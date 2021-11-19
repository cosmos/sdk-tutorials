---
title: Gas Metering
order: 16
description: Reward validators proportional to their effort.
---

# Gas Metering

So far, players can start playing checkers with your Cosmos blockchain. Players must pay transaction fees. At least the fee related to transporting the serialized bytes and the other metered parts, like bank. Now you can add your own gas fees to reflect the costs that different transactions impose. Or you can add costs to discourage spam.

## New Information

Now that you have landed on values that you think are reasonable, save them in `x/checkers/types/keys.go`:

```go
const (
    CreateGameGas = 10
    PlayMoveGas   = 10
    RejectGameGas = 0
)
```

## Add Handling

This update is going to be quick. In each relevant handler, add a line that consumes the designated amount of gas:

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

</HighlightBox type="tip">

Avoid calling `ConsumeGas` from within a loop. Instead, if you know the number of times your code loops, consume all the gas ahead of the loop. With this trick, if the signer has not sent enough gas, the transaction runs out of gas anyway as if you had run the steps. This strategy saves computations on your node.

</HighlightBox>

Okay. Time to move on.
