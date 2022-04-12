---
title: Store FIFO - Put Your Games in Order
order: 11
description: You prepare to expire games
tag: deep-dive
---

# Store FIFO - Put Your Games in Order

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [ABCI](../2-main-concepts/architecture.md), [Protobuf](../2-main-concepts/protobuf.md), and of a [doubly-linked list](https://en.wikipedia.org/wiki/Doubly_linked_list).
* Have Go installed.
* The checkers blockchain codebase with `MsgRejectGame` and its handling. You can get there by following the [previous steps](./reject-game.md) or checking out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/reject-game-handler).

</HighlightBox>

In the [previous step](./reject-game.md) you added a way for players to reject a game. There are two ways for a game to advance through its lifecycle until resolution, win or draw: _play_ and _reject_.

## The why

What if a player never shows up again? Should a game remain in limbo forever?

You eventually want to let players wager on the outcome of games especially if _value_ is tied up in games. You need to add a way for games to be forcibly resolved if a player stops responding.

The simplest mechanism to expire a game is to use a **deadline**. If the deadline is reached, then the game is forcibly terminated and expires. The deadline is pushed further back every time a game is played.

To enforce the termination it is a good idea to use the **`EndBlock`** part of the ABCI protocol. The call `EndBlock` is triggered when all transactions of the block are delivered and gives you a chance to do some tidying up before the block is sealed. In your case, all games that have reached their deadline will be terminated.

How do you find all the games that reached their deadline? Maybe with a pseudo-code like:

```javascript
findAll(game => game.deadline < now)
```

This approach is **expensive** in terms of computation. The `EndBlock` code should not have to pull up all games out of the storage just to find the dozen that are relevant. Doing a `findAll` costs [`O(n)`](https://en.wikipedia.org/wiki/Big_O_notation), where `n` is the total number of games.

## The how

You need another data structure. The simplest one is a First-In-First-Out (FIFO) that is constantly updated so that:

* The just played games are taken out of where they are and sent to the tail.
* The games that have not been played for the longest time eventually end up at the head.

You keep dealing with the expired games that are at the head of the FIFO when terminating expired games in `EndBlock`. Do not stop until the head includes an ongoing game. The cost is:

* `O(1)` on each game creation and gameplay.
* `O(k)` where `k` is the number of expired games on each block.
* `k <= n`

`k` still is an unbounded number of operations. But if you use the same expiration duration on each game, for `k` games to expire together in a block, these `k` games would all have to have had a move in the same previous block. Give or take the block before or after. The largest `EndBlock` computation will be proportional to the largest regular block in the past in the worst case. This is a reasonable risk to take.

Remember this only works if the expiration duration is the same for all games instead of being a parameter left to a potentially malicious game creator.

## New information

How do you implement a FIFO from which you extract elements at random positions? Choose a doubly-linked list for that:

1. You need to remember the game ID at the head, to pick expired games, and at the tail, to send back fresh games. The existing `NextGame` object is a good place for this as it is already an object and expandable. Just add a bit to its Protobuf declaration:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/proto/checkers/next_game.proto#L11-L12]
    message NextGame {
        ...
        string fifoHead = 3; // Will contain the index of the game at the head.
        string fifoTail = 4; // Will contain the index of the game at the tail.
    }
    ```

2. To make extraction possible each game needs to know which other game takes place before it in the FIFO, and which after. The right place to store this double link information is `StoredGame`. Thus, you add them in the game's Protobuf declaration:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/proto/checkers/stored_game.proto#L16-L17]
    message StoredGame {
        ...
        string beforeId = 8; // Pertains to the FIFO. Towards head.
        string afterId = 9; // Pertains to the FIFO. Towards tail.
    }
    ```

3. There needs to be an "ID" that indicates _no game_. Let's use `"-1"`, which you save as a constant:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/types/keys.go#L32-L34]
    const (
        NoFifoIdKey = "-1"
    )
    ```

4. Adjust the default genesis values, so that it has proper head and tail:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/types/genesis.go#L20-L21]
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

To have Ignite CLI and Protobuf recompile the files:

```sh
$ ignite chain build
```

## FIFO management

Now that the new fields are created, you need to update them accordingly to keep your FIFO always up-to-date. It's better to create a separate file that encapsulates this knowledge. Create `x/checkers/keeper/stored_game_in_fifo.go` with:

1. A function to remove from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/keeper/stored_game_in_fifo.go#L9-L36]
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
        }
        game.BeforeId = types.NoFifoIdKey
        game.AfterId = types.NoFifoIdKey
    }
    ```

    The game passed as an argument is **not** saved in storage here, even if it was updated. Only its fields in memory are adjusted. The _before_ and _after_ games are saved in storage. It is advised to do a `SetStoredGame` after calling this function to avoid having a mix of saves and memory states. The same applies to `SetNextGame`.

2. A function to send to the tail:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/keeper/stored_game_in_fifo.go#L39-L63]
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
            game.BeforeId = currentTail.Index

            info.FifoTail = game.Index
        }
    }
    ```


## Use it

With these functions ready, it is time to use them in the message handlers.

1. In the handler when creating a new game, send the new game to the tail because it is freshly created:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/keeper/msg_server_create_game.go#L32]
    ...
    k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    k.Keeper.SetStoredGame(ctx, storedGame)
    ...
    ```

2. In the handler when playing a move, send the game back to the tail because it was freshly updated:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/keeper/msg_server_play_move.go#L58-L68]
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

3. In the handler when rejecting a game, remove the game from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/keeper/msg_server_reject_game.go#L34-L42]
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

You implemented a FIFO that is updated but never really used.

## Next up

Now you need to add an expiry date on the games. That's the goal of the [next section](./game-deadline.md).
