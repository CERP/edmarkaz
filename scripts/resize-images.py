import os
import json
from PIL import Image

size = (250, 250)
dirname = "ilmx-product-images"
outdir = "ilmx-thumbs"
files = os.listdir(dirname)

errors = []

file_set = set(files)

for fname in files:

	try:

		# print("resizing " + fname)

		splits = fname.split('.')

		if fname.endswith("tif"):
			os.rename(dirname + "/" + fname, dirname + "/" + ".".join(splits[0:-1]) + ".tiff")
			fname = fname + "f"

		save_name = ".".join(splits[0:-1]) + "_thumb.png"

		if save_name in file_set:
			continue

		im = Image.open(dirname + "/" + fname)
		im.thumbnail(size)

		im.convert("RGBA").save(outdir + "/" + save_name, optimize=True)

		# print("saved " + save_name)
	except Exception as e:
		print("error: " + fname)
		print(e)

		errors.append(fname)

with open('errors.json', "w") as f:
	json.dump(errors, f)