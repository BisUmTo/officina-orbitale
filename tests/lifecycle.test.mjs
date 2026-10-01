import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {unseal,importPrivate} from '../docs/crypto.mjs';

// Run the actual app and its real modules; replace only browser/platform boundaries.
// No application source is changed. A read-only state export exposes observable saved state.
const appURL=new URL('../docs/app.mjs',import.meta.url);
const source=(await readFile(appURL,'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,appURL).href}'`);
let instance=0;
async function harness(t,storage=new Map()){
 const nodes=new Map(),listeners=new Map();let now=0;
 function node(selector){
  if(!nodes.has(selector))nodes.set(selector,{value:selector==='#student-name'?'Ada':selector==='#student-class'?'1A':'',innerHTML:'',open:false,dataset:{},classList:{toggle(){},add(){}},events:new Map(),
   addEventListener(type,fn){this.events.set(type,fn)},showModal(){this.open=true},close(){this.open=false;this.events.get('close')?.()},setAttribute(){},click(){},remove(){}});
  return nodes.get(selector);
 }
 const downloads=[];
 const globals={document:{querySelector:node,body:node('body'),hidden:false,addEventListener(type,fn){listeners.set(type,fn)},createElement(){const link=node(`link-${downloads.length}`);link.click=()=>downloads.push(link);return link}},window:{addEventListener(){}},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>({matches:true}),performance:{now:()=>now},setInterval:()=>0,setTimeout:()=>0,crypto:webcrypto};
 for(const [key,value] of Object.entries(globals)){const descriptor=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});t.after(()=>descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key]);}
 const app=await import('data:text/javascript;base64,'+Buffer.from(source+`\nexport {state};\n// instance ${instance++}`).toString('base64'));
 const click=(action,data={})=>listeners.get('click')({target:{closest:()=>({dataset:{action,...data},setAttribute(){}})}});
 const start=async()=>{node('#join').events.get('submit')({preventDefault(){}});await click('close')};
 const answer=async value=>{for(let i=0;i<8;i++)if(value&(1<<i))await click('bit',{column:String(i)});await click('submit')};
 return {app,node,storage,downloads,click,start,answer,advance:ms=>now+=ms,visibility:async hidden=>{document.hidden=hidden;await listeners.get('visibilitychange')()}};
}

test('third successful load unlocks mission before leaving summary or starting training',async t=>{
 const h=await harness(t);await h.start();
 await h.answer(3);await h.click('next');await h.answer(7);await h.click('next');await h.answer(15);
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
 const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));saved.unlocked=6;h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);await resumed.click('map');await resumed.click('mission',{level:'6'});await resumed.click('close');
 assert.equal(accessibleColumnCount(resumed.node('#app').innerHTML),0);
 assert.match(resumed.node('#app').innerHTML,/data-action="reveal"/);
 await resumed.click('reveal');assert.ok(accessibleColumnCount(resumed.node('#app').innerHTML)>0);
 assert.equal(resumed.app.state.active.actions.at(-1).kind,'hint');
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
 await h.click('next');await h.click('submit');assert.equal(h.app.state.run.lives,1);
});

test('three training successes stay in training LOG and do not unlock campaign',async t=>{
 const h=await harness(t);t.mock.method(Math,'random',()=>0);
 await h.click('training');await h.click('train-add');await h.click('close');
 for(let i=0;i<3;i++){await h.answer(0);await h.click('next')}
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
 assert.equal(resumed.app.state.attempts[0].mode,'infinite');assert.equal(resumed.app.state.unlocked,20);
});

test('repeated deliberate carries in the same column remain available after 440 ms',async t=>{
 const h=await harness(t);const saved=JSON.parse(h.storage.get('officina-orbitale-v1'));saved.unlocked=16;h.storage.set('officina-orbitale-v1',JSON.stringify(saved));
 const resumed=await harness(t,h.storage);await resumed.click('map');await resumed.click('mission',{level:'16'});await resumed.click('close');
 for(let row=0;row<4;row++){for(let shift=0;shift<row;shift++)await resumed.click('shift',{delta:'1'});await resumed.click('partial')}
 await resumed.click('reveal');await resumed.click('merge',{column:'3'});resumed.advance(440);await resumed.click('merge',{column:'3'});
 assert.equal(resumed.app.state.active.actions.filter(a=>a.kind==='merge').length,2);assert.equal(resumed.app.state.run.lives,3);
});
