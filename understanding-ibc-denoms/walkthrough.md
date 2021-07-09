---
parent:
  title: Understanding IBC Denoms with Gaia
order: 1
description: Send tokens with IBC and trace your denom, understand how denoms work.
---

## Walkthrough sending with IBC and denom tracing

## Getting Lower Level: Querying IBC By Using gaiad gRPC Endpoints

So far you learned at a high level what needs to be done. But what is actually going on under the hood? How is `gaiad` getting all that data, and how can you access this data from another SDK or programming language, for example CosmJS?

At a low level, the `gaiad` instance invoked from your shell is contacting another `gaiad` instance that is running a blockchain node using its gRPC endpoint. SDKs make it easier to query these GRPC endpoints, but only the `main` branch of CosmJS provides methods for accessing these IBC queries. These methods are not available on 0.24.1, the latest branch available from the npm software registry.

You may be familiar with `curl` when developing HTTP REST APIs. The equivalent command for gRPC is [grpcurl](https://github.com/fullstorydev/grpcurl/blob/master/README.md). Install `grpcurl` and follow these steps.

### Start Two Chains That Are Connected By Using IBC

Install gaiad v4.2.1:

```bash
git clone git@github.com:cosmos/gaia.git
cd gaia && git checkout v4.2.1
make build && cp build/gaiad $GOPATH/bin/gaiad
```

Use cosmos-sdk v0.42.4:

```bash
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk && git checkout v0.42.4 && make proto-all # you need docker
```

Download the relayer, tell it to use gaiad v4.2.1, start two chains.

```bash
git clone https://github.com/cosmos/relayer
cd relayer
```

Now execute the `two-chainz` script

```bash
./scripts/two-chainz
```

Result

```bash
GAIA VERSION INFO:
name: NewApp
server_name: <appd>
version: 1.0.0
commit: 261f4b8cb754f1b7ef5a7b4c8c7973fc21275b92
build_tags: ""
go: go version go1.16 darwin/amd64
build_deps:

[...]

Generating gaia configurations...
Creating gaiad instance: home=./data | chain-id=ibc-0 | p2p=:26656 | rpc=:26657 | profiling=:6060 | grpc=:9090
Change settings in config.toml file...
Creating gaiad instance: home=./data | chain-id=ibc-1 | p2p=:26556 | rpc=:26557 | profiling=:6061 | grpc=:9091

[...]

Creating light clients...
successfully created light client for ibc-0 by trusting endpoint http://localhost:26657...
successfully created light client for ibc-1 by trusting endpoint http://localhost:26557...
```

There are now two blockchains running on your computer.
There is `ibc-0` which is the source blockchain and `ibc-1` as the target blockchain.

With the following script you will link the two blockchains.
Execute the following steps to make an IBC transfer between chains.

First, link the two blockchains with each other.

```bash
rly tx link demo -d -o 3s
```

Query the balances of the source blockchain account

```bash
rly q balance ibc-0
```

Response:

```bash
99998000000samoleans,99999977419stake
```

Query the balances of the target blockchain account

```bash
rly q balance ibc-1
```

Response:

```bash
100000000000samoleans,99999982051stake
```

Transfer token from one blockchain to another.

```bash
rly tx transfer ibc-0 ibc-1 1000000samoleans $(rly chains address ibc-1)
```

Response:

```bash
I[2021-07-09|02:12:50.834] ✔ [ibc-0]@{550} - msg(0:transfer) hash(477E2D52D9FB08E1E3F076EB2CC7B1B343224B7475598AC1C0A088CE42AEC892) 
```


```bash
rly tx relay-packets demo -d
sleep 2
rly tx relay-acknowledgements demo -d

rly q balance ibc-0
echo "Balance of $(rly chains address ibc-1) on ibc-1:"
rly q balance ibc-1
```

Make the script executable with

```bash
chmod +x connect.sh
```

Now run `connect.sh`:

```bash
./connect.sh
```

Result:

```bash
I[2021-04-23|15:12:33.406] - [ibc-0] -> creating client on ibc-0 for ibc-1 header-height{5} trust-period(336h0m0s)
...
I[2021-04-23|15:12:55.023] ★ Channel created: [ibc-0]chan{channel-0}port{transfer} -> [ibc-1]chan{channel-0}port{transfer}
100000000000samoleans,99999982786stake
100000000000samoleans,99999982081stake
I[2021-04-23|15:12:55.507] ✔ [ibc-0]@{35} - msg(0:transfer) hash(F3729C01856C3FFE52C363DEBB3A5ECBC1453F8DCCD2417EF46A73595BE98A1A)
waiting for 2 seconds for the tx to confirm
I[2021-04-23|15:12:58.081] ✔ [ibc-1]@{30} - msg(0:update_client,1:recv_packet) hash(930A743A0481B40F10E617C5F79D9D45FB0836BE00F7CBF242E449C258B7F7F5)
I[2021-04-23|15:12:58.081] ★ Relayed 1 packets: [ibc-0]port{transfer}->[ibc-1]port{transfer}
I[2021-04-23|15:13:00.627] ✔ [ibc-0]@{40} - msg(0:update_client,1:acknowledge_packet) hash(6D00EA314F3F4B1496491553C56BE901BDFF554CE759D9C61F368B3DF343F50A)
I[2021-04-23|15:13:00.627] ★ Relayed 1 packets: [ibc-1]port{transfer}->[ibc-0]port{transfer}
99999000000samoleans,99999976647stake
Balance of cosmos1957r6c38kc6gy94w0k9t7ear8xdg4j8xvm80xq on ibc-1:
1000000transfer/channel-0/samoleans,100000000000samoleans,99999977240stake
```

From the last line, you can see that `rly` unwraps IBC denomtrace so that you can see the denom is `1000000transfer/channel-0/samoleans`. As you learned in the first section, `gaiad q ibc-transfer denom-trace` also unwraps the denomtrace for you.

The `gaiad q bank` does not unwrap the denomtrace:

```bash
gaiad q bank balances cosmos1957r6c38kc6gy94w0k9t7ear8xdg4j8xvm80xq --node tcp://localhost:26557
```

Result:

```bash
balances:
- amount: "1000000"
  denom: ibc/27A6394C3F9FF9C9DCF5DFFADF9BB5FE9A37C7E92B006199894CF1824DF9AC7C
- amount: "100000000000"
  denom: samoleans
- amount: "99999977240"
  denom: stake
pagination:
  next_key: null
  total: "0"
```

### Performing the Low Level gRPC Queries Using grpcurl

Now that you have a private IBC testnet setup, you can query the IBC endpoints.

First, the `DenomTraces`.

```bash
grpcurl -plaintext -import-path ./third_party/proto -import-path ./proto \
-proto ./proto/ibc/applications/transfer/v1/query.proto \
localhost:9091 ibc.applications.transfer.v1.Query/DenomTraces
```

Result:

```bash
{
  "denomTraces": [
    {
      "path": "transfer/channel-0",
      "baseDenom": "samoleans"
    }
  ],
  "pagination": {
    "total": "1"
  }
}
```

Then the `ChannelClientState`.

```bash
grpcurl -plaintext -import-path ./third_party/proto -import-path ./proto \
-proto ./proto/ibc/core/channel/v1/query.proto \
-d '{"port_id": "transfer", "channel_id": "channel-0"}' \
localhost:9091 ibc.core.channel.v1.Query/ChannelClientState
```

Result:

```bash
{
  "identifiedClientState": {
    "clientId": "07-tendermint-0",
    "clientState": {
      "@error": "ibc.lightclients.tendermint.v1.ClientState is not recognized; see @value for raw binary message data",
      "@type": "/ibc.lightclients.tendermint.v1.ClientState",
      "@value": "CgVpYmMtMBIECAEQAxoECIDqSSIECIDfbioDCNgEMgA6AhAlQhkKCQgBGAEgASoBABIMCgIAARAhGAQgDDABQhkKCQgBGAEgASoBABIMCgIAARAgGAEgATABSgd1cGdyYWRlShB1cGdyYWRlZElCQ1N0YXRlUAFYAQ=="
    }
  },
  "proofHeight": {
    "revisionNumber": "1",
    "revisionHeight": "751"
  }
}
```

The ClientState is a raw binary blob. In protobuf world, raw binary blob is an `Any` or "any type" that grpcurl cannot parse and results in an error.

However, as you learned from the preceding ClientState querying example, `gaiad` can of course parse the ClientState binary data.