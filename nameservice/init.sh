#!/usr/bin/env bash

rm -rf ~/.nsd
rm -rf ~/.nscli

nsd init test --chain-id=namechain

nscli keys add test1
nscli keys add test2

nsd add-genesis-account $(nscli keys show test1 -a) 10000000000000000000000000stake,1000000nametoken
nsd add-genesis-account $(nscli keys show test2 -a) 100000000000stake,1000nametoken

nscli config output json
nscli config indent true
nscli config trust-node true
nscli config chain-id namechain

nsd gentx --name test1

echo "Collecting genesis txs..."
nsd collect-gentxs

echo "Validating genesis file..."
nsd validate-genesis