"""Build the main storefront from factual Scentora source records.

No competitor marketing prose is copied. Descriptions use original wording
around published names, inspiration references, notes, and ingredient facts.
"""
import json
import re
from pathlib import Path

data=json.loads(Path('data/reference-catalogs.json').read_text(encoding='utf-8'))
source=[p for p in data['products'] if p['brand']=='Scentora' and p['kind']=='Perfume' and p['variants']]
featured=[('Scentora',h) for h in ['inspired-by-imagination','inspired-by-aventus','inspired-by-delina','inspired-by-lost-cherry','inspired-by-baccarat-rouge']]
ordered=[]
for brand,handle in featured:
    item=next((p for p in source if p['brand']==brand and p['handle']==handle),None)
    if item and item not in ordered:ordered.append(item)
for item in source:
    if item not in ordered:ordered.append(item)

def family(p):
    text=(p['profile']+' '+' '.join(p['notes'])).lower()
    for name,words in [('Gourmand',['gourmand','vanilla','caramel','chocolate','coffee']),('Fresh',['fresh','citrus','aquatic','bergamot','lemon','green tea']),('Woody',['woody','sandalwood','cedar','vetiver','oud']),('Floral',['floral','rose','jasmine','peony']),('Fruity',['fruity','cherry','peach','pineapple']),('Amber',['amber','oriental','saffron'])]:
        if any(w in text for w in words):return name
    return 'Other'

existing_file=Path('data/store-products.js')
existing=json.loads(existing_file.read_text(encoding='utf-8').split('export const importedProducts=',1)[1].strip().removesuffix(';')) if existing_file.exists() else []
stable_ids={p['sourceId']:p['id'] for p in existing}
next_id=max(stable_ids.values(),default=225)+1
products=[]
for index,p in enumerate(ordered,1):
    p=dict(p)
    variants=[]
    keys=set()
    for n,v in enumerate(p['variants']):
        match=re.search(r'(\d+(?:\.\d+)?)\s*ml',v['title'],re.I)
        volume=float(match.group(1)) if match else None
        key=int(volume) if volume and volume.is_integer() and int(volume) not in keys else 10000+n
        keys.add(key)
        variants.append(dict(size=key,volumeMl=volume,label=v['title'],price=v['price'],sku=v['sku'],available=v['available'],compareAt=v['compareAt'],imageUrl=v.get('imageUrl') or ''))
    default=next((v for v in variants if v['available']),variants[0])
    group=family(p)
    category='Unisex' if re.search('unisex',p['gender'],re.I) else 'Women' if re.match('female|women|for her',p['gender'],re.I) else 'Men' if re.match('male|men|for him',p['gender'],re.I) else 'Not specified'
    description=p['name']+' by '+p['brand']
    description+=(' follows the '+p['profile'].replace(' - ', ', ')+' direction described in the retailer listing.' if p['profile'] else ' is part of the '+p['brand']+' fragrance collection.')
    if p['inspiredBy']:description+=' The retailer identifies '+p['inspiredBy']+' as its inspiration.'
    if p['notes']:description+=' Its published text mentions '+', '.join(p['notes'][:7])+('. Additional notes mentioned include '+', '.join(p['notes'][7:])+'.' if len(p['notes'])>7 else '.')
    if p['season']:description+=' The listing suggests '+p['season'].lower()+' wear.'
    if p['concentration']:description+=' Its stated concentration is '+p['concentration']+'.'
    stable_id=stable_ids.get(p['id'])
    if stable_id is None:
        stable_id=next_id
        next_id+=1
    products.append(dict(id=stable_id,slug=p['brand'].lower()+'-'+p['handle'],name=p['name'],brand=p['brand'],sourceId=p['id'],category=category,family=group,familyDerived=True,mood={'Fresh':'Bright','Floral':'Romantic','Woody':'Grounded','Gourmand':'Warm','Amber':'Warm','Fruity':'Bright'}.get(group,'Curious'),occasion=[],season=p['season'] or 'Not specified by retailer',color='#d7c8a3',tag=p['brand'],price=default['price'],defaultSize=default['size'],top=[],heart=[],base=[],notes=p['notes'],description=description,edit='signature' if index<=10 else 'new',variants=variants,source=p,snapshotDate=data['snapshotDate']))
Path('data/store-products.js').write_text('// Generated from the attributed source snapshot. Refresh with scripts/build-store-catalog.py.\nexport const importedProducts='+json.dumps(products,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(json.dumps({'products':len(products),'brands':{b:sum(p['brand']==b for p in products) for b in ['Scentora']},'featured':[{ 'id':p['id'],'name':p['name'],'brand':p['brand']} for p in products[:10]]}))
