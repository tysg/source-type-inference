#!usr/bin/python3

from os import listdir
import re
from os.path import isfile, join

project_root = "./src/"
output_file = "source-1-type-inference.js"
main_file = "main.js"
files = [f for f in listdir(project_root) if isfile(join(project_root, f))]
js_files = list(filter(lambda name: re.search(".*\.js$", name), files))


with open(output_file, "w") as f:
    non_main = list(filter(lambda x: x != "main.js", js_files))
    for name in non_main:
        with open(project_root + name, "r") as n:
            f.write(n.read())
    with open(project_root + main_file, "r") as main:
        f.write(main.read())
