import json
import csv
import requests
import psycopg2 as pg
from urllib.parse import urlparse, parse_qs

with open('/home/ali/dev/cerp/edmarkaz/scripts/sabaq_june28_formatted.csv') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    lines = [l for l in reader]

api_resp = requests.get(
    'http://studio.muselessons.com/api/VideosApi/GetAllForCerp').json()

excercises_resp = requests.get(
    "http://api.muselessons.com/api/Content/GetAllExercises").json()

questions_resp = requests.get(
    "http://api.muselessons.com/api/Content/GetAllExerciseQuestions").json()

answers_resp = requests.get(
    "http://api.muselessons.com/api/Content/GetAllExerciseAnswers").json()


conn = pg.connect(dbname="postgres", user="postgres",
                  host="localhost", password="postgres")
cur = conn.cursor()


def addPrefix(val):
    pre = 'https://musebysabaq.s3.ap-south-1.amazonaws.com'
    if val == None:
        return ""
    else:
        return pre + val


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

    rel = v_obj[0]
    mapped_link = prefix + rel['UrduPath'][1:]
    if v['Medium'] == 'English':
        mapped_link = prefix + rel['EnglishPath'][1:]

    mapped.append({
        **v,
        'Link': mapped_link,
        'sabaq_id': v_id,
        'topic_id': rel['TopicId'],
        'subtopic_id': rel['SubTopicId']
    })

# with open('lol.csv', 'w') as f:
#     writer = csv.DictWriter(
#         f, [*fieldnames, 'sabaq_id', 'topic_id', 'subtopic_id'])
#     writer.writeheader()
#     writer.writerows(mapped)

# ======================================================================
print("Preparing Dictionares")
ex_dict = {}

for ex in excercises_resp:
    if ex["TopicId"] in ex_dict:
        if ex["SubTopicId"] in ex_dict[ex["TopicId"]]:
            if ex["Id"] in ex_dict[ex["TopicId"]][ex["SubTopicId"]]:
                print("Found dupes in exc")
                continue
            else:
                ex_dict[ex["TopicId"]][ex["SubTopicId"]] = {
                    **ex_dict[ex["TopicId"]][ex["SubTopicId"]],
                    ex["Id"]: ex
                }
        else:
            ex_dict[ex["TopicId"]] = {
                **ex_dict[ex["TopicId"]],
                ex["SubTopicId"]: {
                    ex["Id"]: ex
                }
            }
    else:
        ex_dict[ex["TopicId"]] = {
            ex["SubTopicId"]: {
                ex["Id"]: ex
            }
        }

qs_dict = {}

for qs in questions_resp:
    if qs["ExerciseId"] in qs_dict:
        if qs["Id"] in qs_dict[qs["ExerciseId"]]:
            print("Found dupes in qs")
            continue
        else:
            qs_dict[qs["ExerciseId"]] = {
                **qs_dict[qs["ExerciseId"]],
                qs["Id"]: qs
            }
    else:
        qs_dict[qs["ExerciseId"]] = {
            qs["Id"]: qs
        }
# you could directly ingest into postgres

ans_dict = {}

for ans in answers_resp:
    if ans["ExerciseQuestionId"] in ans_dict:
        if ans["Id"] in ans_dict[ans["ExerciseQuestionId"]]:
            print("Found dupes in ans")
            continue
        else:
            ans_dict[ans["ExerciseQuestionId"]] = {
                **ans_dict[ans["ExerciseQuestionId"]],
                ans["Id"]: ans
            }
    else:
        ans_dict[ans["ExerciseQuestionId"]] = {
            ans["Id"]: ans
        }

print("Dictionary Prep Complete")

for val in mapped:
    topic_id = val["topic_id"]
    subtopic_id = val["subtopic_id"]

    if topic_id in ex_dict:
        # Here is the problem shouldn't loop over all of thhe subtopics. Just check if it's in the dict
        if subtopic_id in ex_dict[topic_id]:
            # EXERCISES HAVE ALL THE EXERCISES FOR THIS TOPIC
            excercises = ex_dict[topic_id][subtopic_id]
            ex_with_qs_ans = {}
            for k in excercises:
                if k in qs_dict:
                    curr_ex = excercises[k]
                    qs_for_ex = {}
                    for q_id in qs_dict[k]:
                        curr_qs = qs_dict[k][q_id]
                        # Getting all the options for curr_qs
                        ans_for_qs = {}
                        if q_id in ans_dict:
                            for ans_id in ans_dict[q_id]:
                                ans_for_qs[ans_id] = {
                                    "answer": ans_dict[q_id][ans_id]["Answer"],
                                    "correct_answer": ans_dict[q_id][ans_id]["CorrectAnswer"],
                                    "urdu_answer": ans_dict[q_id][ans_id]["UrduAnswer"],
                                    "image": addPrefix(ans_dict[q_id][ans_id]["ImagePath"]),
                                    "audio": addPrefix(ans_dict[q_id][ans_id]["AudioPath"]),
                                    "id": ans_dict[q_id][ans_id]["Id"],
                                    "active": ans_dict[q_id][ans_id]["Active"]
                                }
                        else:
                            print(f"QS not found in ans dict id:{q_id}")
                        qs_for_ex[q_id] = {
                            "order": curr_qs["Order"],
                            "id": curr_qs["Id"],
                            "title": curr_qs["Question"],
                            "title_urdu": curr_qs["UrduQuestion"],
                            "response_limit": curr_qs["ResponseLimit"],
                            "multi_response": curr_qs["IsMultipleResponseAllowed"],
                            "active": curr_qs["Active"],
                            "image": addPrefix(curr_qs["ImagePath"]),
                            "urdu_image": addPrefix(curr_qs["UrduImagePath"]),
                            "audio": addPrefix(curr_qs["AudioPath"]),
                            "answers": ans_for_qs
                        }
                        ex_with_qs_ans[k] = {
                            "type": curr_ex["ExerciseTypeId"],
                            "id": curr_ex["Id"],
                            "subject": val["Subject"],
                            "grade": val["Grade"],
                            "chapter_id": val["Unit No"],
                            "lesson_id": val["Video No"],
                            "title": curr_ex["ExerciseTitle"],
                            "title_urdu": curr_ex["UrduTitle"],
                            "description": curr_ex["Description"],
                            "order": curr_ex["Order"],
                            "time": curr_ex["Timer"],
                            "total_marks": curr_ex["TotalMarks"],
                            "active": curr_ex["Active"],
                            "questions": qs_for_ex,
                            "source": "Sabaq Muse"
                        }
                else:
                    print(f"No question Found for {k}")

            print("==========================================\n")
            # HERE I CAN INGEST IN DB EACH TOPICS ASSESSMENTS ---HOPEFULLY :D
            for l in ex_with_qs_ans:
                ques = ex_with_qs_ans[l].pop("questions")
                meta = ex_with_qs_ans[l]
                id = f'{val["Medium"]}-{val["Grade"]}-{val["Subject"]}-{val["Unit No"]}-{val["Video No"]}-{ex_with_qs_ans[l]["order"]}'
                cur.execute(
                    """INSERT INTO assessments (id, medium, class, subject, chapter_id, lesson_id, meta, questions)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO UPDATE SET meta=excluded.meta, questions=excluded.questions;""", (id, val["Medium"], val["Grade"], val["Subject"], val["Unit No"], val["Video No"], json.dumps(meta), json.dumps(ques)))
                conn.commit()
                print("DONE")

        else:
            print(f"Didnt found sub-topic in exercises", subtopic_id)
    else:
        print("Didnt found topic in exercises")

cur.close()
conn.close()
