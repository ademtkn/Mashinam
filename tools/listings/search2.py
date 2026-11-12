import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json, time
from common import get
queries = json.load(open(sys.argv[1]))
out = json.load(open(sys.argv[2])) if os.path.exists(sys.argv[2]) else {}
for key, q in queries.items():
    if out.get(key): continue
    try:
        d = get({"action": "query", "list": "search", "srsearch": q, "srnamespace": 14, "srlimit": 5})
        out[key] = [s["title"] for s in d["query"]["search"]]
    except Exception as e:
        print("ERR", key, e, file=sys.stderr); out[key] = []
    print(key, "=>", out[key][:3], file=sys.stderr)
    json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
    time.sleep(4)
