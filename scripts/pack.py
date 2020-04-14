#!usr/bin/python3

from os import listdir
import re
from os.path import isfile, join

project_root = "./"
output_file = "build/type_inferred_source"
main_file = "main.js"
files = [f for f in listdir(project_root) if isfile(join(project_root, f))]
js_files = list(filter(lambda name: re.search(".*\.js", name), files))


with open(output_file, "w") as f:
    non_main = list(filter(lambda x: x != "main.js", js_files))
    for name in non_main:
        with open(name, "r") as n:
            f.write(n.read())
    with open(main_file, "r") as main:
        f.write(main.read())
