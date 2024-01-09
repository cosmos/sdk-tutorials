#!/bin/bash

source ./vars.sh  &> /dev/null

$BINARY q  consensus comet node-info --node "tcp://127.0.0.1:29170" -o json | jq '.default_node_info'