#!/bin/bash
find_project_root() {
    local dir=$PWD
    while [ "$dir" != "" ] && [ ! -d "$dir/.git" ]; do
        dir=$(dirname "$dir")
    done
    echo "$dir"
}

PROJECT_ROOT=$(find_project_root)
export HOME=$HOME/.tutoriald
export BINARY=$PROJECT_ROOT/build/tutoriald

rm -rf ~/.tutoriald

make build

$BINARY init liveness --chain-id cosmos-1 --default-denom uatom --home $HOME
$BINARY config set client chain-id cosmos-1 --home $HOME
$BINARY config set client keyring-backend test --home $HOME
$BINARY keys add val1 --home $HOME
$BINARY keys add alice --home $HOME
$BINARY keys add bob --home $HOME
$BINARY genesis add-genesis-account val1 10000000000000000000000000uatom --home $HOME
$BINARY genesis add-genesis-account alice 1000000000000000000uatom --home $HOME
$BINARY genesis add-genesis-account bob 1000000000000000000uatom  --home $HOME
$BINARY genesis gentx val1 1000000000uatom --chain-id cosmos-1 --home $HOME
$BINARY genesis collect-gentxs --home $HOME
sed -i.bak'' 's/minimum-gas-prices = ""/minimum-gas-prices = "0.025uatom"/' $HOME/config/app.toml
$BINARY start --val-key val1 --run-provider true --home $HOME

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