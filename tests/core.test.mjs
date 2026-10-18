import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {filterStations,readState,moveFavorite,validURL,escapeHTML,migrateFavorites} from '../core.js';
const stations=JSON.parse(readFileSync(new URL('../stations.json',import.meta.url)));
test('catálogo sin duplicados y señales seguras',()=>{assert.equal(new Set(stations.map(s=>s.id)).size,stations.length);assert.ok(stations.some(s=>s.band==='AM'));assert.ok(stations.some(s=>s.band==='FM'));for(const s of stations){assert.ok(validURL(s.url),s.name);assert.ok(s.name&&s.frequency&&s.category)}});
test('búsqueda ignora acentos y combina filtros',()=>{assert.ok(filterStations(stations,{query:'catolica'}).some(s=>s.id==='catolica'));assert.ok(filterStations(stations,{band:'AM'}).every(s=>s.band==='AM'));assert.equal(filterStations(stations,{band:'AM',category:'Salsa'}).length,0);assert.deepEqual(filterStations(stations,{favorites:['isla']}).map(s=>s.id),['isla'])});
test('favoritas: reordenar sin modificar original',()=>{const ids=['a','b','c'];assert.deepEqual(moveFavorite(ids,'b',-1),['b','a','c']);assert.deepEqual(moveFavorite(ids,'a',-1),ids);assert.deepEqual(ids,['a','b','c'])});
test('preservar favoritos vacíos, recuperarse de datos inválidos',()=>{assert.deepEqual(readState('{"favorites":[]}').favorites,[]);assert.equal(readState('bad').favorites,null);assert.equal(readState('{"custom":[{"id":"evil","url":"javascript:alert(1)"}]}').custom.length,0)});
test('enlaces y nombres de usuario no permiten scripts',()=>{assert.equal(validURL('javascript:alert(1)'),false);assert.equal(validURL('http://radio.test/stream'),false);assert.equal(validURL('https://user:pass@radio.test/stream'),false);assert.equal(escapeHTML('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;')});

test('limpieza única de favoritas antiguas sin borrar preferencias ni nuevas selecciones',()=>{
 const state=readState(JSON.stringify({favorites:['fidelity','kq'],accent:'mint',list:true,custom:[{id:'custom-demo',name:'Mi radio',url:'https://radio.example/stream',band:'FM'}]}));
 assert.equal(migrateFavorites(state),true);assert.deepEqual(state.favorites,[]);assert.equal(state.accent,'mint');assert.equal(state.list,true);assert.equal(state.custom.length,1);
 state.favorites.push('isla');const reopened=readState(JSON.stringify(state));assert.equal(migrateFavorites(reopened),false);assert.deepEqual(reopened.favorites,['isla']);
 const fresh=readState(null);migrateFavorites(fresh);assert.deepEqual(fresh.favorites,[]);
});
