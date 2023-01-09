---
title: "Let Players Set a Wager"
order: 6
description: Token - Players set a wager
tags: 
  - guided-coding
  - cosmos-sdk
---

# Let Players Set a Wager

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [transactions](/academy/2-cosmos-concepts/3-transactions.md), [messages](/academy/2-cosmos-concepts/4-messages.md), and [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase up to game expiry handling. If not, follow the [previous steps](./4-game-forfeit.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/forfeit-game).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add wager information (only).
* Update unit tests.

</HighlightBox>

With the introduction of game expiry in the [previous section](./4-game-forfeit.md) and other features, you have now addressed the cases when two players start a game and finish it, or let it expire.

In this section, you will go one step closer to adding an extra layer to a game, with wagers or stakes. Your application already includes all the necessary modules.

Players choose to wager _money_ or not, and the winner gets both wagers. The forfeiter loses their wager. To reduce complexity, start by letting players wager in the staking token of your application.

Now that no games can be left stranded, it is possible for players to safely wager on their games. How could this be implemented?

## Some initial thoughts

When thinking about implementing a wager on games, ask:

* What form will a wager take?
* Who decides on the amount of wagers?
* Where is a wager recorded?
* At what junctures do you need to handle payments, refunds, and wins?

This is a lot to go through. Therefore, the work is divided into two sections. In this section, you only add new information, while the [next section](./5-payment-winning.md) is where the tokens are actually handled.

Some answers:

* Even if only as a start, it makes sense to let the game creator decide on the wager.
* It seems reasonable to save this information in the game itself so that wagers can be handled at any point in the lifecycle of the game.

## Code needs

When it comes to your code:

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* Where do you make your changes?
* What event should you emit?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## New information

Add this wager value to the `StoredGame`'s Protobuf definition:

```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/proto/checkers/stored_game.proto#L17]
    message StoredGame {
        ...
+      uint64 wager = 11;
    }
```

You can let players choose the wager they want by adding a dedicated field in the message to create a game, in `proto/checkers/tx.proto`:

```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/proto/checkers/tx.proto#L20]
    message MsgCreateGame {
        ...
+      uint64 wager = 4;
    }
```

Have Ignite CLI and Protobuf recompile these two files:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite generate proto-go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    ignite generate proto-go
```

</CodeGroupItem>

</CodeGroup>

Now add a helper function to `StoredGame` using the Cosmos SDK `Coin` in `full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/types/full_game.go#L68-L70]
func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
    return sdk.NewCoin(sdk.DefaultBondDenom, sdk.NewInt(int64(storedGame.Wager)))
}
```

This encapsulates information about the wager (where `sdk.DefaultBondDenom` is most likely `"stake"`).

## Saving the wager

Time to ensure that the new field is saved in the storage and it is part of the creation event.

1. Define a new event key as a constant:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/types/keys.go#L36]
        const (
            ...
    +      GameCreatedEventWager = "wager"
        )
    ```

2. Set the actual value in the new `StoredGame` as it is instantiated in the create game handler:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game.go#L33]
        storedGame := types.StoredGame{
            ...
    +      Wager: msg.Wager,
        }
    ```

3. And in the event:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game.go#L52]
        ctx.EventManager().EmitEvent(
            sdk.NewEvent(sdk.EventTypeMessage,
                ...
    +          sdk.NewAttribute(types.GameCreatedEventWager, strconv.FormatUint(msg.Wager, 10)),
            )
        )
    ```

4. Modify the constructor among the interface definition of `MsgCreateGame` in `x/checkers/types/message_create_game.go` to avoid surprises:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/types/message_create_game.go#L17]
        func NewMsgCreateGame(creator string, red string, black string, wager uint64) *MsgCreateGame {
            return &MsgCreateGame{
                ...
    +          Wager: wager,
            }
        }
    ```

5. Adjust the CLI client accordingly:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/compare/forfeit-game..game-wager#diff-499219a70e143a1a848af38d250273a6de287507bfc67f89ff0f46cc8222a7a1]
        func CmdCreateGame() *cobra.Command {
            cmd := &cobra.Command{
    -          Use:   "create-game [black] [red]",
    +          Use:   "create-game [black] [red] [wager]",
                Short: "Broadcast message createGame",
    -          Args:  cobra.ExactArgs(2),
    +          Args:  cobra.ExactArgs(3),
                RunE: func(cmd *cobra.Command, args []string) (err error) {
                    argBlack := args[0]
                    argRed := args[1]
    +              argWager, err := strconv.ParseUint(args[2], 10, 64)
    +              if err != nil {
    +                  return err
    +              }

                    clientCtx, err := client.GetClientTxContext(cmd)
                    if err != nil {
                        return err
                    }
                    msg := types.NewMsgCreateGame(
                        clientCtx.GetFromAddress().String(),
                        argBlack,
                        argRed,
    +                  argWager,
                    )
                    if err := msg.ValidateBasic(); err != nil {
                        return err
                    }
                    return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
                },
            }
            flags.AddTxFlagsToCmd(cmd)
            return cmd
        }
    ```

That is it. Adding _just a field_ is quick.

## Unit tests

Some of your unit tests no longer pass because of this new field. Ajust accordingly.

1. When creating a game:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game_test.go#L27]
        createResponse, err := msgServer.CreateGame(context, &types.MsgCreateGame{
            ...
    +      Wager: 45,
        })
    ```

2. When checking that it was saved correctly:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game_test.go#L64]
        require.EqualValues(t, types.StoredGame{
            ...
    +      Wager: 45,
        }, game1)
    ```

3. When checking that the event was emitted correctly:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-wager/x/checkers/keeper/msg_server_create_game_test.go#L114]
        require.EqualValues(t, sdk.StringEvent{
            Type: "new-game-created",
            Attributes: []sdk.Attribute{
                ...
    +          {Key: "wager", Value: "45"},
            },
        }, event)
    ```

Go ahead and make the rest of the changes as necessary.

## Interact via the CLI

With the tests done, see what happens at the command line. All there is to check at this stage is that the wager field appears where expected.

After restarting the Ignite CLI, how much do Alice and Bob have to start with?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query bank balances $alice
$ checkersd query bank balances $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    checkersd query bank balances $alice
$ docker exec -it checkers \
    checkersd query bank balances $bob
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
balances:
- amount: "100000000"
  denom: stake
- amount: "20000"
  denom: token
  pagination:
  next_key: null
  total: "0"
balances:
- amount: "100000000"
  denom: stake
- amount: "10000"
  denom: token
  pagination:
  next_key: null
  total: "0"
```

Create a game with a wager:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    checkersd tx checkers create-game $alice $bob 1000000 --from $alice
```

</CodeGroupItem>

</CodeGroup>

Which mentions the wager:

```txt
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"create_game"}]},{"type":"new-game-created","attributes":[{"key":"creator","value":"cosmos1yysy889jzf4kgd84mf6649gt6024x6upzs6pde"},{"key":"game-index","value":"1"},{"key":"black","value":"cosmos1yysy889jzf4kgd84mf6649gt6024x6upzs6pde"},{"key":"red","value":"cosmos1ktgz57udyk4sprkpm5m6znuhsm904l0een8k6y"},{"key":"wager","value":"1000000"}]}]}]'
```

Confirm that the balances of both Alice and Bob are unchanged, as expected.

Was the game stored correctly?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
storedGame:
  ...
  wager: "1000000"
```

This confirms what you expected with regards to the command-line interactions.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to add the new "wager" value, modify the "create a game" message to allow players to choose the wager they want to make, and add a helper function.
* How to save the wager and adjust an event, modifying the create game handler.
* How to minimally adjust unit tests.
* How to interact via the CLI to check that wager values are being recorded.

</HighlightBox>
