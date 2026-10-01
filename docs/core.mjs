const integer = (n, min=0, max=255) => Number.isInteger(n) && n >= min && n <= max;
const length = n => Math.max(1, Math.floor(Math.log2(n || 1)) + 1);
export function bits(value, width=length(value)) {
  if (!integer(value) || !integer(width,1,8) || value >= 2 ** width) throw new TypeError('Bit non validi');
  return Array.from({length:width}, (_,i) => (value >> i) & 1);
}
export function expected(problem) {
  if (!problem || !['add','mul','sub'].includes(problem.op) || !integer(problem.a) || !integer(problem.b)) throw new TypeError('Problema non valido');
  const value = problem.op === 'add' ? problem.a + problem.b : problem.op==='sub'?problem.a-problem.b:problem.a * problem.b;
  if (value < 0) throw new RangeError('Sottrazione con risultato negativo');
  if (value > 255) throw new RangeError('Risultato oltre 8 bit');
  return value;
}
export function makeProblem(op,a,b) {
  const problem = {op,a,b};
  return {...problem,width:Math.max(4,length(expected(problem)),op==='sub'?length(a):1)};
}
export function createPuzzle(problem) {
  const checked = makeProblem(problem.op,problem.a,problem.b);
  if (problem.width !== checked.width) throw new TypeError('Larghezza non valida');
  const counts = Array(checked.width).fill(0);
  if (checked.op === 'add') for (let i=0;i<counts.length;i++) counts[i]=((checked.a>>i)&1)+((checked.b>>i)&1);
  if(checked.op==='sub')for(let i=0;i<counts.length;i++)counts[i]=(checked.a>>i)&1;
  return {problem:{...checked},counts,...(checked.op==='sub'?{remaining:bits(checked.b,checked.width)}:{}),nextRow:0,rows:[],phase:checked.op==='mul'?'partials':'reactor'};
}
// A loan is useful only if a lower column is missing a unit, with no nearer unit.
export function canBorrow(puzzle,column){
 if(puzzle.problem.op!=='sub'||puzzle.phase!=='reactor'||!integer(column,1,puzzle.counts.length-1)||puzzle.counts[column]<1)return false;
 for(let i=column-1;i>=0;i--){
  if(puzzle.counts[i]>0)return false;
  if(puzzle.remaining[i]>0)return true;
 }
 return false;
}
export function applyMove(puzzle,action) {
  if (!action || typeof action !== 'object' || !['merge','borrow','remove','partial','submit','hint'].includes(action.kind)) throw new TypeError('Azione non valida');
  if (['merge','borrow','remove'].includes(action.kind) && !integer(action.column,0,puzzle.problem.width-1)) throw new TypeError('Colonna non valida');
  if (action.kind==='partial' && (typeof action.include!=='boolean' || !integer(action.shift,0,3))) throw new TypeError('Parziale non valido');
  if (action.kind==='submit' && !integer(action.value)) throw new TypeError('Risultato non valido');
  const fail = reason => ({puzzle,correct:false,reason});
  if (puzzle.phase==='completed') return fail('completed');
  if (action.kind==='hint') return {puzzle,correct:true,reason:'hint'};
  if(action.kind==='borrow'){
    if(!canBorrow(puzzle,action.column))return fail('borrow-unavailable');
    const counts=[...puzzle.counts];counts[action.column]--;counts[action.column-1]+=2;
    return {puzzle:{...puzzle,counts},correct:true,reason:'borrow',borrowFrom:action.column};
  }
  if(action.kind==='remove'){
    const i=action.column;
    if(puzzle.problem.op!=='sub'||puzzle.phase!=='reactor'||puzzle.remaining[i]<1||puzzle.counts[i]<1)return fail('remove-unavailable');
    const counts=[...puzzle.counts],remaining=[...puzzle.remaining];counts[i]--;remaining[i]--;
    return {puzzle:{...puzzle,counts,remaining},correct:true,reason:'remove'};
  }
  if (action.kind==='merge') {
    if(puzzle.problem.op==='sub')return fail('merge-unavailable');
    const i=action.column;
    if (puzzle.phase!=='reactor') return fail('partials-required');
    if (puzzle.counts[i]<2 || i===puzzle.counts.length-1) return fail('merge-unavailable');
    const counts=[...puzzle.counts]; counts[i]-=2; counts[i+1]++;
    return {puzzle:{...puzzle,counts},correct:true,reason:'carry',carryFrom:i};
  }
  if (action.kind==='partial') {
    if (puzzle.phase!=='partials') return fail('partial-unavailable');
    const row=puzzle.nextRow, include=Boolean((puzzle.problem.b>>row)&1);
    // A zero multiplicand also makes a copied row mathematically zero; inclusion still teaches the multiplier bit.
    if (action.include!==include) return fail('partial-value');
    if (include && puzzle.problem.a!==0 && action.shift!==row) return fail('partial-shift');
    const value=include ? puzzle.problem.a*2**row : 0;
    const counts=puzzle.counts.map((n,i)=>n+((value>>i)&1));
    const nextRow=row+1, rows=[...puzzle.rows,{row,include,shift:action.shift,value}];
    return {puzzle:{...puzzle,counts,nextRow,rows,phase:nextRow===length(puzzle.problem.b)?'reactor':'partials'},correct:true,reason:'partial'};
  }
  if (puzzle.phase!=='reactor') return fail('partials-required');
  if (action.value!==expected(puzzle.problem)) return fail('wrong-result');
  return {puzzle:{...puzzle,phase:'completed'},correct:true,reason:'completed',done:true};
}
export function replay(problem,actions) {
  if (!Array.isArray(actions)) throw new TypeError('Azioni non valide');
  let puzzle=createPuzzle(problem),errors=0,merges=0,borrows=0,removals=0,partialCorrect=0,partialErrors=0,submitCount=0,hints=0;
  for (const action of actions) {
    const result=applyMove(puzzle,action);
    if (!result.correct) errors++;
    if (action.kind==='submit') submitCount++;
    if (action.kind==='partial') result.correct ? partialCorrect++ : partialErrors++;
    if (result.correct && action.kind==='merge') merges++;
    if (result.correct && action.kind==='borrow') borrows++;
    if (result.correct && action.kind==='remove') removals++;
    if (result.correct && action.kind==='hint') hints++;
    puzzle=result.puzzle;
  }
  const completed=puzzle.phase==='completed';
  return {puzzle,errors,merges,borrows,removals,partialCorrect,partialErrors,submitCount,firstTry:completed&&errors===0&&submitCount===1,completed,hints,independent:hints===0};
}
const legacyCases = [
 [['add',1,2],['add',4,3],['add',5,10]],
 [['add',8,7],['add',17,10],['add',36,18]],
 [['add',1,1],['add',2,2],['add',5,1]],
 [['add',3,1],['add',7,1],['add',15,1]],
 [['add',7,5],['add',31,1],['add',63,1]],
 [['add',13,9],['add',25,17],['add',47,33]],
 [['add',63,65],['add',85,42],['add',95,33]],
 [['add',127,1],['add',127,128],['add',119,73]],
 [['mul',5,0],['mul',0,1],['mul',7,1]],
 [['mul',3,2],['mul',5,2],['mul',7,2]],
 [['mul',3,4],['mul',5,4],['mul',7,8]],
 [['mul',9,2],['mul',11,4],['mul',15,8]],
 [['mul',3,3],['mul',5,3],['mul',7,3]],
 [['mul',5,5],['mul',9,5],['mul',11,5]],
 [['mul',3,9],['mul',7,10],['mul',13,10]],
 [['mul',15,15],['mul',13,13],['mul',7,15]],
 [['add',31,17],['mul',9,6],['add',63,9]],
 [['mul',11,9],['add',85,85],['mul',15,7]],
 [['add',127,63],['mul',14,13],['add',123,99]],
 [['mul',15,15],['add',127,128],['mul',13,15]]
];
const titles = ['Prime scintille','Rotte luminose','Capsule gemelle','Il ponte dei riporti','Catena stellare','Rotta a memoria','Energia nascosta','Verso la stazione','Copie e silenzio','Spinta doppia','Ali in movimento','Salto orbitale','Motori in squadra','Finestre di luce','Previsione propulsiva','Grande accelerazione','Rotte incrociate','Manovre complesse','Verso il confine','La nuova orbita'];
export const CAMPAIGN_VERSION=2;
export const MISSION_COUNT=26;
export const INFINITE_UNLOCK=20;
const cases=legacyCases.map(rows=>rows.map(row=>[...row]));
cases[0]=[['add',1,2],['add',5,1],['add',3,1]];
cases[1]=[['add',5,3],['add',6,3],['add',7,1]];
cases[2]=[['add',9,5],['add',7,7],['add',13,3]];
cases[3]=[['add',15,1],['add',11,7],['add',13,11]];
cases[8]=[['mul',5,1],['mul',3,2],['mul',3,3]];
cases[9]=[['mul',5,2],['mul',3,4],['mul',5,3]];
cases[10]=[['mul',7,0],['mul',5,5],['mul',3,6]];
cases[11]=[['mul',9,2],['mul',11,4],['mul',7,7]];
cases.push(
 [['sub',7,2],['sub',6,1],['sub',8,3]],
 [['sub',10,3],['sub',12,5],['sub',16,7]],
 [['sub',9,3],['sub',13,6],['sub',17,9]],
 [['sub',32,1],['sub',64,17],['sub',80,33]],
 [['sub',128,65],['sub',170,85],['sub',192,127]],
 [['sub',255,0],['sub',128,128],['sub',200,137]]
);
titles.push('Energia da restituire','Prestiti in catena','Prevedi ciò che resta','Attraverso gli zeri','Rientro dalla galassia','Bilancio di bordo');
// Keep the original curriculum available for a run already in progress and old LOGs.
export function mission(level,version=CAMPAIGN_VERSION) {
 if (!integer(level,1,version===1?20:MISSION_COUNT)) throw new RangeError('Missione non valida');
 if (![1,2].includes(version)) throw new RangeError('Campagna non valida');
 const predict=version===1?(level>=6&&level<=8)||level>=15:level!==1&&level!==9&&level!==21&&level!==22;
 const title=version===2?({2:'La prima previsione',3:'Riporti incrociati',9:'Accendi i motori',10:'Prevedi la spinta',11:'Zero e copie'}[level]||titles[level-1]):titles[level-1];
 return {level,version,title,sector:level<=8?'Energia':level<=16?'Propulsione':level<=20?'Orbita':'Rientro',predict,bonusMs:level>=5&&!(version===2&&[9,21,22].includes(level))?90000:0,orders:(version===1?legacyCases:cases)[level-1].map(args=>makeProblem(...args))};
}
