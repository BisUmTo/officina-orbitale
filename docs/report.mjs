import {createPuzzle,applyMove,expected,mission} from './core.mjs';
const MAX_ATTEMPTS=50000,MAX_ACTIONS=10000,MAX_ACTIVE=7*24*60*60*1000;
const integer=(value,min,max)=>Number.isSafeInteger(value)&&value>=min&&value<=max;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const date=value=>typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
const fail=message=>{throw new TypeError(`LOG non valido: ${message}.`);};
const clean=value=>value.trim().replace(/\s+/g,' ');
export const studentKey=student=>JSON.stringify([clean(student.name).toLocaleLowerCase('it'),clean(student.className).toLocaleLowerCase('it')]);
const stable=value=>value===null||typeof value!=='object'?JSON.stringify(value):Array.isArray(value)?`[${value.map(stable).join(',')}]`:`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
/** Recompute every metric from mathematical actions; no supplied correctness flag is read. */
export function replayAttempt(attempt){
 let puzzle=createPuzzle(attempt.problem),errors=0,merges=0,mergeErrors=0,partialCorrect=0,partialErrors=0,partialValueErrors=0,partialShiftErrors=0,submitCount=0,submitErrors=0,hints=0;
 for(const action of attempt.actions){
  if(puzzle.phase==='completed')fail('azione dopo il completamento');
  if(action.kind==='partial'&&action.row!==undefined&&action.row!==puzzle.nextRow)fail('indice del prodotto parziale');
  const result=applyMove(puzzle,action);
  if(!result.correct)errors++;
  if(action.kind==='merge')result.correct?merges++:mergeErrors++;
  if(action.kind==='partial'){
   result.correct?partialCorrect++:partialErrors++;
   if(result.reason==='partial-value')partialValueErrors++;
   if(result.reason==='partial-shift')partialShiftErrors++;
  }
  if(action.kind==='submit'){submitCount++;if(!result.correct)submitErrors++;}
  if(action.kind==='hint')hints++;
  puzzle=result.puzzle;
 }
 const completed=puzzle.phase==='completed';
 return {completed,errors,merges,mergeErrors,partialCorrect,partialErrors,partialValueErrors,partialShiftErrors,submitCount,submitErrors,hints,firstTry:completed&&errors===0&&submitCount===1,independent:hints===0,expected:expected(attempt.problem)};
}
/** Return the original validated input. Throws without mutating it. Sequence starts at zero. */
export function validateLog(log){
 if(!object(log)||log.format!=='officina-orbitale-log'||log.version!==1)fail('formato o versione');
 if(!date(log.exportedAt))fail('data esportazione');
 if(!object(log.student)||typeof log.student.name!=='string'||!clean(log.student.name)||log.student.name.length>120||typeof log.student.className!=='string'||log.student.className.length>80)fail('nome o classe');
 if(!Array.isArray(log.attempts)||log.attempts.length>MAX_ATTEMPTS)fail('numero tentativi');
 const ids=new Set();
 for(const attempt of log.attempts){
  if(!object(attempt)||typeof attempt.id!=='string'||!attempt.id.trim()||attempt.id.length>150||typeof attempt.sessionId!=='string'||!attempt.sessionId.trim()||attempt.sessionId.length>150)fail('identificatore');
  if(ids.has(attempt.id))fail('ID ripetuto nello stesso file');ids.add(attempt.id);
  if(!date(attempt.at)||!['campaign','training','infinite'].includes(attempt.mode)||!integer(attempt.level,1,20)||!['completed','abandoned'].includes(attempt.status)||!integer(attempt.activeMs,0,MAX_ACTIVE))fail('metadati tentativo');
  if(attempt.campaignVersion!==undefined&&![1,2].includes(attempt.campaignVersion))fail('versione campagna');
  if(attempt.scaffold!==undefined&&!['reactor','prediction'].includes(attempt.scaffold))fail('modalità reattore');
  if(!object(attempt.problem))fail('problema');createPuzzle(attempt.problem);
  if(!Array.isArray(attempt.actions)||attempt.actions.length>MAX_ACTIONS)fail('numero azioni');
  let lastTime=0;
  for(let index=0;index<attempt.actions.length;index++){
   const action=attempt.actions[index];
   if(!object(action)||!['merge','partial','submit','hint'].includes(action.kind)||action.seq!==index||!integer(action.activeAtMs,lastTime,attempt.activeMs))fail('sequenza o tempo azioni');
   lastTime=action.activeAtMs;
   // applyMove validates operands, including integer range and legal column indices.
  }
  const result=replayAttempt(attempt);
  if(result.completed!==(attempt.status==='completed'))fail('stato incoerente con le azioni');
 }
 return log;
}
/** Globally deduplicate a prospective array. New log is optional. Never mutates inputs.
 * Same ID with any different source data or different student rejects the whole call.
 * Returned LOGs retain export metadata but contain only newly encountered attempts.
 */
export function mergeLogs(existingLogs,newLog){
 if(!Array.isArray(existingLogs)||existingLogs.length+(newLog===undefined?0:1)>1000)fail('troppi file');
 const input=newLog===undefined?existingLogs:[...existingLogs,newLog],seen=new Map(),output=[];
 for(const log of input){
  validateLog(log);const identity=studentKey(log.student),attempts=[];
  for(const attempt of log.attempts){
   const fingerprint=stable({student:identity,attempt});
   if(seen.has(attempt.id)){
    if(seen.get(attempt.id)!==fingerprint)throw Error(`ID ${attempt.id.slice(0,70)} con contenuto diverso: importazione annullata.`);
    continue;
   }
   if(seen.size>=250000)fail('limite complessivo tentativi');
   seen.set(attempt.id,fingerprint);attempts.push(structuredClone(attempt));
  }
  if(attempts.length)output.push({...structuredClone(log),attempts});
 }
 return output;
}
const median=values=>{if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b),i=Math.floor(sorted.length/2);return sorted.length%2?sorted[i]:(sorted[i-1]+sorted[i])/2;};
function metrics(attempts){
 const result={total:attempts.length,completed:0,abandoned:0,errors:0,merges:0,mergeErrors:0,partialCorrect:0,partialErrors:0,partialValueErrors:0,partialShiftErrors:0,submitCount:0,submitErrors:0,hints:0,firstTry:0,independent:0,activeMs:0};
 for(const a of attempts){
  const replay=a.metrics??replayAttempt(a);
  result.completed+=Number(replay.completed);result.abandoned+=Number(!replay.completed);
  for(const key of ['errors','merges','mergeErrors','partialCorrect','partialErrors','partialValueErrors','partialShiftErrors','submitCount','submitErrors','hints'])result[key]+=replay[key];
  result.firstTry+=Number(replay.firstTry);result.independent+=Number(replay.independent);result.activeMs+=a.activeMs;
 }
 return {...result,completionRate:result.total?result.completed/result.total:null,firstTryRate:result.total?result.firstTry/result.total:null,medianActiveMs:median(attempts.map(a=>a.activeMs)),medianCompletedMs:median(attempts.filter(a=>(a.metrics??replayAttempt(a)).completed).map(a=>a.activeMs))};
}
/** summarize(LOG[]) returns globally deduplicated rows grouped by identity AND exact mode.
 * Completion is separate from first-try success; active time is client-recorded decision time.
 */
export function summarize(logs){
 const unique=mergeLogs(logs),students=new Map();
 for(const log of unique){
  const identity=studentKey(log.student);
  for(const attempt of log.attempts){
   const key=JSON.stringify([identity,attempt.mode]);
   if(!students.has(key))students.set(key,{key,studentKey:identity,name:clean(log.student.name),className:clean(log.student.className),mode:attempt.mode,attempts:[]});
   students.get(key).attempts.push({...attempt,metrics:replayAttempt(attempt)});
  }
 }
 const rows=[...students.values()].map(row=>{
  row.attempts.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id));
  return {...row,...metrics(row.attempts),sessions:new Set(row.attempts.map(a=>a.sessionId)).size,byOperation:Object.fromEntries(['add','mul'].map(op=>[op,metrics(row.attempts.filter(a=>a.problem.op===op))])),byLevel:Object.fromEntries([...new Set(row.attempts.map(a=>a.level))].map(level=>[level,metrics(row.attempts.filter(a=>a.level===level))]))};
 }).sort((a,b)=>a.className.localeCompare(b.className,'it')||a.name.localeCompare(b.name,'it')||a.mode.localeCompare(b.mode));
 return {students:rows,total:rows.reduce((sum,row)=>sum+row.total,0),studentCount:new Set(rows.map(row=>row.studentKey)).size,duplicates:logs.reduce((n,log)=>n+log.attempts.length,0)-rows.reduce((n,row)=>n+row.total,0)};
}
export function csvCell(value){
 let text=value===null||value===undefined?'':String(value);
 if(/^[\s\u0000-\u001f]*[=+\-@]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;
 return `"${text.replaceAll('"','""')}"`;
}
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const scaffoldOf=attempt=>attempt.scaffold??(attempt.mode==='training'?'reactor':mission(attempt.level,attempt.campaignVersion??1).predict?'prediction':'reactor');
export const modeLabel=mode=>({campaign:'Campagna',training:'Allenamento',infinite:'Orbita infinita'}[mode]??mode);
export function buildCSV(rows){
 const header=['Nome','Classe','Modalità','Sessioni','Tentativi','Completati','Abbandonati','Primo tentativo senza errori','Errori','Aiuti','Tentativi senza aiuti richiesti','Fusioni valide','Fusioni errate','Parziali corretti','Errori scelta parziale','Errori allineamento','Tempo attivo ms','Mediana tempo attivo ms'];
 return '\ufeff'+[header,...rows.map(s=>[s.name,s.className,modeLabel(s.mode),s.sessions,s.total,s.completed,s.abandoned,s.firstTry,s.errors,s.hints,s.independent,s.merges,s.mergeErrors,s.partialCorrect,s.partialValueErrors,s.partialShiftErrors,s.activeMs,s.medianActiveMs])].map(row=>row.map(csvCell).join(';')).join('\r\n');
}
