# cloudsolver
dm885 group 3 default cloud solver project
The system is built with google Kubernetes engine to manage the deployment of the system.

The deployment exists of a frontend and a backend image. Which is build based on the frontend and backend directories. It can be deployed by running the dpk8s shell script which builds and apply the kubernetes yml files. The kubernetes yml files is inside the .github directory where the system specific kubernetes objects are specified. The solver directory is used to build two images that gives the input to a minizinc container and output back to the database.

To run the system

step 1: Create a GCP (google cloud platform) project - we recommend to use europe-west1 for all the API's

step 2: Enable following API's
 - Kubernetes engine
 - Artifact registry
 - Network services
 - Firestore
 - VPC network
 - Cloud storage

step 3: Create a kubernetes cluster

step 4: Create backend, frontend, solver and eu.gcr.io repositories. We recommend routing the eu.gcr.io repositories to a artifact repository. The naming convention should be that of the project ID.

step 5: Create a static external ipv4 address named cloudsolver-static-ip

step 6: Create a system account that has owner roles of the above API's and generate
        a key named google-api-key.json

step 7: Create a generic kubernetes secret named google-api-key for the google-api-key.json file
        and a generic kubernetes secret named express-cookie-secret for the secrets that encrypts the session cookie.

step 8: Setup a cloud dns with a domain, in our case we used the domain cloudsolver.xyz. The cloud dns
        must have two url one for the website pages, fx: .cloudsolver.xyz and CNAME: www.cloudsolver.xyz
        and another for the rest api fx: .api.cloudsolver.xyz.

step 9: build the frontend and backend images and send them to there corresponding artifact registries. The name of the build
        images must be the exact same path as the artifact registry when pushing. Then build the input and output images the same
        way.

step 10: Apply the deployments and service kubernetes objects specified in the .github/kubernetes folder. Before deploying remember
         to specify the environment variables in the deployment file, for the system to work properly.

step 11: Apply the managed certification object, which maps a certification to the specified urls and grants secure TLS communication
         over https.

step 12: Apply the ingress. The ingress maps the specified urls to a service. The ingress also has a frontend configuration that
         automatically redirects all http calls to https. There may be a problem when initializing the ingress and wether it can obtain
         TLS communication because the initial connection for the certificate must be on a http connection because the https connection
         do not exist yet. If the certificate is not active within 5 minutes. Delete the frontend config and the certificate will
         become active and then reapply the frontend config to only use https connections.
         
Step 13: For setting up the pipeline refer to the .github folder, and to set it up simply make a github repository.

step 14: To upload a solver POST to the endpoint /admin/solver and give as form data a .tar.gz file, which contains a folder with a docker file for the installation of the solver image, and a .txt file, which contains the flags for the solver. The files must have the same name. For example:
Endpoint: api.cloudsolver.xyz/admin/solver
Method: POST
solverfile: x.tar.gz
flagfile: x.txt

step 15: To start a job on the frontend https://cloudsolver.xyz/ simply select a mzn and dzn file, a solver or more and then you can run it.


