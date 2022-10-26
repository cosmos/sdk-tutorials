---
title: "Queries"
order: 10
description: Query lifecycle and working with queries
tags: 
  - concepts
  - cosmos-sdk
---

# Queries

<HighlightBox type="prerequisite">

Make sure you are prepared for this section by reading the following previous sections:

* [A Blockchain App Architecture](./1-architecture.md)
* [Accounts](./2-accounts.md)
* [Transactions](./3-transactions.md)
* [Modules](./5-modules.md)

</HighlightBox>

<HighlightBox type="learning">

In this section you will discover queries, one of two primary objects handled by modules. At the end of the section is a code example that puts queries into practice in your checkers blockchain.

</HighlightBox>

A query is a request for information, made by end-users of an application through an interface, and processed by a full node. Available information includes:

* Information about the network.
* Information about the application itself.
* Information about the application state.

Queries do not require consensus to be processed as they do not trigger state transitions. Therefore queries can be handled entirely independently by a full node.

<HighlightBox type="tip">

Visit the [detailed Cosmos SDK documentation](https://docs.cosmos.network/main/basics/query-lifecycle.html) for a clear overview of the query lifecycle and learn how a query is created, handled, and responded to.

</HighlightBox>

## Code example

<ExpansionPanel title="Show me some code for my checkers blockchain">

If you have used Ignite CLI so far, it has already created queries for you to get one stored game or a list of them. However, you still do not have a way to check whether a move works or is valid. It would be wasteful to send a transaction with an invalid move, it is better to catch such a mistake *before* submitting a transaction. So you are going to create a query to discover whether a move is valid.
<br/><br/>
Ignite CLI can again help with a simple command:

```sh
$ ignite scaffold query canPlayMove gameIndex player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool
```

This creates the following query objects:

```go
type QueryCanPlayMoveRequest struct {
    GameIndex string
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

It also creates a function that should look familiar:

```go
func (k Keeper) CanPlayMove(goCtx context.Context, req *types.QueryCanPlayMoveRequest) (*types.QueryCanPlayMoveResponse, error) {
    ...
    // TODO: Process the query

    return &types.QueryCanPlayMoveResponse{}, nil
}
```

Now you must fill in the gaps under `TODO`. Simply put:

1. Is the game finished? You should add a `Winner` to your `StoredGame` first.
2. Is it an expected player?

    ```go
    isBlack := req.Player == "b"
    isRed := req.Player == "r"
    var player rules.Player
    if isBlack && isRed {
        player = rules.StringPieces[storedGame.Turn].Player
    } else if isBlack {
        player = rules.BLACK_PLAYER
    } else if isRed {
        player = rules.RED_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("%s: %s", "message creator is not a player", req.Player),
        }, nil
    }
    ```

3. Is it the player's turn?

    ```go
    game, err := storedGame.ParseGame()
    if err != nil {
        return nil, err
    }
    if !game.TurnIs(player) {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("%s: %s", "player tried to play out of turn", player.Color),
        }, nil
    }
    ```

4. Attempt the move in memory without committing any new state:

    ```go
    _, moveErr := game.Move(
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
            Reason:   fmt.Sprintf("%s: %s", "wrong move", moveErr.Error()),
        }, nil
    }
    ```

5. If all checks are passed, return the **OK** status:

    ```go
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

<HighlightBox type="info">

The player's move will be tested against the latest validated state of the blockchain. It does not test against the intermediate state being calculated as transactions are delivered, nor does it test against the potential state that would result from delivering the transactions still in the transaction pool.

</HighlightBox>

<HighlightBox type="info">

A player can test their move only after the opponent's move is included in a previous block. These types of edge-case scenarios are not common in your checkers game, and you can expect little to no effect on the user experience.

</HighlightBox>

This is not an exhaustive list of potential queries. Some examples of other possible queries would be to get a player's open games, or to get a list of games that are timing out soon. It depends on the needs of your application and how much functionality you willingly provide.

</ExpansionPanel>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* Queries, one of two primary objects handled by a module in the Cosmos SDK, which inspect a module's state and are always read-only.
* How a query is a request for information (which could be about the network, about an application, or about the application's state) that is made by end-users of an application through an interface.
* How queries do not require consensus to be processed as they do not trigger state transitions, meaning they can be handled entirely independently by a full node.

</HighlightBox>

<!--## Next up

You can now continue directly to the [next section](./10-events.md) to learn about events.

If you prefer to see some code in action and continue with the checkers blockchain, look at the expandable box above.-->
