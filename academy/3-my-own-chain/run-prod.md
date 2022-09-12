---
title: Move to Production
order: 21
description: Elements to run your checkers in production
tags:
  - guided-coding
  - dev-ops
---

# Move to Production

How would you apply what you learned about [running in production](/hands-on-exercise/5-run-in-prod/0-overview.html) to your checkers blockchain?

## Prepare the node

On each of your nodes, create a new user:

```sh
$ sudo adduser checkersuser
```

Validators are going to use three different computers:

* A high-availability node server, typically running on a cloud service.
* A high-availability key management server, typically accessible by and running close to the operator.
* A desktop computer to manage both servers.

## Prepare executables

Now, take a closer look at how to prepare the executables.

### Compilation

This takes place on the desktop computer. Add a `Makefile` for the targets you want to support:

```make
build-all:
	GOOS=linux GOARCH=amd64 go build -o ./build/checkersd-linux-amd64 ./cmd/checkersd/main.go
	GOOS=linux GOARCH=arm64 go build -o ./build/checkersd-linux-arm64 ./cmd/checkersd/main.go
	GOOS=darwin GOARCH=amd64 go build -o ./build/checkersd-darwin-amd64 ./cmd/checkersd/main.go

do-checksum:
	cd build && sha256sum checkersd-linux-amd64 checkersd-linux-arm64 checkersd-darwin-amd64 > checkers_checksum

build-with-checksum: build-all do-checksum
```

Add `build` to `.gitignore`. Now run:

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

Download them to the node servers, including the validator nodes, and put them in place. You can use a new script `prepare-node.sh` that describes the steps:

```sh
cp -v /checkers/build/checkersd-linux-amd64 /usr/local/bin/checkersd
adduser --home /home/checkersuser --disabled-login --disabled-password checkersuser
```

Now run the script on the node:

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

<HighlightBox type="info">

**This only applies to validators.**

</HighlightBox>

On the key management server, the validator operator installs the Tendermint KMS and gets the consensus key - for instance `{"@type":"/cosmos.crypto.ed25519.PubKey","key":"byefX/uKpgTsyrcAZKrmYYoFiXG0tmTOOaJFziO3D+E="}`.

Prepare the key management server to be able to connect to the node server.

On the desktop computer, select the keyring you want to use.

## Prepare the genesis

Now focus on preparing the genesis to continue to prepare to run your checkers blockchain in production.

### Centralized creation

The validator operator that is in charge of assembling the genesis creates it on the node server:

```sh
$ su -l checkeruser checkersd init --chain-id checkers --staking-bond-denom upawn
```

Next, they attribute the initial stakes of everyone, including the validators, by running as many times as necessary:

```sh
$ su -l checkeruser checkersd add-genesis-account cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq 5000000000upawn
```

Then they make it publicly downloadable.

### First distribution to validators

Each validator node operator downloads this genesis to their desktop computer and:

1. Confirms their address is present and has the right balance.
2. Checks their account number, say `12`.

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

The centralized operator now puts all the received genesis transactions on the node server in their own `/home/checkersuser/config/gentx`. When they have all or enough of them by weight, they do:

```sh
$ su -l checkeruser checkersd collect-gentxs
```

They make this publicly available for everyone, including non-validators.

### Final distribution to operators

All operators download this genesis to their node servers, scrutinize it for confirmation that it conforms to their expectations, and put it in their own `/home/checkersuser/.checkers/config/genesis.json`.

## Prepare the network

Socially, operators exchange their addresses and ports with each other as they see fit. Presumably, they do not create two separate networks but a single one eventually.

They save their choices in `/home/checkersuser/.checkers/config/config.toml`.

## Launch the executable

Here, each operator is free to architect their nodes as sentry, seed, or other types as they please.

Around the time that has been agreed on to start the network, they all enable the service:

```sh
$ sudo systemctl daemon-reload
$ sudo systemctl enable checkersd
$ sudo systemctl start checkersd
```

When 2/3rds of the validators by weight are online, the network starts off the genesis.
