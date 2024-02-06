#!/bin/bash

source ./vars.sh  &> /dev/null

if [ $# -eq 0 ]; then
    echo "Must provide a name to reserve"
    exit 1
fi

find_project_root() {
    local dir=$PWD
    while [ "$dir" != "" ] && [ ! -d "$dir/.git" ]; do
        dir=$(dirname "$dir")
    done
    echo "$dir"
}

PROJECT_ROOT=$(find_project_root)
BINARY=$PROJECT_ROOT/tutorials/nameservice/base/build/exampled

name="$1"

$BINARY keys show alice -a --home $HOME/cosmos/nodes/beacon --keyring-backend test
$BINARY keys show barbara -a --home $HOME/cosmos/nodes/beacon --keyring-backend test

$BINARY tx reserve "${name}" $($BINARY keys show alice -a --home $HOME/cosmos/nodes/beacon --keyring-backend test) 1000uatom --from $($BINARY keys show barbara -a --home $HOME/cosmos/nodes/beacon --keyring-backend test) --home $HOME/cosmos/nodes/beacon --keyring-backend test --node "tcp://127.0.0.1:29170" -y 