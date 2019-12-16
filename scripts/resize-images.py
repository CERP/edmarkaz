import os
import json
from PIL import Image

size = (250, 250)
dirname = "ilmx-product-images"
files = os.listdir(dirname)

errors = []

file_set = set(files)

for fname in files:

	try:
		print("resizing " + fname)

		splits = fname.split('.')

		save_name = ".".join(splits[0:-1]) + "_thumb.png"

		if save_name in file_set:
			continue

		im = Image.open(dirname + "/" + fname)
		im.thumbnail(size)

		im.save(dirname + "/" + save_name)

		print("saved " + save_name)
	except:
		print("error: " + fname)
		errors.append(fname)

with open('errors.json', "w") as f:
	json.dump(errors, f)