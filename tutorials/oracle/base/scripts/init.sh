#!/usr/bin/env bash

rm -r ~/.tutoriald || true
tutorialD_BIN=$(which tutoriald)
# configure tutoriald
$tutorialD_BIN config set client chain-id demo
$tutorialD_BIN config set client keyring-backend test
$tutorialD_BIN keys add alice
$tutorialD_BIN keys add bob
$tutorialD_BIN init test --chain-id demo --default-denom tutorial
# update genesis
$tutorialD_BIN genesis add-genesis-account alice 10000000tutorial --keyring-backend test
$tutorialD_BIN genesis add-genesis-account bob 1000tutorial --keyring-backend test
# create default validator
$tutorialD_BIN genesis gentx alice 1000000tutorial --chain-id demo
sed -i.bak'' 's/minimum-gas-prices = ""/minimum-gas-prices = "0.025uatom"/' $HOME/.tutoriald/config/app.toml
$tutorialD_BIN genesis collect-gentxs
