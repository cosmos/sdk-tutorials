#!/bin/bash

binary=./build/tutoriald
home=$HOME/.tutoriald

./build/tutoriald tx ns reserve "bob.cosmos" $(./build/tutoriald keys show alice -a --home $home --keyring-backend test) 1000uatom --from $($binary keys show bob -a --home $home --keyring-backend test)  --home $home -y