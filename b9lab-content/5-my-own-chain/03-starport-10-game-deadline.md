---
title: A Game Deadline
order: 12
description: You expire games
---

# A Game Deadline

In the [previous section](./03-starport-09-game-fifo.md), you introduced a FIFO that keeps the _oldest_ games at its head and the most recently updated games at its tail.

Just because a game is old, it does not necessarily mean it expired. To ascertain this, you need to add a new field, `deadline`, to a game and test against it. Let's prepare the field.

## New information

To prepare the field, add in `proto/checkers/stored_game.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/proto/checkers/stored_game.proto#L18]
message StoredGame {
    ...
    string deadline = 10;
}
```

To have Starport and Protobuf recompile this file, you can use:

```sh
$ starport generate proto-go
```

On each update, the deadline will always be _now_, defined as the block's time plus a fixed duration. Declare this duration in `x/checkers/types/keys.go`, along with how the date is represented in the saved game, as a string:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/keys.go#L38-L39]
const (
    MaxTurnDurationInSeconds = time.Duration(24 * 3_600 * 1000_000_000) // 1 day
    DeadlineLayout           = "2006-01-02 15:04:05.999999999 +0000 UTC"
)
```

## Date manipulation

You can make your life easier by using helper functions that encode and decode the deadline in the storage. First, a new error in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/errors.go#L21]
ErrInvalidDeadline = sdkerrors.Register(ModuleName, 1110, "deadline cannot be parsed: %s")
```

And, one in `x/checkers/types/full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/full_game.go#L37-L48]
func (storedGame *StoredGame) GetDeadlineAsTime() (deadline time.Time, err error) {
    deadline, errDeadline := time.Parse(DeadlineLayout, storedGame.Deadline)
    return deadline, sdkerrors.Wrapf(errDeadline, ErrInvalidDeadline.Error(), storedGame.Deadline)
}

func FormatDeadline(deadline time.Time) string {
    return deadline.UTC().Format(DeadlineLayout)
}
```

While you are at it, add a function that encapsulates the knowledge of how the next deadline is calculated in the same file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/types/full_game.go#L42-L44]
func GetNextDeadline(ctx sdk.Context) time.Time {
    return ctx.BlockTime().Add(MaxTurnDurationInSeconds)
}
```

## Updated deadline

Next you need to update this new field with its appropriate value at the right junctures: at creation, in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/keeper/msg_server_create_game.go#L26]
...
storedGame := types.StoredGame{
    ...
    Deadline: types.FormatDeadline(types.GetNextDeadline(ctx)),
}
```

And after a move in `x/checkers/keeper/msg_server_play_move.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0d0e36a8ac86cddc457610856ddaab1b356cee84/x/checkers/keeper/msg_server_play_move.go#L56]
...
storedGame.MoveCount++
storedGame.Deadline = types.FormatDeadline(types.GetNextDeadline(ctx))
...
```

Finally, confirm that your project still compiles:

```sh
$ starport chain build
```

When it comes to adding and updating a deadline, this is all you need. 

We have not used the deadline yet. That is the object of the [next section](./03-starport-11-game-winner.md), in which you can find a description on how to use the deadline and the FIFO to expire games that reached their deadline.

Before you can do that, there is one other field to add, discover which in the [next section](03-starport-11-game-winner.md).
