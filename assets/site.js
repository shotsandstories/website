/* ═══ SHOTS & STORIES — SHARED SITE LOGIC ═══
   Loaded by both index.html and galleries.html.
   Contains: data access, left-panel toggle, album drawer, lightbox, toast.
   Page-specific rendering (hero, about, galleries list, scroll-spy) lives
   in each page's own inline <script> block, after this file loads. */

const DB_KEY = 'sns_data';
const DEFAULT_DATA = {
  albums: [
    { id:'a1', title:'Golden Light', description:'Photography is a way of feeling, of touching, of loving. What you have caught on film is captured forever.', tags:['Portrait','Golden Hour'], cover:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&q=80', images:['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&q=80','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80','https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=80','https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80'] },
    { id:'a2', title:'City Whispers', description:'Urban geometry, solitude in crowds, and the quiet poetry hidden in concrete streets at night.', tags:['Urban','Street'], cover:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80', images:['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80','https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=900&q=80','https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&q=80','https://images.unsplash.com/photo-1514565131-fce0801e6f7e?w=900&q=80'] },
    { id:'a3', title:'Still Water', description:"Reflections, stillness, and the meditative calm of nature's quieter moments by the lake.", tags:['Nature','Landscape'], cover:'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1400&q=80', images:['https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1400&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80','https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80','https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=900&q=80'] },
    { id:'a4', title:'Into the Wild', description:'Mountains, mist, and the raw silence of places untouched by time.', tags:['Nature','Mountain'], cover:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80', images:['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80','https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&q=80','https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80','https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=80'] }
  ],
  hero: [
    { id:'h1', url:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=85', label:'Portrait', title:'Golden Light', albumId:'a1' },
    { id:'h2', url:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=85', label:'Urban', title:'City Whispers', albumId:'a2' },
    { id:'h3', url:'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&q=85', label:'Landscape', title:'Still Water', albumId:'a3' },
    { id:'h4', url:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85', label:'Nature', title:'Into the Wild', albumId:'a4' },
    { id:'h5', url:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=85', label:'Serenity', title:'Open Horizons', albumId:null }
  ],
  about: { heading:'About Us', photo:'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80', body:"Photography is a way of feeling, of touching, of loving. What you have caught on film is captured forever — it remembers little things, long after you have forgotten everything.\n\nI am based in Hyderabad, chasing light and stories across India and beyond. Every frame here is a short. Every album, a story worth telling.\n\nAvailable for portrait sessions, travel assignments, and creative collaborations." }
};
function getData(){ try{const r=localStorage.getItem(DB_KEY);const d=r?JSON.parse(r):DEFAULT_DATA;if(!d.hero)d.hero=DEFAULT_DATA.hero;return d;}catch(e){return DEFAULT_DATA;} }

/* Videos and photos share the same album.images string array — a URL is
   recognized as video purely by Cloudinary's own URL convention
   (.../video/upload/... vs .../image/upload/...), since that's what the
   admin's upload pipeline actually produces. No schema change needed. */
function isVideoUrl(url){ return typeof url==='string' && url.indexOf('/video/upload/')!==-1; }

/* PANEL TOGGLE */
let panelOpen=false;
function togglePanel(){
  panelOpen=!panelOpen;
  const btn=document.getElementById('ham-btn');
  const panel=document.getElementById('left-panel');
  btn.classList.toggle('open',panelOpen);
  if(window.innerWidth>900){ panel.classList.toggle('hidden',!panelOpen); }
  else { panel.classList.toggle('visible',panelOpen); }
}
function initPanelState(){
  panelOpen=false;
  const btn=document.getElementById('ham-btn');
  const panel=document.getElementById('left-panel');
  btn.classList.remove('open');
  if(window.innerWidth>900){ panel.classList.add('hidden'); }
  else { panel.classList.remove('visible'); }
}

/* DRAWER */
let currentAlbumId=null, lbImgs=[], lbIdx=0;
function openDrawer(id){
  const data=getData(); const a=data.albums.find(x=>x.id===id); if(!a)return;
  currentAlbumId=id;
  document.getElementById('drawer-title').textContent=a.title;
  document.getElementById('drawer-desc').textContent=a.description;
  document.getElementById('drawer-cats').innerHTML=a.tags.map((t,i)=>i===0?t:`<span class="sep">/</span>${t}`).join('');
  lbImgs=a.images;
  const imgs=a.images; let rows=[];
  if(imgs.length>0)rows.push({cols:1,imgs:[imgs[0]]});
  for(let i=1;i<imgs.length;i+=2)rows.push({cols:Math.min(2,imgs.length-i),imgs:imgs.slice(i,i+2)});
  document.getElementById('drawer-images').innerHTML=rows.map(row=>`<div class="album-img-row row-${row.cols}">${row.imgs.map(img=>{
    const gi=imgs.indexOf(img);
    const media=isVideoUrl(img)
      ? `<video src="${img}" muted preload="metadata"></video><span class="video-badge">&#9654;</span>`
      : `<img src="${img}" loading="lazy" alt="">`;
    return `<div class="album-img-item" onclick="lbOpen(${gi})">${media}<button class="share-btn">Share</button></div>`;
  }).join('')}</div>`).join('');
  const drawer=document.getElementById('album-drawer'); drawer.classList.add('open'); drawer.scrollTo(0,0);
}
function closeDrawer(){ document.getElementById('album-drawer').classList.remove('open'); }
function drawerNav(dir){ const data=getData(); const idx=data.albums.findIndex(a=>a.id===currentAlbumId); const next=data.albums[(idx+dir+data.albums.length)%data.albums.length]; if(next)openDrawer(next.id); }

/* LIGHTBOX — shows either #lb-img or #lb-video depending on the current item */
function lbOpen(i){lbIdx=i;document.getElementById('lightbox').classList.add('open');lbRefresh();document.addEventListener('keydown',lbKey);}
function lbClose(){
  document.getElementById('lightbox').classList.remove('open');
  document.removeEventListener('keydown',lbKey);
  const v=document.getElementById('lb-video'); v.pause();
}
function lbMove(d){lbIdx=(lbIdx+d+lbImgs.length)%lbImgs.length;lbRefresh();}
function lbRefresh(){
  const url=lbImgs[lbIdx];
  const imgEl=document.getElementById('lb-img');
  const vidEl=document.getElementById('lb-video');
  if(isVideoUrl(url)){
    imgEl.style.display='none'; imgEl.removeAttribute('src');
    vidEl.style.display='block'; vidEl.src=url;
  } else {
    vidEl.pause(); vidEl.removeAttribute('src'); vidEl.load();
    vidEl.style.display='none';
    imgEl.style.display='block'; imgEl.src=url;
  }
  document.getElementById('lb-cap').textContent=`${lbIdx+1} / ${lbImgs.length}`;
}
function lbKey(e){if(e.key==='Escape')lbClose();if(e.key==='ArrowLeft')lbMove(-1);if(e.key==='ArrowRight')lbMove(1);}
document.getElementById('lightbox').addEventListener('click',function(e){if(e.target===this)lbClose();});

/* TOAST */
function showToast(msg,err=false){const t=document.getElementById('toast');t.textContent=msg;t.classList.toggle('error',err);t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);}

/* every page needs this on load */
initPanelState();
