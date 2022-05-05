---
title: "IBC-Go Relayer"
order: 
description: 
tag: deep-dive
---

# IBC-Go Relayer

[IBC-Go Relayer](https://github.com/cosmos/relayer) is a relayer implementation written in Golang.

## Testing

The repository offers a script to start two chains, which we need in order to test the relayer. 

First create a folder for this section:

```bash
$ mkdir relay-go-test
$ cd relay-go-test
```

Clone the [IBC-Go Relayer](https://github.com/cosmos/relayer) repository:

```bash
$ git clone https://github.com/cosmos/relayer.git
```

Now clone the [Gaia](https://github.com/cosmos/gaia) repository into it:

```bash
$ git clone https://github.com/cosmos/gaia.git
```

Build Gaia:

```bash
$ cd gaia
$ make install
```

Now build the Go relayer:

```bash
$ cd ../relayer
$ make install
```

Make sure that your `$GOPATH` is set correctly and `$GOPATH/bin` is included in your `$PATH`. 

Now use the offered script to spin up two chains, **ibc-0** and **ibc-1**:

```bash
$ ./scripts/two-chainz
```

The relayer `--home` directory is now ready for normal operations between **ibc-0** and **ibc-1**. 

It is helpful to examine the folder structure of the relayer:

```bash
$ tree ~/.relayer
```

See if the chains are ready to relay over:

```bash
$ rly chains list
```

See the current status of the path you will relay over:

```bash
rly paths list
```

Now you can connect the two chains with one command:

```bash
$ rly tx link demo -d -t 3s
```

Check the token balances on both chains:

```bash
$ rly q balance ibc-0
$ rly q bal ibc-1
```

Now send some tokens between the chains:

```bash
$ rly tx transfer ibc-0 ibc-1 1000000samoleans $(rly chains address ibc-1) channel-0
```

## Relay packets/acknowledgments

Running `rly start demo` essentially loops these two commands:

```bash
$ rly tx relay-pkts demo channel-0 -d
$ rly tx relay-acks demo channel-0 -d
```

Check that the transfer has completed:

```bash
$ rly q bal ibc-0
$ rly q bal ibc-1
```

Send the tokens back to the account on ibc-0:

```bash
$ rly tx transfer ibc-1 ibc-0 1000000ibc/27A6394C3F9FF9C9DCF5DFFADF9BB5FE9A37C7E92B006199894CF1824DF9AC7C $(rly chains addr ibc-0) channel-0
$ rly tx relay-pkts demo channel-0 -d
$ rly tx relay-acks demo channel-0 -d
```

Check that the return trip has completed:

```bash
$ rly q bal ibc-0
$ rly q bal ibc-1
```

NOTE: you will see the stake balances decreased on each chain. This is to pay for fees.
You can change the amount of fees you pay on each chain in the configuration.
