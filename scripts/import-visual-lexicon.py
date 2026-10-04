"""Rebuild the compact English semantic lexicon from Princeton WordNet 3.1.

Usage: python scripts/import-visual-lexicon.py path/to/wn3.1.dict.tar.gz
The archive is a build-time data source only; no runtime network dependency.
"""
import hashlib
import json
import re
import sys
import tarfile
from functools import lru_cache
from pathlib import Path

archive = Path(sys.argv[1])
with tarfile.open(archive) as source:
    def read(name):
        return source.extractfile('dict/' + name).read().decode('utf-8')
    noun_text = read('data.noun')
    nodes = {}
    for line in noun_text.splitlines():
        if not re.match(r'^\d{8} ', line):
            continue
        parts = line.split(' | ')[0].split()
        count = int(parts[3], 16)
        names = parts[4:4 + count * 2:2]
        cursor = 4 + count * 2
        pointers = parts[cursor + 1:cursor + 1 + int(parts[cursor]) * 4]
        parents = [pointers[i + 1] for i in range(0, len(pointers), 4) if pointers[i] == '@']
        nodes[parts[0]] = (int(parts[1]), names, parents)

    @lru_cache(None)
    def ancestors(offset):
        node = nodes[offset]
        return frozenset(node[1]).union(*(ancestors(parent) for parent in node[2] if parent in nodes))

    def noun_category(offset):
        lex, names, parents = nodes[offset]
        family = ancestors(offset)
        if family.intersection({'weapon', 'drug', 'sexual_organ', 'sexual_activity', 'explosive', 'alcoholic_beverage'}):
            return None
        for category, roots in [
            ('fruit', {'edible_fruit'}), ('vegetable', {'vegetable'}),
            ('vehicle', {'vehicle', 'vessel'}), ('household', {'home_appliance', 'household_appliance', 'furniture'}),
            ('clothing', {'clothing', 'footwear'}), ('technology', {'computer', 'electronic_equipment'}),
            ('building', {'building', 'structure'}), ('weather', {'weather', 'atmospheric_phenomenon'}), ('nature', {'vegetation'})
        ]:
            if family.intersection(roots):
                return category
        return {5: 'animal', 6: 'object', 8: 'body', 13: 'food', 15: 'place', 17: 'nature', 18: 'person', 20: 'nature'}.get(lex)

    nouns = {}
    priority = ['animal', 'fruit', 'vegetable', 'food', 'vehicle', 'household', 'technology', 'clothing', 'building', 'weather', 'body', 'person', 'nature', 'place', 'object']
    for line in read('index.noun').splitlines():
        if not line or line.startswith(' '):
            continue
        fields = line.split(); lemma = fields[0].replace('_', ' ')
        if not re.fullmatch(r'[a-z][a-z -]{1,55}', lemma):
            continue
        pointer_count = int(fields[3]); offsets = fields[6 + pointer_count:]
        # Prefer the first sense, except edible plant/animal names where lexical
        # food/animal classes are more useful than the botanical source plant.
        categories = [noun_category(offset) for offset in offsets if offset in nodes]
        first = categories[0] if categories else None
        edible = [c for c in categories if c in ('animal', 'fruit', 'vegetable', 'food')]
        physical_alternate = next((c for c in categories if c in {'technology', 'household', 'object'}), None) if nodes[offsets[0]][0] == 10 else None
        if first or edible or physical_alternate:
            nouns[lemma] = min(edible, key=priority.index) if edible else first or physical_alternate

    verb_nodes = {}
    for line in read('data.verb').splitlines():
        if re.match(r'^\d{8} ', line):
            fields = line.split(); verb_nodes[fields[0]] = int(fields[1])
    verbs = []
    for line in read('index.verb').splitlines():
        if not line or line.startswith(' '):
            continue
        fields = line.split(); offsets = fields[6 + int(fields[3]):]
        # Body, communication, contact, creation, consumption, motion, perception.
        if re.fullmatch('[a-z]{2,20}', fields[0]) and any(verb_nodes.get(offset) in {29, 32, 34, 35, 36, 38, 39} for offset in offsets):
            verbs.append(fields[0])

    # Only retain lemmas whose tokens occur in this CC-CEDICT export. This is a
    # mechanical size reduction, never a hand-maintained Mandarin vocabulary gate.
    rows = json.loads(Path('public/data/cedict.json').read_text(encoding='utf-8'))
    tokens = set(re.findall('[a-z]+', ' '.join(d for row in rows for d in row[3]).lower()))
    nouns = {k: v for k, v in sorted(nouns.items()) if all(t in tokens for t in k.split())}
    verbs = sorted(v for v in verbs if v in tokens)
    # Expand English visual families through WordNet synsets. These are semantic
    # templates, never Mandarin entries. Seed sense numbers select literal or
    # human meanings (e.g. short in stature, not short in duration).
    templates = json.loads(Path('src/data/visual-templates.json').read_text(encoding='utf-8'))
    semantic_nodes, semantic_index = {}, {}
    for pos in ('adj', 'noun', 'verb'):
        semantic_nodes[pos] = {}
        for line in read('data.' + pos).splitlines():
            if not re.match(r'^\d{8} ', line):
                continue
            fields = line.split(' | ')[0].split()
            count = int(fields[3], 16); cursor = 4 + count * 2
            names = [re.sub(r'\([a-z]+\)$', '', name).replace('_', ' ') for name in fields[4:cursor:2]]
            pointers = fields[cursor + 1:cursor + 1 + int(fields[cursor]) * 4]
            similar = [pointers[i + 1] for i in range(0, len(pointers), 4) if pointers[i] == '&']
            semantic_nodes[pos][fields[0]] = (fields[2], names, similar)
        semantic_index[pos] = {}
        for line in read('index.' + pos).splitlines():
            if not line or line.startswith(' '):
                continue
            fields = line.split()
            semantic_index[pos][fields[0].replace('_', ' ')] = fields[6 + int(fields[3]):]

    descriptors = {}
    def offer(lemma, family, distance):
        lemma = lemma.replace('-', ' ')
        if not re.fullmatch(r'[a-z][a-z ]{1,55}', lemma) or not all(t in tokens for t in lemma.split()):
            return
        previous = descriptors.get(lemma)
        if previous is None or distance < previous[1]:
            descriptors[lemma] = (family, distance)

    for family, template in templates.items():
        for anchor in template['anchors']:
            pos, lemma, *sense = anchor.split(':')
            offset = semantic_index[pos][lemma][int(sense[0]) if sense else 0]
            kind, names, similar = semantic_nodes[pos][offset]
            offer(lemma, family, 0)
            for name in names:
                offer(name, family, 1)
            # Only expand outwards from a head adjective. A satellite must not
            # pull in the whole parent family (panic is more specific than fear).
            if pos == 'adj' and kind == 'a':
                for related in similar:
                    for name in semantic_nodes[pos][related][1]:
                        offer(name, family, 2)
    descriptor_buckets = {}
    for lemma, (family, _) in sorted(descriptors.items()):
        descriptor_buckets.setdefault(family, []).append(lemma)
    buckets = {}
    for lemma, category in nouns.items():
        buckets.setdefault(category, []).append(lemma)
    output = {'version': 'wordnet-3.1-cedict-v2', 'nouns': {category: '|'.join(lemmas) for category, lemmas in sorted(buckets.items())}, 'verbs': '|'.join(verbs), 'descriptors': {family: '|'.join(lemmas) for family, lemmas in sorted(descriptor_buckets.items())}}
    Path('src/data/visual-lexicon.json').write_text(json.dumps(output, separators=(',', ':')) + '\n', encoding='utf-8', newline='\n')
    license_text = '\n'.join(re.sub(r'^\s+\d+ ?', '', line).rstrip() for line in noun_text.splitlines() if line.startswith(' '))
    Path('public/data/WORDNET-LICENSE.txt').write_text(license_text + '\n', encoding='utf-8', newline='\n')
    manifest = {'source': 'https://wordnetcode.princeton.edu/wn3.1.dict.tar.gz', 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'nouns': len(nouns), 'verbs': len(verbs), 'descriptors': len(descriptors), 'templates_sha256': hashlib.sha256(Path('src/data/visual-templates.json').read_bytes()).hexdigest()}
    Path('src/data/visual-lexicon-source.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps(manifest))
