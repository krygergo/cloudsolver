FROM google/cloud-sdk:alpine as gcloud

WORKDIR /app
ARG KEY_FILE_CONTENT
#RUN echo $KEY_FILE_CONTENT | gcloud auth activate-service-account get-service@dm885-cloud-solver.iam.gserviceaccount.com --key-file=-
RUN echo $KEY_FILE_CONTENT | gcloud auth activate-service-account get-service@dm885-cloud-solver.iam.gserviceaccount.com --key-file=- \
  && gsutil cp -r gs://dm885-cloud-solver.appspot.com/Solvers ./

FROM minizinc/minizinc
COPY --from=gcloud /app/Solvers /usr/local/share/minizinc/solvers
COPY ./executer /
ENTRYPOINT [ "bash", "/executer" ]