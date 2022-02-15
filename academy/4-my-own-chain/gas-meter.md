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

Next add your own gas metering to reflect the costs that different transactions impose or you can add costs to discourage spam.

## New data

These values are an inspiration but you can set your own. Save them as new constants:

```go
const (
    CreateGameGas = 10
    PlayMoveGas   = 10
    RejectGameGas = 0
)
```

## Add handling

Add a line that consumes the designated amount of gas in each relevant handler:

1. When handling a game creation:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/76abedcf3ad3f4e5186435e153e6ed0d18630a73/x/checkers/keeper/msg_server_create_game.go#L41]
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ```

2. When handling a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/76abedcf3ad3f4e5186435e153e6ed0d18630a73/x/checkers/keeper/msg_server_play_move.go#L90]
    ctx.GasMeter().ConsumeGas(types.PlayMoveGas, "Play a move")
    ```

3. When handling a game rejection:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/76abedcf3ad3f4e5186435e153e6ed0d18630a73/x/checkers/keeper/msg_server_reject_game.go#L52]
    ctx.GasMeter().ConsumeGas(types.RejectGameGas, "Reject game")
    ```

You don't meter gas in your `EndBlock` handler because it is called by a player sending a transaction. It is instead a service rendered by the network. If you want to account for the gas cost of an expiration, you have to devise a way to pre-collect it as part of the other messages.

<HighlightBox type="tip">

Avoid calling `ConsumeGas` from within a loop. If you know the number of times your code loops, consume all the gas ahead of the loop. With this trick the transaction may run out of gas as if you had run the steps if the signer had not sent enough gas. This strategy saves computations on your node.

</HighlightBox>


## Next up

Make your checkers blockchain more user-friendly by helping players avoid bad transactions via a query that tests a move. Just follow the exercise in the [next section](./can-play.md).
