#!/bin/bash

echo "Starting ZHT Server.."

export LD_LIBRARY_PATH=/usr/local/lib/

cd zht-eval

./zhtserver -z zht.conf -n neighbor.conf

echo "ZHT Server Started !"