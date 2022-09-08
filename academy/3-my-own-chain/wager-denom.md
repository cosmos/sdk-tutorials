---
title: "IBC Token - Play With Cross-Chain Tokens"
order: 19
description: Let players wager any fungible token
tag: deep-dive
---

# IBC Token - Play With Cross-Chain Tokens

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [messages](../2-main-concepts/messages.md), [Protobuf](../2-main-concepts/protobuf.md), and [IBC](../4-ibc/what-is-ibc.md).
* Go is installed.
* You have the checkers blockchain codebase up to the _can play_ query. If not, follow the [previous steps](./can-play.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-can-play-move-handler).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Discover the Inter-Blockchain Communication Protocol.
* Accept wagers with tokens from other chains.
* Refactor integration tests.

</HighlightBox>

When you [introduced a wager](./game-wager.md) you enabled players to play a game and bet on the outcome using the base staking token of your blockchain. What if your players want to play with _other_ currencies? Your blockchain can represent a token from any other connected blockchain by using the Inter-Blockchain Communication Protocol (IBC).

Thus, you could expand the pool of your potential players by extending the pool of possible wager denominations via the use of IBC. How can you do this?

<HighlightBox type="info">

Your checkers application will be agnostic regarding tokens and relayers. Your only task is to enable the use of _foreign_ tokens.

</HighlightBox>

## Some initial thoughts

Before diving into the exercise, ask yourself:

* What new information do you need?
* How do you sanitize the inputs?
* Are there new errors to report back?
* What event should you emit?

## Code needs

When it comes to the code itself:

* What Ignite CLI commands, if any, assist you?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## New information

Instead of defaulting to `"stake"`, let players decide what string represents their token:

1. Update the stored game:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/proto/checkers/stored_game.proto#L19]
    message StoredGame {
        ...
        string token = 13; // Denomination of the wager.
    }
    ```

2. Update the message to create a game:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/proto/checkers/tx.proto#L46]
    message MsgCreateGame {
        ...
        string token = 5; // Denomination of the wager.
    }
    ```

3. Instruct the Ignite CLI and Protobuf to recompile both files:

    ```sh
    $ ignite generate proto-go
    ```

4. It is recommended to also update the `MsgCreateGame` constructor:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/types/message_create_game.go#L16]
    func NewMsgCreateGame(creator string, red string, black string, wager uint64, token string) *MsgCreateGame {
        return &MsgCreateGame{
            ...
            Token: token,
        }
    }
    ```

3. This data will be emitted during game creation, so add a new event key as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/types/keys.go#L56]
    const (
        StoredGameEventToken = "Token"
    )
    ```

## Additional handling

The token denomination has been integrated into the relevant data structures. Now the proper values need to be inserted in the right locations:

1. In the helper function to create the `Coin` in `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/types/full_game.go#L74-L76]
    func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
        return sdk.NewCoin(storedGame.Token, sdk.NewInt(int64(storedGame.Wager)))
    }
    ```

2. In the handler that instantiates a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_create_game.go#L34]
    storedGame := types.StoredGame{
        ...
        Token:     msg.Token,
    }
    ```

    Also where it emits an event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_create_game.go#L58]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventToken, msg.Token),
        )
    )
    ```

## Integration tests

### Fixing existing tests

You have introduced a new field and a new event. Therefore you have to fix your existing tests:

1. [Add `Token: sdk.DefaultBondDenom,`](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_create_game_test.go#L16) when creating a game.
2. [Add `Token: "stake",`](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_create_game_test.go#L78) when verifying a stored game.
3. [Add `{Key: "Token", Value: "stake"},`](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_create_game_test.go#L135) when verifying the attributes of the creation event.
4. [Change `createEventCount = 8`](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/keeper_integration_test.go#L19) to account for the new attribute of the creation event.
5. [Change the expected gas](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_create_game_test.go#L152) used where you measured it. Having to do this change by looking at the error message may indicate that these gas tests are unwelcome.

### Preparation

With this out of the way, you will add a test whereby players wager and play with two different tokens. Start by preparing your setup to accommodate different tokens:

1. Although not essential, you can define a reusable foreign denomination and Alice, Bob, and Carol's initial balances in them. Make them **sufficiently different** in value from those of `"stake"` so that one cannot be confused with the other:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/keeper_integration_test.go#L32-L35]
    const(
        foreignToken  = "foreignToken"
        balTokenAlice = 5
        balTokenBob   = 2
        balTokenCarol = 1
    )
    ```

2. Update your bank genesis helper `makeBalance` to take an extra initial balance:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/keeper_integration_test.go#L81-L84]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/keeper_integration_test.go#L91-L93]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/keeper_integration_test.go#L110-L120]
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

With the preparation done, add a test when the player makes their first move. For the test to be meaningful, remember to check all token denominations:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_play_move_test.go#L88-L122]
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

There is no need to further test the event emitted by the bank, which is not your code, other than for curiosity.

Do not forget to add similar tests for when the money goes the other way (i.e. when [rejecting](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_reject_game_test.go#L213-L251), [winning](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/msg_server_play_move_winner_test.go#L149-L189), and [forfeiting](https://github.com/cosmos/b9-checkers-academy-draft/blob/9a22cd21/x/checkers/keeper/end_block_server_game_test.go#L496-L546)).

## Interact via the CLI

If you recall, Alice's and Bob's balances have two token denominations. Query:

```sh
$ checkersd query bank balances $bob
```

This returns:

```
balances:
- amount: "100000000"
  denom: stake
- amount: "10000"
  denom: token
pagination:
  next_key: null
  total: "0"
```

You can make use of this other `token` to create a new game that costs `1 token`:

```sh
$ checkersd tx checkers create-game $alice $bob 1 token --from $alice
```

Which mentions:

```
...
- key: Wager
  value: "1"
- key: Token
  value: token
...
```

Have Bob play once:

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob
```

Has Bob been charged the wager?

```sh
$ checkersd query bank balances $bob
```

This returns:

```
balances:
- amount: "100000000"
  denom: stake
- amount: "9999"
  denom: token
pagination:
  next_key: null
  total: "0"
```

Correct. You made it possible to wager any token. That includes IBC tokens.

## Live testing with a relayer

With the checkers application ready to accommodate IBC-foreign tokens, you should run some tests locally with another blockchain's tokens without running a large-scale operation. Conveniently, Ignite CLI has the [TypeScript relayer](https://docs.ignite.com/kb/relayer.html) built in. If you look at the GUI Ignite CLI created in your checkers blockchain, you will see a _Relayers_ section on the left.

A relayer is a process that transfers IBC packets between two blockchains. Here this process is **running in your browser** using the account you configured in your browser. The account is the same one you would use to play a game of checkers. Dub it `alice123@checkers`.

1. On the checkers end, the relayer is already configured to connect to your running checkers blockchain and to use the tokens of whichever account you have configured in your browser (here `alice123@checkers`). Therefore, it gets the same privileges to access your tokens that you have granted to the checkers browser application.
2. You need to configure it to connect to the other blockchain which hosts the foreign tokens you want to transfer. This can be the Cosmos Hub, or a [testnet](https://github.com/cosmos/testnets) that you or someone else runs.
3. You also need to fund the relayer's account on the remote chain so that it can operate. The account is generated from the same private key as `alice123@checkers`, so call it `alice465@remote`. The relayer shows you in the browser which account this is.

Your test follows a few steps:

1. Configure the relayer. This is a matter of entering the necessary parameters, clicking a button, and waiting for the setup to be done. In effect, the relayer opens a transfer channel (likely numbered `0`) on the checkers chain, opens another transfer channel on the remote chain, and links the two.
2. Send the desired foreign tokens to `alice465@remote` using any regular method of sending tokens, independent of whether the tokens come from a faucet or another account.
3. Use the relayer to send these foreign tokens to `alice123@checkers`.
4. Check the balance of `alice123@checkers` in the checkers blockchain when it is done. You should see a new entry whose `denom` field looks like a long hex value (`ibc/1873CA...`). Save this string to use with your test.
5. Repeat the transfer process through the relayer, this time for the benefit of another player (for example `bob224@checkers`). For your test, Alice can send some tokens to Bob so they can start a game.
6. Have Alice and Bob start a game with `token: ibc/1873CA...`.
7. After the outcome of a game, the players can retransfer these foreign tokens via the same relayer to the remote chain.

This is how the TypeScript relayer built in by Ignite CLI lets you experiment with foreign tokens.

<HighlightBox type="tip">

As soon as you close the browser window the channels on both ends are no longer monitored, and therefore no token transfers will take place. Also depending on the development state of Ignite CLI, after you close it the relayer may not be able to reuse a channel it created earlier. **Do not use this for production**.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to enable the use of cross-chain tokens to make wagers on checkers games as well as your blockchain's base staking token, by making use of the Inter-Blockchain Communication Protocol (IBC).
* How to update the stored game and the game creation message to allow players to decide what string represents their token.
* Where to insert the necessary values to allow recognition of token denominations.
* How to fix your existing tests due to the introduction of a new field and a new event, and how to add a new test when a player makes their first move.
* How to interact via the CLI to confirm the presence of the new token denomination in a player's balance and that using these tokens to make a wager functions as required.
* How to demonstrate that your application will accept IBC-foreign tokens from another blockchain, using Ignite CLI's built-in TypeScript relayer as a convenient small-scale local testing tool.

</HighlightBox>

<!--## Next up

In the [next section](./migration.md), you will learn how to conduct chain upgrades through migrations.-->

<!-- Alternatively, you can learn how to create the [TypeScript client elements](./cosmjs-objects.md) for your blockchain. -->
