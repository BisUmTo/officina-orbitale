import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {validateLog,mergeLogs,summarize,csvCell,escapeHTML,buildCSV,scaffoldOf} from '../docs/report.mjs';
import {seal,unseal,unlock,importPrivate} from '../docs/crypto.mjs';
import {makeProblem} from '../docs/core.mjs';
globalThis.crypto??=webcrypto;
const at='2026-10-01T00:00:00.000Z';
function attempt(id='a',mode='campaign',actions=[{kind:'submit',value:2}]){
 return {id,sessionId:'session',at,mode,level:3,problem:makeProblem('add',1,1),status:'completed',activeMs:1000,actions:actions.map((a,seq)=>({...a,seq,activeAtMs:seq*100}))};
}
function log(attempts=[attempt()],student={name:'Ada',className:'1A'}){return {format:'officina-orbitale-log',version:1,exportedAt:at,student,attempts};}
const clone=value=>structuredClone(value);
test('payload validated unchanged; mathematical correctness ignores supplied flags',()=>{
 const source=log([attempt('a','campaign',[{kind:'submit',value:3,correct:true},{kind:'hint'},{kind:'merge',column:0},{kind:'submit',value:2}])]);
 assert.equal(validateLog(source),source);
 const s=summarize([source]).students[0];
 assert.equal(s.errors,1);assert.equal(s.firstTry,0);assert.equal(s.completed,1);assert.equal(s.hints,1);assert.equal(s.merges,1);assert.equal(s.independent,0);assert.equal(s.activeMs,1000);
});
test('invalid math schemas, status, sequence, time and post-completion are refused',()=>{
 const mutations=[a=>a.problem.width=8,a=>a.problem.a=256,a=>a.level=0,a=>a.status='abandoned',a=>a.actions[0].seq=1,a=>a.actions[0].activeAtMs=1001,a=>a.actions[0].value=2.5,a=>a.actions.push({kind:'hint',seq:1,activeAtMs:10}),a=>a.scaffold='automatic',a=>a.campaignVersion=3,a=>a.activeMs=NaN,a=>a.actions[0].activeAtMs=-1];
 for(const mutate of mutations){const source=log();mutate(source.attempts[0]);assert.throws(()=>validateLog(source));}
 const nonmonotonic=log([attempt('a','campaign',[{kind:'hint'},{kind:'submit',value:2}])]);nonmonotonic.attempts[0].actions[0].activeAtMs=500;assert.throws(()=>validateLog(nonmonotonic));
 const abandoned=log([attempt('a','campaign',[{kind:'submit',value:3}])]);abandoned.attempts[0].status='abandoned';assert.equal(validateLog(abandoned),abandoned);
});
test('partial choice errors and alignment errors are recomputed separately',()=>{
 const a=attempt('product','training',[{kind:'partial',include:false,shift:0},{kind:'partial',include:true,shift:1},{kind:'partial',include:true,shift:0},{kind:'partial',include:false,shift:3},{kind:'partial',include:true,shift:2},{kind:'submit',value:15}]);
 a.problem=makeProblem('mul',3,5);
 const row=summarize([log([a])]).students[0];
 assert.equal(row.partialValueErrors,1);assert.equal(row.partialShiftErrors,1);assert.equal(row.partialCorrect,3);assert.equal(row.partialErrors,2);assert.equal(row.firstTry,0);
});
test('dedup is global and atomic, preserves input and rejects different student or data',()=>{
 const first=log(),overlap=clone(first);overlap.exportedAt='2026-10-02T00:00:00.000Z';
 const existing=[first],snapshot=clone(existing),unique=mergeLogs(existing,overlap);
 assert.equal(unique.length,1);assert.equal(summarize([first,overlap]).duplicates,1);assert.deepEqual(existing,snapshot);
 const conflict=clone(overlap);conflict.attempts[0].activeMs=2000;assert.throws(()=>mergeLogs(existing,conflict),/contenuto diverso/);assert.deepEqual(existing,snapshot);
 const renamed=clone(overlap);renamed.student.name='Bea';assert.throws(()=>mergeLogs(existing,renamed),/contenuto diverso/);
 const invalid=clone(overlap);invalid.attempts[0].status='abandoned';assert.throws(()=>mergeLogs(existing,invalid));assert.deepEqual(existing,snapshot);
});
test('identity and exact mode grouping, operation metrics and median active times',()=>{
 const source=log([attempt('c'),attempt('t','training'),attempt('i','infinite')]);
 const copy=log([attempt('second')],{name:'  ADA ',className:'1a'});copy.attempts[0].activeMs=3000;
 const s=summarize([source,copy]);assert.equal(s.students.length,3);assert.equal(s.studentCount,1);
 const campaign=s.students.find(row=>row.mode==='campaign');assert.equal(campaign.total,2);assert.equal(campaign.medianActiveMs,2000);assert.equal(campaign.byOperation.add.completed,2);assert.equal(campaign.byOperation.mul.total,0);
});
test('optional scaffold validates and legacy derives reactor versus prediction',()=>{
 const source=log();source.attempts[0].scaffold='prediction';assert.equal(validateLog(source),source);assert.equal(scaffoldOf(source.attempts[0]),'prediction');
 const legacy=attempt();assert.equal(scaffoldOf(legacy),'reactor');legacy.level=2;assert.equal(scaffoldOf(legacy),'reactor');legacy.campaignVersion=2;assert.equal(scaffoldOf(legacy),'prediction');delete legacy.campaignVersion;legacy.level=7;assert.equal(scaffoldOf(legacy),'prediction');legacy.mode='training';assert.equal(scaffoldOf(legacy),'reactor');
});
test('CSV formula guard and HTML escaping preserve malicious text as data',()=>{
 for(const value of ['=HYPERLINK("x")',' +cmd','\t@SUM(1)','-3','\ntext'])assert.ok(csvCell(value).startsWith('"\''));
 assert.equal(csvCell('Ada "A"'),'"Ada ""A"""');
 assert.equal(escapeHTML('<img src=x onerror="alert(1)">&\''),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;');
 const report=summarize([log([attempt()],{name:'=danger',className:'<script>'})]);assert.ok(buildCSV(report.students).includes('"\'=danger"'));
});
let keys;
async function actualKeys(){
 if(!keys)keys=(async()=>{
  const shipped=JSON.parse(await readFile(new URL('../docs/public-key.json',import.meta.url),'utf8'));
  assert.ok(!shipped.d);assert.equal((await webcrypto.subtle.importKey('jwk',shipped,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt'])).algorithm.modulusLength,3072);
  try{return [shipped,JSON.parse(await readFile(new URL('../../output/officina-orbitale-private/chiave-privata-docente.json',import.meta.url),'utf8'))];}
  catch(error){
   if(error.code!=='ENOENT')throw error;
   // A clone/CI never needs the real teacher secret: use a fresh disposable pair.
   const pair=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:3072,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
   return Promise.all([webcrypto.subtle.exportKey('jwk',pair.publicKey),webcrypto.subtle.exportKey('jwk',pair.privateKey)]);
  }
 })();
 return keys;
}
test('real shipped RSA3072 AES roundtrip, random IV, key ID and tamper failure',async()=>{
 const [pub,priv]=await actualKeys();assert.ok(!pub.d);const key=await unlock(priv,pub),source=log();
 const first=await seal(source,pub),second=await seal(source,pub);
 assert.equal(first.format,'officina-orbitale');assert.notEqual(first.iv,second.iv);assert.notEqual(first.ciphertext,second.ciphertext);assert.deepEqual(await unseal(first,key),source);
 const tampered=clone(first);const bytes=Uint8Array.from(atob(tampered.ciphertext),c=>c.charCodeAt(0));bytes[0]^=1;tampered.ciphertext=btoa(String.fromCharCode(...bytes));await assert.rejects(()=>unseal(tampered,key),/alterato/);
 const badId=clone(first);badId.keyId='other';await assert.rejects(()=>unseal(badId,key),/altra chiave/);
 const wrongFormat=clone(first);wrongFormat.format='dogana-booleana';await assert.rejects(()=>unseal(wrongFormat,key),/Formato/);
 const badIV=clone(first);badIV.iv='AAAA';await assert.rejects(()=>unseal(badIV,key),/non valido/);
 const pair=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
 const wrongJwk=await webcrypto.subtle.exportKey('jwk',pair.privateKey),wrongKey=await importPrivate(wrongJwk);
 await assert.rejects(()=>unlock(wrongJwk,pub),/non appartiene/);
 await assert.rejects(()=>unseal(first,wrongKey),/altra chiave/);
 const spoofed=clone(first);spoofed.keyId=wrongJwk.n.slice(0,20);await assert.rejects(()=>unseal(spoofed,wrongKey),/chiave errata/);
 assert.equal((await webcrypto.subtle.importKey('jwk',pub,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt'])).algorithm.modulusLength,3072);
});
