#!/bin/bash

# Created on Nov 25, 2015
# Author : Gagan M Gowda (theTechie)

echo "Fetching Cluster IPs from AWS..."

# Get IPs of all instances using AWS CLI
#  - filter instances based on ami-id (to identify a zht+ cluster)
#  - filter instances using instance-state-code (for Running instances)
#  - copy zht+ binary and configs using pSSH
#  - start zht+ server on all cluster nodes using pSSH

AMI_ID="ami-xxxxxxx"		# AMI used for cluster node
INSTANCE_STATE_CODE="16"	# 0 (pending), 16 (running), 32 (shutting-down), 48 (terminated), 64 (stopping), 80 (stopped)
PRIVATE_KEY="CS550.pem"		# ssh private-key file
HOST_FILE_LOCATION="bin/*"	# location of the files to be copied to remote node
REMOTE_FILE_LOCATION="$HOME"	# target location on remote node
ZHT_SERVER_PORT=50000		# port on which ZHT Server will run

GET_IP="aws ec2 describe-instances --query "Reservations[*].Instances[*].PrivateIpAddress" --filter Name=instance-state-code,Values=$INSTANCE_STATE_CODE Name=image-id,Values=$AMI_ID  --output=text"

IP_LIST=($($GET_IP))

(for i in $IP_LIST; do
	echo $i $ZHT_SERVER_PORT
done) | tee confs/neighbor.conf

(for i in $IP_LIST; do
	echo $i
done) | tee confs/hosts.txt

echo "neighbor.conf generated !"

# Copy configs to remote node $HOME
echo "connect to peers and copy zht binary and configs"
parallel-scp -h hosts.txt -x "-oStrictHostKeyChecking=no -i $PRIVATE_KEY" $HOST_FILE_LOCATION $REMOTE_FILE_LOCATION

# Start server at remote node
echo "connect to peers and start zhtserver"
parallel-ssh -h hosts.txt -x "-oStrictHostKeyChecking=no -i $PRIVATE_KEY" "nohup ./start-server.sh > log.out 2> log.err < /dev/null &"
