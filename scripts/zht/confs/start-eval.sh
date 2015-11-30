#!/bin/bash

echo "Starting ZHT Evaluation.."

export LD_LIBRARY_PATH=/usr/local/lib/

cd zht-eval

./zht_ben -z zht.conf -n neighbor.conf -o $1

echo "ZHT Evaluation Started !"