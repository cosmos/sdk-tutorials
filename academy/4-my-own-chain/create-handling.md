---
title: Message Handler - Create and Save a Game Properly
order: 7
description: You create a proper game
tag: deep-dive
---

# Message Handler - Create and Save a Game Properly

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You have Go installed.
* You have the checkers blockchain codebase with `MsgCreateGame` created by Ignite CLI. If not, follow the [previous steps](./create-message.md) and check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-msg).

</HighlightBox>

In the [previous section](./create-message.md) you added the message to create a game along with its serialization and dedicated gRPC function with the help of Ignite CLI.

Now you must add code that:

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

Given that you have already done a lot of preparatory work, what coding is involved? How do you replace `// TODO: Handling the message`?

* First, `rules` represents the ready-made file with the imported rules of the game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L8]
    import (
        rules "github.com/alice/checkers/x/checkers/rules"
    )
    ```

1. Get the new game's ID with the [`Keeper.GetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/next_game.go#L17) function created by the `ignite scaffold single nextGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```

2. Create the object to be stored:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L20-L28]
    newGame := rules.New()
    storedGame := types.StoredGame{
        Creator: msg.Creator,
        Index:   newIndex,
        Game:    newGame.String(),
        Turn:    newGame.Turn.Color,
        Red:     msg.Red,
        Black:   msg.Black,
    }
    ```

    Note the use of:

    * The [`rules.New()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/rules/checkers.go#L122) command, which is part of the Checkers rules file you imported earlier.
    * The string content of the `msg *types.MsgCreateGame`, namely `.Creator`, `.Red`, and `.Black`.

3. Confirm that the values in the object are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L29-L32]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

    `.Creator`, `.Red`, and `.Black` need to be checked because they were copied as **strings**. The check on `.Creator` is redundant because at this stage the message's signatures have been verified, and the creator is the signer.

4. Save the `StoredGame` object using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/stored_game.go#L10) function created by the `ignite scaffold map storedGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L33]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

5. Prepare the ground for the next game using the [`Keeper.SetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/next_game.go#L10) function created by Ignite CLI:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L33-L34]
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```

6. Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L38-L40]
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

## Unit tests



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
  idValue: "1"
```

</CodeGroupItem>
<CodeGroupItem title="List stored game">

```sh
$ checkersd query checkers list-stored-game
```

This returns:

```
StoredGame:
- black: cosmos14n4qkxcpr6ycct75zzp2r7v6rm96xhkegu5205
  creator: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  game: '*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*'
  index: "0"
  red: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  turn: black
pagination:
  next_key: null
  total: "0"
```

</CodeGroupItem>
<CodeGroupItem title="Show stored game">

```sh
$ checkersd query checkers show-stored-game 0
```

This returns:

```
StoredGame:
  black: cosmos14n4qkxcpr6ycct75zzp2r7v6rm96xhkegu5205
  creator: cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66
  game: '*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*'
  index: "0"
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
$ checkersd query checkers show-stored-game 0 --output json | jq ".StoredGame.game" | sed 's/"//g' | sed 's/|/\n/g'
```

</CodeGroupItem>
<CodeGroupItem title="On Mac">

```sh
$ checkersd query checkers show-stored-game 0 --output json | jq ".StoredGame.game" | sed 's/"//g' | sed 's/|/\'$'\n/g'
```

</CodeGroupItem>
</CodeGroup>

## Next up

You will modify this handling in the next sections by:

* Adding [new fields](./game-fifo.md) to the stored information.
* Adding [an event](./events.md).
* Consuming [some gas](./gas-meter.md).
* Facilitating the eventual [deadline enforcement](./game-forfeit.md).
* Adding [_money_](./game-wager.md) handling, including [foreign tokens](./wager-denom.md).

Now that a game is created, it is time to play it. That is the subject of the [next section](./play-game.md).
