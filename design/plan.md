# Officina Orbitale Implementation Plan
Goal: gioco statico mobile completo, verificato, log e docente con meccanica intrinseca.
Architecture: corepuro +appDOM/SVG + reportpuro + cryptolocale. Spec: design/spec.md.
Global constraints: frontendonly;<=8bits; nochiaviprivateinrepo; GitHubsubpath; italiano; max4h+1.
Execution: agenti per core e review, root UIintegrazione; unità indipendenti ownershipfile, nessun gioco precedente modificato.
## Task1 Core arithmetic
- [x] tests/core.test.mjs: somme0+0,1+1,7+1; prodotti0,1,5x5,15x15; carryconservation; invalidindices; replay firsterror; mission20coverage.
- [x] docs/core.mjs implements exactAPI spec; exhaustiveaddition0..127,total<=255 and multiplication0..15 test truth.
- [x] node --test tests/core.test.mjs, independentreview.
## Task2 UI and art
- [x] docs/index.html,style.css,app.mjs,art.mjs,audio.mjs,clock.mjs; input touchkeyboard, persistentstate inclactiveclock.
- [x] imagegenmockup/background, originalSVGmodularvehicles; tokens fly, nativeCSSanimations reducedmotion.
- [x] browse360x640,390x844,desktop. Verifyactualflow additioncarry,multiplication,help,outputwrong/right,pause,reload,allmissionreachability.
## Task3 Report
- [x] docs/report.mjs validateLog/replay summary, docs/crypto.mjs independentformatkeys; tools/keygen.mjs privateoutput outside.
- [x] docs/prof.html/prof.mjs/prof.css multiimport,keyunlock,dedup,detailCSV; tests/report.test.mjs actualcryptoroundtrip/wrongkey/tamper.
- [x] testbadlogs wrongactions,monotonicity,duplicateIDconflict,atomicimport,CSVformula.
## Task4 Review and delivery
- [x] independentcode/designreview, fixconfirmedfindings, testsuite onceand targetedreruns.
- [x] README,GUIDA-DOCENTE,CREDITS,progress finalwithreal limits.
- [x] localGitbranch+commit; installcopy in GitHubfolder onlyifapprovedbyexistingauthorization/reversible. No publish.
- [x] pauseautomationoncomplete, delivergame/link,keyfolder,docs.
## Review focus
1 reload duringfeedback preservesattempt/errors;2 hiddenapp pausesclock;3 8columnssmallphone usable;4 interruptedlogsvalid;5 maliciousfile contentsnotHTML.
