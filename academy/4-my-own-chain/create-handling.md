---
title: Create the Game Handling
order: 7
description: You create a proper game
tag: deep-dive
---

# Create the Game Handling

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* Have Go installed.
* The checkers blockchain codebase with `MsgCreateGame` created by Starport. You can get there by following the [previous steps](./create-message.md) checking out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-msg).

</HighlightBox>

You added the message to create a game along with its serialization and dedicated gRPC function with the help of Starport in the [previous section](./create-message.md).

Now all that remains is to add code that:

* Creates a brand new game.
* Saves it in storage.
* Returns the ID of the new game.

Starport isolated this concern into a separate file, `x/checkers/keeper/msg_server_create_game.go`, for you to edit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```

All the message processing code was created for you and all you are left to do is code the meat of the action. Opting for Starport is a wise decision as you can see.

Given that you have already done a lot of preparatory work: what is involved in coding the action? With what do you replace `// TODO: Handling the message`?

* First, `rules` represent the ready-made file with the imported rules of the game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L8]
    import (
        rules "github.com/alice/checkers/x/checkers/rules"
    )
    ```

1. Get the new game's ID:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```

    Using the [`Keeper.GetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/next_game.go#L17) function created by the `starport scaffold single nextGame...` command.

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

    Notice the use of:

    * The [`rules.New()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/rules/checkers.go#L122) command, which is part of the Checkers rules file you imported earlier.
    * The string content of the `msg *types.MsgCreateGame` namely `.Creator`, `.Red`, and `.Black`.

3. Confirm that the values in it are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L29-L32]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

    The `.Creator`, `.Red`, and `.Black` need to be checked because they were copied as **strings**. The check on `.Creator` is redundant here because at this stage the message's signatures have been verified and in particular the creator is the signer.

4. Save the `StoredGame` object:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L33]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

    Using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/stored_game.go#L10) function created by the `starport scaffold map storedGame...` command.

5. Prepare the ground for the next game with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L33-L34]
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```

    Using the [`Keeper.SetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/next_game.go#L10) function created by Starport.

6. Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8092e4b/x/checkers/keeper/msg_server_create_game.go#L38-L40]
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

## Interact via the CLI

Time to confirm that the transaction creates a game this time. Start with:

```sh
$ starport chain serve
```

And send your transaction, the same as in the [previous section](./create-message.md):

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

There is a first hint of a good sign in the output; `gas_used` is a bit higher than earlier: `gas_used: "50671"`. Confirm the current state:

<CodeGroup>
<CodeGroupItem title="show-next-game" active>

```sh
$ checkersd query checkers show-next-game
```

Which returns:

```
NextGame:
  creator: ""
  idValue: "1"
```

</CodeGroupItem>
<CodeGroupItem title="list-stored-game">

```sh
$ checkersd query checkers list-stored-game
```

Which returns:

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
<CodeGroupItem title="show-stored-game">

```sh
$ checkersd query checkers show-stored-game 0
```

Which returns:

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

You can also get it in a one-liner:

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

You will modify this handling in the next sections:

* To add [new fields](./game-fifo.md) to the stored information.
* To add [an event](./events.md).
* To consume [some gas](./gas-meter.md).
* To facilitate the eventual [deadline enforcement](./game-forfeit.md).
* To add [_money_](./game-wager.md) handling including [foreign tokens](./wager-denom.md).

Now that a game is created, it is time to play it. That is the subject of the [next section](./play-game.md).
