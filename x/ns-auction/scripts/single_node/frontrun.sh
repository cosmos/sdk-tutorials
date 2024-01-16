#!/bin/bash

find_project_root() {
    local dir=$PWD
    while [ "$dir" != "" ] && [ ! -d "$dir/.git" ]; do
        dir=$(dirname "$dir")
    done
    echo "$dir"
}

PROJECT_ROOT=$(find_project_root)
HOME=$HOME/.tutoriald
BINARY=$PROJECT_ROOT/build/tutoriald

$BINARY keys list --home $HOME

$BINARY keys show alice -a --home $HOME

$BINARY tx reserve "bob.cosmos" $($BINARY keys show alice -a --home $HOME) 1000uatom --from $($BINARY keys show bob -a --home $HOME)  --home $HOME -y
