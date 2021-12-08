import sys

if len(sys.argv) != 2 and len(sys.argv) != 3:
    raise Exception("Positional arguments must be: image name, tag (optional)")

# read the template file
file = open("podTemplate.yaml", "r")
content = file.read()

# insert the image name
imageName = sys.argv[1]
content = content.replace("IMAGE", imageName)

# insert the tag if one is provided 
tag = "latest"
try:
    tag = sys.argv[2]
except:
    pass
    
content = content.replace("TAG", tag)

# write to new YAML file
newYAML = open("pod.yaml", "w")
newYAML.seek(0)
newYAML.write(content)