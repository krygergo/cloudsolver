#!/bin/sh
SOLVERNAME=${1?Error: assign a SOLVERNAME}
TAG=${2}
if [ -z "$SOLVERNAME" ]; then
	echo "Name required for solver"
	exit 1
fi
if [ -z "$TAG" ];  
then
	#echo $DOCKERFILE $SOLVERNAME 
	python3 createYAML.py $SOLVERNAME
	#tar -C context -zcf $SOLVERNAME.tar.gz .
else
	#echo $DOCKERFILE $SOLVERNAME $TAG
	python3 createYAML.py $SOLVERNAME $TAG
	#tar -C context -zcf $SOLVERNAME$TAG.tar.gz .
fi
kubectl create -f pod.yaml