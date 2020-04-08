#!/usr/bin/env bash

rm -rf ~/.nsd
rm -rf ~/.nscli

nsd init test --chain-id=namechain

nscli config output json
nscli config indent true
nscli config trust-node true
nscli config chain-id namechain
nscli config keyring-backend test

nscli keys add jack
nscli keys add alice

nsd add-genesis-account $(nscli keys show jack -a) 1000nametoken,100000000stake
nsd add-genesis-account $(nscli keys show alice -a) 1000nametoken,100000000stake

nsd gentx --name jack --keyring-backend test

echo "Collecting genesis txs..."
nsd collect-gentxs

echo "Validating genesis file..."
nsd validate-genesis