#!/usr/bin/env bash

rm -rf ~/.hellod

hcd init test --chain-id=test

echo "12345678" | hccli keys add test1
echo "12345678" | hccli keys add test2

hcd add-genesis-account $(hccli keys show test1 -a) 10000000000000000000000000stake,1000000hello
hcd add-genesis-account $(hccli keys show test2 -a) 100000000000stake,1000hello

hccli config output json
hccli config indent true
hccli config chain-id test
hccli config trust-node true