import {test} from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../catalog.js';
import {cleanCart,addItem,summarize,filterProducts,recommend,bundleTotal,escapeHTML,chooseVariant} from '../shop-core.js';
test('bag keeps Scentora quantities and removes retired ALT or invalid rows',()=>{
 assert.deepEqual(cleanCart([{id:1,qty:2},{id:4,qty:2},{id:4,size:50,qty:3},null,{id:999,qty:1},{id:7,size:99,qty:1},{id:8,qty:-1},{id:9,qty:1.5}]),[{id:4,size:50,qty:5}]);
 assert.deepEqual(cleanCart({bad:true}),[]);assert.equal(cleanCart([{id:4,qty:1000}])[0].qty,99);
});
test('source-listed bottles keep their quantity and integer price calculations',()=>{
 let bag=addItem([],4,50,2);bag=addItem(bag,7,50);bag=addItem(bag,4,50);
 assert.equal(bag.length,2);assert.equal(bag[0].qty,3);assert.deepEqual(summarize(bag),{count:4,subtotal:10000});
 assert.deepEqual(addItem(bag,1),bag);assert.deepEqual(addItem(bag,4,30),bag);
});
test('search uses real product names, brands, inspiration and notes',()=>{
 assert.equal(filterProducts({brand:'ALT'}).length,0);
 const matches=filterProducts({query:'Imagination',brand:'Scentora'});assert.ok(matches.some(p=>p.name==='EDEN MUSK 246'));
 const limited=filterProducts({brand:'Scentora',maxPrice:3000});assert.ok(limited.length>0);assert.ok(limited.every(p=>p.brand==='Eden Musk'&&p.price<=3000));
 assert.equal(filterProducts({query:'Ambre Lumiere'}).length,0);
 assert.equal(filterProducts({query:'<img src=x onerror=alert(1)>'}).length,0);
});
test('catalog sorting does not mutate the original catalog',()=>{
 const before=products.map(p=>p.id);const sorted=filterProducts({sort:'high'});
 assert.ok(sorted.every((p,i)=>i===0||sorted[i-1].price>=p.price));assert.deepEqual(products.map(p=>p.id),before);
});
test('recommendations favor the requested scent family and mood',()=>{
 const list=recommend({family:'Fresh',mood:'Bright',occasion:'Everyday',gender:'All'});
 assert.equal(list.length,3);assert.equal(list[0].family,'Fresh');assert.equal(new Set(list.map(p=>p.id)).size,3);
});
test('bundles use only the source-listed Scentora size',()=>{
 const ids=[4,7,8];assert.equal(bundleTotal(ids,50),7500);assert.equal(bundleTotal(ids,0),7500);
 assert.equal(chooseVariant(products[0],30),undefined);assert.throws(()=>bundleTotal(ids,30));assert.throws(()=>bundleTotal([1]));
});
test('user text is escaped before rendering saved bag notes',()=>{
 assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
