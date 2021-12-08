import sys

# read the template file
file = open("podTemplate.yaml", "r")
content = file.read()

# insert the solvername
solverName = sys.argv[1]
content = content.replace("DUMMY", solverName)

# write to new YAML file
newYAML = open("pod.yaml", "w")
newYAML.write(content)