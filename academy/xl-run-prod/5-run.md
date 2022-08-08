---
title: Configure, run and set up a service
order: 5
description: Make sure your software is configured and always on
tag: deep-dive
---

# Configure, run and set up a service

You have prepared your machine to be part of the upcoming network. Now it is time to:

1. Configure the rest of the software.
2. Start the software and have it establish a peer-to-peer network with others.

## Configuration

Start by putting `myprojectd` into `/usr/local/bin` or whichever path where you put your executables. Confirm it works with:

```sh
$ myprojectd version
```

In the previous section, you already configured some parameters of your node when it comes to Tendermint, in `~/.myprojectd/config/config.toml`.

In `config/app.toml` you will find other parameters to configure. A special note on `halt-height` that assists you in gracefully stopping the node, for instance when applying a migration.

As for the database(s), classic considerations apply. With the `db_dir` flag, consider storing its files in a dedicated and redundant volume. On Linux, you could mount the `data` folder to that separate drive.

Events are also stored in a database, [see `indexer`](https://docs.tendermint.com/master/nodes/configuration.html#indexing-settings), and here too you can choose to store them in a separate one. Note that events are purely a node concern, not a consensus or network one.

TOML and such. Ideas: https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html

Set up snapshots for others.

User to run:
https://catboss.medium.com/cat-boss-setting-up-a-fullnode-for-osmosis-osmosis-1-5f9752460f8f

## Run user

Another standard security concern is that you want to avoid running your application as `root`. So create a new user and prepare it:

```sh
$ sudo adduser chainuser
```

With this done, move the configuration folder to the home folder of the new user.

```sh
$ sudo mv ~/.myprojectd /home/chainuser
$ sudo chown -R chainuser:chainuser /home/chainuser/.myprojectd
```

## Commands

To finally launch your software, you could simply run:

```sh
$ ./myprojectd start
```

The larger your genesis file, the longer this step takes. Do not worry if it looks like it is not moving.

## As a service

Instead of relaunching your software every time, it is a good idea to set it up as a service. You can use your preferred way, but if you are on Linux, it may be with `systemd`. Here is an example of service file, [modeled on Gaia's](https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html#running-via-background-process), to save in `/etc/systemd/system/myprojectd.service`:

```ini
[Unit]
Description=My Project Chain Daemon
After=network-online.target

[Service]
User=chainuser
ExecStart=$(which myprojectd) start
Restart=always
RestartSec=3
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

Check the [section on migrations](./6-migration.md) where you may add parameters to this file if you want to use Cosmovisor.

Enable it once:

```sh
$ sudo systemctl daemon-reload
$ sudo systemctl enable myprojectd
```

Then, if you don't want to try a computer restart, you can start the process immediately with:

```sh
$ sudo systemctl start myprojectd
```

## When to start

You have launched your blockchain software, the other validators have done the same, so when is the first block minted? It happens when validators representing at least [two thirds](https://hub.cosmos.network/main/resources/genesis.html#genesis-transactions) (67%) of the total staked amount are online.

It means that, although you should coordinate with your peers for a convenient date and time to start, you need not narrow it down to the second. You can all agree that you all start _on Tuesday_ and it will therefore start safely at some point on Tuesday.

This is another reason why, when adding staking transactions in the genesis, you need to be sure about the reliability of the other validators, or your start could be delayed.

## Further concerns

Now that you have a running network, you may considering coming back to it, and try to:

* Make your life easier with [shell command completion](https://hub.cosmos.network/main/hub-tutorials/gaiad.html#shells-completion-scripts).
* Add a node that [checks invariants](https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html#verify-mainnet).
* Add [telemetry](https://docs.cosmos.network/master/core/telemetry.html) so as to keep an eye on your node(s).

This is just an extract of the different customizations that are available to you. For more, you can peruse [this documentation](https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html).