import csv

with open('sabaq_june28_unformatted_eng.csv') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    lines = [l for l in reader]

with open('mapped_sabaq_links_eng.csv') as f_two:
    reader_two = csv.DictReader(f_two)
    fieldnames_two = reader_two.fieldnames
    lines_two = [l for l in reader_two]


mapped = []

for v in lines:
    for v_two in lines_two:
        if v["Link"] == v_two["Link"]:
            print("match Found")
            mapped.append({
                **v,
                "sabaq_id": v_two['s_id'],
                "topic_id": v_two['topic_id'],
                "subtopic_id": v_two['subtopic_id']
            })

with open('lol_eng.csv', 'w') as f:
    writer = csv.DictWriter(
        f, [*fieldnames, 'sabaq_id', 'topic_id', 'subtopic_id'])
    writer.writeheader()
    writer.writerows(mapped)
