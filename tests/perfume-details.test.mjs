import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {products} from '../catalog.js';
import {productQuestions,detailSections,actualProductView} from '../actual-products.js';
test('main shop contains actual source perfumes, not invented MAISON names or prices',()=>{
 assert.equal(products.length,225);assert.equal(new Set(products.map(p=>p.slug)).size,225);
 for(const p of products){assert.equal(p.name,p.source.name);assert.equal(p.brand,p.source.brand);assert.equal(p.variants.length,p.source.variants.length);assert.ok(p.description.includes(p.name));assert.ok(p.source.images.length);for(let i=0;i<p.variants.length;i++){assert.equal(p.variants[i].label,p.source.variants[i].title);assert.equal(p.variants[i].price,p.source.variants[i].price);assert.equal(p.variants[i].sku,p.source.variants[i].sku)}assert.equal(productQuestions(p).length,10)}
 assert.equal(products[0].name,'Crystal');assert.equal(products[1].name,'Executive');
});
test('real product details show the exact 30/60/100 ml options and published ingredients',()=>{
 const html=detailSections(products[0],{money:n=>'$'+(n/100).toFixed(2)});
 for(const size of [30,60,100])assert.ok(html.includes(`data-detail-size="${size}"`));
 assert.ok(!html.includes('data-detail-size="50"'));assert.ok(html.includes('Extrait de Parfum'));assert.ok(html.includes('ALCOHOL'));assert.ok(html.includes('C23-60'));
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

test('every actual perfume renders its product page without fabricated size options',()=>{for(const p of products){const html=actualProductView(p,{bottle:()=>'<img>',money:n=>String(n),cards:()=>'',reviewsBlock:()=>''});assert.ok(html.includes('source-feed price'));assert.ok(html.includes(p.source.url));assert.ok(html.includes('data-product-add="'+p.id+'"'));for(const v of p.variants)assert.ok(html.includes('data-size="'+v.size+'"'))}});
