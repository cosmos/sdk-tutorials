#!/bin/bash
find_project_root() {
    local dir=$PWD
    while [ "$dir" != "" ] && [ ! -d "$dir/.git" ]; do
        dir=$(dirname "$dir")
    done
    echo "$dir"
}

PROJECT_ROOT=$(find_project_root)
HOME=$HOME/.exampled
BINARY=$PROJECT_ROOT/tutorials/auction/base/build/exampled

echo $HOME
$BINARY tx reserve "bob.cosmos" $($BINARY keys show alice -a --home $HOME --keyring-backend test) 1000uatom --from $($BINARY keys show bob -a --home $HOME --keyring-backend test) --home $HOME -y
