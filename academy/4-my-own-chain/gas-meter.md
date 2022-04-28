---
title: Gas - Incentivize Players
order: 16
description: Reward validators proportional to their effort
tag: deep-dive
---

# Gas - Incentivize Players

<HighlightBox type="synopsis">

Make sure you have everything you need before proceeding:

* You understand the concept of gas.
* Have Go installed.
* The checkers blockchain codebase with the game wager and its handling. You can get there by following the [previous steps](./game-wager.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-wager).

</HighlightBox>

Players can start playing checkers with your Cosmos blockchain. Transaction fees are paid by players themselves, at least the fee related to transporting the serialized bytes and the other gas-metered parts like `bank`.

Next add your own gas metering to reflect the costs that different transactions impose. You may consider adding costs to discourage spam.

## New data

These values are an inspiration but you can set your own. Save them as new constants:

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

You don't meter gas in your `EndBlock` handler because it is never called by a player sending a transaction. It is instead a service rendered by the network. If you want to account for the gas cost of an expiration, you have to devise a way to collect it in advance, as part of the other messages.

<HighlightBox type="tip">

Avoid calling `ConsumeGas` from within a loop. If you know the number of times your code loops, consume all the gas ahead of the loop. With this trick the transaction may run out of gas as if you had run the steps if the signer had not sent enough gas. This strategy saves computations on your node.

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

## Next up

Make your checkers blockchain more user-friendly by helping players avoid bad transactions via a query that tests a move. Just follow the exercise in the [next section](./can-play.md).
