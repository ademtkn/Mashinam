# Build data/mockCars2.ts from reviewed Commons groups.
# usage: build2.py groups2.json picks.json out.ts   (picks: [{"gid":"g3","idx":[0,1]}, ...])
import json, random, re, sys
groups = {g["gid"]: g for g in json.load(open(sys.argv[1]))}
picks = json.load(open(sys.argv[2]))

# model key -> brand, model, (year range), (price range USD), fuels, transmission, import sources
M = {
 "fit3": ("Honda", "Fit", (2014, 2019), (8500, 12500), ["Benzin", "Hibrit"], "Otomatik", ["JP"]),
 "crv4": ("Honda", "CR-V", (2013, 2016), (15500, 19500), ["Benzin"], "Otomatik", ["JP", "US"]),
 "accord9": ("Honda", "Accord", (2013, 2017), (13500, 18500), ["Benzin"], "Otomatik", ["US"]),
 "stepwgn5": ("Honda", "Stepwgn", (2015, 2019), (16000, 21000), ["Benzin"], "Otomatik", ["JP"]),
 "vezel": ("Honda", "Vezel", (2014, 2018), (13000, 16500), ["Hibrit", "Benzin"], "Otomatik", ["JP"]),
 "avensis3": ("Toyota", "Avensis", (2010, 2015), (9500, 13500), ["Benzin", "Dizel"], "Otomatik", ["DE"]),
 "vitz3": ("Toyota", "Vitz", (2012, 2017), (7000, 9500), ["Benzin", "Hibrit"], "Otomatik", ["JP"]),
 "estima3": ("Toyota", "Estima", (2010, 2016), (13500, 19000), ["Benzin", "Hibrit"], "Otomatik", ["JP"]),
 "sienna3": ("Toyota", "Sienna", (2012, 2017), (18000, 25000), ["Benzin"], "Otomatik", ["US"]),
 "fielder160": ("Toyota", "Corolla Fielder", (2013, 2018), (9500, 13000), ["Benzin", "Hibrit"], "Otomatik", ["JP"]),
 "harrier60": ("Toyota", "Harrier", (2014, 2019), (22000, 29000), ["Benzin", "Hibrit"], "Otomatik", ["JP"]),
 "crown210": ("Toyota", "Crown", (2013, 2017), (17000, 23000), ["Hibrit", "Benzin"], "Otomatik", ["JP"]),
 "aqua": ("Toyota", "Aqua", (2013, 2018), (7500, 10500), ["Hibrit"], "Otomatik", ["JP"]),
 "camry40": ("Toyota", "Camry", (2007, 2011), (8500, 11500), ["Benzin", "Gaz/Benzin"], "Otomatik", ["US", "JP"]),
 "prado120": ("Toyota", "Land Cruiser Prado", (2004, 2009), (15500, 21000), ["Benzin", "Dizel"], "Otomatik", ["JP"]),
 "4runner5": ("Toyota", "4Runner", (2014, 2019), (26000, 34000), ["Benzin"], "Otomatik", ["US"]),
 "wish2": ("Toyota", "Wish", (2010, 2016), (9500, 13000), ["Benzin"], "Otomatik", ["JP"]),
 "nx1": ("Lexus", "NX 200t", (2015, 2019), (26000, 33000), ["Benzin", "Hibrit"], "Otomatik", ["US", "JP"]),
 "is3": ("Lexus", "IS 250", (2014, 2018), (19000, 25000), ["Benzin"], "Otomatik", ["US"]),
 "ls4": ("Lexus", "LS 460", (2008, 2012), (14000, 19500), ["Benzin"], "Otomatik", ["US", "JP"]),
 "ml166": ("Mercedes-Benz", "ML 350", (2012, 2015), (22000, 29000), ["Benzin", "Dizel"], "Otomatik", ["DE", "US"]),
 "c205": ("Mercedes-Benz", "C 200", (2015, 2019), (21000, 28000), ["Benzin"], "Otomatik", ["DE"]),
 "s222": ("Mercedes-Benz", "S 500", (2014, 2017), (42000, 58000), ["Benzin"], "Otomatik", ["DE", "US"]),
 "sprinter2": ("Mercedes-Benz", "Sprinter", (2010, 2016), (16000, 24000), ["Dizel"], "Manuel", ["DE"]),
 "x5e70": ("BMW", "X5", (2008, 2012), (13500, 18500), ["Benzin", "Dizel"], "Otomatik", ["DE", "US"]),
 "f30": ("BMW", "320i", (2013, 2018), (15000, 21000), ["Benzin"], "Otomatik", ["DE", "US"]),
 "x3f25": ("BMW", "X3", (2012, 2016), (16500, 22000), ["Benzin", "Dizel"], "Otomatik", ["DE"]),
 "e60": ("BMW", "525i", (2005, 2009), (7500, 10500), ["Benzin"], "Otomatik", ["DE"]),
 "q7": ("Audi", "Q7", (2008, 2014), (13000, 19000), ["Benzin", "Dizel"], "Otomatik", ["DE"]),
 "a4b8": ("Audi", "A4", (2010, 2015), (11000, 15500), ["Benzin"], "Otomatik", ["DE"]),
 "golf7": ("Volkswagen", "Golf", (2013, 2018), (10500, 14500), ["Benzin", "Dizel"], "Otomatik", ["DE"]),
 "tiguan1": ("Volkswagen", "Tiguan", (2012, 2016), (13000, 17500), ["Benzin"], "Otomatik", ["DE"]),
 "touareg2": ("Volkswagen", "Touareg", (2011, 2016), (17000, 24000), ["Dizel", "Benzin"], "Otomatik", ["DE"]),
 "polo5sedan": ("Volkswagen", "Polo", (2013, 2019), (7500, 10500), ["Benzin"], "Manuel", ["RU"]),
 "accent4": ("Hyundai", "Accent", (2012, 2017), (7500, 10500), ["Benzin", "Gaz/Benzin"], "Otomatik", ["KR", "RU"]),
 "creta1": ("Hyundai", "Creta", (2017, 2021), (13500, 17500), ["Benzin"], "Otomatik", ["RU", "KR"]),
 "grandeur6": ("Hyundai", "Grandeur", (2017, 2021), (18500, 25000), ["Gaz/Benzin", "Benzin"], "Otomatik", ["KR"]),
 "starex2": ("Hyundai", "Grand Starex", (2013, 2019), (14000, 20000), ["Dizel"], "Otomatik", ["KR"]),
 "sonata7": ("Hyundai", "Sonata", (2015, 2019), (13000, 17500), ["Gaz/Benzin", "Benzin"], "Otomatik", ["KR"]),
 "sorento3": ("Kia", "Sorento", (2015, 2020), (19000, 26000), ["Dizel", "Benzin"], "Otomatik", ["KR"]),
 "carnival3": ("Kia", "Carnival", (2015, 2020), (18000, 25000), ["Dizel"], "Otomatik", ["KR"]),
 "optima4": ("Kia", "Optima", (2016, 2020), (13500, 18500), ["Gaz/Benzin", "Benzin"], "Otomatik", ["KR"]),
 "cerato3": ("Kia", "Cerato", (2014, 2018), (9500, 13500), ["Benzin"], "Otomatik", ["KR"]),
 "qashqai2": ("Nissan", "Qashqai", (2014, 2019), (13500, 18500), ["Benzin"], "Otomatik", ["RU", "DE"]),
 "teana2": ("Nissan", "Teana", (2009, 2013), (7500, 10500), ["Benzin"], "Otomatik", ["JP"]),
 "note2": ("Nissan", "Note", (2013, 2018), (6500, 9500), ["Benzin", "Hibrit"], "Otomatik", ["JP"]),
 "patrol6": ("Nissan", "Patrol", (2011, 2016), (24000, 33000), ["Benzin"], "Otomatik", ["US"]),
 "juke1": ("Nissan", "Juke", (2011, 2016), (8500, 11500), ["Benzin"], "Otomatik", ["JP", "DE"]),
 "mazda6_3": ("Mazda", "6", (2013, 2018), (12500, 17500), ["Benzin"], "Otomatik", ["JP", "US"]),
 "cx5_1": ("Mazda", "CX-5", (2013, 2017), (13500, 18000), ["Benzin"], "Otomatik", ["JP"]),
 "mazda3_3": ("Mazda", "3", (2014, 2018), (10500, 14000), ["Benzin"], "Otomatik", ["JP", "US"]),
 "outback5": ("Subaru", "Outback", (2015, 2019), (16500, 22000), ["Benzin"], "Otomatik", ["US", "JP"]),
 "impreza4": ("Subaru", "Impreza", (2012, 2016), (8500, 11500), ["Benzin"], "Otomatik", ["JP"]),
 "xv1": ("Subaru", "XV", (2012, 2017), (10500, 14000), ["Benzin"], "Otomatik", ["JP"]),
 "outlander3": ("Mitsubishi", "Outlander", (2013, 2019), (13000, 19000), ["Benzin"], "Otomatik", ["JP", "RU"]),
 "pajero4": ("Mitsubishi", "Pajero", (2008, 2015), (13500, 20000), ["Dizel", "Benzin"], "Otomatik", ["JP"]),
 "l200_5": ("Mitsubishi", "L200", (2015, 2019), (17000, 23000), ["Dizel"], "Manuel", ["RU"]),
 "granta": ("Lada", "Granta", (2013, 2021), (4500, 7500), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "niva": ("Lada", "Niva", (2010, 2021), (4500, 8500), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "priora": ("Lada", "Priora", (2010, 2017), (3500, 5500), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "largus": ("Lada", "Largus", (2013, 2021), (6500, 9500), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "matiz": ("Daewoo", "Matiz", (2008, 2015), (2300, 3800), ["Benzin", "Gaz/Benzin"], "Manuel", ["KR", "KG"]),
 "gentra": ("Daewoo", "Gentra", (2014, 2019), (5500, 8000), ["Benzin", "Gaz/Benzin"], "Manuel", ["KG"]),
 "cobalt2": ("Chevrolet", "Cobalt", (2014, 2021), (6500, 9500), ["Benzin", "Gaz/Benzin"], "Otomatik", ["KG", "RU"]),
 "cruze1": ("Chevrolet", "Cruze", (2011, 2015), (6500, 9000), ["Benzin"], "Otomatik", ["KR", "RU"]),
 "spark3": ("Chevrolet", "Spark", (2011, 2018), (4000, 6500), ["Benzin"], "Otomatik", ["KR", "KG"]),
 "octavia3": ("Skoda", "Octavia", (2014, 2019), (11000, 15500), ["Benzin"], "Otomatik", ["DE", "RU"]),
 "logan2": ("Renault", "Sandero Stepway", (2015, 2021), (7500, 11000), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "duster1": ("Renault", "Duster", (2012, 2019), (8500, 12500), ["Benzin", "Dizel"], "Manuel", ["RU"]),
 "focus3": ("Ford", "Focus", (2011, 2017), (7000, 10500), ["Benzin"], "Otomatik", ["DE", "RU"]),
 "cayenne2": ("Porsche", "Cayenne", (2011, 2016), (26000, 36000), ["Benzin", "Dizel"], "Otomatik", ["DE", "US"]),
 "rrsport2": ("Land Rover", "Range Rover Sport", (2014, 2018), (34000, 46000), ["Dizel", "Benzin"], "Otomatik", ["US", "DE"]),
 "disco4": ("Land Rover", "Discovery 4", (2010, 2016), (18000, 26000), ["Dizel"], "Otomatik", ["DE"]),
 "gc_wk2": ("Jeep", "Grand Cherokee", (2012, 2018), (17000, 25000), ["Benzin", "Dizel"], "Otomatik", ["US"]),
 "qx80": ("Infiniti", "QX80", (2014, 2019), (30000, 42000), ["Benzin"], "Otomatik", ["US"]),
 "fx35": ("Infiniti", "FX35", (2009, 2013), (11500, 16000), ["Benzin"], "Otomatik", ["US"]),
 "patriot": ("UAZ", "Patriot", (2014, 2021), (7500, 12500), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "gazelle": ("GAZ", "GAZelle Next", (2014, 2021), (9500, 15000), ["Dizel", "Gaz/Benzin"], "Manuel", ["RU"]),
 "tiggo7": ("Chery", "Tiggo 7 Pro", (2021, 2024), (15500, 21000), ["Benzin"], "Otomatik", ["CN"]),
 "jolion": ("Haval", "Jolion", (2021, 2024), (14500, 19500), ["Benzin"], "Otomatik", ["CN"]),
 "coolray": ("Geely", "Coolray", (2020, 2024), (12500, 17500), ["Benzin"], "Otomatik", ["CN"]),
 "bydsong": ("BYD", "Song Plus", (2022, 2024), (19000, 26000), ["Elektrik", "Hibrit"], "Otomatik", ["CN"]),
 "w210": ("Mercedes-Benz", "E 320", (1998, 2002), (3500, 6000), ["Benzin", "Gaz/Benzin"], "Otomatik", ["DE"]),
 "vaz2114": ("Lada", "2114", (2006, 2013), (1800, 3200), ["Benzin", "Gaz/Benzin"], "Manuel", ["RU"]),
 "priusalpha": ("Toyota", "Prius Alpha", (2012, 2017), (10500, 14500), ["Hibrit"], "Otomatik", ["JP"]),
 "ipsum2": ("Toyota", "Ipsum", (2002, 2007), (5500, 8000), ["Benzin", "Gaz/Benzin"], "Otomatik", ["JP"]),
}

cities = ["Bişkek"] * 11 + ["Oş"] * 5 + ["Karakol", "Celalabad", "Tokmok", "Narın", "Talas"]
names = ["Azamat", "Nurlan", "Bakıt", "Erlan", "Aibek", "Cıldız", "Timur", "Ulan", "Mirlan", "Aizada", "Bekzat", "Kanat",
         "Aidana", "Daniyar", "Ermek", "Nurbek", "Asel", "Talant", "Elmira", "Ruslan", "Kubat", "Meerim", "Almaz", "Bolot", "Gülnara", "Sanjar"]
PHONE = "+996502001903"
thumb = lambda u, w: re.sub(r"/\d+px-", f"/{w}px-", u)
ts = lambda s: json.dumps(s, ensure_ascii=False)

rnd = random.Random(2024)
today = set(rnd.sample(range(len(picks)), min(8, len(picks))))
lines = []
for i, pk in enumerate(picks):
    g = groups[pk["gid"]]
    photos = [g["items"][j] for j in pk.get("idx", range(len(g["items"])))]
    brand, model, (y0, y1), (p0, p1), fuels, tr, imports = M[g["model"]]
    year = rnd.randint(y0, y1)
    age = max(1, 2026 - year)
    km = round(rnd.randint(9000, 20000) * age, -3)
    price = round(rnd.randint(p0, p1), -2)
    hours = rnd.randint(1, 22) if i in today else rnd.randint(26, 40 * 24)
    views = rnd.randint(8, 120) if hours <= 24 else rnd.randint(40, 900)
    old = f"\n    oldPriceUsd: {price + (round(price * rnd.uniform(0.03, 0.09), -2) or 100)}," if rnd.random() < 0.15 else ""
    imgs = "\n".join(
        f"      {{ uri: {ts(thumb(p['thumb'], 1280))}, author: {ts(p['author'] or 'Wikimedia Commons')}, license: {ts(p['license'])}, source: {ts(p['page'])} }},"
        for p in photos)
    lines.append(f"""  {{
    id: 'd{i + 1}',
    brand: {ts(brand)},
    model: {ts(model)},
    year: {year},
    priceUsd: {price},{old}
    mileageKm: {km},
    fuel: {ts(rnd.choice(fuels))},
    transmission: {ts(tr)},
    city: {ts(rnd.choice(cities))},
    importedFrom: {ts(rnd.choice(imports))},
    accidentFree: {'true' if rnd.random() < 0.8 else 'false'},
    customsCleared: {'true' if rnd.random() < 0.9 else 'false'},
    owners: {rnd.choice([1, 1, 1, 2, 2, 3])},
    views: {views},
    likes: {max(1, int(views * rnd.uniform(0.04, 0.14)))},
    photos: [
{imgs}
    ],
    sellerName: {ts(rnd.choice(names))},
    sellerPhone: '{PHONE}',
    whatsappPhone: '{PHONE}',
    createdAt: hoursAgo({hours}),
  }},""")

header = """import { hoursAgo } from '../utils/time';
import type { Car } from '../types/car';

// Second batch of demo listings, generated from Wikimedia Commons like the
// first (each listing's photos show the same physical car; licenses require
// the credit shown on every photo). Specs, prices and sellers are invented;
// every phone number is the owner's test number.
export const mockCars2: Car[] = [
"""
open(sys.argv[3], "w").write(header + "\n".join(lines) + "\n];\n")
from collections import Counter
print("listings", len(picks)); print(Counter(M[groups[p['gid']]['model']][0] for p in picks))
