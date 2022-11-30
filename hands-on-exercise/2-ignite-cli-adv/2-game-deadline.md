---
title: "Keep an Up-To-Date Game Deadline"
order: 3
description: Store field - games can expire
tags: 
  - guided-coding
  - cosmos-sdk
---

# Keep an Up-To-Date Game Deadline

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with the game FIFO. If not, follow the [previous steps](./1-game-fifo.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-fifo).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Implement a deadline.
* Work with dates.
* Extend your unit tests.

</HighlightBox>

In the [previous section](./1-game-fifo.md) you introduced a FIFO that keeps the _oldest_ games at its head and the most recently updated games at its tail.

Just because a game has not been updated in a while does not mean that it has expired. To ascertain this you need to add a new field to a game, `deadline`, and test against it.

## New information

To prepare the field, add in the `StoredGame`'s Protobuf definition:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/proto/checkers/stored_game.proto#L15]
message StoredGame {
    ...
    string deadline = 9;
}
```

To have Ignite CLI and Protobuf recompile this file, use:

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

On each update the deadline will always be _now_ plus a fixed duration. In this context, _now_ refers to the block's time. Declare this duration as a new constant, plus how the date is to be represented - encoded in the saved game as a string:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/keys.go#L57-L60]
const (
    MaxTurnDuration = time.Duration(24 * 3_600 * 1000_000_000) // 1 day
    DeadlineLayout  = "2006-01-02 15:04:05.999999999 +0000 UTC"
)
```

## Date manipulation

Helper functions can encode and decode the deadline in the storage.

1. Define a new error:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/errors.go#L20]
    ErrInvalidDeadline = sdkerrors.Register(ModuleName, 1109, "deadline cannot be parsed: %s")
    ```

2. Add your date helpers. A reasonable location to pick is `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game.go#L35-L42]
    func (storedGame *StoredGame) GetDeadlineAsTime() (deadline time.Time, err error) {
        deadline, errDeadline := time.Parse(DeadlineLayout, storedGame.Deadline)
        return deadline, sdkerrors.Wrapf(errDeadline, ErrInvalidDeadline.Error(), storedGame.Deadline)
    }

    func FormatDeadline(deadline time.Time) string {
        return deadline.UTC().Format(DeadlineLayout)
    }
    ```

   Note that `sdkerrors.Wrapf(err, ...)` conveniently returns `nil` if `err` is `nil`.

3. At the same time, add this to the `Validate` function:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game.go#L57-L62]
    ...
    _, err = storedGame.ParseGame()
    if err != nil {
        return err
    }
    _, err = storedGame.GetDeadlineAsTime()
    return err
    ```

4. Add a function that encapsulates how the next deadline is calculated in the same file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game.go#L44-L46]
    func GetNextDeadline(ctx sdk.Context) time.Time {
        return ctx.BlockTime().Add(MaxTurnDuration)
    }
    ```

## Updated deadline

Next, you need to update this new field with its appropriate value:

1. At creation, in the message handler for game creation:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_create_game.go#L31]
    ...
    storedGame := types.StoredGame{
        ...
        Deadline: types.FormatDeadline(types.GetNextDeadline(ctx)),
    }
    ```

2. After a move, in the message handler:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_play_move.go#L64]
    ...
    storedGame.MoveCount++
    storedGame.Deadline = types.FormatDeadline(types.GetNextDeadline(ctx))
    ...
    ```

Confirm that your project still compiles:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain build
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain build
```

</CodeGroupItem>

</CodeGroup>

## Unit tests

After these changes, your previous unit tests fail. Fix them by adding `Deadline` wherever it should be. Do not forget that the time is taken from the block's timestamp. In the case of tests, it is stored in the context's `ctx.BlockTime()`. In effect, you need to add this single line:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_reject_game_fifo_test.go#L41]
ctx := sdk.UnwrapSDKContext(context)
...
require.EqualValues(t, types.StoredGame{
    ...
    Deadline:  types.FormatDeadline(ctx.BlockTime().Add(types.MaxTurnDuration)),
}, game)
```

Also add a couple of unit tests that confirm the `GetDeadlineAsTime` function [works as intended](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game_test.go#L103-L117) and that the dates saved [on create](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_create_game_test.go#L327-L339) and [on play](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_play_move_test.go#L389-L404) are parseable.

## Interact via the CLI

There is not much to test here. Remember that you added a new field, but if your blockchain state already contains games then they are missing the new field:

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

This demonstrates some missing information:

```txt
...
  deadline: ""
  ...
```

In effect, your blockchain state is broken. Examine the [section on migrations](/hands-on-exercise/4-run-in-prod/2-migration.md) to see how to update your blockchain state to avoid such a breaking change. This broken state still lets you test the update of the deadline on play:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This contains:

```txt
...
  deadline: 2022-02-05 15:26:26.832533 +0000 UTC
...
```

In the same vein, you can create a new game and confirm it contains the deadline.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to implement a new `deadline` field and work with dates to enable the application to check whether games which have not been recently updated have expired or not.
* How the deadline must use the block's time as its reference point, since a non-deterministic `Date.now()` would change with each execution.
* How to test your code to ensure that it functions as desired.
* How to interact with the CLI to create a new game with the deadline field in place
* How, if your blockchain contains preexisting games, that the blockchain state is now effectively broken, since the deadline field of those games demonstrates missing information (which can be corrected through migration).

</HighlightBox>

<!--## Next up

You have created and updated the deadline. The [section two steps ahead](./1-game-forfeit.md) describes how to use the deadline.

Before you can do that, there is one other field you need to add. Discover which in the [next section](./3-game-winner.md).-->
