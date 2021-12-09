import sys

if len(sys.argv) != 2 and len(sys.argv) != 3:
    raise Exception("Positional arguments must be: image name, tag (optional)")

# read the template file
with open("podTemplate.yaml", "r") as template:
    content = template.read()
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
    with open("pod.yaml", "w") as newYAML:
        newYAML.seek(0)
        newYAML.write(content)