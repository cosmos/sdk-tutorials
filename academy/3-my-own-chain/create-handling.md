---
title: "Message Handler - Create and Save a Game Properly"
order: 8
description: Create a proper game
tag: deep-dive
---

# Message Handler - Create and Save a Game Properly

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You have Go installed.
* You have the checkers blockchain codebase with `MsgCreateGame` created by Ignite CLI. If not, follow the [previous steps](./create-message.md) and check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-create-game-msg).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add application rules - the rules of checkers.
* Add a Message Handler to create a game and return its ID.

</HighlightBox>

In the [previous section](./create-message.md), you added the message to create a game along with its serialization and dedicated gRPC function with the help of Ignite CLI.

However, it does not create a game yet because you have not implemented the message handling. How would you do this?

## Some initial thoughts

Dwell on the following questions to guide you in the exercise:

* How do you sanitize your inputs?
* How do you avoid conflicts with past and future games?
* How do you use your files that implement the Checkers rules?

## Code needs

* No Ignite CLI is involved here, it is just Go.
* Of course, you need to know where to put your code - look for `TODO`.
* How would you unit-test this message handling?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

For now, do not bother with niceties like gas metering or event emission.

You must add code that:

* Creates a brand new game.
* Saves it in storage.
* Returns the ID of the new game.

Ignite CLI isolated this concern into a separate file, `x/checkers/keeper/msg_server_create_game.go`, for you to edit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```

Ignite CLI has conveniently created all the message processing code for you. You are only required to code the key features.

## Coding steps

Given that you have already done a lot of preparatory work, what coding is involved? How do you replace `// TODO: Handling the message`?

* First, `rules` represents the ready-made file with the imported rules of the game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L8]
    import (
        rules "github.com/alice/checkers/x/checkers/rules"
    )
    ```

1. Get the new game's ID with the [`Keeper.GetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/next_game.go#L17) function created by the `ignite scaffold single nextGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```

2. Create the object to be stored:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L20-L28]
    newGame := rules.New()
    storedGame := types.StoredGame{
        Creator: msg.Creator,
        Index:   newIndex,
        Game:    newGame.String(),
        Turn:    rules.PieceStrings[newGame.Turn],
        Red:     msg.Red,
        Black:   msg.Black,
    }
    ```

    Note the use of:

    * The [`rules.New()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/rules/checkers.go#L122) command, which is part of the Checkers rules file you imported earlier.
    * The string content of the `msg *types.MsgCreateGame`, namely `.Creator`, `.Red`, and `.Black`.

3. Confirm that the values in the object are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L29-L32]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

    `.Creator`, `.Red`, and `.Black` need to be checked because they were copied as **strings**. The check on `.Creator` is redundant because at this stage the message's signatures have been verified, and the creator is the signer.

4. Save the `StoredGame` object using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/stored_game.go#L10) function created by the `ignite scaffold map storedGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L33]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

5. Prepare the ground for the next game using the [`Keeper.SetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/next_game.go#L10) function created by Ignite CLI:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L35-L36]
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```

6. Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game.go#L38-L40]
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

## Unit tests

Try the unit test you prepared in the previous section again:

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

This should fail with:

```
panic: NextGame not found [recovered]
        panic: NextGame not found
...
```

Your keeper was initialized with an empty genesis. You must fix that one way or another.

You can fix this by always initializing the keeper with the default genesis. However such a default initialization may not always be desirable. So it is better to keep this default initialization closest to the tests. Copy the `setupMsgServer` from [`msg_server_test.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_test.go#L12-L15) into your `msg_server_create_game_test.go`. Modify it to also return the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L20-L24]
func setupMsgServerCreateGame(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context) {
    k, ctx := setupKeeper(t)
    checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
    return keeper.NewMsgServerImpl(*k), *k, sdk.WrapSDKContext(ctx)
}
```

Note the new import:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L9]
import (
    "github.com/xavierlepretre/checkers/x/checkers"
)
```

Unfortunately, this created an import cycle. To fix that, use the better practice of suffixing `_test` to the package of your test files:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L1]
package keeper_test
```

You should fix the package in all [the](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/grpc_query_next_game_test.go#L1) [other](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/grpc_query_stored_game_test.go#L1) [test](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/keeper_test.go#L1) [files](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_test.go#L1) in your keeper folder. Afterward, run the tests again with the same command as before:

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

The error has changed, and you need to adjust the expected value as per the default genesis:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L34-L36]
require.EqualValues(t, types.MsgCreateGameResponse{
    IdValue: "1",
}, *createResponse)
```

One unit test is good, but you can add more, in particular testing whether the values in storage are as expected when you create a single game:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L39-L62]
func TestCreate1GameHasSaved(t *testing.T) {
    msgSrvr, keeper, context := setupMsgServerCreateGame(t)
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
    })
    nextGame, found := keeper.GetNextGame(sdk.UnwrapSDKContext(context))
    require.True(t, found)
    require.EqualValues(t, types.NextGame{
        Creator: "",
        IdValue: 2,
    }, nextGame)
    game1, found1 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Creator: alice,
        Index:   "1",
        Game:    "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:    "b",
        Red:     bob,
        Black:   carol,
    }, game1)
}
```

Or when you [create 3](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L109-L134) games. Other tests could include whether the _get all_ functionality works as expected after you have created [1 game](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L64-L81), or [3](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L191-L234), or if you create a game in a hypothetical [far future](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L236-L267). Also add games with [badly formatted](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L83-L94) or [missing input](https://github.com/cosmos/b9-checkers-academy-draft/blob/b79a43c/x/checkers/keeper/msg_server_create_game_test.go#L96-L107).

## Interact via the CLI

Now you must confirm that the transaction creates a game. Start with:

```sh
$ ignite chain serve
```

Send your transaction as you did in the [previous section](./create-message.md):

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

A good sign is that the output `gas_used` is slightly higher than it was before (`gas_used: "50671"`). Confirm the current state:

<CodeGroup>
<CodeGroupItem title="Show next game" active>

```sh
$ checkersd query checkers show-next-game
```

This returns:

```
NextGame:
  creator: ""
  idValue: "2"
```

</CodeGroupItem>
<CodeGroupItem title="List stored games">

```sh
$ checkersd query checkers list-stored-game
```

This returns:

```
StoredGame:
- black: cosmos14n4qkxcpr6ycct75zzp2r7v6rm96xhkegu5205
  creator: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  game: '*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*'
  index: "1"
  red: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  turn: black
pagination:
  next_key: null
  total: "0"
```

</CodeGroupItem>
<CodeGroupItem title="Show stored game">

```sh
$ checkersd query checkers show-stored-game 1
```

This returns:

```
StoredGame:
  black: cosmos14n4qkxcpr6ycct75zzp2r7v6rm96xhkegu5205
  creator: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  game: '*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*'
  index: "1"
  red: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  turn: black
```

</CodeGroupItem>
</CodeGroup>

---

Now your game is in the blockchain's storage. Notice how `bob` was given the black pieces and it is already his turn to play. As a note for the next sections, this is how to understand the board:

```
*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*
                   ^X:1,Y:2                              ^X:3,Y:6
```

Or if placed in a square:

```
X 01234567
  *b*b*b*b 0
  b*b*b*b* 1
  *b*b*b*b 2
  ******** 3
  ******** 4
  r*r*r*r* 5
  *r*r*r*r 6
  r*r*r*r* 7
           Y
```

You can also get this in a one-liner:

<CodeGroup>
<CodeGroupItem title="On Linux" active>

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".StoredGame.game" | sed 's/"//g' | sed 's/|/\n/g'
```

</CodeGroupItem>
<CodeGroupItem title="On Mac">

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".StoredGame.game" | sed 's/"//g' | sed 's/|/\'$'\n/g'
```

</CodeGroupItem>
</CodeGroup>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to implement a Message Handler that will create a new game, save it in storage, and return its ID on receiving the approapriate prompt message.
* How to create unit tests to demonstrate the validity of your code.
* How to interact via the CLI to confirm that sending the appropriate transaction will successfully create a game.

</HighlightBox>

## Overview of upcoming content

You will learn how to modify this handling in later sections by:

* Adding [new fields](../3-my-own-chain/game-fifo.md) to the stored information.
* Adding [an event](./events.md).
* Consuming [some gas](../3-my-own-chain/gas-meter.md).
* Facilitating the eventual [deadline enforcement](../3-my-own-chain/game-forfeit.md).
* Adding [_money_](../3-my-own-chain/game-wager.md) handling, including [foreign tokens](../3-my-own-chain/wager-denom.md).

<!--Now that a game is created, it is time to play it by adding moves. That is the subject of the [next section](./play-game.md).-->
