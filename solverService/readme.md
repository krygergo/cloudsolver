kinda depricated already, given we've changed server.
but it needs a key to the cloud storage as argument.
Then it can pull solvers to the image.
The image takes an argument which is the solver when it is run.
Build the image.
docker build --build-arg KEY_FILE_CONTENT="$(cat dm885-cloud-solver-e787ef682b18.json)"  -t devtest .
interactive image.
docker run -it -t devtest /bin/bash
example on how to mount a volume if dev test. it needs an abselute path to the dzn and mzn files.
docker run -it -v /home/"user"/Desktop/solverApp/values:/values -t tester ortools