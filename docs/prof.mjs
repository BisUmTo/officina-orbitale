import {mergeLogs,summarize,buildCSV,escapeHTML as html,modeLabel,scaffoldOf} from './report.mjs';
import {unlock,unseal} from './crypto.mjs';
import {createPuzzle,applyMove} from './core.mjs';
const duration=ms=>{const seconds=Math.round(ms/1000);return seconds>=60?`${Math.floor(seconds/60)} min ${seconds%60} s`:`${seconds} s`;};
const operation=problem=>`${problem.a.toString(2)} ${problem.op==='add'?'+':'×'} ${problem.b.toString(2)}`;
function mount(){
 const $=id=>document.getElementById(id);
 let privateKey=null,publicKey=null,logs=[],report=summarize([]),busy=false;
 const status=(message,error=false)=>{$('status').textContent=message;$('status').classList.toggle('error',error);};
 function filtered(){
  const name=$('filter-name').value.trim().toLocaleLowerCase('it'),className=$('filter-class').value,mode=$('filter-mode').value;
  return report.students.filter(row=>(mode==='all'||row.mode===mode)&&(!name||row.name.toLocaleLowerCase('it').includes(name))&&(!className||JSON.stringify(row.className)===className));
 }
 function setBusy(value){
  busy=value;$('key-file').disabled=busy||!publicKey;$('log-files').disabled=busy||!privateKey;
  $('lock-key').disabled=busy||!privateKey;$('clear-reports').disabled=busy||!logs.length;$('download-csv').disabled=busy||!filtered().length;
 }
 function paint(){
  const rows=filtered();
  $('count-students').textContent=new Set(rows.map(row=>row.studentKey)).size;
  $('count-attempts').textContent=rows.reduce((sum,row)=>sum+row.total,0);
  $('count-completed').textContent=rows.reduce((sum,row)=>sum+row.completed,0);
  $('count-duplicates').textContent=report.duplicates;
  $('table-body').innerHTML=rows.map(row=>`<tr><th scope="row"><button class="student-link" data-student="${html(row.key)}">${html(row.name)}</button></th><td>${html(row.className)||'—'}</td><td class="mode">${modeLabel(row.mode)}</td><td>${row.completed}/${row.total}</td><td>${row.firstTry}/${row.total}</td><td>${row.errors}</td><td>${row.hints}</td><td>${duration(row.activeMs)}</td></tr>`).join('');
  $('results-table').hidden=!rows.length;$('empty-state').hidden=!!rows.length;
  $('empty-state').querySelector('p').textContent=report.total?'Nessun percorso corrisponde ai filtri.':'Carica la chiave docente e importa i LOG per osservare i percorsi.';
  setBusy(busy);
 }
 function paintClasses(){
  const previous=$('filter-class').value;
  $('filter-class').innerHTML='<option value="">Tutte le classi</option>'+[...new Set(report.students.map(row=>row.className))].sort((a,b)=>a.localeCompare(b,'it')).map(className=>`<option value="${html(JSON.stringify(className))}">${html(className)||'Senza classe'}</option>`).join('');
  $('filter-class').value=previous;
 }
 function actionList(attempt){
  let puzzle=createPuzzle(attempt.problem);
  return attempt.actions.map(action=>{
   const result=applyMove(puzzle,action),row=puzzle.nextRow;puzzle=result.puzzle;
   let text=action.kind==='hint'?'Aiuto aperto':action.kind==='merge'?`Fusione nella colonna 2^${action.column}`:action.kind==='partial'?`Parziale ${row+1}: ${action.include?'copia':'riga zero'}, spostamento ${action.shift}`:`Risultato proposto: ${action.value.toString(2)} (${action.value})`;
   const reason={'partial-value':'scelta della copia o riga zero errata','partial-shift':'allineamento errato','wrong-result':'risultato errato','merge-unavailable':'fusione non disponibile','partials-required':'parziali ancora da completare','partial-unavailable':'parziali già completati'}[result.reason];
   return `<li>${html(text)} · ${duration(action.activeAtMs)} · ${result.correct?(action.kind==='hint'?'aiuto registrato':'corretto'):html(reason||'azione errata')}</li>`;
  }).join('');
 }
 function details(key){
  const row=filtered().find(row=>row.key===key);if(!row)return;
  $('detail-title').textContent=row.name;
  $('detail-subtitle').textContent=`${row.className||'Classe non indicata'} · ${modeLabel(row.mode)} · ${row.sessions} sessioni`;
  $('detail-content').innerHTML=`<p>${row.completed}/${row.total} completati · ${row.firstTry} senza errori al primo tentativo · ${row.independent} senza aiuti richiesti.</p><p>${row.merges} fusioni valide · ${row.partialCorrect} parziali corretti · ${row.partialValueErrors} errori nella scelta del parziale · ${row.partialShiftErrors} errori di allineamento. Mediana del tempo attivo: ${duration(row.medianActiveMs)}.</p>`+row.attempts.map(attempt=>`<article class="attempt"><div class="attempt-meta"><span>Missione ${attempt.level}</span><span>${scaffoldOf(attempt)==='reactor'?'Reattore guidato':'Previsione'}</span><time>${html(new Date(attempt.at).toLocaleString('it-IT'))}</time><span>${duration(attempt.activeMs)}</span></div><h3>${operation(attempt.problem)} = ${attempt.metrics.expected.toString(2)}</h3><p>${attempt.status==='completed'?'Completato':'Abbandonato'} · ${attempt.metrics.errors} errori · ${attempt.metrics.hints} aiuti · ${attempt.metrics.firstTry?'primo tentativo senza errori':'percorso con correzioni o non completato'}</p><details><summary>Osserva le ${attempt.actions.length} azioni</summary><ol>${actionList(attempt)}</ol></details></article>`).join('');
  $('student-detail').showModal();
 }
 $('key-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file||busy)return;
  setBusy(true);status('Verifica della chiave docente…');
  try{
   if(file.size>100000)throw Error('File chiave troppo grande.');
   const key=await unlock(JSON.parse(await file.text()),publicKey);
   privateKey=key;$('key-status').textContent='Chiave attiva in questa scheda';status('Chiave verificata. Puoi importare i LOG.');
  }catch(error){status(error.message||'Chiave non valida.',true);}
  finally{event.target.value='';setBusy(false);}
 });
 $('log-files').addEventListener('change',async event=>{
  const files=[...event.target.files];if(!files.length||!privateKey||busy)return;
  setBusy(true);const additions=[];
  try{
   if(files.length>100)throw Error('Seleziona al massimo 100 LOG per importazione.');
   if(files.reduce((sum,file)=>sum+file.size,0)>128*1024*1024)throw Error('Selezione superiore a 128 MB. Importa meno file per volta.');
   for(const [index,file] of files.entries()){
    status(`Apertura ${index+1}/${files.length}: ${file.name}`);
    if(file.size>64*1024*1024)throw Error(`${file.name}: file superiore a 64 MB.`);
    try{additions.push(await unseal(JSON.parse(await file.text()),privateKey));}
    catch(error){throw Error(`${file.name}: ${error.message}`);}
   }
   const prospective=[...logs,...additions];mergeLogs(prospective);
   const nextReport=summarize(prospective);
   logs=prospective;report=nextReport;paintClasses();paint();
   status(`${files.length} LOG importati. ${report.total} tentativi unici; ${report.duplicates} sovrapposizioni escluse.`);
  }catch(error){status(`${error.message} Nessun file della selezione è stato aggiunto.`,true);}
  finally{event.target.value='';setBusy(false);}
 });
 $('lock-key').addEventListener('click',()=>{privateKey=null;$('key-status').textContent='Chiave non caricata';setBusy(false);status('Chiave rimossa dalla memoria. I risultati aperti restano visibili.');});
 $('clear-reports').addEventListener('click',()=>{logs=[];report=summarize([]);$('student-detail').close();$('detail-content').replaceChildren();paintClasses();paint();status('Report rimossi dalla pagina.');});
 for(const id of ['filter-class','filter-mode'])$(id).addEventListener('change',paint);
 $('filter-name').addEventListener('input',paint);
 $('table-body').addEventListener('click',event=>{const button=event.target.closest('[data-student]');if(button)details(button.dataset.student);});
 $('close-detail').addEventListener('click',()=>$('student-detail').close());
 $('download-csv').addEventListener('click',()=>{
  try{
   const url=URL.createObjectURL(new Blob([buildCSV(filtered())],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');
   link.href=url;link.download=`officina-orbitale-${$('filter-mode').value}-${new Date().toISOString().slice(0,10)}.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('CSV preparato per il download.');
  }catch(error){status(`Download non riuscito: ${error.message}`,true);}
 });
 paint();
 fetch('./public-key.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Chiave pubblica non disponibile.');return response.json();}).then(jwk=>{publicKey=jwk;setBusy(false);status('Pronto. Carica la chiave privata docente.');}).catch(error=>status(`${error.message} Apri la pagina dal sito del gioco o da un server locale.`,true));
}
if(typeof document!=='undefined')mount();
