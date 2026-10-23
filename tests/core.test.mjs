import {test} from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../catalog.js';
import {cleanCart,addItem,summarize,filterProducts,recommend,bundleTotal,escapeHTML} from '../shop-core.js';
test('bag migrates legacy rows and rejects invalid catalog data',()=>{
 assert.deepEqual(cleanCart([{id:1,qty:2},{id:1,size:50,qty:3},{id:1,size:100,qty:1},null,{id:999,qty:1},{id:2,size:99,qty:1},{id:3,qty:-1},{id:4,qty:1.5}]),[{id:1,size:50,qty:5},{id:1,size:100,qty:1}]);
 assert.deepEqual(cleanCart({bad:true}),[]);
 assert.equal(cleanCart([{id:1,qty:1000}])[0].qty,99);
});
test('different bottle sizes remain separate and totals use integer variant prices',()=>{
 let bag=addItem([],1,30,2);bag=addItem(bag,1,100);bag=addItem(bag,1,30);
 assert.equal(bag.length,2);assert.equal(bag[0].qty,3);
 const p=products[0];assert.deepEqual(summarize(bag),{count:4,subtotal:p.variants[0].price*3+p.variants[2].price});
 assert.deepEqual(addItem(bag,999),bag);assert.deepEqual(addItem(bag,1,77),bag);
});
test('search ignores accents and combines family, price and gender filters',()=>{
 assert.equal(filterProducts({query:'lumiere'})[0].id,1);
 assert.equal(filterProducts({query:'THE VERT'})[0].id,9);
 assert.deepEqual(filterProducts({family:'Floral',gender:'Men'}),[]);
 const list=filterProducts({family:'Floral',maxPrice:4000});assert.equal(list.length,1);assert.equal(list[0].id,6);
 assert.ok(filterProducts({query:'<img src=x onerror=alert(1)>'}).length===0);
});
test('catalog sorting does not mutate the original catalog',()=>{
 const before=products.map(p=>p.id);const sorted=filterProducts({sort:'high'});
 assert.ok(sorted.every((p,i)=>i===0||sorted[i-1].price>=p.price));assert.deepEqual(products.map(p=>p.id),before);
});
test('recommendations favor the requested scent family and mood',()=>{
 const list=recommend({family:'Fresh',mood:'Bright',occasion:'Everyday',gender:'All'});
 assert.equal(list.length,3);assert.equal(list[0].id,4);assert.equal(new Set(list.map(p=>p.id)).size,3);
});
test('bundles total the chosen size without inventing discounts',()=>{
 assert.equal(bundleTotal([1,2,3],50),12300);
 assert.equal(bundleTotal([1,2,3],100),products.slice(0,3).reduce((n,p)=>n+p.variants[2].price,0));
 assert.throws(()=>bundleTotal([1,999]));assert.throws(()=>bundleTotal([1],999));
});
test('user text is escaped before rendering saved bag notes',()=>{
 assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
