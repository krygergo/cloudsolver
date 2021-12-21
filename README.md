# cloudsolver
dm885 group 3 default cloud solver project
The system is built with Kubernetes to manage the services containers and the deployment of the system.
To deploy the system simply use kubernetes to deploy the backend with /dpk8s. After the backend has deployed, you must wait for it to certify for your key, in which it is also understoo that you will have to make a




The frontend can be accessed on cloudsolver.xyz after the backend is deployed from where the user can upload your mzn and dzn files.
Then the user can choose to run a job with any set of solvers supported by site, with a txt file of flags you wish to execute along with it.
If user choose multiple solvers to run on the same dzn and mzn files it will execute as a batch, returning only with the fastest result.
If the user does not specifcy how much memory or vCPU's they wish to use it will by default choose all of their avaiable resources.
If a user does not have enough resources it will queue their jobs.


The admin can delete a user and all their jobs from the GUI, as well as signle jobs, aswell as add additional solvers. But the rest of the framework is handled by the framework on Google Cloud.