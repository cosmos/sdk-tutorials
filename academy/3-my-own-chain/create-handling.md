---
title: "Message Handler - Create and Save a Game Properly"
order: 8
description: Create a proper game
tags: 
  - guided-coding
  - cosmos-sdk
---

# Message Handler - Create and Save a Game Properly

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You have Go installed.
* You have the checkers blockchain codebase with `MsgCreateGame` created by Ignite CLI. If not, follow the [previous steps](./create-message.md) and check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-msg).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Make use of the rules of checkers.
* Update the message handler to create a game and return its ID.

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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/msg_server_create_game.go#L10-L17]
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

1. First, `rules` represents the ready-made file with the imported rules of the game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L7]
    import (
        "github.com/alice/checkers/x/checkers/rules"
    )
    ```

2. Get the new game's ID with the [`Keeper.GetSystemInfo`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/system_info.go#L17) function created by the `ignite scaffold single systemInfo...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    systemInfo, found := k.Keeper.GetSystemInfo(ctx)
    if !found {
        panic("SystemInfo not found")
    }
    newIndex := strconv.FormatUint(systemInfo.NextId, 10)
    ```

    <HighlightBox type="info">

    You panic if you cannot find the `SystemInfo` object because there is no way to continue if it is not there. It is not like a user error, which would warrant returning an error.

    </HighlightBox>

3. Create the object to be stored:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L21-L28]
    newGame := rules.New()
    storedGame := types.StoredGame{
        Index: newIndex,
        Board: newGame.String(),
        Turn:  rules.PieceStrings[newGame.Turn],
        Black: msg.Black,
        Red:   msg.Red,
    }
    ```

    <HighlightBox type="note">

    Note the use of:

    * The [`rules.New()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/rules/checkers.go#L122) command, which is part of the Checkers rules file you imported earlier.
    * The string content of the `msg *types.MsgCreateGame`, namely `.Black` and `.Red`.

    Also note that you lose the information about the creator. If your design is different, you may want to keep this information.

    </HighlightBox>

4. Confirm that the values in the object are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L30-L33]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

    `.Red`, and `.Black` need to be checked because they were copied as **strings**. You do not need to check `.Creator` because at this stage the message's signatures have been verified, and the creator is the signer.

    <HighlightBox type="note">

    Note that by returning an error, instead of calling `panic`, players cannot stall your blockchain. They can still spam but at a cost, because they will still pay the gas fee up to this point.

    </HighlightBox>

5. Save the `StoredGame` object using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/stored_game.go#L10) function created by the `ignite scaffold map storedGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L35]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

6. Prepare the ground for the next game using the [`Keeper.SetSystemInfo`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/system_info.go#L10) function created by Ignite CLI:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L36-L37]
    systemInfo.NextId++
    k.Keeper.SetSystemInfo(ctx, systemInfo)
    ```

7. Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game.go#L39-L41]
    return &types.MsgCreateGameResponse{
        GameIndex: newIndex,
    }, nil
    ```

You just handled the _create game_ message by actually creating the game.

## Unit tests

Try the unit test you prepared in the previous section again:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

</CodeGroup>

This should fail with:

```
panic: SystemInfo not found [recovered]
        panic: SystemInfo not found
...
```

Your keeper was initialized with an empty genesis. You must fix that one way or another.

You can fix this by always initializing the keeper with the default genesis. However such a default initialization may not always be desirable. So it is better to keep this default initialization closest to the tests. Copy the `setupMsgServer` from [`msg_server_test.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_test.go#L13-L16) into your `msg_server_create_game_test.go`. Modify it to also return the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L21-L25]
func setupMsgServerCreateGame(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context) {
    k, ctx := keepertest.CheckersKeeper(t)
    checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
    return keeper.NewMsgServerImpl(*k), *k, sdk.WrapSDKContext(ctx)
}
```

<HighlightBox type="note">

Note the new import:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L8]
import (
    "github.com/alice/checkers/x/checkers"
)
```

</HighlightBox>

Run the tests again with the same command as before:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

</CodeGroup>

The error has changed to `Not equal`, and you need to adjust the expected value as per the default genesis:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L35-L37]
require.EqualValues(t, types.MsgCreateGameResponse{
    GameIndex: "1",
}, *createResponse)
```

One unit test is good, but you can add more, in particular testing whether the values in storage are as expected when you create a single game:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L40-L62]
func TestCreate1GameHasSaved(t *testing.T) {
    msgSrvr, keeper, context := setupMsgServerCreateGame(t)
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
    })
    systemInfo, found := keeper.GetSystemInfo(sdk.UnwrapSDKContext(context))
    require.True(t, found)
    require.EqualValues(t, types.SystemInfo{
        NextId: 2,
    }, systemInfo)
    game1, found1 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Index: "1",
        Board: "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:  "b",
        Black: bob,
        Red:   carol,
    }, game1)
}
```

Or when you [create 3](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L108-L133) games. Other tests could include whether the _get all_ functionality works as expected after you have created [1 game](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L64-L80), or [3](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L187-L227), or if you create a game in a hypothetical [far future](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L229-L258). Also add games with [badly formatted](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L82-L93) or [missing input](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L95-L106).

## Interact via the CLI

Now you can also confirm that the transaction creates a game via the CLI. Start with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain serve
```

</CodeGroupItem>

</CodeGroup>

Send your transaction as you did in the [previous section](./create-message.md#interact-via-the-cli):

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

</CodeGroupItem>

</CodeGroup>

A first good sign is that the output `gas_used` is slightly higher than it was before (`gas_used: "52498"`). After the transaction has been validated, confirm the current state.

Show the system info:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
SystemInfo:
  nextId: "2"
```

List all stored games:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers list-stored-game
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers list-stored-game
```

</CodeGroupItem>

</CodeGroup>

This returns a game at index `1` as expected:

```txt
pagination:
  next_key: null
  total: "0"
storedGame:
- black: cosmos169mc8qqd6tlued00z23fs75tyecfcazpuwapc4
  board: '*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*'
  index: "1"
  red: cosmos10mqyvj55hm4wunsd62wprwfv9ehcerkfghcjfl
  turn: b
```

Show the new game alone:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
storedGame:
  black: cosmos169mc8qqd6tlued00z23fs75tyecfcazpuwapc4
  board: '*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*'
  index: "1"
  red: cosmos10mqyvj55hm4wunsd62wprwfv9ehcerkfghcjfl
  turn: b
```

Now your game is in the blockchain's storage. Notice how `alice` was given the black pieces and it is already her turn to play. As a note for the next sections, this is how to understand the board:

```txt
*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*
                   ^X:1,Y:2                              ^X:3,Y:6
```

Or if placed in a square:

```txt
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

<CodeGroupItem title="Linux" active>

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".storedGame.board" | sed 's/"//g' | sed 's/|/\n/g'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "checkersd query checkers show-stored-game 1 --output json | jq \".storedGame.board\" | sed 's/\"//g' | sed 's/|/\n/g'"
```

</CodeGroupItem>

<CodeGroupItem title="Mac">

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".storedGame.board" | sed 's/"//g' | sed 's/|/\'$'\n/g'
```

</CodeGroupItem>

</CodeGroup>

When you are done with this exercise you can stop Ignite's `chain serve.`

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to implement a Message Handler that will create a new game, save it in storage, and return its ID on receiving the appropriate prompt message.
* How to create unit tests to demonstrate the validity of your code.
* How to interact via the CLI to confirm that sending the appropriate transaction will successfully create a game.

</HighlightBox>

## Overview of upcoming content

You will learn how to modify this handling in later sections by:

* Adding [new fields](./game-fifo.md) to the stored information.
* Adding [an event](./events.md).
* Consuming [some gas](./gas-meter.md).
* Facilitating the eventual [deadline enforcement](./game-forfeit.md).
* Adding [_money_](./game-wager.md) handling, including [foreign tokens](./wager-denom.md).

<!--Now that a game is created, it is time to play it by adding moves. That is the subject of the [next section](./play-game.md).-->
