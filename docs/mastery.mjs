import {replay} from './core.mjs';

/** Personal records only compare complete runs of the same campaign revision.
 * Abandoned loads remain part of their run: retrying cannot erase their mistakes.
 */
export function missionRecord(attempts,level,campaignVersion=2) {
 const sessions=new Map();
 for(const attempt of attempts) {
  if(attempt.mode!=='campaign'||attempt.level!==level||(attempt.campaignVersion??1)!==campaignVersion)continue;
  if(!sessions.has(attempt.sessionId))sessions.set(attempt.sessionId,[]);
  sessions.get(attempt.sessionId).push(attempt);
 }
 const record={completedRuns:0,bestErrors:null,bestHints:null,precise:false,predicted:false};
 for(const attempts of sessions.values()) {
  const completed=attempts.filter(attempt=>attempt.status==='completed');
  if(completed.length!==3)continue;
  const evaluated=attempts.map(attempt=>({attempt,metrics:replay(attempt.problem,attempt.actions)}));
  if(evaluated.some(({attempt,metrics})=>attempt.status==='completed'&&!metrics.completed))continue;
  const errors=evaluated.reduce((total,{metrics})=>total+metrics.errors,0);
  const hints=evaluated.reduce((total,{metrics})=>total+metrics.hints,0);
  record.completedRuns++;
  record.precise ||= errors===0;
  record.predicted ||= errors===0&&hints===0&&completed.every(attempt=>attempt.scaffold==='prediction');
  if(record.bestErrors===null||errors<record.bestErrors) {
   record.bestErrors=errors;record.bestHints=hints;
  } else if(errors===record.bestErrors)record.bestHints=Math.min(record.bestHints,hints);
 }
 return record;
}
