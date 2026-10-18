import {normalize,escapeHTML as esc,validURL,filterStations,moveFavorite,readState,migrateFavorites} from './core.js?v=1.1.2';
const FEATURES=Object.freeze({sleepTimer:false,stationWebsite:false});
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const icon=(name,cls='')=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
let storageAvailable=true;let raw;try{raw=localStorage.getItem('radio-fran-v1')}catch{storageAvailable=false}
const state=readState(raw),audio=$('#audio');
const favoritesMigrated=migrateFavorites(state);
let base=[],page='home',band='Todas',category='Todas',query='',editing=false,current=null,playState='idle',hls=null,attempt=0,loadTimer=null,sleepEnd=0,sheetMode='',toastTimer,installPrompt=null;
const save=()=>{try{localStorage.setItem('radio-fran-v1',JSON.stringify(state))}catch{storageAvailable=false;toast('No se pudieron guardar los cambios en este navegador.')}};
if(favoritesMigrated)save();
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500)}
const stations=()=>[...state.custom,...base];
const find=id=>stations().find(s=>s.id===id);
function art(s,cls='station-art'){const graphic=s.logo?.startsWith('./assets/logos/')?`<img class="station-logo" src="${esc(s.logo)}" alt="Logo de ${esc(s.name)}" decoding="async">`:['palm','leaf','flower','wave'].includes(s.art)?icon(s.art):`<span class="initials">${esc(s.art||s.name.slice(0,2))}</span>`;return `<span class="${cls} ${s.logoDark?'logo-dark':''}" style="--tint:${s.tint||'#215c5c'};--art:${s.color||'#ffb389'}">${graphic}</span>`}
function favorite(id){return state.favorites.includes(id)}
function heart(id,cls='row-heart'){return `<button class="${cls} ${favorite(id)?'hearted':''}" data-favorite="${esc(id)}" aria-label="${favorite(id)?'Quitar de':'Añadir a'} favoritas: ${esc(find(id)?.name)}" aria-pressed="${favorite(id)}">${icon('heart')}</button>`}
function card(s){let i=state.favorites.indexOf(s.id);return `<article class="station-card ${current?.id===s.id?'active':''}" style="--tint:${s.tint};--art:${s.color}"><button class="station-play" data-play="${esc(s.id)}" aria-label="Escuchar ${esc(s.name)}">${art(s)}<span class="station-bottom"><span><strong>${esc(s.name)}</strong><span class="frequency">${esc(s.frequency)} ${esc(s.band)}</span></span><span class="badge ${s.band==='FM'?'fm':''}">${esc(s.band)}</span></span></button>${editing?`<div class="edit-order"><button data-move="${esc(s.id)}" data-direction="-1" aria-label="Mover ${esc(s.name)} antes" ${i===0?'disabled':''}>←</button><button data-favorite="${esc(s.id)}" aria-label="Quitar ${esc(s.name)}">×</button><button data-move="${esc(s.id)}" data-direction="1" aria-label="Mover ${esc(s.name)} después" ${i===state.favorites.length-1?'disabled':''}>→</button></div>`:heart(s.id,'card-heart')}</article>`}
function row(s){return `<article class="station-row ${current?.id===s.id?'active':''}"><button class="row-main" data-play="${esc(s.id)}" aria-label="Escuchar ${esc(s.name)}">${art(s,'row-art')}<span class="row-text"><strong>${esc(s.name)}</strong><small>${esc(s.frequency)} ${esc(s.band)} · ${esc(s.category)}</small></span></button>${heart(s.id)}<button class="row-menu" data-info="${esc(s.id)}" aria-label="Detalles de ${esc(s.name)}">⋮</button></article>`}
function render(){
 document.body.dataset.accent=state.accent;
 $$('[data-band]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.band===band)));
 $$('[data-page]').forEach(b=>{b.removeAttribute('aria-current');if(b.dataset.page===page)b.setAttribute('aria-current','page')});
 const options={query,band,category};
 const favorites=state.favorites.map(find).filter(Boolean);const visibleFavorites=filterStations(favorites,{query,band});
 $('#favorites-section').hidden=page==='explore';
 $('#directory-section').hidden=page==='favorites';
 $('#favorites-grid').innerHTML=visibleFavorites.length?visibleFavorites.map(card).join(''):`<div class="empty"><strong>${favorites.length?'No hay coincidencias':'Tu radio, a tu manera'}</strong>${favorites.length?'Prueba otra búsqueda o banda.':'Toca el corazón de una emisora para guardarla aquí.'}</div>`;
 $('#edit-favorites').innerHTML=editing?'Listo':icon('edit');
 $('#directory-title').textContent=page==='explore'?'Explora la isla':'Todas las emisoras';
 $('#section-kicker').textContent=page==='explore'?'MÚSICA, NOTICIAS Y MUCHO MÁS':'DESCUBRE TU PRÓXIMA ESTACIÓN';
 const cats=['Todas',...new Set(stations().map(s=>s.category))];
 $('#categories').innerHTML=cats.map(c=>`<button data-category="${esc(c)}" aria-pressed="${c===category}">${esc(c)}</button>`).join('');
 const filtered=filterStations(stations(),options);$('#station-count').textContent=String(filtered.length);
 $('#station-list').innerHTML=filtered.length?filtered.map(row).join(''):'<div class="empty"><strong>No encontramos esa emisora</strong>Prueba otra búsqueda o añádela con su enlace de audio.</div>';
 $('#station-list').style.gridTemplateColumns=state.list?'1fr':'';
 updatePlayer();
}
function setStatus(status){playState=status;updatePlayer()}
function statusText(){return {idle:'Elige una emisora para comenzar',loading:'Conectando con la emisora…',playing:`En vivo · ${current?.band||''}`,paused:'En pausa',error:'No se pudo conectar. Toca ▶ para reintentar.'}[playState]}
function updatePlayer(){
 $('#mini-name').textContent=current?.name||'Tu isla suena aquí';$('#mini-status').textContent=statusText();$('#mini-status').classList.toggle('error-message',playState==='error');
 if(current){$('#mini-art').outerHTML=art(current,'mini-art');$('.player-summary .mini-art').id='mini-art'}
 const isActive=['playing','loading'].includes(playState);$('#mini-play').innerHTML=icon(isActive?'pause':'play');$('#mini-play').setAttribute('aria-label',isActive?'Pausar':'Reproducir');$('#mini-wave').classList.toggle('playing',playState==='playing');
 if(sheetMode==='player'&&$('#sheet').open){const b=$('#large-play');if(b){b.innerHTML=icon(isActive?'pause':'play');b.setAttribute('aria-label',isActive?'Pausar':'Reproducir')}const st=$('#large-status');if(st){st.textContent=statusText();st.classList.toggle('error-message',playState==='error')}const timer=$('#timer-current');if(timer)timer.textContent=sleepEnd?`Se apaga en ${Math.max(1,Math.ceil((sleepEnd-Date.now())/60000))} min`:''}
 if('mediaSession'in navigator)navigator.mediaSession.playbackState=playState==='playing'?'playing':'paused';
}
function stopTransport(){clearTimeout(loadTimer);loadTimer=null;if(hls){hls.destroy();hls=null}audio.pause();audio.removeAttribute('src');audio.load()}
function pause(){setStatus('paused');stopTransport()}
function playStation(id){const s=find(id);if(!s)return;if(!validURL(s.url)){toast('Esta señal no tiene un enlace HTTPS válido.');return}current=s;attempt=0;startStream();render();if(sheetMode==='player')showPlayer()}
function startStream(){
 stopTransport();setStatus('loading');
 const url=(attempt>0&&current.alternatives?.[attempt-1])||current.url;
 if(!navigator.onLine){setStatus('error');toast('Estás sin conexión. Conéctate a internet y vuelve a intentar.');return}
 loadTimer=setTimeout(()=>failStream(),22000);
 if(url.includes('.m3u8')&&!audio.canPlayType('application/vnd.apple.mpegurl')){
  if(window.Hls?.isSupported()){hls=new window.Hls({maxBufferLength:20,backBufferLength:0});hls.loadSource(url);hls.attachMedia(audio);hls.on(window.Hls.Events.MANIFEST_PARSED,tryPlay);hls.on(window.Hls.Events.ERROR,(_,data)=>{if(data.fatal)failStream()})}
  else{setStatus('error');toast('Este navegador no puede reproducir esta señal. Prueba Safari o Chrome actualizado.');return}
 }else{audio.src=url;tryPlay()}
 if('mediaSession'in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:current.name,artist:`${current.frequency} ${current.band} · Puerto Rico`,album:'Radio Fran',artwork:[{src:new URL('./assets/icon-512.png',location.href).href,sizes:'512x512',type:'image/png'}]})}
}
function tryPlay(){const request=audio.play();if(request)request.catch(e=>{if(e.name==='NotAllowedError'){pause();toast('Toca reproducir para escuchar la emisora.')}else if(e.name!=='AbortError')failStream()})}
function failStream(){if(playState!=='loading'&&playState!=='playing')return;const alternatives=current?.alternatives||[];if(attempt<alternatives.length){attempt++;startStream();return}setStatus('error');stopTransport();toast('La emisora no responde. Puedes reintentar o elegir otra señal.')}
function toggle(){if(['playing','loading'].includes(playState))pause();else if(current){attempt=0;startStream()}else playStation(state.favorites.find(id=>find(id))||stations()[0]?.id)}
audio.addEventListener('pause',()=>{if(playState==='playing')setStatus('paused')});
audio.addEventListener('playing',()=>{clearTimeout(loadTimer);setStatus('playing')});audio.addEventListener('error',()=>{if(audio.getAttribute('src')||hls)failStream()});audio.addEventListener('waiting',()=>{if(playState==='playing'){setStatus('loading');clearTimeout(loadTimer);loadTimer=setTimeout(failStream,22000)}});audio.addEventListener('ended',()=>{if(playState==='playing')failStream()});
function toggleFavorite(id){if(favorite(id)){state.favorites=state.favorites.filter(x=>x!==id);toast('Emisora quitada de favoritas')}else{state.favorites.push(id);toast('Guardada en tus favoritas')}save();render();if(sheetMode==='player')showPlayer()}
function openSheet(title,content,mode){sheetMode=mode;$('#sheet-title').textContent=title;$('#sheet-body').innerHTML=content;if(!$('#sheet').open)$('#sheet').showModal();$('#close-sheet').focus({preventScroll:true})}
function closeSheet(){$('#sheet').close();sheetMode=''}
$('#close-sheet').onclick=closeSheet;$('#sheet').addEventListener('click',e=>{if(e.target===$('#sheet')){const r=$('#sheet').getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)closeSheet()}});$('#sheet').addEventListener('close',()=>sheetMode='');
function settings(){openSheet('Tu radio, a tu manera',`<p>El estilo Tropical cristal, con tu toque personal.</p><h3>Color de acento</h3><div class="choices">${[['coral','#ff9569','Coral'],['mint','#5ce0be','Menta'],['gold','#ffd176','Dorado']].map(([key,color,label])=>`<button class="swatch ${state.accent===key?'selected':''}" style="--swatch:${color}" data-accent="${key}" aria-label="${label}" aria-pressed="${state.accent===key}"></button>`).join('')}</div><h3>Vista de las emisoras</h3><div class="choices"><button data-layout="grid" class="${state.list?'':'selected'}">Compacta</button><button data-layout="list" class="${state.list?'selected':''}">Lista amplia</button></div>${FEATURES.sleepTimer?`<h3>Temporizador de apagado</h3>${timerChoices()}<p id="timer-current" class="timer-label">${sleepEnd?'Temporizador activado':''}</p>`:''}<h3>Tus emisoras</h3><button class="secondary" data-action="add">${icon('plus')} Añadir emisora</button><h3>Instalar en tu iPhone</h3><p>Abre esta página en Safari, toca Compartir y luego <strong>Añadir a pantalla de inicio</strong>. Se abrirá con tu icono y en pantalla completa.</p>${installPrompt?'<button class="primary" data-action="install">Instalar Radio Fran</button>':''}<p>Favoritas y ajustes se guardan en este dispositivo${storageAvailable?'.':', pero el navegador está impidiendo guardarlos.'} Las emisoras se escuchan por internet.</p><p>Radio Fran · v1.1.2<br>Catálogo inicial revisado el 18 de octubre de 2026.<br>Emisoras independientes; Radio Fran no está afiliada a ellas.</p>`, 'settings')}
function timerChoices(){return `<div class="choices">${[0,15,30,60].map(m=>`<button data-sleep="${m}" class="${m===0&&!sleepEnd?'selected':''}">${m?m+' min':'Desactivar'}</button>`).join('')}</div>`}
function showPlayer(){if(!current){toast('Elige primero una emisora.');return}openSheet('Ahora suena',`<div class="player-large" style="--tint:${current.tint}">${art(current)}<span class="live-label">RADIO POR INTERNET</span><h3>${esc(current.name)}</h3><p>${esc(current.frequency)} ${esc(current.band)} · ${esc(current.city)}</p><div id="large-status" class="status-detail">${esc(statusText())}</div><div class="large-controls"><button class="icon-button" data-action="previous" aria-label="Emisora anterior">${icon('next').replace('<svg ','<svg style="transform:rotate(180deg)" ')}</button><button id="large-play" class="play-button" data-action="toggle" aria-label="Reproducir">${icon(['playing','loading'].includes(playState)?'pause':'play')}</button>${heart(current.id)}<button class="icon-button" data-action="next" aria-label="Emisora siguiente">${icon('next')}</button></div>${FEATURES.sleepTimer?`<h3>Apagar en…</h3>${timerChoices()}<p id="timer-current" class="timer-label"></p>`:''}${FEATURES.stationWebsite&&validURL(current.homepage)?`<p><a class="secondary" href="${esc(current.homepage)}" target="_blank" rel="noopener noreferrer">Sitio oficial ↗</a></p>`:''}</div>`, 'player');updatePlayer()}
function showInfo(id){const s=find(id);if(!s)return;openSheet(s.name,`${art(s)}<p>${esc(s.frequency)} ${esc(s.band)} · ${esc(s.city)}<br>${esc(s.category)}</p><button class="primary" data-play="${esc(id)}">Escuchar ahora</button>${FEATURES.stationWebsite&&validURL(s.homepage)?`<p><a class="secondary" href="${esc(s.homepage)}" target="_blank" rel="noopener noreferrer">Sitio oficial ↗</a></p>`:''}${id.startsWith('custom-')?`<p><button class="secondary" data-edit="${esc(id)}">Editar emisora</button></p><button class="secondary danger" data-delete="${esc(id)}">Eliminar emisora</button>`:''}<p>Transmisión independiente por internet. Si no responde, vuelve a intentar más tarde.</p>`, 'info')}
function stationForm(id){const s=id?find(id):{};openSheet(id?'Editar emisora':'Añade tu emisora',`<p>Usa el enlace directo HTTPS del audio, no el enlace de una página web. Compatible con MP3, AAC y HLS.</p><form id="station-form" class="form-grid" data-id="${esc(id||'')}"><label>Nombre<input name="name" required maxlength="55" value="${esc(s.name||'')}" placeholder="Nombre de la emisora"></label><label>Enlace de transmisión<input name="url" required type="url" value="${esc(s.url||'')}" placeholder="https://servidor.com/stream"></label><div class="form-columns"><label>Banda<select name="band">${['FM','AM','Online'].map(b=>`<option ${s.band===b?'selected':''}>${b}</option>`).join('')}</select></label><label>Frecuencia<input name="frequency" maxlength="12" value="${esc(s.frequency||'')}" placeholder="Ej. 99.1"></label></div><label>Municipio<input name="city" maxlength="40" value="${esc(s.city||'')}" placeholder="Puerto Rico"></label><p id="form-error" class="form-error" role="alert"></p><button class="primary" type="submit">Guardar emisora</button></form>`, 'form')}
function nextStation(delta){const list=state.favorites.length?state.favorites.map(find).filter(Boolean):stations();if(!list.length)return;const index=list.findIndex(s=>s.id===current?.id);playStation(list[(index+delta+list.length)%list.length].id)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.play){playStation(d.play);if($('#sheet').open&&sheetMode==='info')showPlayer()}
 if(d.favorite)toggleFavorite(d.favorite);
 if(d.move){state.favorites=moveFavorite(state.favorites,d.move,Number(d.direction));save();render()}
 if(d.info)showInfo(d.info);
 if(d.page){page=d.page;query='';$('#search').value='';category='Todas';editing=false;render();window.scrollTo({top:0,behavior:'smooth'})}
 if(d.band){band=d.band;render()}
 if(d.category){category=d.category;render()}
 if(d.accent){state.accent=d.accent;save();render();settings()}
 if(d.layout){state.list=d.layout==='list';save();render();settings()}
 if(d.sleep){if(!FEATURES.sleepTimer)return;const mins=Number(d.sleep);sleepEnd=mins?Date.now()+mins*60000:0;toast(mins?`La radio se apagará en ${mins} minutos`:'Temporizador desactivado');if(sheetMode==='settings')settings();else updatePlayer()}
 if(d.edit)stationForm(d.edit);
 if(d.delete){openSheet('Eliminar emisora',`<p>¿Eliminar ${esc(find(d.delete)?.name)} de tus emisoras guardadas?</p><button class="primary" data-confirm-delete="${esc(d.delete)}">Sí, eliminar</button><button class="secondary" data-action="close">Cancelar</button>`, 'confirm')}
 if(d.confirmDelete){if(current?.id===d.confirmDelete){pause();current=null}state.custom=state.custom.filter(s=>s.id!==d.confirmDelete);state.favorites=state.favorites.filter(id=>id!==d.confirmDelete);save();closeSheet();render();toast('Emisora eliminada')}
 if(d.action==='toggle')toggle();if(d.action==='previous')nextStation(-1);if(d.action==='next')nextStation(1);if(d.action==='add')stationForm();if(d.action==='close')closeSheet();if(d.action==='install'&&installPrompt){installPrompt.prompt();installPrompt=null;closeSheet()}
});
document.addEventListener('submit',e=>{if(e.target.id!=='station-form')return;e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(!validURL(data.url)){$('#form-error').textContent='El enlace debe comenzar por https:// y no incluir usuario ni contraseña.';return}if(!data.name.trim()){$('#form-error').textContent='Escribe un nombre para la emisora.';return}const id=e.target.dataset.id||`custom-${crypto.randomUUID()}`;const previous=find(id);const item={id,name:data.name.trim(),url:data.url.trim(),band:data.band,frequency:data.frequency.trim(),city:data.city.trim()||'Puerto Rico',category:'Mis emisoras',art:'palm',tint:'#17585c',color:'#ffb07c'};state.custom=state.custom.filter(s=>s.id!==id);state.custom.unshift(item);if(!favorite(id))state.favorites.push(id);if(current?.id===id){pause();current=item}save();closeSheet();render();toast(previous?'Emisora actualizada':'Emisora añadida')});
$('#settings').onclick=settings;$('#add-station').onclick=()=>stationForm();$('#mini-play').onclick=toggle;$('#open-player').onclick=showPlayer;$('#edit-favorites').onclick=()=>{editing=!editing;render()};$('#search').oninput=e=>{query=e.target.value;render()};
setInterval(()=>{if(sleepEnd&&Date.now()>=sleepEnd){sleepEnd=0;pause();toast('La radio se apagó con el temporizador.')}if(sleepEnd)updatePlayer()},1000);
window.addEventListener('offline',()=>{if(['playing','loading'].includes(playState))toast('Sin conexión. La señal podría interrumpirse.')});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
if('mediaSession'in navigator){for(const [action,handler] of Object.entries({play:()=>{if(current)startStream()},pause,stop:pause,previoustrack:()=>nextStation(-1),nexttrack:()=>nextStation(1)})){try{navigator.mediaSession.setActionHandler(action,handler)}catch{}}}
async function init(){try{const r=await fetch('./stations.json');if(!r.ok)throw Error('Catálogo no disponible');base=await r.json();if(state.favorites===null)state.favorites=[];render()}catch{$('#station-list').innerHTML='<div class="empty"><strong>No pudimos cargar las emisoras</strong>Comprueba tu conexión y vuelve a abrir Radio Fran.</div>';state.favorites??=[];toast('No se pudo cargar el catálogo.')}}
init();
// Network-first shell. Do not interrupt live radio when an update is activated.
if('serviceWorker'in navigator){let hadController=!!navigator.serviceWorker.controller;let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController){hadController=true;return}if(['playing','loading'].includes(playState)){$('#update-notice').hidden=false;return}if(!refreshing){refreshing=true;location.reload()}});navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{reg.update();document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update()})}).catch(()=>{});$('#update-now').onclick=()=>location.reload()}
