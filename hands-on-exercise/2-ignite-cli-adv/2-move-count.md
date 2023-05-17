---
title: "Keep Track Of How Many Moves Have Been Played"
order: 3
description: Store field - store the move count
tags: 
  - guided-coding
  - cosmos-sdk
---

# Keep Track Of How Many Moves Have Been Played

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with the game deadline. If not, follow the [previous steps](/hands-on-exercise/2-ignite-cli-adv/1-game-deadline.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-deadline).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Implement a count of game moves.
* Extend your unit tests.

</HighlightBox>

Previously, you added [a winner](/hands-on-exercise/1-ignite-cli/8-game-winner.md) and [a deadline](/hands-on-exercise/2-ignite-cli-adv/1-game-deadline.md) to games, with a view to implementing a forfeit mechanism for games that have become stale.

## Some initial thoughts

When the forfeit is implemented, it would be interesting to be able to differentiate games that have never been played on from games that have.

To be specific:

1. If no moves are ever played, there is no point in recording a winner and a forfeiter. There is no point in keeping a track of the game.
2. If the black player moved once but the red player never showed up, it is the same situation. After all, a malicious player could create many games that go stale just to tarnish the reputation of another player.
3. If both players have played at least once, then this can be considered a proper game, where a forfeit is one of the legitimate outcomes.

## New information

To achieve this, the easiest way is to add a new `MoveCount` to the `StoredGame`. In `proto/checkers/stored_game.proto`:

```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/proto/checkers/stored_game.proto#L14]
    message StoredGame {
        ...
+      uint64 moveCount = 8;
    }
```

Run Protobuf to recompile the relevant Go files:

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

`MoveCount` should start at `0` and increment by `1` on each move.

1. Adjust it first in the handler when creating the game:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_create_game.go#L30]
        storedGame := types.StoredGame{
            ...
    +      MoveCount: 0,
        }
    ```

2. Before saving to the storage, adjust it in the handler when playing a move:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_play_move.go#L71]
        ...
        storedGame.Deadline = types.FormatDeadline(types.GetNextDeadline(ctx))
    +  storedGame.MoveCount++
        storedGame.Turn = rules.PieceStrings[game.Turn]
        ...
    ```

<HighlightBox type="note">

This value is not emitted in events, because (as it stands) it will be only used internally for checks.

</HighlightBox>

## Unit tests

You have to fix the existing tests by adding [`MoveCount: 0`](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L57) ([or more](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_play_move_winner_test.go#L34)) when testing a retrieved `StoredGame`.

## Interact via the CLI

There is not much to test here. Remember that you added a new field, but if your blockchain state already contains games then they are missing that field, so the default value of the underlying type will be applied:

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

Although this game was already played on, the default `uint` value is applied:

```diff-txt
    ...
+  moveCount: 0
    ...
```

In effect, your blockchain state is broken. Eventually examine the [section on migrations](/hands-on-exercise/4-run-in-prod/2-migration-info.md) to see how to update your blockchain state to avoid such a breaking change.

Restart your chain with `--reset-once`, create a new game, then:

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
+  moveCount: 1
    ...
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to implement a new `moveCount` field and increment it on play.
* How to test your code to ensure that it functions as desired.
* How, if your blockchain contains preexisting games, that the blockchain state is now effectively broken, since the move count field of those games is `0` by default (which can be corrected through migration).

</HighlightBox>
