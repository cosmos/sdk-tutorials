---
title: Move to Production
order: 21
description: Elements to run your Checkers in production
tag: deep-dive
---

# Move to Production

## Prepare the node

On each of your nodes, you create a new user:

```sh
$ sudo adduser checkersuser
```

## Prepare executables

### Compilation

Add a `Makefile` for the targets you want to support:

```make
build-all:
	GOOS=linux GOARCH=amd64 go build -o ./build/checkersd-linux-amd64 ./cmd/checkersd/main.go
	GOOS=linux GOARCH=arm64 go build -o ./build/checkersd-linux-arm64 ./cmd/checkersd/main.go
	GOOS=darwin GOARCH=amd64 go build -o ./build/checkersd-darwin-amd64 ./cmd/checkersd/main.go

do-checksum:
	cd build && sha256sum checkersd-linux-amd64 checkersd-linux-arm64 checkersd-darwin-amd64 > checkers_checksum

build-with-checksum: build-all do-checksum
```

Add `build` to `.gitignore`. And run:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ make build-with-checksum
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i make build-with-checksum
```

</CodeGroupItem>

</CodeGroup>

### Sharing and download

Make these files publicly downloadable.

Download them on the nodes, including validator nodes, and put them in place. You can use a new script `prepare-node.sh` that describes the steps:

```sh
cp -v /checkers/build/checkersd-linux-amd64 /usr/local/bin/checkersd
adduser --home /home/checkersuser --disabled-login --disabled-password checkersuser
```

And run the script on the node:

<CodeGroup>

<CodeGroupItem title="Linux" active>

```sh
$ /checkers/prod/prepare-node.sh
```

</CodeGroupItem>

<CodeGroupItem title="Mac">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i prod/prepare-node.sh
```

</CodeGroupItem>

</CodeGroup>

### As a service

Prepare to run the executable as a service. Create a `/etc/systemd/system/checkersd.service` file with:

```ini
[Unit]
Description=Checkers Chain Daemon
After=network-online.target

[Service]
User=checkersuser
ExecStart=$(which checkersd) start
Restart=always
RestartSec=3
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

## Prepare keys

This applies for validators. On the server, install the Tendermint KMS and get the consensus key. For instance `{"@type":"/cosmos.crypto.ed25519.PubKey","key":"byefX/uKpgTsyrcAZKrmYYoFiXG0tmTOOaJFziO3D+E="}`.

On your management computer, select the keyring you want to use.

## Prepare the genesis

### Centralized creation

The validator operator that is in charge of assembling the genesis creates it:

```sh
$ checkersd init --chain-id checkers --staking-bond-denom upawn
```

And attributes the initial stakes of everyone, including the validators, by running as many times as necessary:

```sh
$ checkersd add-genesis-account cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq 5000000000upawn
```

And makes it publicly downloadable.

### First distribution to validators

Each validator node operator downloads this genesis into their management computer and:

1. Confirms their address is present and has the right balance.
2. Check their account number, say 12.

Then for their address, they need to create the genesis transaction:

```sh
$ checkersd gentx cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq \
    3000000000upawn \
	--account-number 12 --sequence 0 \
	--chain-id checkers \
	--pubkey '{"@type":"/cosmos.crypto.ed25519.PubKey","key":"byefX/uKpgTsyrcAZKrmYYoFiXG0tmTOOaJFziO3D+E="}'
```

Then each validator sends the new file found in `~/.checkers/config/gentx` back to the operator that centralizes the creation of the genesis.

### Addition of genesis transactions

Then the centralized operator puts all the received genesis transactions in their own `/home/checkersuser/config/gentx`. Then when they have all or enough of them by weight, they do:

```sh
$ checkersd collect-gentxs
```

And makes it publicly available for everyone including non-validators.

### Final distribution to operators

All operators download this genesis in their servers and scrutinize it for confirmation that it conforms to their expectations. And put it in their own `/home/checkersuser/.checkers/config/genesis.json`.

## Prepare the network

Socially, each operator exchange their addresses and ports with each other as they see fit. Presumably they do not create two separate networks but a single one eventually.

They save their choices in `/home/checkersuser/.checkers/config/config.toml`.

## Launch the executable

Here, each operator is free to architect their nodes as sentry, seed or other types as they please.

Around the time that has been agreed on to start the network they all enable the service:

```sh
$ sudo systemctl daemon-reload
$ sudo systemctl enable checkersd
$ sudo systemctl start checkersd
```

When 2/3 of the validators by weight are online, the network starts off the genesis. Congratulations.