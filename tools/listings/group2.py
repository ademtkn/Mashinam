# Group candidate files into "same physical car" series (same author + same title stem) and
# write a review sheet HTML; usage: group2.py candidates2.json groups2.json sheet.html
import json, re, sys, collections
d = json.load(open(sys.argv[1]))
def key(t):
    t = t[5:].rsplit('.', 1)[0]
    t = re.sub(r'(?i)[\s_,-]*(\(?\d{1,2}\)?|front|rear|back|side|left|right|frontview|rearview|heck|vorne|hinten|\d+/\d+)$', '', t)
    t = re.sub(r'(?i)[\s_,-]*(front|rear|back|side|view|left|right|heck|vorne|hinten|frontansicht|heckansicht)\b', '', t)
    return t.strip()
groups = []
for m, items in d.items():
    g = collections.defaultdict(list)
    for it in items: g[(it['author'], key(it['title']))].append(it)
    multi = [(k, v) for k, v in g.items() if len(v) >= 2 and not re.search(r'Taikyu|Brabus|racing', k[1], re.I)]
    singles = [v[0] for k, v in g.items() if len(v) == 1]
    for (a, k), v in multi[:4]:
        v.sort(key=lambda it: (0 if re.search(r'(?i)front|vorne|\b0?1\b|\(1\)', it['title']) else 1, it['title']))
        groups.append({"gid": f"g{len(groups)}", "model": m, "items": v[:4]})
    if not multi:  # fall back to up to 3 single shots so the model still gets reviewed
        for it in singles[:3]:
            groups.append({"gid": f"g{len(groups)}", "model": m, "items": [it]})
json.dump(groups, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
t = lambda u: re.sub(r'/\d+px-', '/250px-', u)
html = '<body style="margin:0;background:#111;color:#fff;font:13px sans-serif">' + ''.join(
    f'<div style="display:flex;gap:4px;align-items:center;margin:3px"><div style="width:120px">{g["gid"]} {g["model"]}</div>' +
    ''.join(f'<img src="{t(i["thumb"])}" style="width:200px;height:120px;object-fit:cover">' for i in g["items"]) + '</div>' for g in groups) + '</body>'
open(sys.argv[3], 'w').write(html)
print(len(groups), 'groups across', len({g['model'] for g in groups}), 'models')
