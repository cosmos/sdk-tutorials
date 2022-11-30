---
title: "Play With Cross-Chain Tokens"
order: 9
description: Let players wager any fungible token
tags: 
  - guided-coding
  - cosmos-sdk
  - ibc
---

# Play With Cross-Chain Tokens

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [messages](/academy/2-cosmos-concepts/4-messages.md), [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md), and [IBC](/academy/3-ibc/1-what-is-ibc.md).
* Go is installed.
* You have the checkers blockchain codebase up to the _can play_ query. If not, follow some [previous steps](/hands-on-exercise/2-ignite-cli-adv/7-can-play.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/can-play-move-handler).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Discover the Inter-Blockchain Communication Protocol.
* Accept wagers with tokens from other chains.
* Refactor integration tests.

</HighlightBox>

When you [introduced a wager](/hands-on-exercise/2-ignite-cli-adv/5-game-wager.md) you enabled players to play a game and bet on the outcome using the base staking token of your blockchain. What if your players want to play with _other_ currencies? Your blockchain can represent a token from any other connected blockchain by using the Inter-Blockchain Communication Protocol (IBC).

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

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/proto/checkers/stored_game.proto#L18]
    message StoredGame {
        ...
        string denom = 12;
    }
    ```

2. Update the message to create a game:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/proto/checkers/tx.proto#L21]
    message MsgCreateGame {
        ...
        string denom = 5;
    }
    ```

3. Instruct the Ignite CLI and Protobuf to recompile both files:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite generate proto-go
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite generate proto-go
    ```

    </CodeGroupItem>

    </CodeGroup>

4. It is recommended to also update the `MsgCreateGame` constructor:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/types/message_create_game.go#L12-L18]
    func NewMsgCreateGame(creator string, black string, red string, wager uint64, denom string) *MsgCreateGame {
        return &MsgCreateGame{
            ...
            Denom: denom,
        }
    }
    ```

5. Not to forget the CLI client:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/client/cli/tx_create_game.go#L17-L39]
    cmd := &cobra.Command{
        Use:   "create-game [black] [red] [wager] [denom]",
        Short: "Broadcast message createGame",
        Args:  cobra.ExactArgs(4),
        RunE: func(cmd *cobra.Command, args []string) (err error) {
            ...
            argDenom := args[3]
            ...

            msg := types.NewMsgCreateGame(
                ...
                argDenom,
            )
            ...
        },
    }
    ```

6. This new field will be emitted during game creation, so add a new event key as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/types/keys.go#L37]
    const (
        GameCreatedEventDenom = "denom"
    )
    ```

## Additional handling

The token denomination has been integrated into the relevant data structures. Now the proper denomination values need to be inserted in the right instances at the right locations:

1. In the helper function to create the `Coin` in `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/types/full_game.go#L68-L70]
    func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
        return sdk.NewCoin(storedGame.Denom, sdk.NewInt(int64(storedGame.Wager)))
    }
    ```

2. In the handler that instantiates a game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game.go#L34]
    storedGame := types.StoredGame{
        ...
        Denom:       msg.Denom,
    }
    ```

    Also where it emits an event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game.go#L56]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.GameCreatedEventDenom, msg.Denom),
        )
    )
    ```

## Unit tests

The point of the tests is to make sure that the token denomination is correctly used. So you ought to add a denomination [when creating a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L34) and add it to [all the stored games](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L101) you check and all the [emitted events](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L127) you check. Choose a `"stake"` for all first games and something else for additional games, for instance [`"coin"`](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L191) and [`"gold"`](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_create_game_test.go#L232) respectively.

Adjust your test helpers too:

* The coins factory now needs to care about the denomination too:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/testutil/mock_types/bank_escrow_helpers.go#L16-L23]
    func coinsOf(amount uint64, denom string) sdk.Coins {
        return sdk.Coins{
            sdk.Coin{
                Denom:  denom,
                Amount: sdk.NewInt(int64(amount)),
            },
        }
    }
    ```

* To minimize the amount of work to redo, add an `ExpectPayWithDenom` helper, and have the earlier `ExpectPay` use it with the `"stake"` denomination:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/testutil/mock_types/bank_escrow_helpers.go#L25-L35]
    func (escrow *MockBankEscrowKeeper) ExpectPay(context context.Context, who string, amount uint64) *gomock.Call {
        return escrow.ExpectPayWithDenom(context, who, amount, "stake")
    }

    func (escrow *MockBankEscrowKeeper) ExpectPayWithDenom(context context.Context, who string, amount uint64, denom string) *gomock.Call {
        whoAddr, err := sdk.AccAddressFromBech32(who)
        if err != nil {
            panic(err)
        }
        return escrow.EXPECT().SendCoinsFromAccountToModule(sdk.UnwrapSDKContext(context), whoAddr, types.ModuleName, coinsOf(amount, denom))
    }
    ```

    Do the same with [`ExpectRefund`](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/testutil/mock_types/bank_escrow_helpers.go#L37-L47).

With the new helpers in, you can pepper call expectations with [`"coin"`](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/end_block_server_game_test.go#L239) or `"gold"`.

## Integration tests

You have fixed your unit tests. You need to do the same for your integration tests. 

### Adjustments

Take this opportunity to expand the genesis state so that it includes a different coin.

* Make sure your helper to make a balance cares about the denomination:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/keeper_integration_suite_test.go#L59-L69]
    func makeBalance(address string, balance int64, denom string) banktypes.Balance {
        return banktypes.Balance{
            Address: address,
            Coins: sdk.Coins{
                sdk.Coin{
                    Denom:  denom,
                    Amount: sdk.NewInt(balance),
                },
            },
        }
    }
    ```

* Since you want to add more coins, make a specific function to sum balances per denomination:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/keeper_integration_suite_test.go#L71-L77]
    func addAll(balances []banktypes.Balance) sdk.Coins {
        total := sdk.NewCoins()
        for _, balance := range balances {
            total = total.Add(balance.Coins...)
        }
        return total
    }
    ```

* In the bank genesis creation, add new balances:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/keeper_integration_suite_test.go#L79-L89]
    func getBankGenesis() *banktypes.GenesisState {
        coins := []banktypes.Balance{
            makeBalance(alice, balAlice, "stake"),
            makeBalance(bob, balBob, "stake"),
            makeBalance(bob, balBob, "coin"),
            makeBalance(carol, balCarol, "stake"),
            makeBalance(carol, balCarol, "coin"),
        }
        supply := banktypes.Supply{
            Total: addAll(coins),
        }
        ...
    }    
    ```

* Also adjust the helper that checks bank balances. Add a function to reduce the amount of refactoring:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/keeper_integration_suite_test.go#L104-L114]
    func (suite *IntegrationTestSuite) RequireBankBalance(expected int, atAddress string) {
        suite.RequireBankBalanceWithDenom(expected, "stake", atAddress)
    }

    func (suite *IntegrationTestSuite) RequireBankBalanceWithDenom(expected int, denom string, atAddress string) {
        sdkAdd, err := sdk.AccAddressFromBech32(atAddress)
        suite.Require().Nil(err, "Failed to parse address: %s", atAddress)
        suite.Require().Equal(
            int64(expected),
            suite.app.BankKeeper.GetBalance(suite.ctx, sdkAdd, denom).Amount.Int64())
    }
    ```


### Additional test

With the helpers in place, you can add a test with three players playing two games with different tokens:

```go  [https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/x/checkers/keeper/msg_server_play_move_integration_test.go#L322-L349]
func (suite *IntegrationTestSuite) TestPlayMoveToWinnerBankPaidDifferentTokens() {
    suite.setupSuiteWithOneGameForPlayMove()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    suite.msgServer.CreateGame(goCtx, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
        Wager:   46,
        Denom:   "coin",
    })
    suite.RequireBankBalance(balAlice, alice)
    suite.RequireBankBalanceWithDenom(0, "coin", alice)
    suite.RequireBankBalance(balBob, bob)
    suite.RequireBankBalanceWithDenom(balBob, "coin", bob)
    suite.RequireBankBalance(balCarol, carol)
    suite.RequireBankBalanceWithDenom(balCarol, "coin", carol)
    suite.RequireBankBalance(0, checkersModuleAddress)
    playAllMoves(suite.T(), suite.msgServer, sdk.WrapSDKContext(suite.ctx), "1", game1Moves)
    playAllMoves(suite.T(), suite.msgServer, sdk.WrapSDKContext(suite.ctx), "2", game1Moves)
    suite.RequireBankBalance(balAlice, alice)
    suite.RequireBankBalanceWithDenom(0, "coin", alice)
    suite.RequireBankBalance(balBob+45, bob)
    suite.RequireBankBalanceWithDenom(balBob+46, "coin", bob)
    suite.RequireBankBalance(balCarol-45, carol)
    suite.RequireBankBalanceWithDenom(balCarol-46, "coin", carol)
    suite.RequireBankBalance(0, checkersModuleAddress)
    suite.RequireBankBalanceWithDenom(0, "coin", checkersModuleAddress)
}
```

All your tests should now pass.

## Interact via the CLI

Restart Ignite with `chain serve`. If you recall, Alice's and Bob's balances have two token denominations. Query:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances $alice
```

</CodeGroupItem>

</CodeGroup>

This returns what you would expect from the [`config.yml`](https://github.com/cosmos/b9-checkers-academy-draft/blob/wager-denomination/config.yml#L2-L5):

```txt
balances:
- amount: "100000000"
  denom: stake
- amount: "20000"
  denom: token
pagination:
  next_key: null
  total: "0"
```

You can make use of this other `token` to create a new game that costs `1 token`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob 1 token --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob 1 token --from $alice
```

</CodeGroupItem>

</CodeGroup>

Which mentions:

```txt
...
- key: wager
  value: "1"
- key: denom
  value: token
...
```

Have Alice play once:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 1 2 2 3 --from $alice
```

</CodeGroupItem>

</CodeGroup>

Which mentions:

```txt
- attributes:
  - key: recipient
    value: cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3
  - key: sender
    value: cosmos180g0kaxzzre95f9gww93t8cqhshjydazu7g35n
  - key: amount
    value: 1token
  type: transfer
```

This seems to indicate that Alice has been charged the wager. As a side node, `cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3` is the checkers module's address. Confirm it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances $alice
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
balances:
- amount: "100000000"
  denom: stake
- amount: "19999"
  denom: token
pagination:
  next_key: null
  total: "0"
```

Correct. You made it possible to wager any token. That includes IBC tokens.

Now check the checkers module's balance:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query bank balances cosmos16xx0e457hm8mywdhxtmrar9t09z0mqt9x7srm3
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
balances:
- amount: "1"
  denom: token
pagination:
  next_key: null
  total: "0"
```

That is correct.

## Live testing with a relayer

<!-- TODO it looks like it is no longer possible with this version of Ignite -->

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

In the [next section](/hands-on-exercise/4-run-in-prod/2-migration.md), you will learn how to conduct chain upgrades through migrations.-->

Alternatively, you can learn how to create the [TypeScript client elements](/hands-on-exercise/3-cosmjs-adv/1-cosmjs-objects.md) for your blockchain.
