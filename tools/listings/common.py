import json, sys, time, urllib.error, urllib.parse, urllib.request
UA = {"User-Agent": "MashinamPrototype/0.1 (demo car listing app; one-off image lookup)"}
API = "https://commons.wikimedia.org/w/api.php"
def get(params):
    params = {**params, "format": "json", "formatversion": "2"}
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers=UA)
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            wait = int(e.headers.get("Retry-After") or 0) or 20 * (attempt + 1)
            print("429 wait", wait, file=sys.stderr); time.sleep(wait)
    raise RuntimeError("rate limited")
