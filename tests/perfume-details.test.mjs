import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {products} from '../catalog.js';
import {detailsFor,productQuestions,detailSections} from '../perfume-details.js';
test('every MAISON perfume has a complete, distinct editorial dossier',()=>{
 const stories=new Set();
 for(const p of products){const d=detailsFor(p);assert.ok(d);assert.ok(d.story.length>100);stories.add(d.story);assert.equal(d.journey.length,3);assert.equal(d.moments.length,3);assert.ok(d.accords.length>=4);assert.equal(d.pairings.length,2);for(const [id] of d.pairings){assert.notEqual(id,p.id);assert.ok(products.some(p=>p.id===id))}assert.ok(productQuestions(p,d).length>=10)}
 assert.equal(stories.size,products.length);
});
test('product dossiers disclose missing specifications and use size-specific unit prices',()=>{
 const html=detailSections(products[0],{money:n=>'$'+(n/100).toFixed(2),bottle:()=>'<svg></svg>'});
 for(const size of [30,50,100])assert.ok(html.includes(`data-detail-size="${size}"`));
 assert.ok(html.includes('$7.80'));assert.ok(html.includes('Not yet confirmed'));assert.ok(html.includes('No wear-time or projection testing published'));assert.ok(!html.includes('25% fragrance oil'));
});
const library=JSON.parse(fs.readFileSync(new URL('../data/reference-catalogs.json',import.meta.url),'utf8'));
test('both public source catalogs are fully represented without copying marketing HTML',()=>{
 assert.equal(library.products.length,library.sources.reduce((n,s)=>n+s.count,0));assert.equal(library.products.length,288);assert.equal(new Set(library.products.map(p=>p.id)).size,288);
 for(const p of library.products){assert.ok(p.name);assert.ok(p.url.startsWith('https://'));assert.ok(['ALT','Scentora'].includes(p.brand));assert.ok(!('body_html' in p));assert.ok(!('description' in p));for(const v of p.variants){assert.ok(Number.isInteger(v.price));assert.ok(v.price>=0);assert.equal(typeof v.available,'boolean')}for(const image of [...p.images,...p.noteImages])assert.ok(image.url.startsWith('https://'))}
});
test('known retailer records retain actual sizes, currency, ingredients and provenance',()=>{
 const crystal=library.products.find(p=>p.brand==='ALT'&&p.handle==='inspired-by-baccarat-rouge-540');assert.ok(crystal);assert.ok(crystal.variants.some(v=>v.title.includes('60ML')&&v.price===4900));assert.equal(crystal.currency,'USD');assert.ok(crystal.ingredients.includes('ALCOHOL'));assert.ok(crystal.noteImages.length);assert.equal(crystal.concentration,'Extrait de Parfum');
 const imagination=library.products.find(p=>p.brand==='Scentora'&&p.handle==='inspired-by-imagination');assert.equal(imagination.gender,'Unisex');assert.match(imagination.inspiredBy,/Imagination/);assert.ok(imagination.ingredients.includes('Limonene'));assert.ok(imagination.notes.includes('Bergamot'));
});
