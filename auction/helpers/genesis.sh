#!/usr/bin/env bash

rm -rf ~/.auctionapp
aud init a --chain-id testchain
echo "12345678" | aucli keys add test1
echo "12345678" | aucli keys add test2

aud add-genesis-account $(aucli keys show test1 -a) 10000000000000000000000000stake,1000000legends
aucli config output json
aucli config indent true
aucli config trust-node true

echo "12345678" | aud gentx --name test1

echo "Collecting genesis txs..."
aud collect-gentxs

echo "Validating genesis file..."
aud validate-genesis

aud start