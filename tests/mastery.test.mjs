import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProblem} from '../docs/core.mjs';
import {missionRecord} from '../docs/mastery.mjs';

const empty={completedRuns:0,bestErrors:null,bestHints:null,precise:false,predicted:false};
const load=(sessionId,overrides={})=>({sessionId,mode:'campaign',level:3,campaignVersion:2,scaffold:'prediction',status:'completed',problem:makeProblem('add',3,1),actions:[{kind:'submit',value:4}],...overrides});
const run=(sessionId,overrides={})=>Array.from({length:3},()=>load(sessionId,overrides));

test('only complete runs of the requested revision and level establish records',()=>{
 const historical=run('legacy');for(const attempt of historical)delete attempt.campaignVersion;
 const attempts=[...historical,...run('training',{mode:'training'}),...run('other-level',{level:4}),...run('partial').slice(0,2),...run('too-many'),load('too-many')];
 assert.deepEqual(missionRecord(attempts,3),empty);
 assert.deepEqual(missionRecord(attempts,3,1),{completedRuns:1,bestErrors:0,bestHints:0,precise:true,predicted:true});
 assert.deepEqual(missionRecord([...attempts,...run('current')],3),{completedRuns:1,bestErrors:0,bestHints:0,precise:true,predicted:true});
});

test('errors in abandoned loads are retained when the same run later completes',()=>{
 const abandoned=load('retry',{status:'abandoned',actions:[{kind:'submit',value:5,correct:true},{kind:'hint'}]});
 assert.deepEqual(missionRecord([abandoned,...run('retry')],3),{completedRuns:1,bestErrors:1,bestHints:1,precise:false,predicted:false});
});

test('help prevents a prediction award but still permits a precise run',()=>{
 const attempts=run('help');attempts[0].actions.unshift({kind:'hint'});
 assert.deepEqual(missionRecord(attempts,3),{completedRuns:1,bestErrors:0,bestHints:1,precise:true,predicted:false});
 const abandonedHelp=load('help-before-retry',{status:'abandoned',actions:[{kind:'hint'}]});
 assert.equal(missionRecord([abandonedHelp,...run('help-before-retry')],3).predicted,false);
 const guided=run('guided');guided[1].scaffold='reactor';
 assert.deepEqual(missionRecord(guided,3),{completedRuns:1,bestErrors:0,bestHints:0,precise:true,predicted:false});
});

test('best hints belong to the lowest-error run and later errors cannot erase an award',()=>{
 const preciseWithHints=run('careful');preciseWithHints[0].actions.unshift({kind:'hint'},{kind:'hint'});
 const mistakesNoHints=run('fast');mistakesNoHints[0].actions.unshift({kind:'submit',value:5});
 const attempts=[...preciseWithHints,...mistakesNoHints];
 assert.deepEqual(missionRecord(attempts,3),{completedRuns:2,bestErrors:0,bestHints:2,precise:true,predicted:false});
 const snapshot=structuredClone(attempts);
 assert.deepEqual(missionRecord([...attempts,...run('mastered'),...run('guided-later',{scaffold:'reactor'})],3),{completedRuns:4,bestErrors:0,bestHints:0,precise:true,predicted:true});
 assert.deepEqual(attempts,snapshot);
});

test('completion must have a successful mathematical action, not only a status flag',()=>{
 const attempts=run('invalid');attempts[0].actions=[{kind:'submit',value:5}];
 assert.deepEqual(missionRecord(attempts,3),empty);
});
