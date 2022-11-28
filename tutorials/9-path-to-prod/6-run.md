---
title: Configure, Run, and Set Up a Service
order: 7
description: Make sure your software is configured and always on
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Configure, Run, and Set Up a Service

You have prepared your machine to be part of the upcoming network. Now it is time to:

1. Configure the rest of the software.
2. Start the software and have it establish a peer-to-peer (P2P) network with others.

## Configuration

Start by putting `myprojectd` into `/usr/local/bin`, or into whichever path you put your executables. Confirm it works with:

```sh
$ myprojectd version
```

In the previous section, you configured some parameters of your node when it comes to Tendermint, in `~/.myprojectd/config/config.toml`.

In `config/app.toml`, you will find other parameters to configure. Take special note of `halt-height` which assists you in gracefully stopping the node, such as when applying a migration.

As for the database(s), classic considerations apply. With the `db_dir` flag, consider storing its files in a dedicated and redundant volume. On Linux, you could mount the `data` folder to that separate drive.

Events are also stored in a database, and here too you can choose to store them separately. Note that events are purely a node concern, not a consensus or network one.

## Run user

Another standard security concern is that you want to avoid running your application as `root`. So, create a new user and prepare it:

```sh
$ sudo adduser chainuser
```

With this done, move the configuration folder to the home folder of the new user:

```sh
$ sudo mv ~/.myprojectd /home/chainuser
$ sudo chown -R chainuser:chainuser /home/chainuser/.myprojectd
```

## Commands

To finally launch your software, you could simply run:

```sh
$ ./myprojectd start
```

The larger your genesis file, the longer this step takes. Do not worry if it seems like nothing is happening.

## As a service

Instead of relaunching your software every time, it is a good idea to set it up as a service. You can use your preferred method, but if you are on Linux it may be with `systemd`. Here is an example of a service file, [modeled on Gaia's](https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html#running-via-background-process), to save in `/etc/systemd/system/myprojectd.service`:

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

Check the [section on migrations](./7-migration.md) to see how you may add parameters to this file if you want to use Cosmovisor.

Enable it once:

```sh
$ sudo systemctl daemon-reload
$ sudo systemctl enable myprojectd
```

Now, if you do not want to try a computer restart, you can start the process immediately with:

```sh
$ sudo systemctl start myprojectd
```

## When to start

You have launched your blockchain software, and the other validators have done the same, so when is the first block minted? This happens when validators representing at least [two-thirds](https://hub.cosmos.network/main/resources/genesis.html#genesis-transactions) (67%) of the total staked amount are online.

This means that, although you should coordinate with your peers for a convenient date and time to start, you need not narrow it down to the second. You can collectively agree to all start _on Tuesday_ and it will therefore start safely at some point on Tuesday.

However, this is another reason why, when adding staking transactions in the genesis, you need to be sure about the reliability of the other validators, otherwise your start could be delayed.

## Further concerns

Now that you have a running network, you may consider coming back to it and try to:

* Make your life easier with [shell command completion](https://hub.cosmos.network/main/hub-tutorials/gaiad.html#shells-completion-scripts).
* Add a node that [checks invariants](https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html#verify-mainnet).
* Add [telemetry](https://docs.cosmos.network/main/core/telemetry.html) so as to keep an eye on your node(s).
* See what [other projects](https://github.com/cosmos/awesome-cosmos) can benefit you.

This is just an extract of the different customizations that are available to you. For more ideas, peruse [this documentation](https://hub.cosmos.network/main/hub-tutorials/join-mainnet.html).

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to configure other software necessary to be part of a network.
* How to start the software and establish a P2P network with other nodes.
* The importance of avoiding running your application as a user (rather than as `root`) for security reasons.
* How to set up your software as a service, to avoid the need to repeatedly relaunch it.
* How to coordinate with your peers regarding when to start your network to ensure timely behaviour.

</HighlightBox>

<!--

E2E:
https://github.com/tendermint/tendermint/tree/main/test/e2e
https://github.com/hyphacoop/cosmos-ansible/

-->
