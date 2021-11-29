---
title: Gas Metering
order: 16
description: Reward validators proportional to their effort
---

# Gas Metering

<HighlightBox type="info">

Make sure you have all you need to reward validators for their work:

* You understand the concepts of [transactions](../3-main-concepts/05-transactions), [messages](../3-main-concepts/07-messages), and [Protobuf](../3-main-concepts/09-protobuf).
* Have Go installed.
* The checkers blockchain with the `MsgCreateGame` and its handling. Either because you followed the [previous steps](./03-starport-05-create-handling) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-handler
).

</HighlightBox>

So far players can start playing checkers with your Cosmos blockchain. Players must pay transaction fees. Players pay at least the fee related to transporting the serialized bytes and the other metered parts like `bank`.

Now you can add your own gas fees to reflect the costs that different transactions impose or you can add costs to discourage spam.

## New information

Now that you have landed on reasonable values, save them in `x/checkers/types/keys.go`:

```go
const (
    CreateGameGas = 10
    PlayMoveGas   = 10
    RejectGameGas = 0
)
```

## Add handling

This update is going to be quick. Add a line that consumes the designated amount of gas in each relevant handler:

1. In `x/checkers/keeper/msg_server_create_game.go`:

    ```go
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ```

2. In `x/checkers/keeper/msg_server_play_move.go`:

    ```go
    ctx.GasMeter().ConsumeGas(types.PlayMoveGas, "Play a move")
    ```

3. In `x/checkers/keeper/msg_server_reject_game.go`:

    ```go
    ctx.GasMeter().ConsumeGas(types.RejectGameGas, "Reject game")
    ```

Of course, you are free to be more elaborate and chisel the conditions that consume.

<HighlightBox type="tip">

Avoid calling `ConsumeGas` from within a loop. If you know the number of times your code loops, consume all the gas ahead of the loop. With this trick, the transaction runs out of gas as if you had run the steps if the signer has not sent enough gas. This strategy saves computations on your node.

</HighlightBox>

Time to move on.

## Next up

Make your checkers blockchain more user-friendly by helping players make good transactions with a play query. Just follow the exercise in the [next section](./03-starport-15-can-play).
