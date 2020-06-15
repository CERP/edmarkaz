import json
import csv
import requests
from urllib.parse import urlparse, parse_qs

with open('urdu_portal_sabaq.csv') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    lines = [l for l in reader]

api_resp = requests.get(
    'http://studio.muselessons.com/api/VideosApi/GetAllForCerp').json()


prefix = 'https://musebysabaq.s3.ap-south-1.amazonaws.com/'
mapped = []
not_found_in_api = []
for v in lines:
    parsed_link = urlparse(v['Link'])
    q = parse_qs(parsed_link.query)

    if 'id' not in q:
        # print(v)
        # these seem to all be 'readalouds' and there are 3 of them
        continue

    v_id = int(q['id'][0])
    v_obj = [x for x in api_resp if x['Id'] == v_id]
    if len(v_obj) == 0:
        not_found_in_api.append({**v, 'id': v_id})
        continue

    mapped_link = prefix + v_obj[0]['UrduPath'][1:]
    if v['Medium'] == 'English':
        mapped_link = prefix + v_obj[0]['EnglishPath'][1:]

    mapped.append({**v, 'Link': mapped_link, 'sabaq_id': v_id})

with open('mapped_urdu_portal.csv', 'w') as f:
    writer = csv.DictWriter(f, [*fieldnames, 'sabaq_id'])
    writer.writeheader()
    writer.writerows(mapped)
