#!/usr/bin/env node
import {webcrypto} from 'node:crypto';
import {mkdir,writeFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const publicPath=fileURLToPath(new URL('../docs/public-key.json',import.meta.url));
const privateDir=fileURLToPath(new URL('../../output/officina-orbitale-private/',import.meta.url));
const privatePath=fileURLToPath(new URL('../../output/officina-orbitale-private/chiave-privata-docente.json',import.meta.url));
for(const path of [publicPath,privatePath]){
 try{await access(path);throw Error('Chiavi già presenti: generazione annullata per evitare di invalidare i LOG.');}
 catch(error){if(error.code!=='ENOENT')throw error;}
}
const pair=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:3072,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
const publicJwk=await webcrypto.subtle.exportKey('jwk',pair.publicKey),privateJwk=await webcrypto.subtle.exportKey('jwk',pair.privateKey);
await mkdir(privateDir,{recursive:true,mode:0o700});
await writeFile(privatePath,JSON.stringify(privateJwk,null,2)+'\n',{flag:'wx',mode:0o600});
await writeFile(publicPath,JSON.stringify(publicJwk,null,2)+'\n',{flag:'wx',mode:0o644});
console.log('Nuova chiave pubblica salvata in docs/public-key.json. Chiave privata docente salvata fuori dal progetto in output/officina-orbitale-private.');
