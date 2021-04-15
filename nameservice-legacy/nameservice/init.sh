#!/usr/bin/env bash

rm -rf ~/.nameserviced
rm -rf ~/.nameservicecli

nameserviced init test --chain-id=namechain

nameservicecli config output json
nameservicecli config indent true
nameservicecli config trust-node true
nameservicecli config chain-id namechain
nameservicecli config keyring-backend test

nameservicecli keys add user1
nameservicecli keys add user2

nameserviced add-genesis-account $(nameservicecli keys show user1 -a) 1000nametoken,100000000stake
nameserviced add-genesis-account $(nameservicecli keys show user2 -a) 1000nametoken,100000000stake

nameserviced gentx --name user1 --keyring-backend test

echo "Collecting genesis txs..."
nameserviced collect-gentxs

echo "Validating genesis file..."
nameserviced validate-genesis