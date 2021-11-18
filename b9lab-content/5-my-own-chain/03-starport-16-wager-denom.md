---
title: IBC Foreign Token Wager
order: 18
description: Let players wager any fungible token.
---

# IBC Foreign Token Wager

When you introduced a wager, players could play a game and wager the base, staking, token of your blockchain application. What if they want to play with other _currencies_? Fortunately, with the use of IBC, your blockchain can represent a token from any other blockchain connected to yours. Here, you are agnostic as to which tokens are being represented, and who is taking care of relayers. Instead, your only concern is to enable the use of _foreign_ tokens.

## New Information

This is extremely simple. Instead of defaulting to `"stake"`, you now let players decide what string their token is. So you update:

* The stored game, in `proto/checkers/stored_game.proto`:
    ```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/stored_game.proto#L21]
    message StoredGame {
        ...
        string token = 13; // Denomination of the wager.
    }
    ```
* The message to create a game, in `proto/checkers/tx.proto`:
    ```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/proto/checkers/tx.proto#L46]
    message MsgCreateGame {
        ...
        string token = 5; // Denomination of the wager.
    }
    ```

To have Starport and Protobuf recompile both files, you can use:

```sh
$ starport chain serve
```
To avoid surprises down the road, also update the constructor, in `x/checkers/types/message_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/message_create_game.go#L16]
func NewMsgCreateGame(creator string, red string, black string, wager uint64, token string) *MsgCreateGame {
    return &MsgCreateGame{
        ...
        Token: token,
    }
}
```
You already know you are going to emit this new information on game creation. So add an event key in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/keys.go#L56]
const (
    StoredGameEventToken = "Token"
)
```

## Additional Handling

This new denomination now needs to be inserted in the relevant locations.

* In the helper function to create the `Coin`, in `x/checkers/types/full_game.go`:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9799e2cee1a0541932ec19d5cfdcdd955be0390f/x/checkers/types/full_game.go#L71-L73]
    func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
        return sdk.NewCoin(storedGame.Token, sdk.NewInt(int64(storedGame.Wager)))
    }
    ```
* In the handler that creates a game, in `x/checkers/keeper/msg_server_create_game.go`:
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

This was all rather simple. The difficulty was in fact in the IBC protocol and relayers. Your checkers blockchain is complete. It has the required features, and lets players play comfortably.

Complete? What if you wanted to introduce a new feature after it has been deployed and been running? That's the point of migrations in the next section.
