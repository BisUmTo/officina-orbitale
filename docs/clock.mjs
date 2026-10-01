/** Foreground decision time only. Pauses do not spend the guest's allowance. */
export class DecisionClock {
 constructor(now=()=>performance.now()){this.now=now;this.running=false;this.spent=0;this.started=0;this.limit=null;}
 reset(limit=null,spent=0){this.running=false;this.spent=Math.max(0,Number(spent)||0);this.limit=limit;return this;}
 resume(){if(!this.running){this.started=this.now();this.running=true;}return this;}
 pause(){if(this.running){this.spent+=Math.max(0,this.now()-this.started);this.running=false;}return this.elapsed;}
 get elapsed(){return this.spent+(this.running?Math.max(0,this.now()-this.started):0);}
 get remaining(){return this.limit===null?null:Math.max(0,this.limit-this.elapsed);}
 get expired(){return this.limit!==null&&this.remaining===0;}
}
