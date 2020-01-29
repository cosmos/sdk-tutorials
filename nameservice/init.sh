#!/usr/bin/env bash

rm -rf ~/.nsd
rm -rf ~/.nscli

nsd init test --chain-id=test

echo "12345678" | nscli keys add test1
echo "12345678" | nscli keys add test2

nsd add-genesis-account $(nscli keys show test1 -a) 10000000000000000000000000stake,1000000hello
nsd add-genesis-account $(nscli keys show test2 -a) 100000000000stake,1000hello

nscli config output json
nscli config indent true
nscli config trust-node true

echo "12345678" | nsd gentx --name test1

echo "Collecting genesis txs..."
nsd collect-gentxs

echo "Validating genesis file..."
nsd validate-genesis

nsd start 