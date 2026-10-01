import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {unseal,importPrivate} from '../docs/crypto.mjs';
import {validateLog,replayAttempt} from '../docs/report.mjs';

// Run the actual app and its real modules; replace only browser/platform boundaries.
// No application source is changed. A read-only state export exposes observable saved state.
const appURL=new URL('../docs/app.mjs',import.meta.url);
const source=(await readFile(appURL,'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,appURL).href}'`);
let instance=0;
async function harness(t,storage=new Map(),options={}){
 const nodes=new Map(),listeners=new Map(),pendingCarries=[];let now=0;
 function node(selector){
  if(!nodes.has(selector))nodes.set(selector,{value:selector==='#student-name'?'Ada':selector==='#student-class'?'1A':'',innerHTML:'',open:false,dataset:{},classList:{toggle(){},add(){}},events:new Map(),
   style:{},append(){},getBoundingClientRect(){return {left:0,top:0,bottom:120,width:50,height:120}},
   animate(){return {finished:this.className==='carry-fly'?new Promise(resolve=>pendingCarries.push(resolve)):Promise.resolve()}},
   addEventListener(type,fn){this.events.set(type,fn)},showModal(){this.open=true},close(){this.open=false;this.events.get('close')?.()},setAttribute(){},click(){},remove(){}});
  return nodes.get(selector);
 }
 // Only the animation regression needs real disabled controls. Rebuild these from rendered markup.
 let controls=[];
 if(options.animateCarry){
  let markup='';Object.defineProperty(node('#app'),'innerHTML',{get:()=>markup,set:html=>{
   markup=html;controls=[...html.matchAll(/<button\b([^>]*)>/g)].map(([,attrs])=>{
    const dataset=Object.fromEntries([...attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([,key,value])=>[key,value]));
    return {dataset,disabled:/\bdisabled\b/.test(attrs),setAttribute(){}};
   });
  }});
  node('#app').querySelectorAll=selector=>controls.filter(control=>selector==='button[data-action]'?control.dataset.action:selector.includes(`[data-action=${control.dataset.action}]`));
 }
 const downloads=[];
 const globals={document:{querySelector:node,body:node('body'),hidden:false,addEventListener(type,fn){listeners.set(type,fn)},createElement(){const link=node(`link-${downloads.length}`);link.click=()=>downloads.push(link);return link}},window:{addEventListener(){}},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>({matches:!options.animateCarry}),performance:{now:()=>now},setInterval:()=>0,setTimeout:()=>0,crypto:webcrypto};
 for(const [key,value] of Object.entries(globals)){const descriptor=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});t.after(()=>descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key]);}
 const app=await import('data:text/javascript;base64,'+Buffer.from(source+`\nexport {state};\n// instance ${instance++}`).toString('base64'));
 const control=(action,data={})=>controls.find(c=>c.dataset.action===action&&Object.entries(data).every(([key,value])=>c.dataset[key]===value));
 const click=(action,data={})=>listeners.get('click')({target:{closest:()=>control(action,data)||({dataset:{action,...data},setAttribute(){}})}});
 const start=async()=>{node('#join').events.get('submit')({preventDefault(){}});await click('close')};
 const answer=async value=>{for(let i=0;i<8;i++)if(value&(1<<i))await click('bit',{column:String(i)});await click('submit')};
 return {app,node,storage,downloads,click,start,answer,control,pendingCarries,advance:ms=>now+=ms,visibility:async hidden=>{document.hidden=hidden;await listeners.get('visibilitychange')()}};
}

test('third successful load unlocks mission before leaving summary or starting training',async t=>{
 const h=await harness(t);await h.start();
 await h.answer(3);await h.click('next');await h.click('merge',{column:'0'});await h.answer(6);
 await h.click('next');await h.click('merge',{column:'0'});await h.click('merge',{column:'1'});await h.answer(4);
 assert.deepEqual(h.app.state.completed,[1]);assert.equal(h.app.state.unlocked,2);
 await h.click('home');await h.click('training');await h.click('train-add');
 assert.equal(h.app.state.run.mode,'training');assert.deepEqual(h.app.state.completed,[1]);assert.equal(h.app.state.unlocked,2);
});

test('help from home is recorded on a suspended load',async t=>{
 const h=await harness(t);await h.start();await h.click('pause');await h.click('home');await h.click('help');
 assert.deepEqual(h.app.state.active.actions.map(a=>a.kind),['hint']);
 await h.click('close');await h.start();await h.answer(3);
 assert.equal(h.app.state.attempts[0].actions.filter(a=>a.kind==='hint').length,1);
});

// Parse only rendered ancestry needed for this accessibility regression, not layout.
function accessibleColumnCount(html){
 const stack=[];let count=0;
 for(const token of html.matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi)){
  const tag=token[1].toLowerCase(),text=token[0];
  if(text.startsWith('</')){if(stack.at(-1)?.tag===tag)stack.pop();continue;}
  const hidden=stack.some(n=>n.hidden)||/aria-hidden="true"|\binert\b/.test(text);
  if(/aria-label="Colonna /.test(text)&&!hidden)count++;
  if(!['input','br','img','hr','meta','link'].includes(tag)&&!text.endsWith('/>'))stack.push({tag,hidden});
 }
 return count;
}
test('prediction hides column answers from accessibility until reveal records a hint',async t=>{
 const h=await harness(t);await h.start();await h.click('pause');await h.click('abandon');
 // A previously unlocked mission is a legitimate persisted starting condition.
 const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));saved.unlocked=2;h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);await resumed.click('map');await resumed.click('mission',{level:'2'});await resumed.click('close');
 assert.equal(accessibleColumnCount(resumed.node('#app').innerHTML),0);
 assert.match(resumed.node('#app').innerHTML,/data-action="reveal"/);
 const lives=resumed.app.state.run.lives;
 await resumed.click('reveal');assert.ok(accessibleColumnCount(resumed.node('#app').innerHTML)>0);
 assert.equal(resumed.app.state.active.actions.at(-1).kind,'hint');
 assert.equal(resumed.app.state.run.lives,lives);assert.equal(resumed.app.state.active.scaffold,'prediction');
});

test('reload keeps mathematical errors and lives; third error archives abandoned load',async t=>{
 const h=await harness(t);await h.start();await h.click('submit');
 const resumed=await harness(t,h.storage);assert.equal(resumed.app.state.run.lives,2);assert.equal(resumed.app.state.active.actions.length,1);
 await resumed.start();await resumed.click('submit');resumed.advance(250);await resumed.click('submit');
 assert.equal(resumed.app.state.active,null);assert.equal(resumed.app.state.run.lives,0);
 assert.equal(resumed.app.state.attempts[0].status,'abandoned');assert.equal(resumed.app.state.attempts[0].actions.length,3);
});

test('active decision time excludes pause, help dialog and background time',async t=>{
 const h=await harness(t);await h.start();h.advance(1000);await h.click('pause');h.advance(7000);await h.click('close');h.advance(500);
 await h.visibility(true);h.advance(9000);await h.visibility(false);h.advance(200);await h.click('help');h.advance(4000);await h.click('close');h.advance(300);await h.answer(3);
 assert.equal(h.app.state.attempts[0].activeMs,2000);
});

test('export freezes identity and completed attempts before asynchronous key fetch',async t=>{
 const pair=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
 const pub=await webcrypto.subtle.exportKey('jwk',pair.publicKey),priv=await webcrypto.subtle.exportKey('jwk',pair.privateKey);
 const h=await harness(t);await h.start();await h.answer(3);await h.click('next');await h.click('pause');await h.click('home');
 let resolveFetch;const response=new Promise(resolve=>resolveFetch=resolve);t.mock.method(globalThis,'fetch',()=>response);
 let payload;t.mock.method(URL,'createObjectURL',blob=>{payload=blob;return 'blob:regression'});
 const exporting=h.click('export');
 await h.click('change-student');await h.click('confirm-student');h.node('#student-name').value='Bea';await h.start();
 resolveFetch({ok:true,json:async()=>pub});await exporting;
 assert.ok(payload,'a downloadable encrypted LOG is produced');
 const log=await unseal(JSON.parse(await payload.text()),await importPrivate(priv));
 assert.equal(log.student.name,'Ada');assert.equal(log.attempts.length,1);assert.equal(log.attempts[0].status,'completed');assert.equal(log.attempts[0].problem.a,1);
 assert.match(h.node('#modal-content').innerHTML,/download="Officina-Orbitale-Ada-/);assert.equal(h.app.state.student.name,'Bea');
});


test('double submit costs one life; a deliberate repeat after 250 ms remains an error',async t=>{
 const h=await harness(t);await h.start();await h.click('submit');h.advance(100);await h.click('submit');
 assert.equal(h.app.state.run.lives,2);assert.equal(h.app.state.active.actions.length,1);
 h.advance(150);await h.click('submit');assert.equal(h.app.state.run.lives,1);assert.equal(h.app.state.active.actions.length,2);
});

test('different submit payload is accepted immediately and a new load resets debounce',async t=>{
 const h=await harness(t);await h.start();await h.click('submit');await h.answer(3);
 assert.equal(h.app.state.attempts.length,1);assert.equal(h.app.state.run.lives,2);
 await h.click('next');await h.click('merge',{column:'0'});await h.click('submit');assert.equal(h.app.state.run.lives,1);
});

test('three training successes stay in training LOG and do not unlock campaign',async t=>{
 const h=await harness(t);t.mock.method(Math,'random',()=>0);
 await h.click('training');await h.click('train-add');await h.click('close');
 for(let i=0;i<3;i++){
  await h.answer(0);
  if(i===2){assert.match(h.node('#app').innerHTML,/ALLENAMENTO COMPLETATO/);assert.doesNotMatch(h.node('#app').innerHTML,/MISSIONE .* COMPLETATA|previsioni al primo lancio/)}
  await h.click('next');
 }
 assert.equal(h.app.state.attempts.length,3);assert.ok(h.app.state.attempts.every(a=>a.mode==='training'));
 assert.deepEqual(h.app.state.completed,[]);assert.equal(h.app.state.unlocked,1);
});

test('infinite stays gated until persisted mission 20 completion then creates separate LOG',async t=>{
 const h=await harness(t);await h.click('infinite');assert.equal(h.app.state.active,null);
 const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));saved.completed=Array.from({length:20},(_,i)=>i+1);saved.unlocked=20;
 h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);t.mock.method(Math,'random',()=>0.75);
 await resumed.click('infinite');await resumed.click('close');
 assert.equal(resumed.app.state.run.mode,'infinite');assert.equal(resumed.app.state.active.mode,'infinite');
 await resumed.click('pause');await resumed.click('abandon');
 assert.equal(resumed.app.state.attempts[0].mode,'infinite');assert.equal(resumed.app.state.unlocked,21);
});

test('repeated deliberate carries in the same column remain available after 440 ms',async t=>{
 const h=await harness(t);const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));saved.unlocked=16;h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);await resumed.click('map');await resumed.click('mission',{level:'16'});await resumed.click('close');
 for(let row=0;row<4;row++){for(let shift=0;shift<row;shift++)await resumed.click('shift',{delta:'1'});await resumed.click('partial')}
 await resumed.click('reveal');await resumed.click('merge',{column:'3'});resumed.advance(440);await resumed.click('merge',{column:'3'});
 assert.equal(resumed.app.state.active.actions.filter(a=>a.kind==='merge').length,2);assert.equal(resumed.app.state.run.lives,3);
});

test('first mission teaches a single carry and a chain before direct continuation to prediction',async t=>{
 const h=await harness(t);await h.start();
 assert.deepEqual(h.app.state.run.orders.map(p=>[p.a,p.b]),[[1,2],[5,1],[3,1]]);
 await h.answer(3);await h.click('next');
 assert.equal(h.node('#modal').open,false);assert.match(h.node('#app').innerHTML,/class="game /);
 // The guided introduction requires actually doing the carry, without penalising early submission.
 await h.answer(6);assert.equal(h.app.state.attempts.length,1);assert.equal(h.app.state.run.lives,3);
 await h.click('merge',{column:'0'});await h.click('submit');await h.click('next');
 await h.click('merge',{column:'0'});await h.click('merge',{column:'1'});await h.answer(4);
 assert.equal(h.app.state.attempts.length,3);assert.deepEqual(h.app.state.completed,[1]);
 await h.click('next');
 assert.equal(h.app.state.run.level,2);assert.equal(h.app.state.run.index,0);
 assert.equal(h.app.state.run.lives,3);assert.equal(h.app.state.active.scaffold,'prediction');
 assert.equal(h.app.state.active.reactorVisible,false);assert.equal(h.node('#modal').open,false);
 assert.match(h.node('#app').innerHTML,/class="game /);assert.doesNotMatch(h.node('#app').innerHTML,/id="join"/);
});

test('non-fusible columns cannot consume lives or produce mathematical actions',async t=>{
 const h=await harness(t);await h.start();
 for(const column of ['0','1','2','3'])await h.click('merge',{column});
 assert.equal(h.app.state.run.lives,3);assert.deepEqual(h.app.state.active.actions,[]);
 const buttons=[...h.node('#app').innerHTML.matchAll(/<button\b[^>]*data-action="merge"[^>]*>/g)];
 assert.equal(buttons.length,4);assert.ok(buttons.every(([html])=>/\bdisabled\b/.test(html)));
 await h.answer(3);await h.click('next');
 await h.click('merge',{column:'0'});h.advance(250);await h.click('merge',{column:'0'});
 assert.equal(h.app.state.run.lives,3);assert.equal(h.app.state.active.actions.length,1);
 assert.equal(h.app.state.active.actions[0].kind,'merge');
});

test('failed load resumes at its checkpoint after reload, preserving completed loads and session',async t=>{
 const h=await harness(t);await h.start();await h.answer(3);await h.click('next');
 const sessionId=h.app.state.run.sessionId,orders=structuredClone(h.app.state.run.orders),oldId=h.app.state.active.id;
 await h.click('merge',{column:'0'});
 for(let i=0;i<3;i++){h.advance(300);await h.click('submit')}
 assert.equal(h.app.state.summary.type,'failed');assert.equal(h.app.state.run.index,1);
 assert.deepEqual(h.app.state.attempts.map(a=>a.status),['completed','abandoned']);
 const resumed=await harness(t,h.storage);await resumed.start();await resumed.click('next');
 assert.equal(resumed.app.state.run.index,1);assert.equal(resumed.app.state.run.sessionId,sessionId);
 assert.deepEqual(resumed.app.state.run.orders,orders);assert.equal(resumed.app.state.run.lives,3);
 assert.notEqual(resumed.app.state.active.id,oldId);assert.deepEqual(resumed.app.state.active.actions,[]);
 assert.deepEqual(resumed.app.state.active.problem,orders[1]);assert.equal(resumed.app.state.attempts.length,2);
 assert.equal(resumed.node('#modal').open,false);
 const reloadedAgain=await harness(t,resumed.storage);await reloadedAgain.start();
 assert.equal(reloadedAgain.app.state.run.index,1);assert.equal(reloadedAgain.app.state.run.lives,3);
 await reloadedAgain.click('merge',{column:'0'});await reloadedAgain.answer(6);
 assert.equal(reloadedAgain.app.state.run.index,2);assert.equal(reloadedAgain.app.state.attempts.filter(a=>a.status==='completed').length,2);
});

test('resuming a legacy campaign retains its saved problems and visible scaffold until next mission',async t=>{
 const h=await harness(t);await h.start();
 const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));
 const legacyOrders=[{op:'add',a:8,b:7,width:4},{op:'add',a:17,b:10,width:5},{op:'add',a:36,b:18,width:6}];
 saved.unlocked=2;saved.completed=[1];saved.run.level=2;saved.run.orders=legacyOrders;delete saved.run.campaignVersion;
 saved.active.level=2;saved.active.problem=legacyOrders[0];saved.active.scaffold='reactor';saved.active.reactorVisible=true;delete saved.active.campaignVersion;
 h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);await resumed.start();
 assert.deepEqual(resumed.app.state.run.orders,legacyOrders);assert.equal(resumed.app.state.active.scaffold,'reactor');
 await resumed.answer(15);await resumed.click('next');
 assert.deepEqual(resumed.app.state.active.problem,legacyOrders[1]);assert.equal(resumed.app.state.active.scaffold,'reactor');
 assert.equal(resumed.app.state.active.reactorVisible,true);
 await resumed.answer(27);await resumed.click('next');await resumed.answer(54);await resumed.click('next');
 assert.ok(resumed.app.state.attempts.every(a=>a.campaignVersion===1&&a.scaffold==='reactor'));
 assert.equal(resumed.app.state.run.level,3);assert.equal(resumed.app.state.run.campaignVersion,2);
 assert.equal(resumed.app.state.active.scaffold,'prediction');assert.equal(resumed.node('#modal').open,false);
});

test('result bits accept taps during a carry animation while mathematical submission stays disabled',async t=>{
 const h=await harness(t,new Map(),{animateCarry:true});await h.start();await h.answer(3);await h.click('next');
 const carrying=h.click('merge',{column:'0'});
 assert.equal(h.pendingCarries.length,1,'the real carry is waiting for its browser animation');
 assert.equal(h.control('submit').disabled,true);assert.equal(h.control('merge',{column:'0'}).disabled,true);
 assert.equal(h.control('bit',{column:'2'}).disabled,false);
 await h.click('bit',{column:'2'});await h.click('bit',{column:'1'});
 assert.equal(h.app.state.active.output,6);assert.equal(h.app.state.attempts.length,1);
 await h.click('submit');assert.equal(h.app.state.active.output,6);assert.equal(h.app.state.attempts.length,1);
 h.advance(440);h.pendingCarries.shift()();await carrying;
 assert.equal(h.app.state.active.output,6);assert.equal(h.control('submit').disabled,false);
 await h.click('submit');
 assert.equal(h.app.state.attempts.length,2);assert.equal(h.app.state.attempts[1].status,'completed');
 assert.deepEqual(h.app.state.attempts[1].actions.map(a=>a.kind),['merge','submit']);
 assert.equal(h.app.state.attempts[1].actions.at(-1).value,6);assert.equal(h.app.state.run.lives,3);
});

test('all 78 campaign loads flow through subtraction and mission 26 into unlocked infinite mode',async t=>{
 const h=await harness(t);await h.start();
 for(let load=0;load<78;load++){
  const level=Math.floor(load/3)+1;
  assert.equal(h.app.state.run.level,level);assert.equal(h.app.state.run.index,load%3);
  assert.equal(h.node('#modal').open,false,`mission ${level} must not interrupt the route with a dialog`);
  const {problem,scaffold}=h.app.state.active;
  if(level===9){assert.equal(problem.op,'mul');assert.equal(scaffold,'reactor')}
  if(problem.op==='mul'){
   const rows=Math.max(1,problem.b.toString(2).length);
   for(let row=0;row<rows;row++){
    const include=Boolean(problem.b&(1<<row));
    await h.click('include',{value:String(include)});
    if(include)for(let shift=0;shift<row;shift++)await h.click('shift',{delta:'1'});
    h.advance(300);await h.click('partial');
   }
  }
  // Follow available controls on the guided reactor; prediction problems go straight to the answer.
  if(scaffold==='reactor'){
   if(problem.op==='sub'){
    for(let moves=0;;moves++){
     const controls=[...h.node('#app').innerHTML.matchAll(/<button\b[^>]*data-action="(remove|borrow)"[^>]*>/g)].filter(([html])=>! /\bdisabled\b/.test(html));
     const available=controls.find(([,kind])=>kind==='remove')||controls[0];if(!available)break;
     assert.ok(moves<100);h.advance(440);await h.click(available[1],{column:available[0].match(/data-column="(\d+)"/)[1]});
    }
   }
   for(let moves=0;;moves++){
    const available=[...h.node('#app').innerHTML.matchAll(/<button\b[^>]*data-action="merge"[^>]*>/g)].find(([html])=>!/\bdisabled\b/.test(html));
    if(!available)break;
    assert.ok(moves<64,'guided reactor must eventually stabilise');
    const column=available[0].match(/data-column="(\d+)"/)[1];
    h.advance(440);await h.click('merge',{column});
   }
  }
  h.advance(1000);await h.answer(problem.op==='add'?problem.a+problem.b:problem.op==='sub'?problem.a-problem.b:problem.a*problem.b);
  assert.equal(h.app.state.attempts.length,load+1);assert.equal(h.app.state.summary.type,'order');
  assert.equal(h.app.state.run.lives,3);
  if(load===77){assert.deepEqual(h.app.state.completed,Array.from({length:26},(_,i)=>i+1));assert.match(h.node('#app').innerHTML,/CAMPAGNA COMPLETATA/)}
  await h.click('next');
 }
 assert.equal(h.app.state.run.mode,'infinite');assert.equal(h.app.state.active.mode,'infinite');
 assert.equal(h.app.state.unlocked,26);assert.equal(h.node('#modal').open,false);
 assert.equal(h.app.state.attempts.length,78);
 assert.ok(h.app.state.attempts.every(a=>a.mode==='campaign'&&a.campaignVersion===2&&a.status==='completed'));
 const log={format:'officina-orbitale-log',version:1,exportedAt:new Date().toISOString(),student:h.app.state.student,attempts:h.app.state.attempts};
 assert.doesNotThrow(()=>validateLog(log));
 assert.ok(log.attempts.every(a=>{const result=replayAttempt(a);return result.completed&&result.errors===0&&result.submitCount===1}));
});


test('old completed campaign unlocks subtraction without removing infinite access',async t=>{
 const h=await harness(t);const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));
 saved.completed=Array.from({length:20},(_,i)=>i+1);saved.unlocked=20;h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);assert.equal(resumed.app.state.unlocked,21);
 assert.match(resumed.node('#app').innerHTML,/Spazio infinito · sbloccato/);
 await resumed.start();assert.equal(resumed.app.state.run.level,21);assert.equal(resumed.app.state.active.problem.op,'sub');assert.match(resumed.node('#app').innerHTML,/<span class="op">−<\/span>/);
 await resumed.click('submit');assert.equal(resumed.app.state.run.lives,3);assert.equal(resumed.app.state.active.actions.length,0);
 await resumed.click('remove',{column:'1'});await resumed.answer(5);await resumed.click('next');
 await resumed.click('borrow',{column:'1'});await resumed.click('remove',{column:'0'});await resumed.answer(5);await resumed.click('next');
 await resumed.click('borrow',{column:'3'});const id=resumed.app.state.active.id;
 const reloaded=await harness(t,resumed.storage);await reloaded.start();assert.equal(reloaded.app.state.active.id,id);
 await reloaded.click('borrow',{column:'2'});await reloaded.click('remove',{column:'1'});reloaded.advance(500);await reloaded.click('borrow',{column:'1'});await reloaded.click('remove',{column:'0'});await reloaded.answer(5);
 assert.equal(reloaded.app.state.attempts.length,3);assert.ok(reloaded.app.state.completed.includes(21));
 const log={format:'officina-orbitale-log',version:1,exportedAt:new Date().toISOString(),student:reloaded.app.state.student,attempts:reloaded.app.state.attempts};assert.doesNotThrow(()=>validateLog(log));
});

test('subtraction prediction can be solved directly or opened without losing a life',async t=>{
 const h=await harness(t);const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));saved.unlocked=23;h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);await resumed.start();assert.equal(resumed.app.state.active.scaffold,'prediction');
 assert.equal(accessibleColumnCount(resumed.node('#app').innerHTML),0);await resumed.answer(6);await resumed.click('next');
 await resumed.click('reveal');assert.equal(resumed.app.state.run.lives,3);assert.equal(resumed.app.state.active.actions.at(-1).kind,'hint');
 await resumed.answer(7);assert.equal(resumed.app.state.attempts.length,2);
});
