---
title: "Queries"
order: 10
description: Query lifecycle and working with queries
tag: deep-dive
---

# Queries

<HighlightBox type="synopsis">

In this section, you will discover queries. They are one of two primary objects handled by modules. Make sure to be all set up by reading the previous sections:

* [A Blockchain App Architecture](./architecture.md)
* [Accounts](./accounts.md)
* [Transactions](./transactions.md)
* [Modules](./modules.md)

</HighlightBox>

A query is a request for information made by end-users of an application through an interface and processed by a full node. Available information includes:

* Information about the network
* Information about the application itself
* Information about the application state

Queries do not require consensus to be processed as they do not trigger state transitions. Therefore, queries can be fully handled independently by a full node.

<HighlightBox type="info">

Visit the [detailed Cosmos SDK documentation](https://docs.cosmos.network/master/basics/query-lifecycle.html) to get a clear overview of the query lifecycle and learn how a query is created, handled, and responded to.

</HighlightBox>

## Next up

You can now continue with the [next section](./events.md) if you want to skip ahead to read up on events.

If you prefer to see some code in action and continue with the checkers blockchain, take a look at the expandable box beneath.

<ExpansionPanel title="Show me some code for my checkers blockchain">

If you have used Ignite CLI so far, it has already created queries for you to get one stored game or a list of them. You still do not have a way to check whether a move works/is valid. It would be wasteful to send a transaction with an invalid move. It is better to catch such a mistake before submitting a transaction. So you are going to create a query to know whether a move is valid.

Ignite CLI can again help you with a simple command:

```sh
$ ignite scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool
```

This creates the query objects:

```go
type QueryCanPlayMoveRequest struct {
    IdValue string
    Player  string
    FromX   uint64
    FromY   uint64
    ToX     uint64
    ToY     uint64
}

type QueryCanPlayMoveResponse struct {
    Possible bool
    Reason   string // Actually, you have to add this one by hand.
}
```

It also creates a function that should looks familiar:

```go
func (k Keeper) CanPlayMove(goCtx context.Context, req *types.QueryCanPlayMoveRequest) (*types.QueryCanPlayMoveResponse, error) {
    ...
    // TODO: Process the query

    return &types.QueryCanPlayMoveResponse{}, nil
}
```

So now you are left with filling in the gaps under `TODO`. Simply put:

1. Is the game finished? You should add a `Winner` to your `StoredGame` first.
2. Is it an expected player?

    ```go
    var player rules.Player
    if strings.Compare(rules.RED_PLAYER.Color, req.Player) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(rules.BLACK_PLAYER.Color, req.Player) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "message creator is not a player",
            }, nil
    }
    ```

3. Is it the player's turn?

    ```go
    fullGame := storedGame.ToFullGame()
        if !fullGame.Game.TurnIs(player) {
            return &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "player tried to play out of turn",
            }, nil
        }
    ```

4. Attempt the move in memory without committing any new state:

    ```go
    _, moveErr := fullGame.Game.Move(
        rules.Pos{
            X: int(req.FromX),
            Y: int(req.FromY),
        },
        rules.Pos{
            X: int(req.ToX),
            Y: int(req.ToY),
        },
    )
    if moveErr != nil {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("wrong move", moveErr.Error()),
        }, nil
    }
    ```

5. If all checks passed, return the OK status:

    ```go
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

Note that the player's move will be tested against the latest validated state of the blockchain. It does not test against the intermediate state being calculated as transactions are delivered, nor does it test against the potential state that would result from delivering the transactions still in the transaction pool.

A player can test their move only once the opponent's move is included in a previous block. These types of edge-case scenarios are not common in your checkers game and you can expect little to no effect on the user experience.

This is not an exhaustive list of potential queries. Some examples of other possible queries would be to get a player's open games or to get a list of games that are timing out soon. It depends on the needs of your application and how much functionality you willingly provide.

</ExpansionPanel>
