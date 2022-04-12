---
title: Gas - Incentivize Players
order: 16
description: Reward validators proportional to their effort
tag: deep-dive
---

# Gas - Incentivize Players

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concept of gas.
* Have Go installed.
* The checkers blockchain codebase with the game wager and its handling. You can get there by following the [previous steps](./game-wager.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-wager).

</HighlightBox>

Players can start playing checkers with your Cosmos blockchain. Transaction fees are paid by players themselves, at least the fee related to transporting the serialized bytes and the other gas-metered parts like `bank`.

Next, add your own gas metering to reflect the costs that different transactions impose or you can add costs to discourage spam.

## New data

These values are an inspiration but you can, and should, set your own. Save them as new constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/4e8a82e/x/checkers/types/keys.go#L42-L46]
const (
    CreateGameGas = 10
    PlayMoveGas   = 10
    RejectGameGas = 0
)
```

## Add handling

Add a line that consumes the designated amount of gas in each relevant handler:

1. When handling a game creation:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/4e8a82e/x/checkers/keeper/msg_server_create_game.go#L45]
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ```

2. When handling a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/4e8a82e/x/checkers/keeper/msg_server_play_move.go#L90]
    ctx.GasMeter().ConsumeGas(types.PlayMoveGas, "Play a move")
    ```

3. When handling a game rejection:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/4e8a82e/x/checkers/keeper/msg_server_reject_game.go#L52]
    ctx.GasMeter().ConsumeGas(types.RejectGameGas, "Reject game")
    ```

You do not meter gas in your `EndBlock` handler because it is **not** called by a player sending a transaction. Instead, it is a service rendered by the network. If you want to account for the gas cost of a game expiration, you have to devise a way to pre-collect it from players as part of the other messages.

<HighlightBox type="tip">

Avoid calling `ConsumeGas` from within a loop. If you know the number of times your code loops, consume all the gas ahead of the loop. With this trick, the transaction may run out of gas as if you had run the steps if the signer had not sent enough gas. This strategy saves computations on your node.

</HighlightBox>

## Interact via the CLI

Here, you want to confirm that gas is consumed by different actions. The _difficulty_ is that Alice's and Bob's balances in `stake` tokens change not only because of the gas used but also depending on the gas price. An easy measurement is to use `--dry-run`:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice --dry-run
```

Let's say this returns `54322`, which is the estimated gas used. Now comment out the `.ConsumeGas` line in `msg_server_create_game.go`, save it, wait the couple minutes it takes for Ignite CLI to rebuild, and try again:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice --dry-run
```

Say, this time you get `54312`. This is good - the `10` gas is no longer part of the estimation, as expected. Uncomment the `.ConsumeGas` line. You can try `--dry-run` on play and reject too.

Notice how a difference of `10` **is insignificant** compared to the `54312` of the other gas costs. This is where you have to decide how to adjust your gas costs so that they are meaningful concerning the costs they impose on the network.

Estimating with `--dry-run` is a good start. Now better, have Alice create a game and check the gas used in the transaction:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

Which mentions:

```
...
gas_used: "52755"
...
```

You could impose a `--gas-prices` and then check balances but it would obfuscate the gas consumption, which is what you want to confirm.

As before, comment the `.ConsumeGas` line `msg_server_create_game.go` and wait for Ignite CLI to rebuild. Then try again:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

Which mentions:

```
...
gas_used: "52751"
...
```

Only a difference of `4`? The rest of the system likely had some under-the-hood initializations such as Merkle tree creations, which may _falsify_ the early results. Create 10 more games without `.Consume`ing gas and only look at the `gas_used`. It should stabilize at a certain value:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y | grep gas_used
```

Which mentions:

```
gas_used: "65057"
```

Now put back the `.ConsumeGas` line and rebuild. Then try the same:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y | grep gas_used
```

Which mentions a difference of `10`:

```
gas_used: "65067"
```

That is sufficient confirmation for now.

## Next up

Make your checkers blockchain more user-friendly by helping players avoid bad transactions via a query that tests a move. Just follow the exercise in the [next section](./can-play.md).
