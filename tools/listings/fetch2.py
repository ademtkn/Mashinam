import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json, os, re, sys, time
from common import get
BAD = re.compile(r"interior|innen|cockpit|dashboard|engine|motor|seat|wheel|badge|emblem|logo|detail|light|lamp|grille|trunk|boot|crash|wreck|damag|police|polizei|taxi|rally|race|tuning|concept|prototype|show|salon|expo|messe|museum|IAA|autosalon|cutaway|ambulance|feuerwehr|fire", re.I)
strip = lambda h: re.sub(r"<[^>]+>", "", h or "").strip()
def files(cat, how):
    if how == "cat":
        p = {"generator": "categorymembers", "gcmtitle": cat, "gcmtype": "file", "gcmlimit": 60}
    else:
        p = {"generator": "search", "gsrsearch": f'deepcat:"{cat[9:]}" filetype:bitmap', "gsrnamespace": 6, "gsrlimit": 60}
    d = get({"action": "query", **p, "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1280,
             "iiextmetadatafilter": "Artist|LicenseShortName"})
    return d.get("query", {}).get("pages", [])
cats = json.load(open(sys.argv[1]))
out = json.load(open(sys.argv[2])) if os.path.exists(sys.argv[2]) else {}
for key, cat in cats.items():
    if key in out: continue
    res = []
    for how in ("cat", "deep"):
        try: pages = files(cat, how)
        except Exception as e: print("ERR", key, how, e, file=sys.stderr); pages = []
        for pg in pages:
            ii = (pg.get("imageinfo") or [{}])[0]
            w, h = ii.get("width", 0), ii.get("height", 1)
            if ii.get("mime") != "image/jpeg" or w < 1600 or not (1.3 <= w / h <= 1.9) or BAD.search(pg["title"]): continue
            md = ii.get("extmetadata", {}); lic = md.get("LicenseShortName", {}).get("value", "")
            if not re.search(r"CC|Public domain|PD", lic, re.I) or re.search(r"NC|ND", lic): continue
            res.append({"title": pg["title"], "thumb": ii.get("thumburl"), "page": ii.get("descriptionurl"),
                        "author": strip(md.get("Artist", {}).get("value", ""))[:80], "license": lic})
        if len(res) >= 12: break
        time.sleep(3)
    seen = set(); out[key] = [r for r in res if not (r["title"] in seen or seen.add(r["title"]))][:24]
    print(f"{key:14s} {len(out[key])}", file=sys.stderr)
    json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
    time.sleep(3)
