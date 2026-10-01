const integer = (n, min=0, max=255) => Number.isInteger(n) && n >= min && n <= max;
const length = n => Math.max(1, Math.floor(Math.log2(n || 1)) + 1);
export function bits(value, width=length(value)) {
  if (!integer(value) || !integer(width,1,8) || value >= 2 ** width) throw new TypeError('Bit non validi');
  return Array.from({length:width}, (_,i) => (value >> i) & 1);
}
export function expected(problem) {
  if (!problem || !['add','mul'].includes(problem.op) || !integer(problem.a) || !integer(problem.b)) throw new TypeError('Problema non valido');
  const value = problem.op === 'add' ? problem.a + problem.b : problem.a * problem.b;
  if (value > 255) throw new RangeError('Risultato oltre 8 bit');
  return value;
}
export function makeProblem(op,a,b) {
  const problem = {op,a,b};
  return {...problem,width:Math.max(4,length(expected(problem)))};
}
export function createPuzzle(problem) {
  const checked = makeProblem(problem.op,problem.a,problem.b);
  if (problem.width !== checked.width) throw new TypeError('Larghezza non valida');
  const counts = Array(checked.width).fill(0);
  if (checked.op === 'add') for (let i=0;i<counts.length;i++) counts[i]=((checked.a>>i)&1)+((checked.b>>i)&1);
  return {problem:{...checked},counts,nextRow:0,rows:[],phase:checked.op==='mul'?'partials':'reactor'};
}
export function applyMove(puzzle,action) {
  if (!action || typeof action !== 'object' || !['merge','partial','submit','hint'].includes(action.kind)) throw new TypeError('Azione non valida');
  if (action.kind==='merge' && !integer(action.column,0,puzzle.problem.width-1)) throw new TypeError('Colonna non valida');
  if (action.kind==='partial' && (typeof action.include!=='boolean' || !integer(action.shift,0,3))) throw new TypeError('Parziale non valido');
  if (action.kind==='submit' && !integer(action.value)) throw new TypeError('Risultato non valido');
  const fail = reason => ({puzzle,correct:false,reason});
  if (puzzle.phase==='completed') return fail('completed');
  if (action.kind==='hint') return {puzzle,correct:true,reason:'hint'};
  if (action.kind==='merge') {
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
  let puzzle=createPuzzle(problem),errors=0,merges=0,partialCorrect=0,partialErrors=0,submitCount=0,hints=0;
  for (const action of actions) {
    const result=applyMove(puzzle,action);
    if (!result.correct) errors++;
    if (action.kind==='submit') submitCount++;
    if (action.kind==='partial') result.correct ? partialCorrect++ : partialErrors++;
    if (result.correct && action.kind==='merge') merges++;
    if (result.correct && action.kind==='hint') hints++;
    puzzle=result.puzzle;
  }
  const completed=puzzle.phase==='completed';
  return {puzzle,errors,merges,partialCorrect,partialErrors,submitCount,firstTry:completed&&errors===0&&submitCount===1,completed,hints,independent:hints===0};
}
const cases = [
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
export function mission(level) {
 if (!integer(level,1,20)) throw new RangeError('Missione non valida');
 return {level,title:titles[level-1],sector:level<=8?'Energia':level<=16?'Propulsione':'Orbita',predict:(level>=6&&level<=8)||level>=15,bonusMs:level>=5?90000:0,orders:cases[level-1].map(args=>makeProblem(...args))};
}
