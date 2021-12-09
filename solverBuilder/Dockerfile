FROM python:alpine3.15
COPY /imageReq ./
RUN pip3 install google-cloud-storage
ENTRYPOINT [ "sh","/builder.sh" ]