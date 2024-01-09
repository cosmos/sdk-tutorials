#!/bin/bash

make build
binary=./build/tutoriald
home=$HOME/.tutoriald
rm -rf ~/.tutoriald
$binary init liveness --chain-id cosmos-1 --default-denom uatom --home $home
$binary config set client chain-id cosmos-1 --home $home
$binary config set client keyring-backend test --home $home
$binary keys add val1 --home $home
$binary keys add alice --home $home
$binary keys add bob --home $home
$binary genesis add-genesis-account val1 10000000000000000000000000uatom --home $home
$binary genesis add-genesis-account alice 1000000000000000000uatom --home $home
$binary genesis add-genesis-account bob 1000000000000000000uatom  --home $home
$binary genesis gentx val1 1000000000uatom --chain-id cosmos-1 --home $home
$binary genesis collect-gentxs --home $home
sed -i.bak'' 's/minimum-gas-prices = ""/minimum-gas-prices = "0.025uatom"/' $home/config/app.toml
$binary start --val-key val1 --run-provider true