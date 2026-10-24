// Presentation names are independent of source identifiers, URLs and product facts.
export const displayBrand='Eden Musk';
export const brandText=value=>String(value??'').replace(/\bSCENTORA\b/g,'EDEN MUSK').replace(/\b(?:Scentora|ALT)\b/gi,'Eden Musk');
export const storefrontProduct=p=>({...p,brand:displayBrand,name:brandText(p.name),tag:displayBrand,description:brandText(p.description)});
export const referenceProduct=p=>({...p,originalBrand:p.brand,originalName:p.name,brand:displayBrand,name:brandText(p.name),images:p.images.map(img=>({...img,alt:brandText(img.alt)}))});
