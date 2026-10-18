export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validURL(value) { try { const u=new URL(value); return u.protocol==='https:' && !u.username && !u.password; } catch { return false; } }
export function filterStations(stations,{query='',band='Todas',category='Todas',favorites=null}={}) { const q=normalize(query); return stations.filter(s=>(band==='Todas'||s.band===band)&&(category==='Todas'||s.category===category)&&(!favorites||favorites.includes(s.id))&&normalize(`${s.name} ${s.frequency} ${s.city} ${s.category} ${s.band}`).includes(q)); }
export function moveFavorite(ids,id,delta) { const next=[...ids],i=next.indexOf(id),j=i+delta; if(i>=0&&j>=0&&j<next.length)[next[i],next[j]]=[next[j],next[i]];return next; }
export function readState(raw) { try { const v=JSON.parse(raw);return {favoritesVersion:v.favoritesVersion===2?2:0,favorites:Array.isArray(v.favorites)?v.favorites.filter(x=>typeof x==='string'):null,custom:Array.isArray(v.custom)?v.custom.filter(s=>s&&typeof s.id==='string'&&s.id.startsWith('custom-')&&typeof s.name==='string'&&validURL(s.url)&&['AM','FM','Online'].includes(s.band)):[],accent:['coral','mint','gold'].includes(v.accent)?v.accent:'coral',list:v.list===true}; }catch{return {favoritesVersion:0,favorites:null,custom:[],accent:'coral',list:false};} }

// Clear legacy preselected favorites once; future explicit selections survive updates.
export function migrateFavorites(state) {
  if(state.favoritesVersion===2) { state.favorites??=[]; return false; }
  state.favorites=[]; state.favoritesVersion=2; return true;
}
