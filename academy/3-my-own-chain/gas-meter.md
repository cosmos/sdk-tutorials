---
title: "Gas - Incentivize Players"
order: 17
description: Reward validators proportional to their effort
tag: deep-dive
---

# Gas - Incentivize Players

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concept of gas.
* Go is installed.
* You have the checkers blockchain codebase with the game wager and its handling. If not, follow the [previous steps](./game-wager.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-wager).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add transaction fees.
* Set fees and add metering.
* Do integration tests.

</HighlightBox>

Players can start playing checkers with your Cosmos blockchain. Transaction fees are paid by the players themselves, at least the fee related to transporting the serialized bytes and the other gas-metered parts like `bank`.

Your blockchain is taking shape, but you need to take care of peripheral concerns. For instance, how do you make sure that participants pay their fair share of the costs they impose on the network?

Next, you should add your own gas metering to reflect the costs that different transactions impose, or you can add costs to discourage spam.

## Some initial thoughts

To continue developing your checkers blockchain:

* At what junctures can you charge gas?
* At what junctures can you **not** charge gas, and what do you do about it?
* Are there new errors to report back?
* What event should you emit?

## Code needs

Before diving into the specifics, ask yourself:

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* Where do you make your changes?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## New data

These values provide examples but you can, and should, set your own. Save them as new constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/types/keys.go#L43-L45]
const (
    CreateGameGas = 10
    PlayMoveGas   = 10
    RejectGameGas = 0
)
```

## Add handling

Add a line that consumes the designated amount of gas in each relevant handler:

1. When handling a game creation:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/keeper/msg_server_create_game.go#L45]
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ```

2. When handling a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/keeper/msg_server_play_move.go#L94]
    ctx.GasMeter().ConsumeGas(types.PlayMoveGas, "Play a move")
    ```

3. When handling a game rejection:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/keeper/msg_server_reject_game.go#L52]
    ctx.GasMeter().ConsumeGas(types.RejectGameGas, "Reject game")
    ```

You do not meter gas in your `EndBlock` handler because it is **not** called by a player sending a transaction. Instead, it is a service rendered by the network. If you want to account for the gas cost of a game expiration, you have to devise a way to pre-collect it from players as part of the other messages.

<HighlightBox type="tip">

As part of your code optimization, avoid calling `ConsumeGas` with a fixed gas cost (for instance `k`) from within a loop. Each pass of the loop uses computation resources (`c`) on each node. If you know the number of times your code loops (`n`), you know running the full loop will use `n*c` computation resources.

Now consider the case of a user who sent a transaction without enough gas. The transaction will fail anyway, but at what point will it fail?

1. If you call `ConsumeGas(k)` _within_ the loop, the transaction will fail during one of the passes (the `m`th pass). This means that the node has already used `m*c` computation resources.
2. If you call `ConsumeGas(n*k)` once _before_ the loop, the transaction will fail immediately, and the node will have used `0` computation resources.

Choosing option 2 improves the effectiveness of your blockchain, and potentially protects it from spam and denial-of-service attacks.

Additionally, making only a single call to `ConsumeGas` slightly saves computation resources of the node.

</HighlightBox>

## Integration tests

Now you must add tests that confirm the gas consumption. However, it is not possible to differentiate the gas cost that BaseApp is incurring on your messages from the gas cost your module imposes on top of it. Also, you cannot distinguish via the descriptor [unless it panics](https://github.com/cosmos/cosmos-sdk/blob/v0.42.6/store/types/gas.go#L90-L101). Nevertheless, you can add a lame test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/keeper/msg_server_create_game_test.go#L132-L144]
func (suite *IntegrationTestSuite) TestCreate1GameConsumedGas() {
    suite.setupSuiteWithBalances()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    gasBefore := suite.ctx.GasMeter().GasConsumed()
    suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
        Wager:   15,
    })
    gasAfter := suite.ctx.GasMeter().GasConsumed()
    suite.Require().Equal(uint64(13_190+10), gasAfter-gasBefore)
}
```

Now add tests for a [play](https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/keeper/msg_server_play_move_test.go#L86-L100) and a [reject](https://github.com/cosmos/b9-checkers-academy-draft/blob/63370efe/x/checkers/keeper/msg_server_reject_game_test.go#L93-L103).

## Interact via the CLI

Here, you want to confirm that gas is consumed by different actions. The difficulty is that Alice's and Bob's balances in `stake` tokens change not only because of the gas used but also depending on the gas price. An easy measurement is to use `--dry-run`:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice --dry-run
```

Let's say this returns `54322`, which is the estimated gas used. Now comment out the `.ConsumeGas` line in `msg_server_create_game.go`, save it, wait a few minutes for Ignite CLI to rebuild, and try again:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice --dry-run
```

Say, this time you get `54312`. This is good: the `10` gas is no longer part of the estimation, as expected. Uncomment the `.ConsumeGas` line. You can try `--dry-run` on play and reject too.

Note how a difference of `10` **is insignificant** compared to the `54312` of the other gas costs. This is where you have to decide how to adjust your gas costs so that they are meaningful concerning the costs they impose on the network.

Estimating with `--dry-run` is a good start. Now have Alice create a game and check the gas used in the transaction:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

This mentions:

```
...
gas_used: "52755"
...
```

You could impose a `--gas-prices` and then check balances, but this would obfuscate the gas consumption which is what you want to confirm.

As before, comment the `.ConsumeGas` line `msg_server_create_game.go` and wait for Ignite CLI to rebuild. Then try again:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

This mentions:

```
...
gas_used: "52751"
...
```

There is only a difference of `4`. The rest of the system likely had some under-the-hood initializations, such as Merkle tree creations, which may _falsify_ the early results. Create 10 more games without `.Consume`ing gas and only look at the `gas_used`. It should stabilize at a certain value:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y | grep gas_used
```

This mentions:

```
gas_used: "65057"
```

Put back the `.ConsumeGas` line and rebuild. Then try again:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y | grep gas_used
```

This mentions a difference of `10`:

```
gas_used: "65067"
```

That is sufficient confirmation.

## Next up

Make your checkers blockchain more user-friendly by helping players avoid bad transactions via a query that tests a move. Just follow the exercise in the [next section](./can-play.md).
