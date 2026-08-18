#!/bin/bash
# Captures the five storyboard states from a running dev server.
S="${2:-/tmp/room-shots}"; URL="${1:-http://localhost:4321/}"; mkdir -p "$S"
ab() { agent-browser "$@" >/dev/null 2>&1; }
ab set viewport "${W:-1440}" "${H:-900}"
ab open "$URL"; sleep 1
ab eval "localStorage.clear();sessionStorage.clear();'cleared'"
ab reload; sleep 2
ab screenshot "$S/1-dark.png"

# sweep the light across the middle of the wall
ab eval "(()=>{const f=(x,y)=>dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));
let i=0;const p=[[900,420],[820,430],[720,440],[640,450],[560,455],[500,460]];
const t=setInterval(()=>{if(i>=p.length)return clearInterval(t);f(p[i][0],p[i][1]);i++},50);})()"
sleep 2; ab screenshot "$S/2-sweep.png"

# find the cord
ab eval "(()=>{const f=(x,y)=>dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));
let i=0;const p=[[420,460],[340,465],[260,470],[200,475],[160,480],[140,485]];
const t=setInterval(()=>{if(i>=p.length)return clearInterval(t);f(p[i][0],p[i][1]);i++},50);})()"
sleep 2; ab screenshot "$S/3-cord.png"

# drag it down
ab eval "(()=>{const h=document.getElementById('pull-hit');const r=h.getBoundingClientRect();
const x=r.x+r.width/2, y=r.y+r.height/2;
const ev=(t,cy)=>h.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:cy,pointerId:1,bubbles:true,cancelable:true}));
ev('pointerdown',y); window.__dragY=y; let i=1;
const t=setInterval(()=>{ if(i>16){clearInterval(t);return;} ev('pointermove',y+i*11); i++; },26);})()"
sleep 1; ab screenshot "$S/4-pull.png"
ab eval "(()=>{const h=document.getElementById('pull-hit');
h.dispatchEvent(new PointerEvent('pointerup',{clientX:0,clientY:0,pointerId:1,bubbles:true}));})()"
sleep 1; ab screenshot "$S/5-igniting.png"
sleep 2; ab screenshot "$S/6-lit.png"
ab eval "JSON.stringify({phase:document.documentElement.dataset.phase,lit:document.getElementById('room').dataset.lit})"
