---
title: A Game FIFO
order: 11
description: You prepare to expire games
---

# A Game FIFO

In the [previous step](./03-starport-08-reject-game.md), you added a way for players to reject a game. With _play_ and _reject_, there are two ways for a game to advance through its lifecycle until its resolution (win or draw).

## The why

There is a situation we have not taken into account: what if a player never shows up again? Should a game remain in limbo forever?

You eventually want to let players wager on the outcome of games, especially if _value_ is tied up in games. Therefore, you need to add a way for games to be forcibly resolved if a player stops responding.

The simplest mechanism to expire a game is to use a **deadline**. If the deadline is reached, then the game is forcibly terminated (expires). Every time a game is played, the deadline is pushed further back.

To enforce the termination, use the **`EndBlock`** part of the ABCI protocol. The call `EndBlock` is triggered when all transactions of the block are delivered and after you had a chance to do some tidying up before the block is sealed. In your case, all games that reach their deadline will be terminated.

How do you find all the games with reached deadlines? Maybe with a pseudo-code like:

```
findAll(game => game.deadline < now)
```

In terms of computation, this approach is **expensive**. The `EndBlock` code should not have to pull up all games, potentially millions, out of the storage just to find the dozen that are relevant. In computer science jargon: doing a `findAll` costs `O(n)`, where `n` is the total number of games.

## The how

You need another data structure. The simplest one is a First-In-First-Out (FIFO) that is constantly updated, so that:

* The games that have just been played are taken out of where they are and sent to the tail.
* The games that have not been played for the longest time eventually end up at the head.

When terminating expired games in `EndBlock`, you keep dealing with the expired games that are at the head of the FIFO. Do not stop until the head includes an ongoing game. The cost is:

* `O(1)` on each game creation and gameplay.
* `O(k)`, where `k` is the number of expired games on each block, and `k <= n`.

Is `k` still an unbounded number of operations? Yes, but if you use the same expiration duration on each game, for `k` games to expire together in a block, these `k` games would all have had a move in the same previous block. Give or take the block before or after. In the worst case, the largest `EndBlock` computation will be proportional to the largest regular block in the past. This is a reasonable risk to take.

Remember this back-of-the-envelope assessment works only if the expiration duration is the same for all games, instead of being a parameter left to a potentially malicious game creator.

## New information

How do you implement a FIFO? Let's choose a doubly-linked list for that:

1. You need to keep the ID of the head and the tail. `NextGame` is a good place for this, as it is already an object and expandable. In terms of code, just add a bit in `proto/checkers/next_game.proto`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/proto/checkers/next_game.proto#L11-L12]
    message NextGame {
        ...
        string fifoHead = 3; // Will contain the index of the game at the head.
        string fifoTail = 4; // Will contain the index of the game at the tail.
    }
    ```

2. Each game needs to know which game takes place before it, and which after. The right place to store this information is `StoredGame`. Thus, in `proto/checkers/stored_game.proto`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/proto/checkers/stored_game.proto#L16-L17]
    message StoredGame {
        ...
        string beforeId = 8; // Pertains to the FIFO. Towards head.
        string afterId = 9; // Pertains to the FIFO. Towards tail.
    }
    ```

3. Finally, there needs to be an ID that indicates _no game_. Let's use `"-1"`, in `x/checkers/types/keys.go `:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/types/keys.go#L32-L34]
    const (
        NoFifoIdKey = "-1"
    )
    ```

To have Starport and Protobuf recompile the files, you can use:

```sh
$ starport chain build
```

While you are adding the new information, do not forget to adjust the default genesis, so that it has proper values in `x/checkers/types/genesis.go`:

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

## FIFO management

Now that the new information is available, you need to update the fields accordingly to keep your FIFO always up-to-date. Better create a separate file that encapsulates this knowledge. Let's create `x/checkers/keeper/stored_game_in_fifo.go` with a function to remove from the FIFO:

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

The requested game is not saved in storage here. Only the fields in memory are adjusted. On the other hand, the _before_ and _after_ games are saved in storage. It is advised to do a `SetStoredGame` after calling this function to avoid having a mix of saves and memory states. The same applies to `SetNextGame`.

A function to send to the tail:

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

In `x/checkers/keeper/msg_server_create_game.go`, send the new game to the tail because it is freshly created:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/keeper/msg_server_create_game.go#L32]
...
k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
k.Keeper.SetStoredGame(ctx, storedGame)
...
```

In `x/checkers/keeper/msg_server_play_move.go`, send the game back to the tail because it was freshly updated:

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

In `x/checkers/keeper/msg_server_reject_game.go`, remove the game from the FIFO:

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

You probably recognize the classical doubly-linked list implementation.

We do not have any expiry date on the games yet. You implemented purely a FIFO that is updated but the FIFO's head is never queried. Let's fix this in the [next section](./03-starport-10-game-deadline.md).
