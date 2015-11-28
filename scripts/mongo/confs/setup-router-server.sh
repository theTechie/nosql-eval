#!/bin/bash

echo "Setting up Rotuer Server (mongos --configdb <config server hostnames>)..."

sudo mkdir /data
sudo mkdir /data/configdb

sudo mongod --configsvr &

echo "Mongo Config Server Started !"