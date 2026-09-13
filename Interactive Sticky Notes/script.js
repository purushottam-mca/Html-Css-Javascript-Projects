const notesEl=document.getElementById('notes');
const overlay=document.getElementById('overlay');
const input=document.getElementById('user-input');
const charCount=document.getElementById('charCount');
const emptyEl=document.getElementById('empty');
const PALETTE=['#fef08a','#bbf7d0','#bae6fd','#fecdd3','#e9d5ff','#fed7aa'];
const TILTS=['rotate(-2deg)','rotate(1.5deg)','rotate(-1deg)','rotate(2deg)','rotate(-3deg)','rotate(1deg)'];
let notes=[];
try{const raw=localStorage.getItem('sticky-notes-v2');if(raw)notes=JSON.parse(raw);}catch(e){notes=[];}
if(!Array.isArray(notes))notes=[];
function persist(){try{localStorage.setItem('sticky-notes-v2',JSON.stringify(notes));}catch(e){}}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function paint(){
notesEl.innerHTML='';
emptyEl.classList.toggle('hidden',notes.length>0);
notes.forEach(function(n,idx){
const d=document.createElement('div');
d.className='note';d.tabIndex=0;
d.style.background=n.color;d.style.transform=n.tilt;
d.innerHTML='<button class="del" aria-label="Delete note">✕</button><p>'+esc(n.text)+'</p><small>'+esc(n.date)+'</small>';
d.querySelector('.del').onclick=function(ev){ev.stopPropagation();notes.splice(idx,1);persist();paint();};
notesEl.appendChild(d);
});
}
function openModal(){overlay.classList.remove('hidden');input.value='';charCount.textContent='0';setTimeout(function(){input.focus();},50);}
function closeModal(){overlay.classList.add('hidden');}
function addNote(){
const v=input.value.trim();
if(!v){input.focus();input.style.borderColor='#ef4444';setTimeout(function(){input.style.borderColor='';},900);return;}
notes.unshift({id:Date.now(),text:v.slice(0,280),color:PALETTE[notes.length%PALETTE.length],tilt:TILTS[Math.floor(Math.random()*TILTS.length)],date:new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'})});
persist();paint();closeModal();
}
document.getElementById('btn').onclick=openModal;
document.getElementById('cancelBtn').onclick=closeModal;
document.getElementById('closeBtn').onclick=closeModal;
document.getElementById('addBtn').onclick=addNote;
document.getElementById('clearBtn').onclick=function(){if(!notes.length)return;if(confirm('Delete all '+notes.length+' notes?')){notes=[];persist();paint();}};
overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
input.addEventListener('input',function(){charCount.textContent=input.value.length;});
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addNote();}});
(function migrate(){
try{
const old=localStorage.getItem('items');
if(old&&!localStorage.getItem('sticky-notes-v2-migrated')){
const arr=JSON.parse(old);
if(Array.isArray(arr)&&arr.length&&!notes.length){
notes=arr.filter(function(x){return typeof x==='string'&&x.trim();}).slice(0,50).map(function(x,i){return{id:Date.now()+i,text:String(x).slice(0,280),color:PALETTE[i%PALETTE.length],tilt:TILTS[i%TILTS.length],date:'imported'};});
persist();
}
localStorage.setItem('sticky-notes-v2-migrated','1');
}
}catch(e){}
})();
paint();
