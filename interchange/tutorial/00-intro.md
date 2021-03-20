# Interchange

# Commands to run

### App creation

```
starport app github.com/tendermint/interchange

cd interchange
```

### Module

```
starport module create ibcdex --ibc --ordering unordered
```

### Order books

`orderIDTrack` is an internal counter in the order book to assign the orders an ID

```
starport type sellOrderBook orderIDTrack:int amountDenom priceDenom --indexed --module ibcdex
starport type buyOrderBook orderIDTrack:int amountDenom priceDenom --indexed --module ibcdex
```

### Packets

```
starport packet createPair sourceDenom targetDenom --module ibcdex
starport packet sellOrder amountDenom amount:int priceDenom price:int --ack remainingAmount:int,gain:int --module ibcdex
starport packet buyOrder amountDenom amount:int priceDenom price:int --ack remainingAmount:int,purchase:int --module ibcdex
```

### Cancel messages

Cancelling orders is done locally in the network, there is no packet to send

```
starport message cancelSellOrder port channel amountDenom priceDenom orderID:int --desc "Cancel a sell order" --module ibcdex
starport message cancelBuyOrder port channel amountDenom priceDenom orderID:int --desc "Cancel a buy order" --module ibcdex
```

### Denom trace

The token denoms should have the same behavior as in the `ibctransfer` module:

- An external token received from a chain has a unique denom named voucher
- When a token sent to a chain is received back, the chain can resolve the voucher and convert it back to the original token denomination

Vouchers are hashes, therefore we must store which original denomination is related to a voucher, we can do this with an indexed type.

For a voucher, we store: the source port ID, source channel ID and the original denom

```go
starport type denomTrace port channel origin --indexed --module ibcdex
```

# Config

We can add to config (`mars` and `venus`) to test two blockchain networks with specific token for each (`mcx`: `marscoin`, `vcx`: `venuscoin`)

mars.yml:

```go
accounts:
  - name: alice
    coins: ["1000token", "100000000stake", "1000mcx"]
  - name: bob
    coins: ["500token", "1000mcx"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  name: bob
  coins: ["5token"]
genesis:
  chain_id: "mars"
init:
  home: "$HOME/.mars"
```

earth.yml:

```go
accounts:
  - name: alice
    coins: ["1000token", "1000000000stake", "1000vcx"]
  - name: bob
    coins: ["500token", "1000vcx"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  host: ":4501"
  name: bob
  coins:
    - "5token"
host:
  rpc: ":26659"
  p2p: ":26658"
  prof: ":6061"
  grpc: ":9091"
  api: ":1318"
  frontend: ":8081"
  dev-ui: ":12346"
genesis:
  chain_id: "venus"
init:
  home: "$HOME/.venus"
```