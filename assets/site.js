/* ═══ SHOTS & STORIES — SHARED SITE LOGIC ═══
   Loaded by both index.html and galleries.html.
   Contains: data access, left-panel toggle, lightbox, toast.
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
  about: { heading:'About Us', photo:'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80', body:"Photography is a way of feeling, of touching, of loving. What you have caught on film is captured forever — it remembers little things, long after you have forgotten everything.\n\nI am based in Hyderabad, chasing light and stories across India and beyond. Every frame here is a short. Every album, a story worth telling.\n\nAvailable for portrait sessions, travel assignments, and creative collaborations.", awards:[] },
  theme: { primary:'#D4501A', accent:'#2A7D6F', dark:'#1a1a1a', fontKey:'josefin', instagramEmbedCode:'' }
};
function getData(){ try{const r=localStorage.getItem(DB_KEY);const d=r?JSON.parse(r):DEFAULT_DATA;if(!d.hero)d.hero=DEFAULT_DATA.hero;if(!d.theme)d.theme=DEFAULT_DATA.theme;if(d.about&&!d.about.awards)d.about.awards=[];return d;}catch(e){return DEFAULT_DATA;} }

/* REMOTE DATA — data.json is committed to the repo root by admin.html's
   "Publish to Live Site" button (GitHub Contents API). It's the actually-
   published content; localStorage is just this browser's cache of it (or,
   before the first-ever Publish, DEFAULT_DATA sample content). Every page
   fetches data.json once on load and, if present, overwrites the local
   cache with it so real visitors see real content instead of getting stuck
   on the bundled sample photos. Fails silently (returns false) on a 404
   (nothing published yet), offline, or malformed JSON — callers just skip
   the re-render and whatever was already shown from getData()'s existing
   fallback chain stays up. */
async function initData(){
  try{
    const res=await fetch('data.json',{cache:'no-store'});
    if(!res.ok) return false;
    const remote=await res.json();
    if(!remote||!Array.isArray(remote.albums)) return false;
    localStorage.setItem(DB_KEY,JSON.stringify(remote));
    return true;
  }catch(e){
    return false;
  }
}

/* Curated font catalog — admin picks by key, not free text, so a typo can't
   silently break every heading on the site. 'josefin' is the only one that
   loads for free (embedded as base64 in assets/fonts.css already); every
   other choice pulls from Google Fonts CDN at runtime, once, the first time
   it's actually selected. */
const FONT_OPTIONS = {
  josefin:    { label:"Josefin Sans (default)", family:"'Josefin Sans', sans-serif", url:null },
  playfair:   { label:'Playfair Display',       family:"'Playfair Display', serif", url:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap' },
  cormorant:  { label:'Cormorant Garamond',      family:"'Cormorant Garamond', serif", url:'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&display=swap' },
  raleway:    { label:'Raleway',                 family:"'Raleway', sans-serif", url:'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700&display=swap' },
  montserrat: { label:'Montserrat',              family:"'Montserrat', sans-serif", url:'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap' },
  ebgaramond: { label:'EB Garamond',             family:"'EB Garamond', serif", url:'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap' },
  dmserif:    { label:'DM Serif Display',        family:"'DM Serif Display', serif", url:'https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400&display=swap' }
};

/* Applies the saved theme (colors + font) by overriding the CSS custom
   properties already used throughout site.css (--orange/--teal/--dark/
   --font-main), instead of hardcoding colors/fonts per-rule. Runs
   automatically on every page load. */
function applyTheme(){
  const theme=(getData().theme)||DEFAULT_DATA.theme;
  const root=document.documentElement.style;
  if(theme.primary) root.setProperty('--orange',theme.primary);
  if(theme.accent) root.setProperty('--teal',theme.accent);
  if(theme.dark) root.setProperty('--dark',theme.dark);
  const font=FONT_OPTIONS[theme.fontKey]||FONT_OPTIONS.josefin;
  if(font.url && !document.querySelector(`link[data-theme-font="${theme.fontKey}"]`)){
    const link=document.createElement('link');
    link.rel='stylesheet'; link.href=font.url; link.dataset.themeFont=theme.fontKey;
    document.head.appendChild(link);
  }
  root.setProperty('--font-main',font.family);
}

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

/* LIGHTBOX — shows either #lb-img or #lb-video depending on the current
   item. There's no intermediate album-detail view anymore (the old drawer
   was removed) — clicking any album entry point (thumbnail, title, "See
   More", hero's "View Album") goes straight into the lightbox via
   openAlbumLightbox(), which points lbImgs at that album's images and
   opens lbOpen() at the given index. */
let lbImgs=[], lbIdx=0;
function openAlbumLightbox(albumId,idx){
  const data=getData(); const a=data.albums.find(x=>x.id===albumId); if(!a||!a.images.length) return;
  lbImgs=a.images;
  lbOpen(idx);
}
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

/* every page needs these on load */
initPanelState();
applyTheme();
