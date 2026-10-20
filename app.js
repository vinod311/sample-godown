/* Trivenkem Sample Godown – data stays in this browser (localStorage). */
const KEY='triven_godown_v1',CKEY='triven_godown_cfg';
const DEF={cats:{'Fabric Care':'#2563eb','Home Care':'#0f9d78','Fine Fragrance':'#7c3aed','Personal Care':'#c026a3','Multipurpose':'#c9871f','Other':'#64748b'},status:{'Available':'#16a34a','Empty':'#dc2626'}};
let items=[],cfg;
try{items=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
try{cfg=JSON.parse(localStorage.getItem(CKEY))}catch(e){}
if(!cfg)cfg=JSON.parse(JSON.stringify(DEF));
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items,(k,v)=>k==='_h'?undefined:v));localStorage.setItem(CKEY,JSON.stringify(cfg))}catch(e){toast('Could not save in this browser')}};
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2400)};
const col=(m,k)=>m[k]||'#64748b',tint=c=>`background:${c}1f;color:${c}`;
const rackOf=l=>{const m=/^\s*(rack\s*\d+)/i.exec(l||'');return m?m[1].replace(/\s+/,' ').replace(/^r/,'R'):''};
const hay=x=>(x.name+' '+x.code+' '+x.loc+' '+x.profile+' '+x.notes+' '+x.remarks+' '+x.cat).toLowerCase();
const PIN='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>';
let cat='',rack='',stat='',prof='',q='';
function hl(t){t=esc(t);if(!q)return t;return q.split(/\s+/).filter(Boolean).reduce((s,k)=>s.replace(new RegExp('('+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![^<]*>)','ig'),'<mark>$1</mark>'),t)}
function mono(i){return ((i.name.match(/[A-Za-z0-9]/g)||['?']).slice(0,2).join('')).toUpperCase()}
const card=i=>{const c=col(cfg.cats,i.cat);return `<article class="card" data-id="${i.id}"><div class="tile" style="--c:${c}"><div class="mono">${esc(mono(i))}</div><span class="st" style="background:${col(cfg.status,i.status)}">${esc(i.status)}</span><button class="dots" data-id="${i.id}" aria-label="More options">⋮</button></div>
<div class="cb"><div class="nm">${hl(i.name)}</div><div class="cd">${hl(i.code||'No code')}</div>
<div class="tags"><span class="tag" style="${tint(c)}">${esc(i.cat)}</span>${i.profile?`<span class="tag g">${hl(i.profile)}</span>`:''}</div>
<div class="lc ${i.loc?'':'none'}">${PIN}<span>${i.loc?hl(i.loc):'Location not set'}</span></div>
<div class="ft"><span>Stock <b>${esc(i.stock||'—')}</b></span><span>${esc((i.remarks||'').slice(0,26))}</span></div></div></article>`};
function filtered(){const ws=q.split(/\s+/).filter(Boolean),so=$('#sort').value;
 const r=items.filter(i=>(!cat||i.cat===cat)&&(!rack||rackOf(i.loc)===rack)&&(!stat||i.status===stat)&&(!prof||(i.profile||'').trim().toUpperCase()===prof)&&ws.every(w=>(i._h||(i._h=hay(i))).includes(w)));
 if(so==='name')r.sort((a,b)=>a.name.localeCompare(b.name));else if(so==='loc')r.sort((a,b)=>(a.loc||'~').localeCompare(b.loc||'~',undefined,{numeric:true}));else r.sort((a,b)=>b.t-a.t);return r}
function init(){
 const cs=Object.keys(cfg.cats),n=k=>items.filter(i=>i.cat===k).length;
 $('#chips').innerHTML=`<button class="chip ${cat?'':'on'}" data-cat="">All <em>${items.length}</em></button>`+cs.map(c=>`<button class="chip ${cat===c?'on':''}" data-cat="${esc(c)}"><i style="background:${col(cfg.cats,c)}"></i>${esc(c)} <em>${n(c)}</em></button>`).join('');
 const rs=[...new Set(items.map(i=>rackOf(i.loc)).filter(Boolean))].sort((a,b)=>parseInt(a.slice(5))-parseInt(b.slice(5)));
 const ps=[...new Set(items.map(i=>(i.profile||'').trim().toUpperCase()).filter(Boolean))].sort();
 $('#panel').innerHTML=`<h4>Rack</h4>`+rs.map(r=>`<button class="fb ${rack===r?'on':''}" data-rack="${r}">${r}<em>${items.filter(i=>rackOf(i.loc)===r).length}</em></button>`).join('')
 +`<h4>Status</h4>`+Object.keys(cfg.status).map(s=>`<button class="fb ${stat===s?'on':''}" data-stat="${esc(s)}"><i style="background:${col(cfg.status,s)}"></i>${esc(s)}<em>${items.filter(i=>i.status===s).length}</em></button>`).join('')
 +`<h4>Scent profile</h4><select id="fp"><option value="">Any</option>${ps.map(p=>`<option ${p===prof?'selected':''}>${esc(p)}</option>`).join('')}</select><button class="clr" id="clr">Clear all filters</button>`;
 render()}
function render(){const r=filtered();
 $('#cnt').textContent=r.length+' sample'+(r.length===1?'':'s');
 $('#sum').textContent=items.filter(i=>i.status==='Available').length+' available · '+items.filter(i=>i.status==='Empty').length+' empty · '+items.filter(i=>!i.loc).length+' without location';
 $('#grid').innerHTML=r.length?r.slice(0,400).map(card).join(''):(items.length?'<div class="empty"><div class="big">No samples match</div>Try fewer words, or clear the filters.</div>':'<div class="empty"><div class="big">Your godown is empty</div>Import your CSV to load all samples, or add the first one.<br><br><button class="btn pri" id="emp">Import CSV</button></div>')}
$('#q').addEventListener('input',e=>{q=e.target.value.toLowerCase().trim();requestAnimationFrame(render)});
$('#sort').addEventListener('change',render);
$('#chips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b){cat=b.dataset.cat;init()}});
$('#panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='clr'){cat=rack=stat=prof='';$('#q').value='';q=''}else if(b.dataset.rack)rack=rack===b.dataset.rack?'':b.dataset.rack;else if(b.dataset.stat)stat=stat===b.dataset.stat?'':b.dataset.stat;init()});
$('#panel').addEventListener('change',e=>{if(e.target.id==='fp'){prof=e.target.value;init()}});
$('#bFil').onclick=()=>$('#panel').classList.toggle('open');
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#q').focus()}if(e.key==='Escape'){closeM();hideMenu()}});
/* menus */
const menu=$('#menu');let mid=null;const hideMenu=()=>menu.style.display='none';
function showMenu(btn,html){menu.innerHTML=html;menu.style.display='block';const r=btn.getBoundingClientRect();menu.style.top=Math.max(8,Math.min(r.bottom+4,innerHeight-menu.offsetHeight-8))+'px';menu.style.left=Math.max(8,Math.min(r.right-menu.offsetWidth,innerWidth-menu.offsetWidth-8))+'px'}
$('#grid').addEventListener('click',e=>{if(e.target.id==='emp'){$('#file').click();return}
 const b=e.target.closest('.dots');if(b){e.stopPropagation();mid=b.dataset.id;const it=items.find(i=>i.id===mid);
  showMenu(b,`<button data-a="view">View details</button><button data-a="edit">Edit details</button><button data-a="loc">Change location</button><button data-a="tog">${it.status==='Empty'?'Mark available':'Mark empty'}</button><button data-a="dup">Duplicate</button><button class="d" data-a="del">Delete</button>`);return}
 const c=e.target.closest('.card');if(c)view(items.find(i=>i.id===c.dataset.id))});
$('#bExp').onclick=e=>{e.stopPropagation();showMenu(e.currentTarget,`<button data-a="x1">All samples (CSV)</button><button data-a="x2">Current results (CSV)</button><button data-a="x3">Full backup (JSON)</button><button data-a="x4">Print / Save as PDF</button>`)};
addEventListener('click',e=>{if(!e.target.closest('#menu'))hideMenu()});
menu.addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;hideMenu();const it=items.find(i=>i.id===mid);
 if(a==='view')view(it);if(a==='edit'||a==='loc')form(it,a==='loc');
 if(a==='tog'){it.status=it.status==='Empty'?'Available':'Empty';done('Status updated')}
 if(a==='dup'){items.push({...it,id:'s'+Date.now(),name:it.name+' (copy)',t:Date.now(),_h:null});done('Duplicated')}
 if(a==='del')confirmDel(it);
 if(a==='x1')dl('godown-all',toCSV(items),'text/csv','csv');
 if(a==='x2')dl('godown-results',toCSV(filtered()),'text/csv','csv');
 if(a==='x3')dl('godown-backup',JSON.stringify({cfg,items},(k,v)=>k==='_h'?undefined:v,1),'application/json','json');
 if(a==='x4')print()});
function done(m){items.forEach(i=>i._h=null);save();init();toast(m)}
const openM=h=>{$('#sheet').innerHTML=h;$('#mod').classList.add('on')},closeM=()=>$('#mod').classList.remove('on');
$('#mod').addEventListener('mousedown',e=>{if(e.target.id==='mod')closeM()});
function confirmDel(it){openM(`<h3>Delete this sample?</h3><p><b>${esc(it.name)}</b> (${esc(it.loc||'no location')}) will be removed permanently.</p><div class="acts2"><button class="btn" onclick="closeM()">Cancel</button><button class="btn dng" id="yes">Delete</button></div>`);
 $('#yes').onclick=()=>{items=items.filter(i=>i.id!==it.id);closeM();done('Deleted')}}
function view(it){if(!it)return;
 const notes=(it.notes||'').split(/\n|\\n/).filter(Boolean).map(x=>`<div style="padding:3px 0">${esc(x)}</div>`).join('')||'<span style="color:var(--mute)">No notes added</span>';
 const f=(a,b,w)=>`<div class="${w?'w':''}"><label>${a}</label><div style="font-weight:600">${b||'<span style="color:var(--mute);font-weight:400">Not set</span>'}</div></div>`;
 openM(`<div style="display:flex;justify-content:space-between;gap:10px"><div><h3 style="margin:0">${esc(it.name)}</h3><div class="cd" style="margin-top:4px">${esc(it.code||'No code')}</div></div><span class="pill" style="${tint(col(cfg.status,it.status))}">${esc(it.status)}</span></div>
 <div class="g2" style="margin-top:18px">${f('Category',`<span class="pill" style="${tint(col(cfg.cats,it.cat))}">${esc(it.cat)}</span>`)}${f('Storage location',esc(it.loc))}${f('Scent profile',esc(it.profile))}${f('Stock size',esc(it.stock))}${f('Top / Middle / Base notes',notes,1)}${f('Used for / remarks',esc(it.remarks),1)}</div>
 <div class="acts2"><button class="btn" onclick="closeM()">Close</button><button class="btn" id="vl">Change location</button><button class="btn pri" id="ve">Edit</button></div>`);
 $('#ve').onclick=()=>form(it);$('#vl').onclick=()=>form(it,true)}
function form(it,focusLoc){const n=!it;it=it||{name:'',code:'',cat:Object.keys(cfg.cats)[0],profile:'',notes:'',stock:'1KG',loc:'',status:'Available',remarks:''};
 const opt=(o,v)=>Object.keys(o).map(k=>`<option ${k===v?'selected':''}>${esc(k)}</option>`).join('');
 openM(`<h3>${n?'Add sample':'Edit sample'}</h3><div class="g2">
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
 setTimeout(()=>$(focusLoc?'#fl':'#fn').focus(),30);
 $('#sv').onclick=()=>{const v=id=>$(id).value.trim();if(!v('#fn')){toast('Name is required');return}
  Object.assign(it,{name:v('#fn').toUpperCase(),code:v('#fc'),cat:v('#fk'),profile:v('#fpr'),stock:v('#fs'),loc:v('#fl'),status:v('#ft'),notes:v('#fo'),remarks:v('#fr')});
  if(n){it.id='s'+Date.now();it.t=Date.now();items.push(it)}closeM();done(n?'Sample added':'Changes saved')}}
$('#bAdd').onclick=()=>form();
$('#bSet').onclick=()=>{const row=(m,k,t)=>`<div class="cr"><input type="color" data-m="${m}" data-k="${esc(k)}" value="${(m==='cats'?cfg.cats:cfg.status)[k]}"><span>${esc(k)}</span>${t?`<button class="btn" data-rm="${esc(k)}">Remove</button>`:''}</div>`;
 openM(`<h3>Colours &amp; options</h3><label>Categories</label>${Object.keys(cfg.cats).map(k=>row('cats',k,1)).join('')}
 <div class="cr"><input id="nc" placeholder="New category name" style="flex:1"><button class="btn" id="addc">Add</button></div>
 <label style="margin-top:14px">Status</label>${Object.keys(cfg.status).map(k=>row('status',k,0)).join('')}
 <div class="acts2"><button class="btn" onclick="closeM()">Close</button><button class="btn pri" id="ok">Save</button></div>`);
 $('#sheet').onclick=e=>{const k=e.target.dataset.rm;if(k&&items.every(i=>i.cat!==k)){delete cfg.cats[k];save();$('#bSet').click()}else if(k)toast('Category is in use')};
 $('#addc').onclick=()=>{const v=$('#nc').value.trim();if(v){cfg.cats[v]='#0ea5e9';save();$('#bSet').click()}};
 $('#ok').onclick=()=>{document.querySelectorAll('input[type=color]').forEach(c=>cfg[c.dataset.m][c.dataset.k]=c.value);save();closeM();init();toast('Colours saved')}};
/* import / export */
function parseCSV(t){const r=[];let row=[],c='',qt=false;for(let i=0;i<t.length;i++){const ch=t[i];if(qt){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else qt=false}else c+=ch}else if(ch=='"')qt=true;else if(ch==','){row.push(c);c=''}else if(ch=='\n'||ch=='\r'){if(ch=='\r'&&t[i+1]=='\n')i++;row.push(c);r.push(row);row=[];c=''}else c+=ch}if(c||row.length){row.push(c);r.push(row)}return r.filter(x=>x.some(y=>y.trim()))}
const H=['Product name','Product code','Application category','Profile','Top / Middle / Base notes','Stock','Storage location','Status','Internal notes'],K=['name','code','cat','profile','notes','stock','loc','status','remarks'];
const toCSV=l=>[H.join(',')].concat(l.map(i=>K.map(k=>'"'+String(i[k]||'').replace(/"/g,'""')+'"').join(','))).join('\r\n');
function dl(name,text,type,ext){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type}));a.download=name+'-'+new Date().toISOString().slice(0,10)+'.'+ext;a.click();toast('Exported')}
$('#bImp').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const t=(await f.text()).replace(/^\ufeff/,'');let rows=[];
 if(/\.json$/i.test(f.name)){try{const j=JSON.parse(t);rows=Array.isArray(j)?j:j.items||[];if(j.cfg&&!items.length)cfg=j.cfg}catch(x){return toast('This JSON file is not valid')}}
 else{const r=parseCSV(t),h=r[0].map(x=>x.trim().toLowerCase()),ix=n=>h.findIndex(x=>x.includes(n)),m={name:ix('name'),code:ix('code'),cat:ix('categ'),profile:ix('profile'),notes:ix('notes'),stock:ix('stock'),loc:ix('location'),status:ix('status'),remarks:ix('internal')};
  if(m.name<0)return toast('No "Product name" column found');
  rows=r.slice(1).map(x=>{const o={};K.forEach(k=>o[k]=m[k]<0?'':(x[m[k]]||'').trim());return o})}
 rows=rows.filter(x=>x.name);if(!rows.length)return toast('No samples found in file');
 if(items.length&&confirm('You already have '+items.length+' samples.\nOK = replace them with this file\nCancel = add this file to them'))items=[];
 rows.forEach((x,i)=>{const ct=x.cat||'Other',st=x.status||'Available';if(!cfg.cats[ct])cfg.cats[ct]='#0ea5e9';if(!cfg.status[st])cfg.status[st]='#64748b';
  items.push({id:'i'+Date.now()+'_'+i,t:Date.now()+i,name:String(x.name).toUpperCase(),code:x.code||'',cat:ct,profile:x.profile||'',notes:x.notes||'',stock:x.stock||'',loc:x.loc||'',status:st,remarks:x.remarks||''})});
 cat=rack=stat=prof='';done(rows.length+' samples imported')};
init();
