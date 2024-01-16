#!/bin/bash

source ./vars.sh  &> /dev/null

if [ $# -eq 0 ]; then
    echo "Must provide an name to query"
    exit 1
fi

name="$1"

$BINARY q ns whois "${name}" --node "tcp://127.0.0.1:29170" -o json
