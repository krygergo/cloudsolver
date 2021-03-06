* create its own profile that can be access with a username and password (Complete)
* Create, read, update and delete a .mzn instance (Complete)
* Create, read, update and delete a .dzn instance (Complete)
* list the name of the solvers supported and their configuration options (e.g., free search, return all solutions, ...) (Partially Complete - does not list in GUI what the options are, but can be reached with endpoints.)
* trigger the execution of a solver giving the id of the mzn and dzn instances 
  (only mzn if dzn is not needed), selecting the solver to use and its options,
  the timeout, maximal amount of memory that can be used, vCPUs to use (Complete)
* trigger the execution in parallel of more solvers terminating the other solvers 
  when the quickest solver terminates (Complete)
* monitor the termination state of the solver execution (Complete)
* given a computaton request, retrieve its result if terminated, what solver 
  manage to solve it first and the time it took to solve it (Complete)
* cancel the execution of a computation request (terminate the solver if 
  running, delete the result otherwise) (Complete)
* bulk execution of various instances to be solved with a set of solvers in 
  parallel (Complete)
* GUI support (optional for group with less than 6 people) (Partially Complete - Admin related work largly done on google cloud and end points.)

* monitor and log the platform using a dashboard (Complete - done via the google framework)
* kill all solver executions started by a user (Complete)
* set resources quota to users (e.g., no more than 6 vCPUs in total) (Complete)
* delete a user and all its material(Complete - works via end points - no GUI support.)
* deploy the system and add new computing nodes in an easy way (Complete - done via google)
* add or remove a solver. It is possible to assume that the solver to add satisfy the submission rules of the MiniZinc challenge (note also that you have to handle
  the case when a users asks to use a removed solver) (Complete)
  
 * Use continuous integration and deployment (Complete)
* Infrastructure as a Code with an automatic DevOps pipeline (Complete)
* scalable, supporting multiple users exploiting if needed more resources in the (Partially Complete - done via input rather than the -p parameter)
  cloud (note: vcpus allocated to a run depending on the parameter "-p")
* have tests to test the system (unit test, integration, ...) (Complete)
* security (proper credential management and common standard security practices 
  enforced) (Complete)
* provide user stories to explain how the system is intended to be use (Complete)
* provide minimal documentation to deploy and run the system (Complete)
* fairness: if the resources do not allow to run all the solvers at the same time (Complete - Users jobs are qeued if they exceed resource limits)
  the jobs should be delayed and executed fairly (e.g. FIFO).
  User should therefore not wait  indefinitely to run their jobs (optional).
