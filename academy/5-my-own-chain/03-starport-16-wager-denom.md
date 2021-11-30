---
title: IBC Foreign Token Wager
order: 18
description: Let players wager any fungible token
---

# IBC Foreign Token Wager

<HighlightBox type="synopsis">

Make sure you have all you need to reward validators for their work:

* You understand the concepts of [transactions](../3-main-concepts/05-transactions), [messages](../3-main-concepts/07-messages), [Protobuf](../3-main-concepts/09-protobuf), and [IBC](../3-main-concepts/16-ibc).
* Have Go installed.
* The checkers blockchain with the `MsgCreateGame` and its handling. Either because you followed the [previous steps](./03-starport-05-create-handling) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-handler
).

</HighlightBox>

Players can play a game and wager the base staking token of your blockchain application when you introduce a wager. What if the players want to play with other _currencies_? Your blockchain can represent a token from any other blockchain connected to your chain by using the Inter-Blockchain Communication Protocol (IBC).

You will be agnostic to the tokens that are represented and to who is taking care of the relayers. Your only concern is to enable the use of _foreign_ tokens.

## New information

Instead of defaulting to `"stake"`, let players decide what string their token is. So you update:

* The stored game, in `proto/checkers/stored_game.proto`:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/stored_game.proto#L21]
    message StoredGame {
        ...
        string token = 13; // Denomination of the wager.
    }
    ```

* The message to create a game in `proto/checkers/tx.proto`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/tx.proto#L46]
    message MsgCreateGame {
        ...
        string token = 5; // Denomination of the wager.
    }
    ```

You can use to have Starport and Protobuf recompile both files:

```sh
$ starport generate proto-go
```

Also update the constructor in `x/checkers/types/message_create_game.go` to avoid surprises down the road:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/message_create_game.go#L16]
func NewMsgCreateGame(creator string, red string, black string, wager uint64, token string) *MsgCreateGame {
    return &MsgCreateGame{
        ...
        Token: token,
    }
}
```

You already know you are going to emit this new information during the game creation. To add an event key in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/keys.go#L56]
const (
    StoredGameEventToken = "Token"
)
```

## Additional handling

This new denomination needs to be inserted in the relevant locations:

* In the helper function to create the `Coin` in `x/checkers/types/full_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/full_game.go#L71-L73]
    func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
        return sdk.NewCoin(storedGame.Token, sdk.NewInt(int64(storedGame.Wager)))
    }
    ```

* In the handler that creates a game in `x/checkers/keeper/msg_server_create_game.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/keeper/msg_server_create_game.go#L30]
    storedGame := types.StoredGame{
        ...
        Token:     msg.Token,
    }
    ```

    And:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/keeper/msg_server_create_game.go#L54]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            ...
            sdk.NewAttribute(types.StoredGameEventToken, msg.Token),
        )
    )
    ```

The code updates to make these changes are not complex. The advanced usage is done for the IBC Protocol and relayers.

Congratulations! Your checkers blockchain is complete with the required features. Now, players can play checkers comfortably.

## Next up

What if you want to introduce a new feature after the checkers blockchain has been deployed and has been running?

Take a look at the [next section](./03-starport-17-migration) to discover how to introduce a leaderboard and conduct migrations for it.
