#!/bin/bash

echo "Setting up Config Server (mongod --configsrv)..."

sudo mkdir /data
sudo mkdir /data/configdb

sudo mongod --configsvr &

echo "Mongo Config Server Started !"