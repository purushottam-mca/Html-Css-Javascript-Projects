const cells=[...document.querySelectorAll('.cell')];
const boardEl=document.getElementById('board');
const statusEl=document.getElementById('status');
const winLine=document.getElementById('winLine');
const scoreX=document.getElementById('scoreX');
const scoreO=document.getElementById('scoreO');
const scoreD=document.getElementById('scoreD');
const mode2p=document.getElementById('mode-2p');
const modeAi=document.getElementById('mode-ai');
const diffSel=document.getElementById('difficulty');
const humanSel=document.getElementById('humanSymbol');
const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let board=Array(9).fill('');
let turn='X',over=false,vsAI=false;
let scores={X:0,O:0,D:0};
try{scores=JSON.parse(localStorage.getItem('ttt-scores'))||scores;}catch(e){}
function saveScores(){try{localStorage.setItem('ttt-scores',JSON.stringify(scores));}catch(e){}paintScores();}
function paintScores(){scoreX.textContent=scores.X;scoreO.textContent=scores.O;scoreD.textContent=scores.D;}
function setStatus(html,cls){statusEl.className='status '+(cls||'');statusEl.innerHTML=html;}
function symCls(s){return s==='X'?'x':'o';}
function winner(b){for(const w of WINS){const a=w[0],c=w[1],d=w[2];if(b[a]&&b[a]===b[c]&&b[a]===b[d])return{winner:b[a],line:w};}return b.indexOf('')===-1?{winner:'D',line:null}:null;}
function render(){cells.forEach(function(c,i){c.textContent=board[i];c.className='cell'+(board[i]?' '+symCls(board[i]):'');c.disabled=!!board[i]||over;});}
function minimax(b,isMax,ai,hu,depth,alpha,beta){
const r=winner(b);
if(r){if(r.winner===ai)return 10-depth;if(r.winner===hu)return depth-10;return 0;}
if(isMax){let best=-99;for(let i=0;i<9;i++){if(b[i]===''){b[i]=ai;const v=minimax(b,false,ai,hu,depth+1,alpha,beta);b[i]='';if(v>best)best=v;if(v>alpha)alpha=v;if(beta<=alpha)break;}}return best;}
let best2=99;for(let j=0;j<9;j++){if(b[j]===''){b[j]=hu;const v2=minimax(b,true,ai,hu,depth+1,alpha,beta);b[j]='';if(v2<best2)best2=v2;if(v2<beta)beta=v2;if(beta<=alpha)break;}}return best2;
}
function bestMove(){
const ai=turn,hu=ai==='X'?'O':'X';
const empty=[];board.forEach(function(v,i){if(v==='')empty.push(i);});
if(diffSel.value==='easy'&&Math.random()<0.7)return empty[Math.floor(Math.random()*empty.length)];
if(diffSel.value==='medium'&&Math.random()<0.3)return empty[Math.floor(Math.random()*empty.length)];
let best=-99,move=empty[0];
const order=[4,0,2,6,8,1,3,5,7].filter(function(i){return board[i]==='';});
for(const i of order){board[i]=ai;const s=minimax(board,false,ai,hu,0,-99,99);board[i]='';if(s>best){best=s;move=i;}}
return move;
}
function drawWinLine(line){
if(!line){winLine.classList.add('hidden');return;}
const r=boardEl.getBoundingClientRect();
const a=cells[line[0]].getBoundingClientRect();
const b=cells[line[2]].getBoundingClientRect();
const ax=a.left+a.width/2-r.left,ay=a.top+a.height/2-r.top;
const bx=b.left+b.width/2-r.left,by=b.top+b.height/2-r.top;
const len=Math.hypot(bx-ax,by-ay);
const ang=Math.atan2(by-ay,bx-ax)*180/Math.PI;
winLine.classList.remove('hidden');
winLine.style.left=ax+'px';winLine.style.top=(ay-3)+'px';
winLine.style.width=len+'px';winLine.style.transform='rotate('+ang+'deg)';
}
function finish(w,line){
over=true;render();cells.forEach(function(c){c.disabled=true;});
if(w==='D'){scores.D++;setStatus("🤝 It's a draw!",'draw');}
else{scores[w]++;setStatus('🎉 Player <span class="'+symCls(w)+'">'+w+'</span> wins!','win');line.forEach(function(i){cells[i].classList.add('winner');});drawWinLine(line);blast();}
saveScores();
}
function announce(){const t='<span class="'+symCls(turn)+'">'+turn+'</span>';if(vsAI){setStatus(turn===humanSel.value?('Your turn '+t):('Computer '+t+' thinking...'));}else{setStatus('Player '+t+"'s turn");}}
function play(i){
if(over||board[i])return;
board[i]=turn;render();
const r=winner(board);
if(r){finish(r.winner,r.line);return;}
turn=turn==='X'?'O':'X';announce();
if(vsAI&&!over)setTimeout(function(){const m=bestMove();if(m!=null)play(m);},350);
}
function newRound(){
board=Array(9).fill('');over=false;turn='X';
winLine.classList.add('hidden');
cells.forEach(function(c){c.classList.remove('winner');});
render();announce();
if(vsAI&&turn!==humanSel.value)setTimeout(function(){play(bestMove());},350);
}
cells.forEach(function(c,i){c.addEventListener('click',function(){play(i);});});
document.getElementById('newRound').onclick=newRound;
document.getElementById('resetScores').onclick=function(){scores={X:0,O:0,D:0};saveScores();newRound();};
mode2p.onclick=function(){vsAI=false;mode2p.classList.add('active');modeAi.classList.remove('active');newRound();};
modeAi.onclick=function(){vsAI=true;modeAi.classList.add('active');mode2p.classList.remove('active');newRound();};
diffSel.onchange=newRound;
humanSel.onchange=function(){if(vsAI)newRound();};
const cv=document.getElementById('confetti'),ctx=cv.getContext('2d');
let parts=[],raf=null;
function sizeCv(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
window.addEventListener('resize',sizeCv);sizeCv();
function blast(){
const colors=['#22d3ee','#f472b6','#a78bfa','#facc15','#34d399'];
for(let k=0;k<140;k++)parts.push({x:window.innerWidth/2+(Math.random()-0.5)*220,y:window.innerHeight*0.35,vx:(Math.random()-0.5)*11,vy:Math.random()*-9-2,g:0.32,s:Math.random()*7+3,c:colors[k%colors.length],r:Math.random()*Math.PI,vr:(Math.random()-0.5)*0.3,l:90+Math.random()*60});
if(!raf)tick();
}
function tick(){
ctx.clearRect(0,0,cv.width,cv.height);
parts=parts.filter(function(p){return p.l>0;});
parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.r+=p.vr;p.l--;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.6);ctx.restore();});
if(parts.length){raf=requestAnimationFrame(tick);}else{raf=null;ctx.clearRect(0,0,cv.width,cv.height);}
}
window.addEventListener('resize',function(){const wb=winner(board);drawWinLine(wb&&wb.line);});
paintScores();newRound();
