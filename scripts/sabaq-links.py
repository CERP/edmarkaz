import requests
import csv
import json

with open('sabaq_ids.csv') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    lines = [l for l in reader]

api_resp = requests.get(
    "http://studio.muselessons.com/api/VideosApi/GetAllForCerp").json()

prefix = 'https://musebysabaq.s3.ap-south-1.amazonaws.com'

mapped = []

for v in lines:
    for x in api_resp:
        # print("===============\n")
        # print(f"Looking for:", type(v['s_id']))
        # print(f"Id: {x['Id']}")
        if x["Id"] == int(v["s_id"]):
            # print("Match Found in Id", v['s_id'])

            # print("Topic", x['Topic']['TopicName'])
            # print('Video-Title', x['Title'])
            # print("URL", x['UrduPath'])
            # print('Grade', x['GradeId'])
            # print("Subject", x['SubjectId'])
            print("ID", x['Id'])

            path = x['UrduPath'] if x['UrduPath'] is not None else x['Path']
            print('Path', path)
            mapped.append({
                **v,
                'Grade': x['GradeId'],
                'Subject': x['SubjectId'],
                'Topic': x['Topic']['TopicName'],
                'Title': x['Title'],
                'Link': prefix + path,
                'topic_id': x['TopicId'],
                'subtopic_id': x['SubTopicId']
            })

            for l in x["Topic"]["Videos"]:
                # print('Video-Title', l['Title'])
                # print('Grade', l['GradeId'])
                # print("Subject", l['SubjectId'])
                # print('URL IN LOOP:', l['UrduPath'])
                path_two = l['UrduPath'] if l['UrduPath'] is not None else l['Path']
                mapped.append({
                    **v,
                    'Grade': l['GradeId'],
                    'Subject': l['SubjectId'],
                    'Topic': x['Topic']['TopicName'],
                    'Title': l['Title'],
                    'Link': prefix + path_two,
                    'topic_id': l['TopicId'],
                    'subtopic_id': l['SubTopicId']
                })

with open('mapped_sabaq_links_two.csv', 'w') as f:
    writer = csv.DictWriter(
        f, [*fieldnames, 'Grade', 'Subject', 'Topic', 'Title', 'Link', 'topic_id', 'subtopic_id'])
    writer.writeheader()
    writer.writerows(mapped)
