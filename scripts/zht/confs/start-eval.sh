#!/bin/bash

echo "Starting ZHT Evaluation.."

export LD_LIBRARY_PATH=/usr/local/lib/

./zht_ben -z zht.conf -n neighbor.conf -o 100000

echo "ZHT Evaluation Started !"