#!/bin/bash

# Created on Nov 25, 2015
# Author : Gagan M Gowda (theTechie)

echo "Fetching Cluster IPs from AWS..."

# Get IPs of all instances using AWS CLI
#  - filter instances based on ami-id (to identify a zht+ cluster)
#  - filter instances using instance-state-code (for Running instances)
#  - copy zht+ binary and configs using pSSH
#  - start zht+ server on all cluster nodes using pSSH

AMI_ID="ami-a17765c0"		# AMI used for cluster node
INSTANCE_STATE_CODE="16"	# 0 (pending), 16 (running), 32 (shutting-down), 48 (terminated), 64 (stopping), 80 (stopped)
PRIVATE_KEY="$HOME/CS550.pem"		# ssh private-key file
HOST_FILE_LOCATION="confs/*"	# location of the files to be copied to remote node
REMOTE_FILE_LOCATION="$HOME/nosql-eval"	# target location on remote node
ZHT_SERVER_PORT=50000		# port on which ZHT Server will run
TAG="cs550-cluster-node" # tag assigned to cluster nodes

GET_IP="aws ec2 describe-instances --query "Reservations[*].Instances[*].PrivateIpAddress" --filter Name=instance-state-code,Values=$INSTANCE_STATE_CODE Name=image-id,Values=$AMI_ID Name=tag-value,Values=$TAG --output=text"

IP_LIST=$($GET_IP)

#(for i in $IP_LIST; do
#	echo $i $ZHT_SERVER_PORT
#done) | tee confs/neighbor.conf

#echo "neighbor.conf generated !"

# Config server
echo "Setting-up Config Server : " ${IP_LIST[0]}

parallel-ssh -H ${IP_LIST[0]} -x "-oStrictHostKeyChecking=no -i $PRIVATE_KEY" -i -o output -e error "./nosql-eval/scripts/mongo/setup-config-server.sh"

CONFIG_SERVER = 0;
ROUTER_SERVER = 0;

if [${#IP_LIST[@]} == 1]
then
		CONFIG_SERVER = ${IP_LIST[0]};
		ROUTER_SERVER = ${IP_LIST[0]};
fi

if [${#IP_LIST[@]} == 2]
then
		CONFIG_SERVER = ${IP_LIST[0]};
		ROUTER_SERVER = ${IP_LIST[1]};
fi
		
# Router Server
echo "Setting-up Router Server on : " ${IP_LIST[1]} " with ${IP_LIST[0]}:27019 as configdb"

parallel-ssh -H ${IP_LIST[1]} -x "-oStrictHostKeyChecking=no -i $PRIVATE_KEY" -i -o output -e error "mongos --configdb ${IP_LIST[0]}:27019"

# Shards
for (( i=0; i <= ${#IP_LIST[@]}; i++ ))
do
    echo ${IP_LIST[$i]}
done

# Start ZHT server at remote node
#for i in $IP_LIST; do
#	echo "connect to $i and start zhtserver"
#        parallel-ssh -H $i -x "-oStrictHostKeyChecking=no -i $PRIVATE_KEY" "nohup ./nosql-eval/start-server.sh > server-log.out 2> server-log.err < /dev/null &"
#done

## Start Evaluation; output output in console and also store in  'output' folder with hostnames
#for i in $IP_LIST; do
#	echo "connect to $i and start zht evaluation"
#        parallel-ssh -H $i -x "-oStrictHostKeyChecking=no -i $PRIVATE_KEY" -i -o output -e error "./nosql-eval/start-eval.sh"
#done