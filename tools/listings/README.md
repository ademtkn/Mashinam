# Demo listing generator (Wikimedia Commons)

One-off scripts used to build `data/mockCars2.ts`. Kept so the next batch
doesn't start from zero. Run them from this folder with `python3 -I`.

1. `search2.py queries2.json cats.json` — find a Commons category per model key.
2. `fetch2.py cats.json candidates.json` — list licensed, landscape, exterior JPEGs per category
   (CC/PD only; interiors, crashes, taxis, shows filtered by filename). Commons rate-limits hard:
   expect 429s, the scripts back off and resume.
3. `group2.py candidates.json groups.json sheet.html` — group files into "same car" series
   (same uploader + title stem) and write a review sheet. Render it with
   `node sheet.mjs sheet.html out.png 0 24` (needs Playwright) and look at every row:
   drop race cars, show stands, wrong models.
4. Put the chosen rows into `picks.json` (`[{"gid":"g1","idx":[0,1]}, ...]`) and run
   `build2.py groups.json picks.json ../../data/mockCars3.ts`. Prices/years per model live in
   the `M` table inside `build2.py`; every phone number is the test number.

Photos must keep the author/license credit the app shows on each card.
Pexels videos: `https://www.pexels.com/download/video/<id>/` redirects to the file;
re-encode to 720x1280 (see git history of `public/media`).
