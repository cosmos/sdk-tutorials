---
title: Store Field - Keep an Up-To-Date Game Deadline
order: 12
description: You expire games
tag: deep-dive
---

# Store Field - Keep an Up-To-Date Game Deadline

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md).
* Have Go installed.
* The checkers blockchain codebase with the game FIFO. You can get there by following the [previous steps](./game-fifo.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-fifo).

</HighlightBox>

In the [previous section](./game-fifo.md) you introduced a FIFO that keeps the _oldest_ games at its head and the most recently updated games at its tail.

Just because a game has not been updated in a while does not mean that it has expired. To ascertain this you need to add a new field, `deadline`, to a game and test against it. Time to prepare the field.

## New information

To prepare the field, add in the `StoredGame`'s Protobuf definition:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/proto/checkers/stored_game.proto#L18]
message StoredGame {
    ...
    string deadline = 10;
}
```

To have Ignite CLI and Protobuf recompile this file. You can use:

```sh
$ ignite generate proto-go
```

On each update the deadline will always be _now_ plus a fixed duration. In this context, _now_ refers to the block's time. Declare this duration as a new constant, along with how the date is to be represented, i.e. encoded in the saved game as a string:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/keys.go#L38-L39]
const (
    MaxTurnDurationInSeconds = time.Duration(24 * 3_600 * 1000_000_000) // 1 day
    DeadlineLayout           = "2006-01-02 15:04:05.999999999 +0000 UTC"
)
```

## Date manipulation

You can make your life easier by using helper functions that encode and decode the deadline in the storage.

1. First define a new error:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/errors.go#L21]
    ErrInvalidDeadline = sdkerrors.Register(ModuleName, 1110, "deadline cannot be parsed: %s")
    ```

2. Now you can add your date helpers. A reasonable location to pick is `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/full_game.go#L37-L48]
    func (storedGame *StoredGame) GetDeadlineAsTime() (deadline time.Time, err error) {
        deadline, errDeadline := time.Parse(DeadlineLayout, storedGame.Deadline)
        return deadline, sdkerrors.Wrapf(errDeadline, ErrInvalidDeadline.Error(), storedGame.Deadline)
    }

    func FormatDeadline(deadline time.Time) string {
        return deadline.UTC().Format(DeadlineLayout)
    }
    ```

    Of note in the above is that `sdkerrors.Wrapf(err, ...)` returns `nil` if `err` is `nil`. This is very convenient.

3. Add a function that encapsulates the knowledge of how the next deadline is calculated in the same file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/full_game.go#L42-L44]
    func GetNextDeadline(ctx sdk.Context) time.Time {
        return ctx.BlockTime().Add(MaxTurnDurationInSeconds)
    }
    ```

## Updated deadline

Next you need to update this new field with its appropriate value:

1. At creation in the message handler for game creation:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/keeper/msg_server_create_game.go#L26]
    ...
    storedGame := types.StoredGame{
        ...
        Deadline: types.FormatDeadline(types.GetNextDeadline(ctx)),
    }
    ```

2. And after a move in the message handler:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/keeper/msg_server_play_move.go#L56]
    ...
    storedGame.MoveCount++
    storedGame.Deadline = types.FormatDeadline(types.GetNextDeadline(ctx))
    ...
    ```

Now confirm that your project still compiles:

```sh
$ ignite chain build
```

## Next up

You have created and updated the deadline. The [section two steps ahead](./game-forfeit.md) describes how to use the deadline and [the FIFO](./game-fifo.md) to expire games that reached their deadline.

Before you can do that there is one other field you need to add. Discover which in the [next section](./game-winner.md).
