---
title: IBC Token - Play With Cross-Chain Tokens
order: 18
description: Let players wager any fungible token
tag: deep-dive
---

# IBC Token - Play With Cross-Chain Tokens

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [messages](../2-main-concepts/messages.md), [Protobuf](../2-main-concepts/protobuf.md), and [IBC](../2-main-concepts/ibc.md).
* Have Go installed.
* The checkers blockchain codebase up to the _can play_ query. You can get there by following the [previous steps](./can-play.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/can-play-move-handler).

</HighlightBox>

When you [introduced a wager](./game-wager.md) you enabled players to play a game and bet in the outcome using the base staking token of your blockchain. What if your players want to play with other _currencies_? Your blockchain can represent a token from any other blockchain connected to your chain by using the Inter-Blockchain Communication Protocol (IBC).

Your checkers application will be agnostic to tokens and relayers. Your only task is to enable the use of _foreign_ tokens.

## New information

Instead of defaulting to `"stake"`, let players decide what string represents their token. So update:

1. The stored game:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/proto/checkers/stored_game.proto#L21]
    message StoredGame {
        ...
        string token = 13; // Denomination of the wager.
    }
    ```

2. The message to create a game:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/proto/checkers/tx.proto#L46]
    message MsgCreateGame {
        ...
        string token = 5; // Denomination of the wager.
    }
    ```

For Starport and Protobuf to recompile both files you can use:

```sh
$ starport generate proto-go
```

To avoid surprises down the road, also update the `MsgCreateGame` constructor:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/types/message_create_game.go#L16]
func NewMsgCreateGame(creator string, red string, black string, wager uint64, token string) *MsgCreateGame {
    return &MsgCreateGame{
        ...
        Token: token,
    }
}
```

This data will be emitted during game creation, so add a new event key as a constant:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/types/keys.go#L56]
const (
    StoredGameEventToken = "Token"
)
```

## Additional handling

The token denomination has been integrated into the relevant data structures. Now the proper values need to be inserted in the right locations:

1. In the helper function to create the `Coin` in `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/types/full_game.go#L74-L76]
    func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
        return sdk.NewCoin(storedGame.Token, sdk.NewInt(int64(storedGame.Wager)))
    }
    ```

2. In the handler that instantiates a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_create_game.go#L34]
    storedGame := types.StoredGame{
        ...
        Token:     msg.Token,
    }
    ```

    Not to forget where it emits an event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_create_game.go#L58]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventToken, msg.Token),
        )
    )
    ```

## Integration tests

### Fixing existing ones

You have introduced a new field and a new event. So you first have to fix your existing tests:

1. [Add `Token: sdk.DefaultBondDenom,`](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_create_game_test.go#L16) when creating a game.
2. [Add `Token: "stake",`](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_create_game_test.go#L78) when verifying a stored game.
3. [Add `{Key: "Token", Value: "stake"},`](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_create_game_test.go#L135) when verifying the attributes of the creation event.
4. [Change `createEventCount = 8`](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/keeper_integration_test.go#L19) to account for the new attribute of the creation event.
5. [Change the expected gas](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_create_game_test.go#L152) used where you measured it. Having to do this change by looking at the error message is perhaps an indication that these gas tests are unwelcome.

### Preparation

With this out of the way, it is time to add a test whereby players wager and play with two different tokens. Start with preparing your setup to accommodate different tokens:

1. Although not a must, you can define a reusable foreign denomination, and Alice, Bob and Carol's initial balances in them. Make them **sufficiently different** in value from those of `"stake"` so that one cannot be confused with the other:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/keeper_integration_test.go#L32-L35]
    const(
        foreignToken  = "foreignToken"
        balTokenAlice = 5
        balTokenBob   = 2
        balTokenCarol = 1
    )
    ```

2. Update your bank genesis helper `makeBalance` to take an extra initial balance:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/keeper_integration_test.go#L81-L84]
    func makeBalance(address string, balance int64, balanceToken int64) banktypes.Balance {
        ...
        Coins: sdk.Coins{
            ...
            sdk.Coin{
                Denom:  foreignToken,
                Amount: sdk.NewInt(balanceToken),
            },
        }
    }
    ```

3. Use it from the bank test genesis:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/keeper_integration_test.go#L91-L93]
    func getBankGenesis() *banktypes.GenesisState {
        coins := []banktypes.Balance{
            makeBalance(alice, balAlice, balTokenAlice),
            makeBalance(bob, balBob, balTokenBob),
            makeBalance(carol, balCarol, balTokenCarol),
        }
        ...
    }
    ```

4. Also add a verification helper function to make it easier later on:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/keeper_integration_test.go#L110-L120]
    func (suite *IntegrationTestSuite) RequireBankBalance(expected int, atAddress string) {
        suite.RequireBankBalanceIn(expected, atAddress, sdk.DefaultBondDenom)
    }

    func (suite *IntegrationTestSuite) RequireBankBalanceIn(expected int, atAddress string, denom string) {
        sdkAdd, err := sdk.AccAddressFromBech32(atAddress)
        suite.Require().Nil(err, "Address %s failed to parse")
        suite.Require().Equal(
            int64(expected),
            suite.app.BankKeeper.GetBalance(suite.ctx, sdkAdd, denom).Amount.Int64())
    }
    ```

### Testing proper

With the preparation done, you can add a test when the player makes their first move. For the test to be meaningful, remember to check all token denominations:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_play_move_test.go#L61-L95]
func (suite *IntegrationTestSuite) TestPlayMovePlayerPaidForeignToken() {
    suite.setupSuiteWithOneGameForPlayMove()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
        Wager:   1,
        Token:   foreignToken,
    })
    suite.RequireBankBalance(balAlice, alice)
    suite.RequireBankBalance(balBob, bob)
    suite.RequireBankBalance(balCarol, carol)
    suite.RequireBankBalance(0, checkersModuleAddress)
    suite.RequireBankBalanceIn(balTokenAlice, alice, foreignToken)
    suite.RequireBankBalanceIn(balTokenBob, bob, foreignToken)
    suite.RequireBankBalanceIn(balTokenCarol, carol, foreignToken)
    suite.RequireBankBalanceIn(0, checkersModuleAddress, foreignToken)
    suite.msgServer.PlayMove(goCtx, &types.MsgPlayMove{
        Creator: carol,
        IdValue: "2",
        FromX:   1,
        FromY:   2,
        ToX:     2,
        ToY:     3,
    })
    suite.RequireBankBalance(balAlice, alice)
    suite.RequireBankBalance(balBob, bob)
    suite.RequireBankBalance(balCarol, carol)
    suite.RequireBankBalance(0, checkersModuleAddress)
    suite.RequireBankBalanceIn(balTokenAlice, alice, foreignToken)
    suite.RequireBankBalanceIn(balTokenBob, bob, foreignToken)
    suite.RequireBankBalanceIn(balTokenCarol-1, carol, foreignToken)
    suite.RequireBankBalanceIn(1, checkersModuleAddress, foreignToken)
}
```

You get the idea. No need to further test the event emitted by the bank, which is not your code, other than for curiosity.

Don't forget to add similar tests for when the money goes the other way, i.e. when [rejecting](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_reject_game_test.go#L213-L251), [winning](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/msg_server_play_move_winner_test.go#L149-L189) and [forfeiting](https://github.com/cosmos/b9-checkers-academy-draft/blob/11b02eb/x/checkers/keeper/end_block_server_game_test.go#L496-L546).

## Next up

In the [next section](./migration.md) you will learn how to conduct chain upgrades through migrations.
