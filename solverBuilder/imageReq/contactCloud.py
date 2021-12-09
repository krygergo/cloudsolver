from google.cloud import storage
import sys

if len(sys.argv)==2:
    client = storage.Client()
    bucket = client.get_bucket('cloudsolver-334113.appspot.com')
    blob = storage.Blob('solvers/'+sys.argv[1]+".tar.gz",bucket)
    with open(sys.argv[1]+".tar.gz","wb") as file_obj:
        client.download_blob_to_file(blob,file_obj)
else:
    raise Exception("only takes 1 argument.")