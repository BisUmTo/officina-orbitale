import {validateLog} from './report.mjs';
const encoder=new TextEncoder(), decoder=new TextDecoder('utf-8',{fatal:true});
const AAD=encoder.encode('officina-orbitale-v1');
const MAX_CIPHERTEXT=64*1024*1024;
const keyIds=new WeakMap();
export function to64(bytes){let text='';for(const byte of new Uint8Array(bytes))text+=String.fromCharCode(byte);return btoa(text);}
export function from64(value){if(typeof value!=='string'||value.length>MAX_CIPHERTEXT||value.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw Error('Dati cifrati non validi');return Uint8Array.from(atob(value),char=>char.charCodeAt(0));}
export async function importPublic(jwk){if(jwk?.kty!=='RSA'||typeof jwk.n!=='string'||typeof jwk.e!=='string'||jwk.d)throw Error('Chiave pubblica non valida');return crypto.subtle.importKey('jwk',jwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);}
export async function importPrivate(jwk){if(jwk?.kty!=='RSA'||typeof jwk.d!=='string')throw Error('Chiave privata non valida');const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);keyIds.set(key,jwk.n.slice(0,20));return key;}
export async function seal(log,publicJwk){
 validateLog(log);
 const pub=await importPublic(publicJwk),key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']);
 const plaintext=encoder.encode(JSON.stringify(log));
 if(plaintext.length>47*1024*1024)throw Error('Report troppo grande: esporta meno tentativi per file.');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:AAD,tagLength:128},key,plaintext);
 const wrappedKey=await crypto.subtle.encrypt({name:'RSA-OAEP'},pub,await crypto.subtle.exportKey('raw',key));
 return {format:'officina-orbitale',version:1,keyId:publicJwk.n.slice(0,20),iv:to64(iv),wrappedKey:to64(wrappedKey),ciphertext:to64(ciphertext)};
}
export async function unseal(envelope,privateKey){
 if(envelope?.format!=='officina-orbitale'||envelope.version!==1||typeof envelope.keyId!=='string')throw Error('Formato file non riconosciuto');
 if(keyIds.has(privateKey)&&keyIds.get(privateKey)!==envelope.keyId)throw Error('Il file appartiene a un’altra chiave docente.');
 const iv=from64(envelope.iv),wrappedKey=from64(envelope.wrappedKey),ciphertext=from64(envelope.ciphertext);
 if(iv.length!==12||ciphertext.length<16||wrappedKey.length<256||wrappedKey.length>1024)throw Error('Report cifrato non valido');
 try {
  const raw=await crypto.subtle.decrypt({name:'RSA-OAEP'},privateKey,wrappedKey);
  if(raw.byteLength!==32)throw Error('Chiave non valida');
  const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
  const log=JSON.parse(decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:AAD,tagLength:128},key,ciphertext)));
  return validateLog(log);
 }catch {throw Error('Impossibile aprire il report: chiave errata, file alterato o contenuto non valido.');}
}
export async function unlock(jwk,publicJwk){
 if(jwk?.n!==publicJwk?.n||jwk?.e!==publicJwk?.e||!jwk?.d)throw Error('Questa chiave non appartiene a Officina Orbitale.');
 const key=await importPrivate(jwk),pub=await importPublic(publicJwk),nonce=crypto.getRandomValues(new Uint8Array(32));
 const encrypted=await crypto.subtle.encrypt({name:'RSA-OAEP'},pub,nonce);
 const plain=new Uint8Array(await crypto.subtle.decrypt({name:'RSA-OAEP'},key,encrypted));
 if(plain.length!==nonce.length||!plain.every((value,index)=>value===nonce[index]))throw Error('Chiave non valida');
 return key;
}
