---
title: "Store Field - Keep an Up-To-Date Game Deadline"
order: 6
description: Games can expire
tag: deep-dive
---

# Store Field - Keep an Up-To-Date Game Deadline

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with the game FIFO. If not, follow the [previous steps](./game-fifo.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-fifo).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Implement a deadline.
* Work with dates.
* Extend your unit tests.

</HighlightBox>

In the [previous section](./game-fifo.md) you introduced a FIFO that keeps the _oldest_ games at its head and the most recently updated games at its tail.

Just because a game has not been updated in a while does not mean that it has expired. To ascertain this you need to add a new field to a game, `deadline`, and test against it.

## New information

To prepare the field, add in the `StoredGame`'s Protobuf definition:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/proto/checkers/stored_game.proto#L16]
message StoredGame {
    ...
    string deadline = 10;
}
```

To have Ignite CLI and Protobuf recompile this file, use:

```sh
$ ignite generate proto-go
```

On each update the deadline will always be _now_ plus a fixed duration. In this context, _now_ refers to the block's time. Declare this duration as a new constant, plus how the date is to be represented, i.e. encoded in the saved game as a string:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/types/keys.go#L38-L39]
const (
    MaxTurnDuration = time.Duration(24 * 3_600 * 1000_000_000) // 1 day
    DeadlineLayout  = "2006-01-02 15:04:05.999999999 +0000 UTC"
)
```

## Date manipulation

Helper functions can encode and decode the deadline in the storage.

1. Define a new error:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/types/errors.go#L21]
    ErrInvalidDeadline = sdkerrors.Register(ModuleName, 1110, "deadline cannot be parsed: %s")
    ```

2. Add your date helpers. A reasonable location to pick is `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/types/full_game.go#L40-L51]
    func (storedGame *StoredGame) GetDeadlineAsTime() (deadline time.Time, err error) {
        deadline, errDeadline := time.Parse(DeadlineLayout, storedGame.Deadline)
        return deadline, sdkerrors.Wrapf(errDeadline, ErrInvalidDeadline.Error(), storedGame.Deadline)
    }

    func FormatDeadline(deadline time.Time) string {
        return deadline.UTC().Format(DeadlineLayout)
    }
    ```

   Note that `sdkerrors.Wrapf(err, ...)` conveniently returns `nil` if `err` is `nil`.

3. Add a function that encapsulates how the next deadline is calculated in the same file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/types/full_game.go#L45-L47]
    func GetNextDeadline(ctx sdk.Context) time.Time {
        return ctx.BlockTime().Add(MaxTurnDuration)
    }
    ```

## Updated deadline

Next, you need to update this new field with its appropriate value:

1. At creation, in the message handler for game creation:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/keeper/msg_server_create_game.go#L30]
    ...
    storedGame := types.StoredGame{
        ...
        Deadline: types.FormatDeadline(types.GetNextDeadline(ctx)),
    }
    ```

2. After a move, in the message handler:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/keeper/msg_server_play_move.go#L60]
    ...
    storedGame.MoveCount++
    storedGame.Deadline = types.FormatDeadline(types.GetNextDeadline(ctx))
    ...
    ```

Confirm that your project still compiles:

```sh
$ ignite chain build
```

## Unit tests

After these changes, your previous unit tests fail. Fix them by adding `Deadline` wherever it should be. Do not forget that the time is taken from the block's timestamp. In the case of tests, it is stored in the context's `ctx.BlockTime()`. In effect, you need to add this single line:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/58199af8/x/checkers/keeper/msg_server_reject_game_fifo_test.go#L43]
ctx := sdk.UnwrapSDKContext(context)
...
require.EqualValues(t, types.StoredGame{
    ...
    Deadline:  types.FormatDeadline(ctx.BlockTime().Add(types.MaxTurnDuration)),
}, game)
```

## Interact via the CLI

There is not much to test here. Remember that you added a new field, but if your blockchain state already contains games then they are missing the new field:

```sh
$ checkersd query checkers show-stored-game 1
```

This demonstrates some missing information:

```
...
  deadline: ""
 ...
```

In effect, your blockchain state is broken. Examine the [section on migrations](./migration.md) to see how to update your blockchain state to avoid such a breaking change. This broken state still lets you test the update of the deadline on play:

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob
$ checkersd query checkers show-stored-game 1
```

This contains:

```
...
  deadline: 2022-02-05 15:26:26.832533 +0000 UTC
...
```

In the same vein, you can create a new game and confirm it contains the deadline.

## Next up

You have created and updated the deadline. The [section two steps ahead](./game-forfeit.md) describes how to use the deadline.

Before you can do that, there is one other field you need to add. Discover which in the [next section](./game-winner.md).
