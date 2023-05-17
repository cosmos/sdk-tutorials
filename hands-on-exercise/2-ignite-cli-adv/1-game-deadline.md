---
title: "Keep an Up-To-Date Game Deadline"
order: 2
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
* You have the checkers blockchain codebase with the game winner. If not, follow the [previous steps](/hands-on-exercise/1-ignite-cli/8-game-winner.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-winner).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Implement a deadline.
* Work with dates.
* Extend your unit tests.

</HighlightBox>

In a [previous step](/hands-on-exercise/1-ignite-cli/6-play-game.md), you made it possible for players to play, and you recorded the [eventual winner](/hands-on-exercise/1-ignite-cli/8-game-winner.md). Presumably _most_ players will play their games until they reach a resolution... but not 100% of them. Some players will forget about their games, no longer care, or simply stop playing when it is obvious they are losing.

Therefore, your blockchain is at risk of accumulating stale games in its storage. Eventually you want to let players wager on the outcome of games, so you do not want games remaining in limbo if they have _value_ assigned. This is one more reason why you need a way for games to be forcibly resolved if one player stops participating.

To take care of this, you could imagine creating new messages. For instance, a player whose opponent has disappeared could raise a flag in order to seek a resolution. That would most likely require the introduction of a deadline to prevent malicious flag raising, and for the deadline to be pushed back every time a move is played.

Another way would be to have the blockchain system resolve _by forfeit_ the stale games on its own. This is the path that this exercise takes. To achieve that, it needs a deadline. This deadline, and its testing, is the object of this section.

## Some initial thoughts

Before you begin touching your code, ask:

* What conditions have to be satisfied for a game to be considered stale and for the blockchain to act?
* How do you sanitize the new information inputs?
* How would you get rid of stale games as part of the protocol, that is _without user inputs_?
* How do you optimize performance and data structures so that a few stale games do not cause your blockchain to grind to a halt?
* How can you be sure that your blockchain is safe from attacks?
* How do you make your changes compatible with future plans for wagers?
* Are there errors to report back?
* What event should you emit?

These are important questions, but not all are answered in this section. For instance, the question about performance and data structures is solved in the following sections.

## New information

To prepare the field, add in the `StoredGame`'s Protobuf definition:

```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/proto/checkers/stored_game.proto#L13]
    message StoredGame {
        ...
+      string deadline = 7;
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
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    ignite generate proto-go
```

</CodeGroupItem>

</CodeGroup>

On each update the deadline will always be _now_ plus a fixed duration. In this context, _now_ refers to **the block's time**. If you tried to use the _node's_ time at the time of execution you would break the consensus, as no two nodes would have the same execution time.

Declare this duration as a new constant, plus how the date is to be represented – encoded in the saved game as a string:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/keys.go#L48-L51]
const (
    MaxTurnDuration = time.Duration(24 * 3_600 * 1000_000_000) // 1 day
    DeadlineLayout  = "2006-01-02 15:04:05.999999999 +0000 UTC"
)
```

## Date manipulation

Helper functions can encode and decode the deadline in the storage.

1. Define a new error:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/errors.go#L19]
        var (
            ...
    +      ErrInvalidDeadline = sdkerrors.Register(ModuleName, 1108, "deadline cannot be parsed: %s")
        )
    ```

2. Add your date helpers. A reasonable location to pick is `full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game.go#L55-L62]
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

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game.go#L78-L81]
        ...
        _, err = storedGame.ParseGame()
    +  if err != nil {
    +      return err
    +  }
    +  _, err = storedGame.GetDeadlineAsTime()
        return err
    ```

4. Add a function that encapsulates how the next deadline is calculated in the same file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game.go#L64-L66]
    func GetNextDeadline(ctx sdk.Context) time.Time {
        return ctx.BlockTime().Add(MaxTurnDuration)
    }
    ```

## Updated deadline

Next, you need to update this new field with its appropriate value:

1. At creation, in the message handler for game creation:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_create_game.go#L29]
        ...
        storedGame := types.StoredGame{
            ...
    +      Deadline: types.FormatDeadline(types.GetNextDeadline(ctx)),
        }
    ```

2. After a move, in the message handler:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_play_move.go#L70]
        ...
    +  storedGame.Deadline = types.FormatDeadline(types.GetNextDeadline(ctx))
        storedGame.Turn = rules.PieceStrings[game.Turn]
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
$ docker run --rm -it \
    --name checkers \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    ignite chain build
```

</CodeGroupItem>

</CodeGroup>

## Unit tests

After these changes, your previous unit tests fail. Fix them by adding `Deadline` wherever it should be. Do not forget that the time is taken from the block's timestamp. In the case of tests, it is stored in the context's `ctx.BlockTime()`. In effect, you need to add this single line:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_play_move_test.go#L108]
    ctx := sdk.UnwrapSDKContext(context)
    ...
    require.EqualValues(t, types.StoredGame{
        ...
+      Deadline:  types.FormatDeadline(ctx.BlockTime().Add(types.MaxTurnDuration)),
    }, game1)
```

Also add a couple of unit tests that confirm the `GetDeadlineAsTime` function [works as intended](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/types/full_game_test.go#L178-L192) and that the dates saved [on create](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_create_game_test.go#L297-L309) and [on play](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-deadline/x/checkers/keeper/msg_server_play_move_test.go#L379-L394) are parseable.

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
$ docker exec -it checkers \
    checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This demonstrates some missing information:

```diff-txt
    ...
+  deadline: ""
    ...
```

In effect, your blockchain state is broken. Eventually examine the [section on migrations](/hands-on-exercise/4-run-in-prod/2-migration-info.md) to see how to update your blockchain state to avoid such a breaking change. This broken state still lets you test the update of the deadline on play:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    checkersd tx checkers play-move 1 1 2 2 3 --from $alice
$ docker exec -it checkers \
    checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This contains:

```diff-txt
    ...
+  deadline: 2023-02-05 15:26:26.832533 +0000 UTC
    ...
```

In the same vein, you can create a new game and confirm it contains the deadline.

<HighlightBox type="warn">

Do you believe that all the elements are in place for you to start the forfeit mechanism? Are you thinking about doing something like this pseudo-code:

```javascript
allGames = keeper.GetAllStoredGames()
expiredGames = allGames.filterWhere(game => now < game.Deadline)
...
```

If you do so, your blockchain is in **extreme danger**. The `.GetAllStoredGames` call is O(n). Its execution time is proportional to the total number of games you have in storage. It is not proportional to the number of games that have expired.
<br/><br/>
If your project is successful, this may mean pulling a million games just to forfeit a handful... _on every block_. At this rate, each block would come out after 30 minutes, not 6 seconds.
<br/><br/>
You need better data structures, as you will see in the next sections.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to implement a new `deadline` field and work with dates to enable the application to check whether games which have not been recently updated have expired or not.
* How the deadline must use the block's time as its reference point, since a non-deterministic `Date.now()` would change with each execution.
* How to test your code to ensure that it functions as desired.
* How to interact with the CLI to create a new game with the deadline field in place
* How, if your blockchain contains preexisting games, that the blockchain state is now effectively broken, since the deadline field of those games demonstrates missing information (which can be corrected through migration).
* How, if you are not careful enough, you can quickly stall a successful blockchain.

</HighlightBox>

<!--## Next up

You have created and updated the deadline. The [section two steps ahead](./1-game-forfeit.md) describes how to use the deadline.

Before you can do that, there is one other field you need to add. Discover which in the [next section](../1-ignite-cli/8-game-winner.md).-->
