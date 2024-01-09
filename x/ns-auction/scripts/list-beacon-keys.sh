#!/bin/bash

source ./vars.sh  &> /dev/null

$BINARY keys list --home $HOME/cosmos/nodes/beacon --keyring-backend test --output json | jq