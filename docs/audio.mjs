/** Original synthesized cues: no audio downloads, samples, or network calls. */
export class GameAudio {
 constructor(){this.ctx=null;this.enabled=true;this.music=false;this.interval=null;this.beat=0;}
 async unlock(){try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')await this.ctx.resume();}catch{}}
 tone(freq,delay=0,duration=.15,type='sine',volume=.05){if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
 play(name){if(name==='correct'){this.tone(523,0,.12,'triangle');this.tone(784,.09,.2,'triangle');}else if(name==='wrong'){this.tone(185,0,.18,'triangle',.07);this.tone(139,.13,.23,'triangle',.06);}else if(name==='timeout'){this.tone(330,0,.12,'triangle');this.tone(247,.15,.18,'triangle');this.tone(165,.3,.25,'triangle');}else if(name==='level'){[392,523,659,784].forEach((f,i)=>this.tone(f,i*.1,.25,'triangle'));}else if(name==='tick')this.tone(880,0,.045,'sine',.018);else this.tone(440,0,.055,'sine',.018);}
 configure(enabled,music){this.enabled=enabled;this.music=music;this.stopMusic();if(enabled&&music&&this.ctx)this.interval=setInterval(()=>{const notes=[130.81,164.81,196,164.81,110,146.83,174.61,146.83];this.tone(notes[this.beat++%notes.length],0,.5,'sine',.012);},420);}
 stopMusic(){if(this.interval)clearInterval(this.interval);this.interval=null;}
}
