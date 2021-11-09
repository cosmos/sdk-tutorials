---
title: A Game FIFO
order: 11
description: You prepare the ground to expire games.
---

# A Game FIFO

In the previous step, you added a way for a player to reject a game. So now, with _play_ and _reject_, there are two ways for a game to advance along its lifecycle until its resolution, a win or a draw.

## The Why

However, there is another situation that is not handled. What if a player never shows up again? Should a game remain in limbo forever? That's one way to decide. Unfortunately, you eventually want to let players wager on the outcome of games. If _value_ is tied up into games, leaving games unresolved forever is poor design. You therefore need to add a way for games to be forcibly resolved if a player stops responding.

The simplest mechanism to handle that is to use a **deadline**. If the deadline is reached, then the game is forcibly terminated. Every time a game is played on, the deadline keeps being pushed back into the future.

Next, to enforce the termination, you will use the **`EndBlock`** part of the ABCI protocol. This call is triggered when all transactions of the block have been delivered, and you are given the opportunity to do some tidying up before the block is sealed. In your case, all games that have reached their deadline will be terminated.

How do you find all the games that have reached their deadline? Do you do a pseudo-code:

```
findAll(game => game.deadline < now)
```
No, that would be prohibitively **expensive** in terms of computation. The EndBlock code should not have to lift up all games, potentially millions, out of storage just to find the dozen that are relevant. In computer science jargon, doing a `findAll` costs `O(n)` where `n` is the total number of games.

## The How

You need another data structure. The simplest one is a FIFO, First-In-First-Out, that is constantly updated so that:

* The games that have just been played on are taken out of wherever they are and sent to the tail.
* The games that have not been played on the longest eventually end up at the head.

So when terminating expired games in `EndBlock`, you keep taking expired games that are at the head of the FIFO. And stop until the head has an on-going game. The cost is therefore:

* `O(1)` on each game creation and game play.
* `O(k)` where `k` is the number of expired games on each block. And of course `k < n`, normally by a lot.

Isn't `k` still an unbounded number of operations? Yes, but if you use the same expiration duration on each game, for `k` games to expire together in a block, these `k` games would all have had to see an action in the same previous one block. Give or take the block before or after. So in the worst case, the largest `EndBlock` computation will be proportional to the largest regular block in the past. This is a reasonable risk to take. And remember this assessment works only if the expiration duration is the same for all games, instead of being a parameter left to the game creator.

## New Information

How do you implement a FIFO given all the previous work?

1. You need to keep the id of the head and the tail. The right place for that is `NextGame`. Good thing that it is already an object and is expandable. So in terms of code, in `proto/checkers/next_game.proto`:
    ```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/proto/checkers/next_game.proto#L11-L12]
    message NextGame {
        ...
        string fifoHead = 3; // Will contain the index of the game at the head.
        string fifoTail = 4; // Will contain the index of the game at the tail.
    }
    ```
2. Each game needs to know which game is before it, and which is after it. The right place for this information is `StoredGame` itself. In `proto/checkers/stored_game.proto`:
    ```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/proto/checkers/stored_game.proto#L16-L17]
    message StoredGame {
        ...
        string beforeId = 8; // Pertains to the FIFO. Towards head.
        string afterId = 9; // Pertains to the FIFO. Towards tail.
    }
    ```
3. There needs to be an id that indicates _no game_. Let's use `"-1"`. In `x/checkers/types/keys.go `:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/2343af69cd1f2c22acfac13f46393aa8ce686685/x/checkers/types/keys.go#L32-L34]
    const (
        NoFifoIdKey = "-1"
    )
    ```

To have Starport and Protobuf recompile these files, you can use:

```sh
$ starport chain serve
```
While you are adding the new information, do not forget to adjust the default genesis so that it has proper values in `x/checkers/types/genesis.go`:

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

## FIFO Management

Now that the new information is available, you need to update the fields as necessary so that your FIFO is always up to date. Better create a separate file that encapsulates this knowledge. Let's create `x/checkers/keeper/stored_game_in_fifo.go` with a function to remove from the FIFO:

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
Notice that it does not save the requested game in storage here. It only adjusts the fields in memory. On the other hand, it does save in storage the _before_ and _after_ games. Therefore it is advised to do a `SetStoredGame` after a call to this function so as to avoid having a mix of saves and memory states.

And a function to send to the tail:

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

## Use It

With these functions done, it is time to use them in the message handlers. In `x/checkers/keeper/msg_server_create_game.go`, send the new game to the tail because it is freshly created:

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

In `x/checkers/keeper/msg_server_reject_game.go`, remove the game from the FIFO at all:

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

That's about it. It involves some code but you should recognize the classical FIFO implementation. Of note is that here we do not have any expiry date on the games yet. You implemented purely a FIFO that is updated but whose head is never queried. Let's fix that in the next section.
