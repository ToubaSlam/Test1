"""Import public product facts, not retailer marketing copy or customer reviews.

Run from the repository root. Source data remains attributed and separate from
MAISON's proposed inventory. Does not interact with carts, checkout, or accounts.
"""
import argparse
import json
import re
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from decimal import Decimal
from html.parser import HTMLParser
from pathlib import Path


class FactsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts, self.images, self.skip = [], [], 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style'):
            self.skip += 1
        elif tag == 'img':
            self.images.append({'url': attrs.get('src', ''), 'alt': attrs.get('alt', '')})
        elif tag in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'li', 'br', 'strong', 'b'):
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1)
        elif tag in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'li', 'strong', 'b'):
            self.parts.append('\n')

    def handle_data(self, text):
        if not self.skip:
            self.parts.append(text)

    def lines(self):
        return [line for part in ''.join(self.parts).splitlines()
                if (line := re.sub(r'\s+', ' ', part).strip())]


NOTES = ['Amber', 'Ambergris', 'Ambroxan', 'Bergamot', 'Mandarin', 'Orange', 'Lemon',
         'Lime', 'Grapefruit', 'Neroli', 'Orange blossom', 'Jasmine', 'Rose', 'Peony',
         'Iris', 'Violet', 'Lavender', 'Ylang-ylang', 'Tuberose', 'Osmanthus', 'Musk',
         'Sandalwood', 'Cedarwood', 'Cedar', 'Vetiver', 'Patchouli', 'Oud', 'Guaiac wood',
         'Vanilla', 'Tonka bean', 'Almond', 'Cherry', 'Peach', 'Pear', 'Apple', 'Plum',
         'Lychee', 'Pineapple', 'Mango', 'Coconut', 'Fig', 'Green tea', 'Black tea',
         'Saffron', 'Cardamom', 'Cinnamon', 'Ginger', 'Black pepper', 'Pink pepper',
         'Clove', 'Nutmeg', 'Frankincense', 'Benzoin', 'Leather', 'Suede', 'Tobacco',
         'Oakmoss', 'Geranium', 'Rosemary', 'Basil', 'Mint', 'Honey', 'Caramel', 'Coffee',
         'Cacao', 'Chocolate', 'Sea salt', 'Cashmere wood']


def field(lines, label):
    for i, line in enumerate(lines):
        if re.fullmatch(re.escape(label) + r'\s*:?\s*', line, re.I):
            return lines[i + 1] if i + 1 < len(lines) else ''
        match = re.match(re.escape(label) + r'\s*:\s*(\S.*)', line, re.I)
        if match:
            return match.group(1)
    return ''


def cents(value):
    return int(Decimal(str(value or '0')) * 100)


def https(url):
    if url.startswith('//'):
        url = 'https:' + url
    return url if url.startswith('https://') else ''


def classify(product):
    text = (product['title'] + ' ' + product.get('product_type', '') + ' ' + product['handle']).lower()
    if any(x in text for x in ('protection', 'upsell toggle', 'route shipping')):
        return 'Service'
    if any(x in text for x in ('bundle', 'pack', '3 for', '3-for', 'trio', 'discovery set')):
        return 'Bundle'
    if any(x in text for x in ('gift card', 'gift-card', 'ebook', 'e-book', 'free gift', 'giveaway', 'entry')):
        return 'Gift'
    if any(x in text for x in ('sample', 'travel spray', 'atomizer')):
        return 'Sample / accessory'
    return 'Perfume'


def extract(product, brand, host, currency):
    parser = FactsParser()
    parser.feed(product.get('body_html') or '')
    lines = parser.lines()
    kind = classify(product)
    # Exclude the ingredient disclosure and legal footer when finding note names.
    end = next((i for i, line in enumerate(lines) if re.match(r'ingredients\s*:?$', line, re.I)), len(lines))
    note_text = ' '.join(lines[:end])
    tags = product.get('tags', [])
    gender = field(lines, 'Gender')
    if not gender:
        for value, aliases in [('Unisex', ['unisex', 'universal']), ('Women', ['female', 'women']), ('Men', ['male', 'men'])]:
            if any(str(tag).lower() in aliases for tag in tags):
                gender = value
                break
    inspired = ''
    for line in lines:
        match = re.search(r'(?:Fragrance Description\s*[-–:]?\s*)?Inspired by\s+(.+)', line, re.I)
        if match:
            value = re.split(r'[.;,]|\bis\b|\bfeatures\b|\bhas been\b', match.group(1), 1)[0].strip(' .:-')
            value = re.sub(r'^(?:an? |the )(?:(?:ultra-exclusive|ever-popular|famous|irresistible)\s+)?', '', value, flags=re.I)
            if 2 < len(value) < 70 and len(value.split()) <= 10 and value[0].isupper():
                inspired = value
                break
    if not inspired and product['handle'].startswith('inspired-by-'):
        inspired = product['handle'][12:].replace('-', ' ').title()
    ingredients = field(lines, 'Ingredients')
    # Only publish ingredient-shaped disclosures, never adjacent marketing text.
    if ingredients and not re.search(r'alcohol|aqua|water|parfum|fragrance|limonene', ingredients, re.I):
        ingredients = ''
    concentration = field(lines, 'Concentration')
    if concentration and len(concentration) > 100:
        concentration = ''
    origin = next((re.search(r'Made in\s+([\w ]{2,30})', line, re.I).group(1).strip(' .')
                   for line in lines if re.match(r'Made in\s+[\w ]{2,30}\.?$', line, re.I)), '')
    note_images = [dict(url=https(image['url']), alt='Retailer scent-note diagram') for image in parser.images
                   if re.search(r'notes|pyramid|scent', image['url'], re.I) and https(image['url'])]
    images = [dict(url=https(image.get('src', '')), alt=image.get('alt') or product['title'])
              for image in product.get('images', []) if https(image.get('src', ''))][:6]
    variants = [dict(title=v['title'], sku=v.get('sku') or '', price=cents(v.get('price')),
                     compareAt=cents(v['compare_at_price']) if v.get('compare_at_price') else None,
                     available=bool(v.get('available')), options=[v.get('option1'), v.get('option2'), v.get('option3')])
                for v in product.get('variants', [])]
    notes = [name for name in NOTES if re.search(r'\b' + re.escape(name) + r'\b', note_text, re.I)]
    return dict(id=f"{brand}-{product['id']}", brand=brand, name=product['title'], handle=product['handle'],
                kind=kind, url=host+'/products/'+product['handle'], currency=currency,
                gender=gender, season=field(lines, 'Season'), profile=field(lines, 'Fragrance Profile'),
                inspiredBy=inspired, concentration=concentration, origin=origin, ingredients=ingredients,
                notes=notes, noteImages=note_images[:2], images=images, variants=variants,
                options=product.get('options', []), updatedAt=product.get('updated_at'))


def load_json(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 MAISON catalog research'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot-date', default=datetime.now(timezone.utc).date().isoformat())
    parser.add_argument('--cached-input-directory', type=Path)
    args = parser.parse_args()
    result = []
    sources = []
    for slug, brand, host in [('alt', 'ALT', 'https://altfragrances.com'), ('scentora', 'Scentora', 'https://scentora-fragrance.com')]:
        if args.cached_input_directory:
            raw = json.loads((args.cached_input_directory / (slug+'-products-source.json')).read_text(encoding='utf-8'))['products']
        else:
            raw, page = [], 1
            while True:
                batch = load_json(f'{host}/products.json?limit=250&page={page}')['products']
                raw.extend(batch)
                if len(batch) < 250:
                    break
                page += 1
        try:
            currency = load_json(host+'/cart.js')['currency']
        except Exception:
            currency = None
        items = [extract(p, brand, host, currency) for p in raw]
        result.extend(items)
        sources.append(dict(brand=brand, host=host, catalogUrl=host+'/products.json?limit=250',
                            count=len(items), currency=currency, kinds=dict(Counter(p['kind'] for p in items))))
    output = dict(snapshotDate=args.snapshot_date, sources=sources, products=result)
    Path('data').mkdir(exist_ok=True)
    Path('data/reference-catalogs.json').write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(json.dumps({'date': args.snapshot_date, 'count': len(result), 'sources': sources}, ensure_ascii=True))


if __name__ == '__main__':
    main()
