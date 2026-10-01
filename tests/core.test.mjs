import test from 'node:test';
import assert from 'node:assert/strict';
import {bits,expected,makeProblem,createPuzzle,applyMove,replay,mission} from '../docs/core.mjs';
const energy=p=>p.counts.reduce((sum,n,i)=>sum+n*2**i,0);
function normalize(p) {
 while(p.counts.some(n=>n>=2)) {
  const i=p.counts.findIndex(n=>n>=2),before=energy(p),r=applyMove(p,{kind:'merge',column:i});
  assert.equal(r.correct,true); assert.equal(energy(r.puzzle),before); p=r.puzzle;
 }
 return p;
}
test('exhaustive addition conservation and output',()=>{
 for(let a=0;a<=127;a++) for(let b=0;b<=127;b++) {
  const problem=makeProblem('add',a,b); let p=createPuzzle(problem);
  assert.equal(energy(p),a+b); p=normalize(p); assert.deepEqual(p.counts,bits(a+b,problem.width));
  assert.equal(applyMove(p,{kind:'submit',value:a+b}).done,true);
 }
});
test('exhaustive multiplication including every zero bit',()=>{
 for(let a=0;a<=15;a++) for(let b=0;b<=15;b++) {
  const problem=makeProblem('mul',a,b); let p=createPuzzle(problem);
  let row=0; while(p.phase==='partials') {
   const include=Boolean((b>>row)&1),value=include?a*2**row:0,before=energy(p);
   const r=applyMove(p,{kind:'partial',include,shift:include?row:3});
   assert.equal(r.correct,true); assert.equal(energy(r.puzzle),before+value); p=r.puzzle;row++;
  }
  assert.equal(row,Math.max(1,b.toString(2).length)); assert.equal(energy(p),a*b);
  p=normalize(p); assert.deepEqual(p.counts,bits(a*b,problem.width));
  assert.equal(applyMove(p,{kind:'submit',value:a*b}).done,true);
 }
});
test('immutable inputs, partial error does not consume row, zero shift irrelevant',()=>{
 const p=createPuzzle(makeProblem('mul',5,5)); const snapshot=structuredClone(p);
 Object.freeze(p.counts);Object.freeze(p.rows);Object.freeze(p.problem);Object.freeze(p);
 assert.equal(applyMove(p,{kind:'partial',include:false,shift:0}).reason,'partial-value');
 assert.equal(applyMove(p,{kind:'partial',include:true,shift:1}).reason,'partial-shift');
 let next=applyMove(p,{kind:'partial',include:true,shift:0}).puzzle;
 assert.deepEqual(p,snapshot); assert.equal(next.nextRow,1);
 next=applyMove(next,{kind:'partial',include:false,shift:3}).puzzle;
 assert.equal(next.nextRow,2); assert.equal(energy(next),5);
 assert.equal(applyMove(next,{kind:'submit',value:25}).reason,'partials-required');
});
test('malformed constraints throw, legal mathematical errors retain state',()=>{
 const p=createPuzzle(makeProblem('add',1,1));
 for(const action of [null,{}, {kind:'merge',column:-1},{kind:'merge',column:4},{kind:'merge',column:1.2},{kind:'submit',value:256},{kind:'submit',value:'2'},{kind:'partial',include:1,shift:0},{kind:'partial',include:true,shift:4},{kind:'partial',include:true,shift:8}]) assert.throws(()=>applyMove(p,action));
 assert.equal(applyMove(p,{kind:'merge',column:1}).puzzle,p);
 assert.equal(applyMove(p,{kind:'submit',value:3}).puzzle,p);
 assert.throws(()=>makeProblem('add',255,1));assert.throws(()=>makeProblem('mul',16,16));
 assert.throws(()=>createPuzzle({...p.problem,width:8}));
});
test('replay calculates errors and hints, ignores client correctness',()=>{
 const problem=makeProblem('add',1,1);
 const r=replay(problem,[{kind:'submit',value:3,correct:true},{kind:'hint'},{kind:'merge',column:0},{kind:'submit',value:2,correct:false}]);
 assert.equal(r.errors,1);assert.equal(r.hints,1);assert.equal(r.merges,1);assert.equal(r.submitCount,2);assert.equal(r.firstTry,false);assert.equal(r.independent,false);assert.equal(r.completed,true);
 assert.equal(replay(problem,[{kind:'submit',value:2}]).firstTry,true);
 assert.equal(replay(problem,[]).completed,false);
 assert.throws(()=>replay(problem,[{kind:'submit',value:-1}]));
 const done=applyMove(createPuzzle(problem),{kind:'submit',value:2}).puzzle;
 assert.equal(applyMove(done,{kind:'hint'}).reason,'completed');
});
test('replay partial errors and completion',()=>{
 const r=replay(makeProblem('mul',5,1),[{kind:'partial',include:false,shift:0},{kind:'partial',include:true,shift:0},{kind:'submit',value:5}]);
 assert.equal(r.partialErrors,1);assert.equal(r.partialCorrect,1);assert.equal(r.errors,1);assert.equal(r.completed,true);
});
test('20 intentional missions, progression and 8-bit ceiling',()=>{
 for(let level=1;level<=20;level++) {
  const m=mission(level);assert.equal(m.orders.length,3);assert.equal(m.predict,(level>=6&&level<=8)||level>=15);assert.equal(m.bonusMs>0,level>=5);
  for(const p of m.orders) {assert.ok(expected(p)<=255);assert.ok(p.width>=4&&p.width<=8);}
  if(level<=8) assert.ok(m.orders.every(p=>p.op==='add'));
  else if(level<=16) assert.ok(m.orders.every(p=>p.op==='mul'));
  else {assert.ok(m.orders.some(p=>p.op==='add'));assert.ok(m.orders.some(p=>p.op==='mul'));}
 }
 const m=mission(1);m.orders[0].a=255;assert.equal(mission(1).orders[0].a,1);
 assert.throws(()=>mission(0));assert.throws(()=>mission(21));
});
