---
title: Gas Metering
order: 16
description: Reward validators proportional to their effort
tag: deep-dive
---

# Gas Metering

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of gas.
* Have Go installed.
* The checkers blockchain with the game wager and its handling. Either because you followed the [previous steps](./03-starport-13-game-wager) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-wager).

</HighlightBox>

So far players can start playing checkers with your Cosmos blockchain. As everything Cosmos, players must pay transaction fees. As of now, players pay at least the fee related to transporting the serialized bytes and the other gas-metered parts like `bank`.

Now you can add your own gas metering to reflect the costs that different transactions impose or you can add costs to discourage spam.

## New information

Now that you have landed on reasonable values, save them as new constants:

```go
const (
    CreateGameGas = 10
    PlayMoveGas   = 10
    RejectGameGas = 0
)
```

## Add handling

This update is going to be quick. Add a line that consumes the designated amount of gas in each relevant handler:

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

Of course, you are free to be more elaborate and chisel the conditions that consume. Also, you don't meter gas in your `EndBlock` handler because it is called by a player sending a transaction. It is instead a service rendered by the network. If you want to account for the gas cost of an expiration, then you have to devise a way to pre-collect it as part of the other messages.

<HighlightBox type="tip">

Avoid calling `ConsumeGas` from within a loop. If you know the number of times your code loops, consume all the gas ahead of the loop. With this trick, the transaction may run out of gas as if you had run the steps if the signer had not sent enough gas. This strategy saves computations on your node.

</HighlightBox>

Time to move on.

## Next up

Make your checkers blockchain more user-friendly by helping players avoid bad transactions via a query that tests a move. Just follow the exercise in the [next section](./03-starport-15-can-play).
