# Queries

### gRPC routing

A query is a request for information made by end-users of an application through an interface and processed by a full-node. Available information includes:

* Information about the network.
* Information about the application itself.
* And information about the application state.

Queries do not require consensus to be processed (as they do not trigger state-transitions) and can therefore be fully handled independently by a full node.

<HighlightBox info=”info”>

[Query lifecycles](https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/query-lifecycle.md): Creating, handling queries with the CLI, RPC and application query handling.

</HighlightBox>

<ExpansionPanel title="Show me some code for my checkers blockchain">

If you used Starport, it has already created queries for you, such as queries to get one stored game, or a list of them. However, you still don't have a way to check whether a move will work. It would be wasteful to send a transaction with an invalid move. It is better to catch such a mistake before submitting a transaction. Let's fix that. You are going to create a query that informs whether a move can be played.

Again, Starport can help you here with a simple command:

```sh
$ starport scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool
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
    Reason   string // Actually you have to add this one by hand.
}
```
It also created a function that looks familiar to you:

```go
func (k Keeper) CanPlayMove(goCtx context.Context, req *types.QueryCanPlayMoveRequest) (*types.QueryCanPlayMoveResponse, error) {
    ...
    // TODO: Process the query

    return &types.QueryCanPlayMoveResponse{}, nil
}
```
So now you are left with filling in the gaps under TODO. Simple:

1. Is the game finished? Actually, for this one, you ought to add a `Winner` to your `StoredGame` first.
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
4. Attempt the move in memory, without committing any new state:
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
Of note is that the player's move will be tested against the latest validated state of the blockchain. It does not test against the intermediate state being calculated as transactions are being delivered. Nor does it test against the potential state that would result from delivering the transactions still in the transaction pool.

In practice, this means that a player could test their move only if the opponent's move has been included in a block.

Examples of other possible queries. Get a player's games, or the games soon to time out.

</ExpansionPanel>
