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
* You have the checkers blockchain codebase with `MsgRejectGame` and its handling. If not, follow the [previous steps](./reject-game.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/reject-game-handler).

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

To enforce the termination, it is a good idea to use the **`EndBlock`** part of the ABCI protocol. The call `EndBlock` is triggered when all transactions of the block are delivered, and allows you to tidy up before the block is sealed. In your case, all games that have reached their deadline will be terminated.

How do you find all the games that have reached their deadline? You could use a pseudo-code like:

```javascript
findAll(game => game.deadline < now)
```

This approach is **expensive** in terms of computation. The `EndBlock` code should not have to pull up all games out of the storage just to find a few that are relevant. Doing a `findAll` costs [`O(n)`](https://en.wikipedia.org/wiki/Big_O_notation), where `n` is the total number of games.

## How can you reject?

You need another data structure. The simplest option is a First-In-First-Out (FIFO) that is constantly updated, so that:

* When games are played, they are taken out of where they are and sent to the tail.
* Games that have not been played for the longest time eventually rise to the head.

Therefore, when terminating expired games in `EndBlock`, you deal with the expired games that are at the head of the FIFO. You do not stop until the head includes an ongoing game. The cost is:

* `O(1)` on each game creation and gameplay.
* `O(k)` where `k` is the number of expired games on each block.
* `k <= n` where `n` is the number of games that exist.

`k` is still an unbounded number of operations. However, if you use the same expiration duration on each game, for `k` games to expire together in a block they would all have to have had a move in the same previous block (give or take the block before or after). In the worst case, the largest `EndBlock` computation will be proportional to the largest regular block in the past. This is a reasonable risk to take.

<HighlightBox type="remember">

This only works if the expiration duration is the same for all games, instead of being a parameter left to a potentially malicious game creator.

</HighlightBox>

## New information

How do you implement a FIFO from which you extract elements at random positions? Choose a doubly-linked list:

1. You must remember the game ID at the head to pick expired games, and at the tail to send back fresh games. The existing `SystemInfo` object is useful, as it is already expandable. Add to its Protobuf declaration:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/proto/checkers/system_info.proto#L8-L9]
    message NextGame {
        ...
        string fifoHeadIndex = 2; // Will contain the index of the game at the head.
        string fifoTailIndex = 3; // Will contain the index of the game at the tail.
    }
    ```

2. To make extraction possible, each game must know which other game takes place before it in the FIFO, and which after. Store this double-link information in `StoredGame`. Add them to the game's Protobuf declaration:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/proto/checkers/stored_game.proto#L13-L14]
    message StoredGame {
        ...
        string beforeIndex = 7; // Pertains to the FIFO. Toward head.
        string afterIndex = 8; // Pertains to the FIFO. Toward tail.
    }
    ```

3. There must be an "ID" that indicates _no game_. Use `"-1"`, which you save as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/types/keys.go#L51-L53]
    const (
        NoFifoIndex = "-1"
    )
    ```

4. Instruct Ignite CLI and Protobuf to regenerate the Protobuf files:

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

5. Adjust the default genesis values, so that it has a proper head and tail:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/types/genesis.go#L15-L16]
    func DefaultGenesis() *GenesisState {
    return &GenesisState{
        SystemInfo: SystemInfo{
            NextId:        uint64(DefaultIndex),
            FifoHeadIndex: NoFifoIndex,
            FifoTailIndex: NoFifoIndex,
        },
        ...
    }
    ```

## FIFO management

Now that the new fields are created, you need to update them to keep your FIFO up-to-date. It's better to create a separate file that encapsulates this knowledge. Create `x/checkers/keeper/stored_game_in_fifo.go` with the following:

1. A function to remove from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/stored_game_in_fifo.go#L8-L41]
    func (k Keeper) RemoveFromFifo(ctx sdk.Context, game *types.StoredGame, info *types.SystemInfo) {
        // Does it have a predecessor?
        if game.BeforeIndex != types.NoFifoIndex {
            beforeElement, found := k.GetStoredGame(ctx, game.BeforeIndex)
            if !found {
                panic("Element before in Fifo was not found")
            }
            beforeElement.AfterIndex = game.AfterIndex
            k.SetStoredGame(ctx, beforeElement)
            if game.AfterIndex == types.NoFifoIndex {
                info.FifoTailIndex = beforeElement.Index
            }
            // Is it at the FIFO head?
        } else if info.FifoHeadIndex == game.Index {
            info.FifoHeadIndex = game.AfterIndex
        }
        // Does it have a successor?
        if game.AfterIndex != types.NoFifoIndex {
            afterElement, found := k.GetStoredGame(ctx, game.AfterIndex)
            if !found {
                panic("Element after in Fifo was not found")
            }
            afterElement.BeforeIndex = game.BeforeIndex
            k.SetStoredGame(ctx, afterElement)
            if game.BeforeIndex == types.NoFifoIndex {
                info.FifoHeadIndex = afterElement.Index
            }
            // Is it at the FIFO tail?
        } else if info.FifoTailIndex == game.Index {
            info.FifoTailIndex = game.BeforeIndex
        }
        game.BeforeIndex = types.NoFifoIndex
        game.AfterIndex = types.NoFifoIndex
    }
    ```

    The game passed as an argument is **not** saved in storage here, even if it was updated. Only its fields in memory are adjusted. The _before_ and _after_ games are saved in storage. Do a `SetStoredGame` after calling this function to avoid having a mix of saves and memory states. The same applies to `SetSystemInfo`.

2. A function to send to the tail:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/stored_game_in_fifo.go#L43-L68]
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

    Again, it is advisable to do `SetStoredGame` and `SetSystemInfo` after calling this function.

## FIFO Integration

With these functions ready, it is time to use them in the message handlers.

1. In the handler when creating a new game, set default values for `BeforeIndex` and `AfterIndex`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_create_game.go#L29-L30]
    ...
    storedGame := types.StoredGame{
        ...
        BeforeIndex: types.NoFifoIndex,
        AfterIndex:  types.NoFifoIndex,
    }
    ```

    Send the new game to the tail because it is freshly created:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_create_game.go#L38]
    ...
    k.Keeper.SendToFifoTail(ctx, &storedGame, &systemInfo)
    k.Keeper.SetStoredGame(ctx, storedGame)
    ...
    ```

2. In the handler, when playing a move send the game back to the tail because it was freshly updated:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_play_move.go#L57-L67]
    ...
    systemInfo, found := k.Keeper.GetSystemInfo(ctx)
    if !found {
        panic("SystemInfo not found")
    }
    k.Keeper.SendToFifoTail(ctx, &storedGame, &systemInfo)

    storedGame.MoveCount++
    ...
    k.Keeper.SetSystemInfo(ctx, systemInfo)
    ...
    ```

    Note that you also need to call `SetSystemInfo`.

3. In the handler, when rejecting a game remove the game from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_reject_game.go#L31-L37]
    ...
    systemInfo, found := k.Keeper.GetSystemInfo(ctx)
    if !found {
        panic("SystemInfo not found")
    }
    k.Keeper.RemoveFromFifo(ctx, &storedGame, &systemInfo)
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ...
    k.Keeper.SetSystemInfo(ctx, systemInfo)
    ...
    ```

You have implemented a FIFO that is updated but never really used. It will be used in a [later section](./game-forfeit.md).

## Unit tests

At this point, your previous unit tests are failing, so they must be fixed. Add `FifoHeadIndex` and `FifoTailIndex` in your value requirements on `SystemInfo` as you [create games](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_create_game_test.go#L52-L53), [play moves](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_play_move_test.go#L98-L99), and [reject games](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_reject_game_test.go#L59-L60). Also add `BeforeIndex` and `AfterIndex` in your value requirements on `StoredGame` as you [create games](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_create_game_test.go#L64-L65) and [play moves](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_play_move_test.go#L110-L111).

Next, you should add more specific FIFO tests. For instance, testing what happens to `SystemInfo` and `StoredGame` as you create up to three new games, instead of [only checking at the end](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_create_game_test.go#L166-L227):

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_create_game_fifo_test.go#L11-L107]
func TestCreate3GamesHasSavedFifo(t *testing.T) {
    msgSrvr, keeper, context := setupMsgServerCreateGame(t)
    ctx := sdk.UnwrapSDKContext(context)
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
    })

    // Second game
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: bob,
        Black:   carol,
        Red:     alice,
    })
    systemInfo2, found := keeper.GetSystemInfo(ctx)
    require.True(t, found)
    require.EqualValues(t, types.SystemInfo{
        NextId:        3,
        FifoHeadIndex: "1",
        FifoTailIndex: "2",
    }, systemInfo2)
    game1, found := keeper.GetStoredGame(ctx, "1")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "1",
        Board:       "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "b",
        Black:       bob,
        Red:         carol,
        MoveCount:   uint64(0),
        BeforeIndex: "-1",
        AfterIndex:  "2",
    }, game1)
    game2, found := keeper.GetStoredGame(ctx, "2")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "2",
        Board:       "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "b",
        Black:       carol,
        Red:         alice,
        MoveCount:   uint64(0),
        BeforeIndex: "1",
        AfterIndex:  "-1",
    }, game2)

    // Third game
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: carol,
        Black:   alice,
        Red:     bob,
    })
    systemInfo3, found := keeper.GetSystemInfo(ctx)
    require.True(t, found)
    require.EqualValues(t, types.SystemInfo{
        NextId:        4,
        FifoHeadIndex: "1",
        FifoTailIndex: "3",
    }, systemInfo3)
    game1, found = keeper.GetStoredGame(ctx, "1")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "1",
        Board:       "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "b",
        Black:       bob,
        Red:         carol,
        MoveCount:   uint64(0),
        BeforeIndex: "-1",
        AfterIndex:  "2",
    }, game1)
    game2, found = keeper.GetStoredGame(ctx, "2")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "2",
        Board:       "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "b",
        Black:       carol,
        Red:         alice,
        MoveCount:   uint64(0),
        BeforeIndex: "1",
        AfterIndex:  "3",
    }, game2)
    game3, found := keeper.GetStoredGame(ctx, "3")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "3",
        Board:       "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "b",
        Black:       alice,
        Red:         bob,
        MoveCount:   uint64(0),
        BeforeIndex: "2",
        AfterIndex:  "-1",
    }, game3)
}
```

What happens when you [have two games and play once on the _older_ one](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_play_move_fifo_test.go#L11-L59)? Or have two games and play them twice in turn:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_play_move_fifo_test.go#L61-L117]
func TestPlayMove2Games2MovesHasSavedFifo(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)
    msgServer.CreateGame(context, &types.MsgCreateGame{
        Creator: bob,
        Black:   carol,
        Red:     alice,
    })
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })

    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   carol,
        GameIndex: "2",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    systemInfo1, found := keeper.GetSystemInfo(ctx)
    require.True(t, found)
    require.EqualValues(t, types.SystemInfo{
        NextId:        3,
        FifoHeadIndex: "1",
        FifoTailIndex: "2",
    }, systemInfo1)
    game1, found := keeper.GetStoredGame(ctx, "1")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "1",
        Board:       "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "r",
        Black:       bob,
        Red:         carol,
        MoveCount:   uint64(1),
        BeforeIndex: "-1",
        AfterIndex:  "2",
    }, game1)
    game2, found := keeper.GetStoredGame(ctx, "2")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "2",
        Board:       "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        Turn:        "r",
        Black:       carol,
        Red:         alice,
        MoveCount:   uint64(1),
        BeforeIndex: "1",
        AfterIndex:  "-1",
    }, game2)
}
```

What happens when you [have two games and reject the _older_ one](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_reject_game_fifo_test.go#L11-L42)? Or have three games and reject the _middle_ one?

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-fifo/x/checkers/keeper/msg_server_reject_game_fifo_test.go#L44-L92]
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

## Interact via the CLI

Time to explore the commands. You need to start afresh because you made numerous additions to the blockchain state:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve --reset-once
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain serve --reset-once
```

</CodeGroupItem>

</CodeGroup>

<HighlightBox type="tip">

Do not forget to export `alice` and `bob` again, as explained in an [earlier section](./create-message.md#interact-via-the-cli).

</HighlightBox>

<PanelList>

<PanelListItem number="1">

Is the genesis FIFO information correctly saved?

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

This should print:

```txt
SystemInfo:
    fifoHeadIndex: "-1" # There is nothing
    fifoTailIndex: "-1" # There is nothing
    nextId: "1"
```

</PanelListItem>

<PanelListItem number="2">

If you create a game, is the game as expected?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $bob
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This should print:

```txt
SystemInfo:
    fifoHeadIndex: "1" # The first game you created
    fifoTailIndex: "1" # The first game you created
    nextId: "2"
```

</PanelListItem>

<PanelListItem number="3">

What about the information saved in the game?

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

Because it is the only game, this should print:

```txt
storedGame:
    afterIndex: "-1" # Nothing because it is alone
    beforeIndex: "-1" # Nothing because it is alone
    ...
```

</PanelListItem>

<PanelListItem number="4">

And if you create another game?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $bob
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This should print:

```txt
SystemInfo:
    fifoHeadIndex: "1" # The first game you created
    fifoTailIndex: "2" # The second game you created
    nextId: "3"
```

</PanelListItem>

<PanelListItem number="5">

Did the games also store the correct values?

For the first game:

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

This should print:

```txt
afterIndex: "2" # The second game you created
beforeIndex: "-1" # No game
...
```

For the second game, run:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 2
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-stored-game 2
```

</CodeGroupItem>

</CodeGroup>

This should print:

```txt
afterIndex: "-1" # No game
beforeIndex: "1" # The first game you created
...
```

Your FIFO in effect has the game IDs `[1, 2]`.

Add a third game, and confirm that your FIFO is `[1, 2, 3]`.

</PanelListItem>

<PanelListItem number="6">

What happens if Alice plays a move in game `2`, the game _in the middle_?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 2 1 2 2 3 --from $alice
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 2 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This should print:

```txt
SystemInfo:
    fifoHeadIndex: "1" # The first game you created
    fifoTailIndex: "2" # The second game you created and on which Bob just played
    nextId: "4"
```

</PanelListItem>

<PanelListItem number="7">

Is game `3` in the middle now?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 3
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-stored-game 3
```

</CodeGroupItem>

</CodeGroup>

This should print:

```txt
storedGame:
    afterIndex: "2"
    beforeIndex: "1"
    ...
```

Your FIFO now has the game IDs `[1, 3, 2]`. You see that game `2`, which was played on, has been sent to the tail of the FIFO.

</PanelListItem>

<PanelListItem number="8" :last="true">

What happens if Alice rejects game `3`?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers reject-game 3 --from $alice
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers reject-game 3 --from $alice
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
SystemInfo:
    fifoHeadIndex: "1"
    fifoTailIndex: "2"
    nextId: "4"
```

There is no change because game `3` was _in the middle_, so it did not affect the head or the tail.

Fetch the two games by running the following two queries :

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

This prints:

```txt
storedGame:
    afterIndex: "2"
    beforeIndex: "-1"
...
```

And:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 2
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-stored-game 2
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
storedGame:
    afterIndex: "-1"
    beforeIndex: "1"
...
```

Your FIFO now has the game IDs `[1, 2]`. Game `3` was correctly removed from the FIFO.

</PanelListItem>

</PanelList>

## Next up

Having a list of games ordered by age is not enough to ascertain their staleness. You must also add an expiry date on each game to reach that decision. That is the goal of the [next section](./game-deadline.md).
