file = "src/test.js"

with open(file, "r") as f:
    lines = f.readlines()


tests = []
tests.append([])
for l in lines:
    if l == "\n":
        tests.append([])
    else:
        tests[-1].append(l)

for i in range(len(tests)):
    with open("__tests__/source-1-type-inference.test-{}.js".format(i), "w") as w:
        w.writelines(tests[i])
