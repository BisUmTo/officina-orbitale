import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProblem,createPuzzle,applyMove,expected,mission,canBorrow,MISSION_COUNT} from '../docs/core.mjs';
import {validateLog,replayAttempt,summarize,buildCSV} from '../docs/report.mjs';
const energy=counts=>counts.reduce((sum,n,i)=>sum+n*2**i,0);
function solve(problem){
 let puzzle=createPuzzle(problem);const actions=[];
 while(puzzle.remaining.some(Boolean)){
  let column=puzzle.remaining.findIndex((n,i)=>n>0&&puzzle.counts[i]>0);
  const action=column>=0?{kind:'remove',column}:{kind:'borrow',column:puzzle.counts.findIndex((_,i)=>canBorrow(puzzle,i))};
  assert.ok(action.column>=0,'a valid nonnegative subtraction cannot deadlock');
  const before=structuredClone(puzzle),result=applyMove(puzzle,action);
  assert.equal(result.correct,true);assert.deepEqual(puzzle,before);puzzle=result.puzzle;
  assert.equal(energy(puzzle.counts)-energy(puzzle.remaining),problem.a-problem.b);
  actions.push({...action,seq:actions.length,activeAtMs:actions.length});assert.ok(actions.length<100);
 }
 assert.ok(puzzle.counts.every(n=>n===0||n===1));assert.equal(energy(puzzle.counts),problem.a-problem.b);
 actions.push({kind:'submit',value:problem.a-problem.b,seq:actions.length,activeAtMs:actions.length});
 return actions;
}
test('all nonnegative 8-bit subtractions conserve value through borrowing and removal',()=>{
 for(let a=0;a<=255;a++)for(let b=0;b<=a;b++)solve(makeProblem('sub',a,b));
});
test('subtraction retains minuend width, handles zero and refuses negative answers',()=>{
 assert.equal(makeProblem('sub',128,128).width,8);assert.equal(expected(makeProblem('sub',255,0)),255);
 assert.throws(()=>makeProblem('sub',1,2));
 let p=createPuzzle(makeProblem('sub',8,3));
 for(const column of [3,2,1]){assert.equal(canBorrow(p,column),true);p=applyMove(p,{kind:'borrow',column}).puzzle;}
 assert.equal(applyMove(p,{kind:'borrow',column:1}).correct,false);
 assert.equal(applyMove(p,{kind:'remove',column:2}).correct,false);
 assert.throws(()=>applyMove(p,{kind:'borrow',column:8}));
 assert.equal(applyMove(createPuzzle(makeProblem('add',1,2)),{kind:'borrow',column:1}).correct,false);
});
test('six final missions gradually introduce subtraction and keep the old curriculum intact',()=>{
 assert.equal(MISSION_COUNT,26);
 for(let level=21;level<=26;level++){
  const m=mission(level);assert.equal(m.orders.length,3);assert.ok(m.orders.every(p=>p.op==='sub'&&p.a>=p.b));
  assert.equal(m.predict,level>=23);if(level<=22)assert.equal(m.bonusMs,0);
 }
 assert.equal(mission(20).orders[0].op,'mul');assert.throws(()=>mission(21,1));
});
test('subtraction logs replay, summarize, export CSV and retain old log compatibility',()=>{
 const problem=makeProblem('sub',16,7),actions=solve(problem);
 const attempt={id:'sub-1',sessionId:'run-sub',at:'2026-10-01T10:00:00.000Z',mode:'campaign',level:22,campaignVersion:2,scaffold:'reactor',problem,actions,activeMs:1000,status:'completed'};
 const log={format:'officina-orbitale-log',version:1,exportedAt:attempt.at,student:{name:'Test',className:'1A'},attempts:[attempt]};
 assert.doesNotThrow(()=>validateLog(log));const r=replayAttempt(attempt);assert.equal(r.errors,0);assert.ok(r.borrows>=1);assert.equal(r.removals,3);
 const summary=summarize([log]);assert.equal(summary.students[0].byOperation.sub.completed,1);assert.match(buildCSV(summary.students),/Prestiti validi/);
 const invalid=structuredClone(log);invalid.attempts[0].actions[0].column=-1;assert.throws(()=>validateLog(invalid));
});
