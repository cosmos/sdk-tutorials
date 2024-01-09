#!/bin/bash

source ./vars.sh  &> /dev/null

if [ $# -eq 0 ]; then
    echo "Must provide a name to reserve"
    exit 1
fi

name="$1"
BINARY=./build/tutoriald

$BINARY tx ns reserve "bob.cosmos" $($BINARY keys show alice -a --home $HOME/cosmos/nodes/beacon --keyring-backend test) 1000uatom --from $($BINARY keys show barbara -a --home $HOME/cosmos/nodes/beacon --keyring-backend test)  --home $HOME/cosmos/nodes/beacon --node "tcp://127.0.0.1:29170" -y