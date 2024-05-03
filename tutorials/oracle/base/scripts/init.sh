#!/usr/bin/env bash

rm -r ~/.exampled || true
exampled_BIN=$(which exampled)
# configure exampled
$exampled_BIN config set client chain-id demo
$exampled_BIN config set client keyring-backend test
$exampled_BIN keys add alice
$exampled_BIN keys add bob
$exampled_BIN init test --chain-id demo --default-denom example
# update genesis
$exampled_BIN genesis add-genesis-account alice 10000000example --keyring-backend test
$exampled_BIN genesis add-genesis-account bob 1000example --keyring-backend test
# create default validator
$exampled_BIN genesis gentx alice 1000000example --chain-id demo
sed -i.bak'' 's/minimum-gas-prices = ""/minimum-gas-prices = "0.025uatom"/' $HOME/.exampled/config/app.toml
jq '.consensus.params.abci.vote_extensions_enable_height = "1"' ~/.exampled/config/genesis.json > output.json && mv output.json ~/.exampled/config/genesis.json
$exampled_BIN genesis collect-gentxs
