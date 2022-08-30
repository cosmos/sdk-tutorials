---
title: "Store FIFO - Put Your Games in Order"
order: 12
description: Prepare to expire games
tag: deep-dive
---

# Store FIFO - Put Your Games in Order

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [ABCI](../2-main-concepts/architecture.md), [Protobuf](../2-main-concepts/protobuf.md), and of a [doubly-linked list](https://en.wikipedia.org/wiki/Doubly_linked_list).
* Go is installed.
* You have the checkers blockchain codebase with `MsgRejectGame` and its handling. If not, follow the [previous steps](./reject-game.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-reject-game-handler).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will deal with:

* The FIFO data structure
* FIFO unit tests

You will learn:

* Modularity and data organization styles

</HighlightBox>

In the [previous step](./reject-game.md), you added a way for players to reject a game, so there is a way for stale games to be removed from storage. But is this enough to avoid _state pollution_?

There are some initial thoughts and code needs to keep in mind during the next sections to be able to implement forfeits in the end.

## Some initial thoughts

Before you begin touching your code, ask:

* What conditions have to be satisfied for a game to be considered stale and the blockchain to act?
* How do you sanitize the new information inputs?
* How would you get rid of stale games as part of the protocol, that is _without user inputs_?
* How do you optimize performance and data structures so that a few stale games do not cause your blockchain to grind to a halt?
* How can you be sure that your blockchain is safe from attacks?
* How do you make your changes compatible with future plans for wagers?
* Are there errors to report back?
* What event should you emit?

## Code needs

Now, think about what possible code changes and additions you should consider:

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

For now, do not bother yet with future ideas like wager handling.

## Why would you reject?

There are two ways for a game to advance through its lifecycle until resolution, win or draw: _play_ and _reject_.

Game inactivity could become a factor. What if a player never shows up again? Should a game remain in limbo forever?

Eventually you want to let players wager on the outcome of games, so you do not want games remaining in limbo if they have _value_ assigned. For this reason, you need a way for games to be forcibly resolved if one player stops responding.

<HighlightBox type="info">

The simplest mechanism to expire a game is to use a **deadline**. If the deadline is reached, then the game is forcibly terminated and expires. The deadline is pushed back every time a move is played.

</HighlightBox>

To enforce the termination it is a good idea to use the **`EndBlock`** part of the ABCI protocol. The call `EndBlock` is triggered when all transactions of the block are delivered, and allows you to tidy up before the block is sealed. In your case, all games that have reached their deadline will be terminated.

How do you find all the games that have reached their deadline? You could use a pseudo-code like:

```javascript
findAll(game => game.deadline < now)
```

This approach is **expensive** in terms of computation. The `EndBlock` code should not have to pull up all games out of the storage just to find a few that are relevant. Doing a `findAll` costs [`O(n)`](https://en.wikipedia.org/wiki/Big_O_notation), where `n` is the total number of games.

## How can you reject?

You need another data structure. The simplest option is a First-In-First-Out (FIFO) that is constantly updated, so that:

* When games are played, they are taken out of where they are and sent to the tail.
* Games that have not been played for the longest time eventually rise to the head.

When terminating expired games in `EndBlock`, you deal with the expired games that are at the head of the FIFO. Do not stop until the head includes an ongoing game. The cost is:

* `O(1)` on each game creation and gameplay.
* `O(k)` where `k` is the number of expired games on each block.
* `k <= n` where `n` is the number of games that exist.

`k` is still an unbounded number of operations. However, if you use the same expiration duration on each game, for `k` games to expire together in a block they would all have to have had a move in the same previous block (give or take the block before or after). In the worst case, the largest `EndBlock` computation will be proportional to the largest regular block in the past. This is a reasonable risk to take.

<HighlightBox type="remember">

This only works if the expiration duration is the same for all games, instead of being a parameter left to a potentially malicious game creator.

</HighlightBox>

## New information

How do you implement a FIFO from which you extract elements at random positions? Choose a doubly-linked list:

1. You must remember the game ID at the head to pick expired games, and at the tail to send back fresh games. The existing `NextGame` object is useful, as it is already expandable. Add to its Protobuf declaration:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/proto/checkers/next_game.proto#L9-L10]
    message NextGame {
        ...
        string fifoHead = 3; // Will contain the index of the game at the head.
        string fifoTail = 4; // Will contain the index of the game at the tail.
    }
    ```

2. To make extraction possible, each game must know which other game takes place before it in the FIFO, and which after. Store this double link information in `StoredGame`. Add them to the game's Protobuf declaration:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/proto/checkers/stored_game.proto#L14-L15]
    message StoredGame {
        ...
        string beforeId = 8; // Pertains to the FIFO. Toward head.
        string afterId = 9; // Pertains to the FIFO. Toward tail.
    }
    ```

3. There must be an "ID" that indicates _no game_. Use `"-1"`, which you save as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/types/keys.go#L32-L34]
    const (
        NoFifoIdKey = "-1"
    )
    ```

4. Adjust the default genesis values, so that it has proper head and tail:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/types/genesis.go#L20-L21]
    func DefaultGenesis() *GenesisState {
        return &GenesisState{
            ...
            NextGame: &NextGame{
                ...
                FifoHead: NoFifoIdKey,
                FifoTail: NoFifoIdKey,
            },
        }
    }
    ```

5. Instruct Ignite CLI and Protobuf to recompile the files:

```sh
$ ignite chain build
```

## FIFO management

Now that the new fields are created, you need to update them to keep your FIFO up-to-date. It's better to create a separate file that encapsulates this knowledge. Create `x/checkers/keeper/stored_game_in_fifo.go` with the following:

1. A function to remove from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/stored_game_in_fifo.go#L9-L42]
    func (k Keeper) RemoveFromFifo(ctx sdk.Context, game *types.StoredGame, info *types.NextGame) {
        // Does it have a predecessor?
        if game.BeforeId != types.NoFifoIdKey {
            beforeElement, found := k.GetStoredGame(ctx, game.BeforeId)
            if !found {
                panic("Element before in Fifo was not found")
            }
            beforeElement.AfterId = game.AfterId
            k.SetStoredGame(ctx, beforeElement)
            if game.AfterId == types.NoFifoIdKey {
                info.FifoTail = beforeElement.Index
            }
            // Is it at the FIFO head?
        } else if info.FifoHead == game.Index {
            info.FifoHead = game.AfterId
        }
        // Does it have a successor?
        if game.AfterId != types.NoFifoIdKey {
            afterElement, found := k.GetStoredGame(ctx, game.AfterId)
            if !found {
                panic("Element after in Fifo was not found")
            }
            afterElement.BeforeId = game.BeforeId
            k.SetStoredGame(ctx, afterElement)
            if game.BeforeId == types.NoFifoIdKey {
                info.FifoHead = afterElement.Index
            }
            // Is it at the FIFO tail?
        } else if info.FifoTail == game.Index {
            info.FifoTail = game.BeforeId
        }
        game.BeforeId = types.NoFifoIdKey
        game.AfterId = types.NoFifoIdKey
    }
    ```

    The game passed as an argument is **not** saved in storage here, even if it was updated. Only its fields in memory are adjusted. The _before_ and _after_ games are saved in storage. Do a `SetStoredGame` after calling this function to avoid having a mix of saves and memory states. The same applies to `SetNextGame`.

2. A function to send to the tail:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/stored_game_in_fifo.go#L45-L70]
    func (k Keeper) SendToFifoTail(ctx sdk.Context, game *types.StoredGame, info *types.NextGame) {
        if info.FifoHead == types.NoFifoIdKey && info.FifoTail == types.NoFifoIdKey {
            game.BeforeId = types.NoFifoIdKey
            game.AfterId = types.NoFifoIdKey
            info.FifoHead = game.Index
            info.FifoTail = game.Index
        } else if info.FifoHead == types.NoFifoIdKey || info.FifoTail == types.NoFifoIdKey {
            panic("Fifo should have both head and tail or none")
        } else if info.FifoTail == game.Index {
            // Nothing to do, already at tail
        } else {
            // Snip game out
            k.RemoveFromFifo(ctx, game, info)

            // Now add to tail
            currentTail, found := k.GetStoredGame(ctx, info.FifoTail)
            if !found {
                panic("Current Fifo tail was not found")
            }
            currentTail.AfterId = game.Index
            k.SetStoredGame(ctx, currentTail)

            game.BeforeId = currentTail.Index
            info.FifoTail = game.Index
        }
    }
    ```

    Again, it is advisable to do `SetStoredGame` and `SetNextGame` after calling this function.

## FIFO Integration

With these functions ready, it is time to use them in the message handlers.

1. In the handler when creating a new game, set default values for `BeforeId` and `AfterId`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_create_game.go#L36]
    ...
    storedGame := types.StoredGame{
        ...
        BeforeId:  types.NoFifoIdKey,
        AfterId:   types.NoFifoIdKey,        
    }
    ```

    Send the new game to the tail because it is freshly created:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_create_game.go#L36]
    ...
    k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    k.Keeper.SetStoredGame(ctx, storedGame)
    ...
    ```

2. In the handler, when playing a move send the game back to the tail because it was freshly updated:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_play_move.go#L62-L72]
    ...
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    storedGame.Game = game.String()
    ...
    k.Keeper.SetNextGame(ctx, nextGame)
    ...
    ```

    Note that you also need to call `SetNextGame`.

3. In the handler, when rejecting a game remove the game from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_reject_game.go#L34-L42]
    ...
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    k.Keeper.RemoveFromFifo(ctx, &storedGame, &nextGame)
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ...
    k.Keeper.SetNextGame(ctx, nextGame)
    ...
    ```

You have implemented a FIFO that is updated but never really used.

## Unit tests

At this point, your previous unit tests are failing, so they must be fixed. Add `FifoHead` and `FifoTail` in your value requirements on `NextGame` as you [create games](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_create_game_test.go#L51-L52), [play moves](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_play_move_test.go#L86-L87), and [reject games](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_reject_game_test.go#L58-L59). Also add `BeforeId` and `AfterId` in your value requirements on `StoredGame` as you [create games](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_create_game_test.go#L64-L65) and [play moves](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_play_move_test.go#L99-L100).

Next, you should add more specific FIFO tests. For instance, testing what happens to `NextGame` and `StoredGame` as you create up to three new games:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_create_game_fifo_test.go#L11-L111]
func TestCreate3GamesHasSavedFifo(t *testing.T) {
    msgSrvr, keeper, context := setupMsgServerCreateGame(t)
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
    })

    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: bob,
        Red:     carol,
        Black:   alice,
    })
    nextGame2, found2 := keeper.GetNextGame(sdk.UnwrapSDKContext(context))
    require.True(t, found2)
    require.EqualValues(t, types.NextGame{
        Creator:  "",
        IdValue:  3,
        FifoHead: "1",
        FifoTail: "2",
    }, nextGame2)
    game1, found1 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Creator:   alice,
        Index:     "1",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       bob,
        Black:     carol,
        MoveCount: uint64(0),
        BeforeId:  "-1",
        AfterId:   "2",
    }, game1)
    game2, found2 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "2")
    require.True(t, found2)
    require.EqualValues(t, types.StoredGame{
        Creator:   bob,
        Index:     "2",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       carol,
        Black:     alice,
        MoveCount: uint64(0),
        BeforeId:  "1",
        AfterId:   "-1",
    }, game2)

    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: carol,
        Red:     alice,
        Black:   bob,
    })
    nextGame3, found3 := keeper.GetNextGame(sdk.UnwrapSDKContext(context))
    require.True(t, found3)
    require.EqualValues(t, types.NextGame{
        Creator:  "",
        IdValue:  4,
        FifoHead: "1",
        FifoTail: "3",
    }, nextGame3)
    game1, found1 = keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Creator:   alice,
        Index:     "1",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       bob,
        Black:     carol,
        MoveCount: uint64(0),
        BeforeId:  "-1",
        AfterId:   "2",
    }, game1)
    game2, found2 = keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "2")
    require.True(t, found2)
    require.EqualValues(t, types.StoredGame{
        Creator:   bob,
        Index:     "2",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       carol,
        Black:     alice,
        MoveCount: uint64(0),
        BeforeId:  "1",
        AfterId:   "3",
    }, game2)
    game3, found3 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "3")
    require.True(t, found3)
    require.EqualValues(t, types.StoredGame{
        Creator:   carol,
        Index:     "3",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       alice,
        Black:     bob,
        MoveCount: uint64(0),
        BeforeId:  "2",
        AfterId:   "-1",
    }, game3)
}
```

What happens when you [have two games and play once on the _older_ one](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_play_move_fifo_test.go#L11-L61)? Or have two games and play them twice in turn:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_play_move_fifo_test.go#L63-L121]
func TestPlayMove2Games2MovesHasSavedFifo(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
    msgServer.CreateGame(context, &types.MsgCreateGame{
        Creator: bob,
        Red:     carol,
        Black:   alice,
    })
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator: carol,
        IdValue: "1",
        FromX:   1,
        FromY:   2,
        ToX:     2,
        ToY:     3,
    })

    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator: alice,
        IdValue: "2",
        FromX:   1,
        FromY:   2,
        ToX:     2,
        ToY:     3,
    })
    nextGame1, found1 := keeper.GetNextGame(sdk.UnwrapSDKContext(context))
    require.True(t, found1)
    require.EqualValues(t, types.NextGame{
        Creator:  "",
        IdValue:  3,
        FifoHead: "1",
        FifoTail: "2",
    }, nextGame1)
    game1, found1 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Creator:   alice,
        Index:     "1",
        Game:      "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "r",
        Red:       bob,
        Black:     carol,
        MoveCount: uint64(1),
        BeforeId:  "-1",
        AfterId:   "2",
    }, game1)
    game2, found2 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "2")
    require.True(t, found2)
    require.EqualValues(t, types.StoredGame{
        Creator:   bob,
        Index:     "2",
        Game:      "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "r",
        Red:       carol,
        Black:     alice,
        MoveCount: uint64(1),
        BeforeId:  "1",
        AfterId:   "-1",
    }, game2)
}
```

What happens when you [have two games and reject the _older_ one](https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_reject_game_fifo_test.go#L11-L43)? Or have three games and reject the _middle_ one?

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/fea86db8/x/checkers/keeper/msg_server_reject_game_fifo_test.go#L45-L95]
func TestRejectMiddleGameHasSavedFifo(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForRejectGame(t)
    msgServer.CreateGame(context, &types.MsgCreateGame{
        Creator: bob,
        Red:     carol,
        Black:   alice,
    })
    msgServer.CreateGame(context, &types.MsgCreateGame{
        Creator: carol,
        Red:     alice,
        Black:   bob,
    })
    msgServer.RejectGame(context, &types.MsgRejectGame{
        Creator: carol,
        IdValue: "2",
    })
    nextGame, found := keeper.GetNextGame(sdk.UnwrapSDKContext(context))
    require.True(t, found)
    require.EqualValues(t, types.NextGame{
        Creator:  "",
        IdValue:  4,
        FifoHead: "1",
        FifoTail: "3",
    }, nextGame)
    game1, found1 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Creator:   alice,
        Index:     "1",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       bob,
        Black:     carol,
        MoveCount: uint64(0),
        BeforeId:  "-1",
        AfterId:   "3",
    }, game1)
    game3, found3 := keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "3")
    require.True(t, found3)
    require.EqualValues(t, types.StoredGame{
        Creator:   carol,
        Index:     "3",
        Game:      "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:      "b",
        Red:       alice,
        Black:     bob,
        MoveCount: uint64(0),
        BeforeId:  "1",
        AfterId:   "-1",
    }, game3)
}
```

## Interact via the CLI

Time to explore the commands. You need to start afresh because you made numerous additions to the blockchain state:

```sh
$ ignite chain serve --reset-once
```

<HighlightBox type="tip">

Do not forget to export `alice` and `bob` again, as explained in an [earlier section](./create-message.md).

</HighlightBox>

1. Is the genesis FIFO information correctly saved?

    ```sh
    $ checkersd query checkers show-next-game
    ```

    This should print:

    ```
    NextGame:
      creator: ""
      fifoHead: "-1" # There is nothing
      fifoTail: "-1" # There is nothing
      idValue: "1"
    ```

2. If you create a game, is the game as expected?

    ```sh
    $ checkersd tx checkers create-game $alice $bob --from $bob
    $ checkersd query checkers show-next-game
    ```

    This should print:

    ```
    NextGame:
      creator: ""
      fifoHead: "1" # The first game you created
      fifoTail: "1" # The first game you created
      idValue: "2"
    ```

3. What about the information saved in the game?

    ```sh
    $ checkersd query checkers show-stored-game 1
    ```

    Because it is the only game, this should print:

    ```
    StoredGame:
      afterId: "-1" # Nothing because it is alone
      beforeId: "-1" # Nothing because it is alone
    ...
    ```

4. And if you create another game?

    ```sh
    $ checkersd tx checkers create-game $alice $bob --from $bob
    $ checkersd query checkers show-next-game
    ```

    This should print:

    ```
    NextGame:
      creator: ""
      fifoHead: "1" # The first game you created
      fifoTail: "2" # The second game you created
      idValue: "3"
    ```

5. Did the games also store the correct values?

    ```sh
    $ checkersd query checkers show-stored-game 1 # The first game you created
    ```

    This should print:

    ```
    afterId: "2" # The second game you created
    beforeId: "-1" # No game
    ...
    ```

    Run:

    ```sh
    $ checkersd query checkers show-stored-game 2 # The second game you created
    ```

    This should print:

    ```
    afterId: "-1" # No game
    beforeId: "1" # The first game you created
    ...
    ```

    Your FIFO in effect has the game IDs `[1, 2]`.

    Add a third game, your FIFO will be `[1, 2, 3]`.

6. What happens if Bob plays a move in game `2`, the game _in the middle_?

    ```sh
    $ checkersd tx checkers play-move 2 1 2 2 3 --from $bob
    $ checkersd query checkers show-next-game
    ```

    This should print:

    ```
    NextGame:
      creator: ""
      fifoHead: "1" # The first game you created
      fifoTail: "2" # The second game you created and on which Bob just played
      idValue: "4"
    ```

7. Is game `3` in the middle now?

    ```sh
    $ checkersd query checkers show-stored-game 3
    ```

    This should print:

    ```
    StoredGame:
      afterId: "2"
      beforeId: "1"
    ...
    ```

    Your FIFO now has the game IDs `[1, 3, 2]`. You see that game `2`, which was played on, has been sent to the tail of the FIFO.

8. What happens if Alice rejects game `3`?

    ```sh
    $ checkersd tx checkers reject-game 3 --from $alice
    $ checkersd query checkers show-next-game
    ```

    This prints:

    ```
    NextGame:
      creator: ""
      fifoHead: "1"
      fifoTail: "2"
      idValue: "4"
    ```

    There is no change because game `3` was _in the middle_, so it did not affect the head or the tail.

    Run the following two queries:

    ```sh
    $ checkersd query checkers show-stored-game 1
    ```

    This prints:

    ```
    StoredGame:
      afterId: "2"
      beforeId: "-1"
    ...
    ```

    And:

    ```sh
    $ checkersd query checkers show-stored-game 2
    ```

    This prints:

    ```
    StoredGame:
      afterId: "-1"
      beforeId: "1"
    ...
    ```

    Your FIFO now has the game IDs `[1, 2]`. Game `3` was correctly removed from the FIFO.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The use of a First-In-First-Out (FIFO) data structure to sort games from the least recently played at the top of the list to the most recently played at the bottom, in order to help identify inactive games which may become candidates for forced termination, which reduces undesirable and wasteful data stored on the blockchain.
* How forced termination of games is beneficial should you implement a wager system, as it prevents any assigned value from becoming locked into inactive games by causing the inactive player to forfeit the game and lose their wager.
* How any code solution which searches the entire data store for inactive games is computationally expensive, needlessly accessing many active games to identify any inactive minority (which may not even exist).
* How a FIFO data structure definitionally orders games such that inactive games rise to the top of the list, meaning code solutions can simply run until encountering the first active game and then stop, conserving gas fees.
* What new information and functions need to be added to your code; how to integrate them into the message handlers; how to update your unit tests to prevent them from failing due to these changes; and what tests to run to test the code.
* How to interact with the CLI to check the effectiveness of your new commands.

</HighlightBox>

<!--## Next up

Having a list of games ordered by age is not enough to ascertain their staleness. You must also add an expiry date on each game to reach that decision. That is the goal of the [next section](./game-deadline.md).-->
