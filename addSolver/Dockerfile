FROM google/cloud-sdk:latest
COPY dm885-cloud-solver-e787ef682b18.json /
#RUN    StorageOptions storageOptions = StorageOptions.newBuilder().setProjectId("dm885-cloud-solver").setCredentials(GoogleCredentials.fromStream(new FileInputStream("dm885-cloud-solver-e787ef682b18.json"))).build();
#RUN    Storage storage = storageOptions.getService();COPY solverAdd ./
#RUN gcloud auth login bmbt95@gmail.com
#RUN gcloud auth activate-service-account get-service@dm885-cloud-solver.iam.gserviceaccount.com --key-file /dm885-cloud-solver-e787ef682b18.json
COPY ./solverAdd /
CMD ["echo" "Hello world","ls"]
ENTRYPOINT ["bash", "/solverAdd" ]