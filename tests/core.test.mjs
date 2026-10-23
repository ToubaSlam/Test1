import {test} from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../catalog.js';
import {cleanCart,addItem,summarize,filterProducts,recommend,bundleTotal,escapeHTML,chooseVariant} from '../shop-core.js';
test('bag migrates legacy rows and rejects invalid catalog data',()=>{
 assert.deepEqual(cleanCart([{id:1,qty:2},{id:1,size:30,qty:3},{id:1,size:100,qty:1},null,{id:999,qty:1},{id:2,size:99,qty:1},{id:3,qty:-1},{id:4,qty:1.5}]),[{id:1,size:30,qty:5},{id:1,size:100,qty:1}]);
 assert.deepEqual(cleanCart({bad:true}),[]);
 assert.equal(cleanCart([{id:1,qty:1000}])[0].qty,99);
});
test('different bottle sizes remain separate and totals use integer variant prices',()=>{
 let bag=addItem([],1,30,2);bag=addItem(bag,1,100);bag=addItem(bag,1,30);
 assert.equal(bag.length,2);assert.equal(bag[0].qty,3);
 const p=products[0];assert.deepEqual(summarize(bag),{count:4,subtotal:p.variants[0].price*3+p.variants[2].price});
 assert.deepEqual(addItem(bag,999),bag);assert.deepEqual(addItem(bag,1,77),bag);
});
test('search uses real product names, brands, inspiration and notes',()=>{
 assert.equal(filterProducts({query:'Crystal',brand:'ALT'})[0].name,'Crystal');
 const matches=filterProducts({query:'Imagination',brand:'Scentora'});assert.ok(matches.some(p=>p.name==='SCENTORA 246'));
 const limited=filterProducts({brand:'Scentora',maxPrice:3000});assert.ok(limited.length>0);assert.ok(limited.every(p=>p.brand==='Scentora'&&p.price<=3000));
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
test('mixed source sizes total correctly without creating nonexistent options',()=>{
 const ids=[1,2,4];assert.equal(bundleTotal(ids,0),ids.reduce((n,id)=>n+chooseVariant(products.find(p=>p.id===id)).price,0));
 assert.equal(chooseVariant(products[0],50),undefined);
 assert.throws(()=>bundleTotal([1,4],50));assert.throws(()=>bundleTotal([999]));
});
test('user text is escaped before rendering saved bag notes',()=>{
 assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
