/* Trivenkem Sample Godown – all data stays in this browser (localStorage + IndexedDB for photos). */
const KEY='triven_godown_v1',CKEY='triven_godown_cfg';
const DEF={cats:{'Fabric Care':'#2563eb','Home Care':'#0f9d78','Fine Fragrance':'#7c3aed','Personal Care':'#c026a3','Multipurpose':'#c9871f','Other':'#64748b'},status:{'Available':'#16a34a','Empty':'#dc2626'}};
let items=[],cfg;
try{items=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
try{cfg=JSON.parse(localStorage.getItem(CKEY))}catch(e){}
if(!cfg)cfg=JSON.parse(JSON.stringify(DEF));
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items,(k,v)=>k==='_h'?undefined:v));localStorage.setItem(CKEY,JSON.stringify(cfg))}catch(e){toast('Could not save in this browser')}};
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2800)};
const col=(m,k)=>m[k]||'#64748b',tint=c=>`background:${c}1f;color:${c}`;
const rackOf=l=>{const m=/^\s*(rack\s*\d+)/i.exec(l||'');return m?m[1].replace(/\s+/,' ').replace(/^r/,'R'):''};
const hay=x=>(x.name+' '+x.code+' '+x.loc+' '+x.profile+' '+x.notes+' '+x.remarks+' '+x.cat).toLowerCase();
const PIN='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>';
let cat='',rack='',stat='',prof='',noloc=false,q='';
/* photos (IndexedDB) */
const IMG={};
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('godown_img',1);r.onupgradeneeded=()=>r.result.createObjectStore('i');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function imgAll(){try{const d=await idb();return await new Promise(res=>{const o={},c=d.transaction('i').objectStore('i').openCursor();c.onsuccess=()=>{const x=c.result;if(x){o[x.key]=x.value;x.continue()}else res(o)};c.onerror=()=>res({})})}catch(e){return{}}}
async function imgSet(id,v){try{const d=await idb(),s=d.transaction('i','readwrite').objectStore('i');v?s.put(v,id):s.delete(id)}catch(e){}}
function shrink(file){return new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const s=Math.min(1,560/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.74))};im.onerror=rej;im.src=u})}
/* render */
function hl(t){t=esc(t);if(!q)return t;return q.split(/\s+/).filter(Boolean).reduce((s,k)=>s.replace(new RegExp('('+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![^<]*>)','ig'),'<mark>$1</mark>'),t)}
const mono=i=>((i.name.match(/[A-Za-z0-9]/g)||['?']).slice(0,2).join('')).toUpperCase();
const card=i=>{const c=col(cfg.cats,i.cat),im=IMG[i.id];return `<article class="card" data-id="${i.id}"><div class="tile ${im?'has':''}" style="--c:${c}">${im?`<img src="${im}" alt="" loading="lazy">`:`<div class="mono">${esc(mono(i))}</div>`}<span class="st" style="background:${col(cfg.status,i.status)}">${esc(i.status)}</span><button class="dots" data-id="${i.id}" aria-label="More options">⋮</button></div>
<div class="cb"><div class="nm">${hl(i.name)}</div><div class="cd">${hl(i.code||'No code')}</div>
<div class="tags"><span class="tag" style="${tint(c)}">${esc(i.cat)}</span>${i.profile?`<span class="tag g">${hl(i.profile)}</span>`:''}</div>
<div class="lc ${i.loc?'':'none'}">${PIN}<span>${i.loc?hl(i.loc):'Location not set'}</span></div>
<div class="ft"><span>Stock <b>${esc(i.stock||'—')}</b></span><span>${esc((i.remarks||'').slice(0,24))}</span></div></div></article>`};
function filtered(){const ws=q.split(/\s+/).filter(Boolean),so=$('#sort').value;
 const r=items.filter(i=>(!cat||i.cat===cat)&&(!rack||rackOf(i.loc)===rack)&&(!stat||i.status===stat)&&(!prof||(i.profile||'').trim().toUpperCase()===prof)&&(!noloc||!i.loc)&&ws.every(w=>(i._h||(i._h=hay(i))).includes(w)));
 if(so==='name')r.sort((a,b)=>a.name.localeCompare(b.name));else if(so==='loc')r.sort((a,b)=>(a.loc||'~').localeCompare(b.loc||'~',undefined,{numeric:true}));else r.sort((a,b)=>b.t-a.t);return r}
function init(){const r=filtered(),cs=Object.keys(cfg.cats),cnt=f=>items.filter(f).length;
 $('#chips').innerHTML=`<button class="chip ${cat?'':'on'}" data-cat="">All <em>${items.length}</em></button>`+cs.map(c=>`<button class="chip ${cat===c?'on':''}" data-cat="${esc(c)}"><i style="background:${col(cfg.cats,c)}"></i>${esc(c)} <em>${cnt(i=>i.cat===c)}</em></button>`).join('');
 const av=cnt(i=>i.status==='Available'),em=cnt(i=>i.status==='Empty'),nl=cnt(i=>!i.loc);
 $('#stats').innerHTML=`<button class="stat" data-f="all"><b>${items.length}</b><span>Total samples</span></button><button class="stat a ${stat==='Available'?'on':''}" data-f="stat" data-v="Available"><b>${av}</b><span>Available</span></button><button class="stat e ${stat==='Empty'?'on':''}" data-f="stat" data-v="Empty"><b>${em}</b><span>Empty</span></button><button class="stat n ${noloc?'on':''}" data-f="noloc"><b>${nl}</b><span>No location</span></button>`;
 const rs=[...new Set(items.map(i=>rackOf(i.loc)).filter(Boolean))].sort((a,b)=>parseInt(a.slice(5))-parseInt(b.slice(5)));
 const pc={};items.forEach(i=>{const p=(i.profile||'').trim().toUpperCase();if(p)pc[p]=(pc[p]||0)+1});
 const ps=Object.keys(pc).sort((a,b)=>pc[b]-pc[a]||a.localeCompare(b));
 const fc=(k,v,lab,n,on)=>`<button class="fc ${on?'on':''}" data-f="${k}" data-v="${esc(v)}">${esc(lab)}${n!=null?`<em>${n}</em>`:''}</button>`;
 $('#panel').innerHTML=`<div class="ph"><b>Filters</b><span><button class="lk" data-f="all">Clear all</button><button class="x" data-act="closef" aria-label="Close">✕</button></span></div><div class="pb">
 <h4>Status</h4><div class="cl">${Object.keys(cfg.status).map(s=>fc('stat',s,s,cnt(i=>i.status===s),stat===s)).join('')}</div>
 <h4>Rack</h4><div class="cl">${rs.map(x=>fc('rack',x,x,cnt(i=>rackOf(i.loc)===x),rack===x)).join('')||'<span style="color:var(--mute)">No racks yet</span>'}</div>
 <h4>Scent profile</h4><div class="cl">${ps.map(p=>fc('prof',p,p,pc[p],prof===p)).join('')||'<span style="color:var(--mute)">No scents yet</span>'}</div>
 <h4>Location</h4><div class="cl"><button class="fc ${noloc?'on':''}" data-f="noloc">Location not set</button></div></div>
 <div class="pf"><button class="cta wide" data-act="closef">Show ${r.length} sample${r.length===1?'':'s'}</button></div>`;
 const ap=(k,l)=>`<button class="ap" data-f="rm" data-v="${k}">${esc(l)}<u>✕</u></button>`;
 $('#active').innerHTML=(cat?ap('cat',cat):'')+(rack?ap('rack',rack):'')+(stat?ap('stat',stat):'')+(prof?ap('prof','Scent: '+prof):'')+(noloc?ap('noloc','No location'):'')+(q?ap('q','“'+q+'”'):'');
 render(r)}
function render(r){r=r||filtered();$('#cnt').textContent=r.length+' sample'+(r.length===1?'':'s');
 $('#grid').innerHTML=r.length?r.slice(0,400).map(card).join(''):(items.length?'<div class="empty"><div class="big">No samples match</div>Try fewer words, or clear the filters.<br><br><button class="btn" data-f="all">Clear all filters</button></div>':'<div class="empty"><div class="big">Your godown is empty</div>Import your CSV or Excel file to load all samples, or add the first one.<br><br><button class="btn pri" data-act="imp">Import file</button></div>')}
function filt(k,v){if(k==='all'){cat=rack=stat=prof='';noloc=false;q='';$('#q').value=''}
 else if(k==='stat')stat=stat===v?'':v;else if(k==='rack')rack=rack===v?'':v;else if(k==='prof')prof=prof===v?'':v;else if(k==='noloc')noloc=!noloc;
 else if(k==='rm'){if(v==='q'){q='';$('#q').value=''}else if(v==='noloc')noloc=false;else if(v==='cat')cat='';else if(v==='rack')rack='';else if(v==='stat')stat='';else if(v==='prof')prof=''}init()}
$('#q').addEventListener('input',e=>{q=e.target.value.toLowerCase().trim();requestAnimationFrame(init)});
$('#sort').addEventListener('change',()=>render());
const openF=o=>{$('#panel').classList.toggle('open',o);$('#scrim').classList.toggle('on',o)};
$('#scrim').onclick=()=>openF(false);
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#q').focus()}if(e.key==='Escape'){closeM();hideMenu();openF(false)}});
/* menus & clicks */
const menu=$('#menu');let mid=null,photoFor=null;const hideMenu=()=>menu.style.display='none';
function showMenu(btn,html){menu.innerHTML=html;menu.style.display='block';const r=btn.getBoundingClientRect(),h=menu.offsetHeight,w=menu.offsetWidth;
 let top=r.top>innerHeight/2?r.top-h-8:r.bottom+6;top=Math.max(8,Math.min(top,innerHeight-h-8));
 menu.style.top=top+'px';menu.style.left=Math.max(8,Math.min(r.left+r.width/2-w/2,innerWidth-w-8))+'px'}
const EXP=`<button data-a="x1">All samples – Excel / CSV</button><button data-a="x2">Current results – Excel / CSV</button><button data-a="x3">Full backup with photos (JSON)</button><button data-a="x4">Print / Save as PDF</button>`;
function act(a,b){if(a==='add')form();else if(a==='imp')$('#file').click();else if(a==='set')settings();else if(a==='fil')openF(true);else if(a==='closef')openF(false);else if(a==='exp')showMenu(b,EXP)}
document.addEventListener('click',e=>{const t=e.target;
 const mi=t.closest('#menu [data-a]');if(mi){menuAct(mi.dataset.a);hideMenu();return}
 if(!t.closest('#menu'))hideMenu();
 const a=t.closest('[data-act]');if(a){act(a.dataset.act,a);return}
 const f=t.closest('[data-f]');if(f){filt(f.dataset.f,f.dataset.v);return}
 const c=t.closest('[data-cat]');if(c){cat=c.dataset.cat;init();return}
 const d=t.closest('.dots');if(d){mid=d.dataset.id;const it=items.find(i=>i.id===mid);
  showMenu(d,`<button data-a="view">View details</button><button data-a="photo">${IMG[mid]?'Change photo':'Add photo'}</button><button data-a="edit">Edit details</button><button data-a="loc">Change location</button><button data-a="tog">${it.status==='Empty'?'Mark available':'Mark empty'}</button><button data-a="dup">Duplicate</button><button class="d" data-a="del">Delete</button>`);return}
 const cd=t.closest('.card');if(cd)view(items.find(i=>i.id===cd.dataset.id))});
function menuAct(a){const it=items.find(i=>i.id===mid);
 if(a==='view')view(it);if(a==='edit'||a==='loc')form(it,a==='loc');
 if(a==='photo'){photoFor=mid;$('#pfile').click()}
 if(a==='tog'){it.status=it.status==='Empty'?'Available':'Empty';done('Status updated')}
 if(a==='dup'){items.push({...it,id:'s'+Date.now(),name:it.name+' (copy)',t:Date.now(),_h:null});done('Duplicated')}
 if(a==='del')confirmDel(it);
 if(a==='x1')dl('godown-all',toCSV(items),'text/csv','csv');
 if(a==='x2')dl('godown-results',toCSV(filtered()),'text/csv','csv');
 if(a==='x3')dl('godown-backup',JSON.stringify({cfg,items,images:IMG},(k,v)=>k==='_h'?undefined:v),'application/json','json');
 if(a==='x4')print()}
function done(m){items.forEach(i=>i._h=null);save();init();toast(m)}
const openM=h=>{$('#sheet').innerHTML=h;$('#mod').classList.add('on')},closeM=()=>$('#mod').classList.remove('on');
$('#mod').addEventListener('mousedown',e=>{if(e.target.id==='mod')closeM()});
function confirmDel(it){openM(`<h3>Delete this sample?</h3><p><b>${esc(it.name)}</b> (${esc(it.loc||'no location')}) will be removed permanently.</p><div class="acts2"><button class="btn" onclick="closeM()">Cancel</button><button class="btn dng" id="yes">Delete</button></div>`);
 $('#yes').onclick=()=>{items=items.filter(i=>i.id!==it.id);delete IMG[it.id];imgSet(it.id,null);closeM();done('Deleted')}}
function view(it){if(!it)return;
 const notes=(it.notes||'').split(/\n|\\n/).filter(Boolean).map(x=>`<div style="padding:3px 0">${esc(x)}</div>`).join('')||'<span style="color:var(--mute)">No notes added</span>';
 const f=(a,b,w)=>`<div class="${w?'w':''}"><label>${a}</label><div style="font-weight:600">${b||'<span style="color:var(--mute);font-weight:400">Not set</span>'}</div></div>`;
 openM(`${IMG[it.id]?`<img class="vimg" src="${IMG[it.id]}" alt="">`:''}<div style="display:flex;justify-content:space-between;gap:10px"><div><h3 style="margin:0">${esc(it.name)}</h3><div class="cd" style="margin-top:4px">${esc(it.code||'No code')}</div></div><span class="pill" style="${tint(col(cfg.status,it.status))}">${esc(it.status)}</span></div>
 <div class="g2" style="margin-top:18px">${f('Category',`<span class="pill" style="${tint(col(cfg.cats,it.cat))}">${esc(it.cat)}</span>`)}${f('Storage location',esc(it.loc))}${f('Scent profile',esc(it.profile))}${f('Stock size',esc(it.stock))}${f('Top / Middle / Base notes',notes,1)}${f('Used for / remarks',esc(it.remarks),1)}</div>
 <div class="acts2"><button class="btn" onclick="closeM()">Close</button><button class="btn" id="vl">Change location</button><button class="btn pri" id="ve">Edit</button></div>`);
 $('#ve').onclick=()=>form(it);$('#vl').onclick=()=>form(it,true)}
let pend;
function form(it,focusLoc){const n=!it;pend=undefined;it=it||{name:'',code:'',cat:Object.keys(cfg.cats)[0],profile:'',notes:'',stock:'1KG',loc:'',status:'Available',remarks:''};
 const opt=(o,v)=>Object.keys(o).map(k=>`<option ${k===v?'selected':''}>${esc(k)}</option>`).join('');
 openM(`<h3>${n?'Add sample':'Edit sample'}</h3><div class="g2">
 <div class="w"><label>Photo</label><div class="ph2"><div class="pv" id="pv">${IMG[it.id]?`<img src="${IMG[it.id]}" alt="">`:'No photo'}</div><div><button class="btn" id="pb" type="button">Take / choose photo</button><button class="btn" id="pr" type="button">Remove</button></div></div></div>
 <div class="w"><label>Sample name *</label><input id="fn" value="${esc(it.name)}"></div>
 <div><label>Product code</label><input id="fc" value="${esc(it.code)}"></div>
 <div><label>Category</label><select id="fk">${opt(cfg.cats,it.cat)}</select></div>
 <div><label>Scent profile</label><input id="fpr" value="${esc(it.profile)}" placeholder="Floral, Fresh, Woody"></div>
 <div><label>Stock size</label><input id="fs" value="${esc(it.stock)}" placeholder="1KG"></div>
 <div><label>Storage location</label><input id="fl" value="${esc(it.loc)}" placeholder="Rack 2 - Row 7"></div>
 <div><label>Status</label><select id="ft">${opt(cfg.status,it.status)}</select></div>
 <div class="w"><label>Top / Middle / Base notes</label><textarea id="fo" rows="2">${esc(it.notes)}</textarea></div>
 <div class="w"><label>Used for / remarks</label><input id="fr" value="${esc(it.remarks)}"></div></div>
 <div class="acts2"><button class="btn" onclick="closeM()">Cancel</button><button class="btn pri" id="sv">Save</button></div>`);
 if(focusLoc)setTimeout(()=>$('#fl').focus(),30);
 $('#pb').onclick=()=>{photoFor=null;$('#pfile').click()};
 $('#pr').onclick=()=>{pend='';$('#pv').textContent='No photo'};
 $('#sv').onclick=()=>{const v=id=>$(id).value.trim();if(!v('#fn')){toast('Name is required');return}
  Object.assign(it,{name:v('#fn').toUpperCase(),code:v('#fc'),cat:v('#fk'),profile:v('#fpr'),stock:v('#fs'),loc:v('#fl'),status:v('#ft'),notes:v('#fo'),remarks:v('#fr')});
  if(n){it.id='s'+Date.now();it.t=Date.now();items.push(it)}
  if(pend!==undefined){if(pend){IMG[it.id]=pend;imgSet(it.id,pend)}else{delete IMG[it.id];imgSet(it.id,null)}}
  closeM();done(n?'Sample added':'Changes saved')}}
$('#pfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 try{const d=await shrink(f);if(photoFor){IMG[photoFor]=d;imgSet(photoFor,d);photoFor=null;render();toast('Photo saved')}else{pend=d;const pv=$('#pv');if(pv)pv.innerHTML=`<img src="${d}" alt="">`}}catch(x){toast('Could not read this image')}};
function settings(){const row=(m,k,t)=>`<div class="cr"><input type="color" data-m="${m}" data-k="${esc(k)}" value="${(m==='cats'?cfg.cats:cfg.status)[k]}"><span>${esc(k)}</span>${t?`<button class="btn" data-rm="${esc(k)}">Remove</button>`:''}</div>`;
 openM(`<h3>Colours &amp; options</h3><label>Categories</label>${Object.keys(cfg.cats).map(k=>row('cats',k,1)).join('')}
 <div class="cr"><input id="nc" placeholder="New category name" style="flex:1"><button class="btn" id="addc">Add</button></div>
 <label style="margin-top:14px">Status</label>${Object.keys(cfg.status).map(k=>row('status',k,0)).join('')}
 <div class="acts2"><button class="btn" onclick="closeM()">Close</button><button class="btn pri" id="ok">Save</button></div>`);
 $('#sheet').onclick=e=>{const k=e.target.dataset.rm;if(k&&items.every(i=>i.cat!==k)){delete cfg.cats[k];save();settings()}else if(k)toast('Category is in use')};
 $('#addc').onclick=()=>{const v=$('#nc').value.trim();if(v){cfg.cats[v]='#0ea5e9';save();settings()}};
 $('#ok').onclick=()=>{document.querySelectorAll('#sheet input[type=color]').forEach(c=>cfg[c.dataset.m][c.dataset.k]=c.value);save();closeM();init();toast('Colours saved')}}
/* import / export – accepts CSV, TSV, TXT, Excel (.xlsx/.xls) and JSON backups; several files at once */
function parseCSV(t,d){const r=[];let row=[],c='',qt=false;for(let i=0;i<t.length;i++){const ch=t[i];if(qt){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else qt=false}else c+=ch}else if(ch=='"')qt=true;else if(ch==d){row.push(c);c=''}else if(ch=='\n'||ch=='\r'){if(ch=='\r'&&t[i+1]=='\n')i++;row.push(c);r.push(row);row=[];c=''}else c+=ch}if(c||row.length){row.push(c);r.push(row)}return r.filter(x=>x.some(y=>String(y).trim()))}
function parseTable(t){const l=t.split(/\r?\n/,1)[0],n=ch=>(l.split(ch).length-1),d=[['\t',n('\t')],[';',n(';')],[',',n(',')]].sort((a,b)=>b[1]-a[1])[0][0];return parseCSV(t,d)}
const H=['Product name','Product code','Application category','Profile','Top / Middle / Base notes','Stock','Storage location','Status','Internal notes'],K=['name','code','cat','profile','notes','stock','loc','status','remarks'];
const SYN={name:['product name','name','sample','item','product'],code:['code','sku'],cat:['categ','application','type'],remarks:['internal','remark','used'],notes:['notes','note'],profile:['profile','scent','fragrance'],stock:['stock','qty','quantity','size'],loc:['location','storage','rack'],status:['status']};
function tableToRows(r){if(!r.length)return[];const h=r[0].map(x=>String(x).trim().toLowerCase()),used=new Set(),m={};
 for(const k of ['name','code','cat','remarks','notes','profile','stock','loc','status']){m[k]=-1;for(const s of SYN[k]){const ix=h.findIndex((x,j)=>!used.has(j)&&x.includes(s));if(ix>=0){m[k]=ix;used.add(ix);break}}}
 if(m.name<0)m.name=0;
 return r.slice(1).map(x=>{const o={};K.forEach(k=>o[k]=m[k]<0?'':String(x[m[k]]??'').trim());return o})}
const toCSV=l=>[H.join(',')].concat(l.map(i=>K.map(k=>'"'+String(i[k]||'').replace(/"/g,'""')+'"').join(','))).join('\r\n');
function dl(name,text,type,ext){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ext==='csv'?'\ufeff'+text:text],{type}));a.download=name+'-'+new Date().toISOString().slice(0,10)+'.'+ext;document.body.appendChild(a);a.click();a.remove();toast('Exported – check your Downloads')}
function loadXLSX(){return window.XLSX?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
async function readRows(f){const nm=f.name.toLowerCase();
 if(/\.xlsx?$/.test(nm)){await loadXLSX();const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});return{rows:tableToRows(parseCSV(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]),','))}}
 const t=(await f.text()).replace(/^\ufeff/,'');
 if(nm.endsWith('.json')||/^\s*[\[{]/.test(t)){const j=JSON.parse(t);if(j.cfg&&!items.length)cfg=j.cfg;return{rows:Array.isArray(j)?j:(j.items||[]),images:j.images||{}}}
 return{rows:tableToRows(parseTable(t))}}
$('#file').onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(!fs.length)return;toast('Reading file…');let rows=[],imgs={},bad=0;
 for(const f of fs){try{const r=await readRows(f);rows.push(...r.rows);Object.assign(imgs,r.images||{})}catch(x){bad++}}
 rows=rows.filter(x=>x&&String(x.name||'').trim());
 if(!rows.length)return toast(bad?'Could not read this file. Save it as CSV and try again.':'No samples found in the file');
 let skip=0;if(items.length&&confirm('You already have '+items.length+' samples.\n\nOK = replace them with this file\nCancel = add new rows only (duplicates are skipped)'))items=[];
 const seen=new Set(items.map(i=>(i.name+'|'+i.code).toUpperCase()));let add=0;
 rows.forEach((x,i)=>{const nm=String(x.name).trim().toUpperCase(),key=(nm+'|'+(x.code||'')).toUpperCase();if(seen.has(key)){skip++;return}seen.add(key);
  const ct=x.cat||'Other',st=x.status||'Available';if(!cfg.cats[ct])cfg.cats[ct]='#0ea5e9';if(!cfg.status[st])cfg.status[st]='#64748b';
  const id='i'+Date.now()+'_'+i;items.push({id,t:Date.now()+i,name:nm,code:x.code||'',cat:ct,profile:x.profile||'',notes:x.notes||'',stock:x.stock||'',loc:x.loc||'',status:st,remarks:x.remarks||''});
  if(x.id&&imgs[x.id]){IMG[id]=imgs[x.id];imgSet(id,imgs[x.id])}add++});
 cat=rack=stat=prof='';noloc=false;done(add+' imported'+(skip?', '+skip+' duplicates skipped':''))};
init();imgAll().then(o=>{Object.assign(IMG,o);render()});
