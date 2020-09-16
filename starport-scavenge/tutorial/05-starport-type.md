---
order: 5
---


# Scaffolding types

In this section, we'll be explaining how to quickly scaffold types for your application using the `starport type` command.

## `starport type`

Let's run the `starport type` command to generate our `scavenge` type - 

```
starport type scavenge description solutionHash reward solution scavenger
```

<!-- From this command, we've added the following:
- `scavenge/vue/src/store/app.js` - The `scavenge` type in our front-end application
- `scavenge/x/scavenge/client/cli/query.go` - adding the `GetCmdListScavenge` query function to the CLI commands
- `scavenge/x/scavenge/client/cli/queryScavenge.go` - defining the `GetCmdListScavenge` function
- `scavenge/x/scavenge/client/cli/tx.go` - adding `GetCmdCreateScavenge` transaction function to the CLI commands
- `scavenge/x/scavenge/client/cli/txScavenge.go` - defining the `GetCmdCreateScavenge` function
- `scavenge/x/scavenge/client/rest/queryScavenge.go` - defining the `listScavengeHandler` query function
- `scavenge/x/scavenge/client/rest/txScavenge.go` - defining the `createScavengeRequest` type and `createScavengeHandler` function
- `scavenge/x/scavenge/client/rest/rest.go` - adding the `listScavengeHandler` and `createScavengeHandler` function to the CLI commands
- `scavenge/x/scavenge/handler.go` - handle the case where `MsgCreateScavenge` is passed, and handle it
- `scavenge/x/scavenge/handlerMsgCreateScavenge.go` - define `handleMsgCreateScavenge`, which creates the scavenge
- `scavenge/x/scavenge/keeper/querier.go` - Handle the `QueryListScavenge` case to use the `listScavenge` function
- `scavenge/x/scavenge/keeper/scavenge.go` - Define the `CreateScavenge` and `listScavenge` functions
- `scavenge/x/scavenge/types/MsgCreateScavenge.go` - define the  `MsgCreateScavenge` function
- `scavenge/x/scavenge/types/TypeScavenge.go` - define the `Scavenge` type
- `scavenge/x/scavenge/types/key.go` - add the `ScavengePrefix` constant
- `scavenge/x/scavenge/types/querier.go` - add the `QueryListScavenge` constant -->

Currently, all the types we definied are of type `string` - this can seen at `scavenge/x/scavenge/types/TypeScavenge.go`. We need to delete the `ID` field, since we're going to be using the SolutionHash as the key, and update `Reward` to `sdk.Coin`, as well as `Scavenger` to `sdk.AccAddress`.

Once this is done, your struct should look like this - 

```
type Scavenge struct {
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`
	Description  string         `json:"description" yaml:"description"`
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"`
	Reward       sdk.Coins       `json:"reward" yaml:"reward"`
	Solution     string         `json:"solution" yaml:"solution"`
	Scavenger    sdk.AccAddress `json:"scavenger" yaml:"scavenger"`
}
```

Since we're using `SolutionHash` as the key, we need to update the field in our keeper `scavenge/x/scavenge/keeper/scavenge.go`.

```
func (k Keeper) CreateScavenge(ctx sdk.Context, scavenge types.Scavenge) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.ScavengePrefix + scavenge.SolutionHash)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(scavenge)
	store.Set(key, value)
}
```


Next, we need to update the fields in `MsgCreateScavenge.go`, since we only fill out the fields partially when creating new  scavenge objects

```
type MsgCreateScavenge struct {
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`
	Description  string         `json:"description" yaml:"description"`
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"`
	Reward       sdk.Coins       `json:"reward" yaml:"reward"`
}

func NewMsgCreateScavenge(creator sdk.AccAddress, description string, solutionHash string, reward sdk.Coins) MsgCreateScavenge {
	return MsgCreateScavenge{
		Creator:      creator,
		Description:  description,
		SolutionHash: solutionHash,
		Reward:       reward,
	}
}
```

In the same file, we'll add some validation code in `ValidateBasic` to ensure that we're populating the required fields (`Creator` and `SolutionHash`).

```
func (msg MsgCreateScavenge) ValidateBasic() error {
	if msg.Creator.Empty() {
		return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
	}
	if msg.SolutionHash == "" {
		return sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "solutionHash can't be empty")
	}
	return nil
}
```

We also need to update `scavenge/x/scavenge/client/rest/txScavenge.go` - 

```
type createScavengeRequest struct {
	BaseReq      rest.BaseReq `json:"base_req"`
	Creator      string       `json:"creator"`
	Description  string       `json:"description"`
	SolutionHash string       `json:"solutionHash"`
	Reward       string       `json:"reward"`
}

func createScavengeHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createScavengeRequest
		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}
		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}
		creator, err := sdk.AccAddressFromBech32(req.Creator)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		reward, err := sdk.ParseCoins(req.Reward)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		msg := types.NewMsgCreateScavenge(creator, req.Description, req.SolutionHash, reward)
		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
```

As well as its counterpart in `scavenge/x/scavenge/client/cli/txScavenge.go` - 

```
func GetCmdCreateScavenge(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "create-scavenge [reward] [solution] [description]",
		Short: "Creates a new scavenge with a reward",
		Args:  cobra.ExactArgs(3), // Does your request require arguments
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))

			reward, err := sdk.ParseCoins(args[0])
			if err != nil {
				return err
			}

			var solution = args[1]
			var solutionHash = sha256.Sum256([]byte(solution))
			var solutionHashString = hex.EncodeToString(solutionHash[:])

			msg := types.NewMsgCreateScavenge(cliCtx.GetFromAddress(), args[2], solutionHashString, reward)
			err = msg.ValidateBasic()
			if err != nil {
				return err
			}

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
```

Next, we'll update the handler for creating the scavenge

```
func handleMsgCreateScavenge(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateScavenge) (*sdk.Result, error) {
	var scavenge = types.Scavenge{
		Creator:      msg.Creator,
		Description:  msg.Description,
		SolutionHash: msg.SolutionHash,
		Reward:       msg.Reward,
	}
	k.CreateScavenge(ctx, scavenge)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
```

If `starport serve` is still running, you'll see that our application finally successfully builds. Let's test things out by creating a scavenge.

```
$ scavengecli tx scavenge create-scavenge \
    "I travel the world for work, have a corner office, and drive a \$500,000 vehicle. What's my job?" \
    "Bus driver" \
    100token \
    --from user1
```

After confirming the transaction, you can confirm that the transaciton exists by entering in `scavengecli q scavenge list-scavenge` in your terminal, or by going to `http://localhost:1317/scavenge/scavenge`

```
$ scavengecli q scavenge list-scavenge
[  
  {
    "creator": "cosmos1agx4r34yqgt7v7zvdr4f2guu3g3pzprtyjxxr7",
    "description": "I travel the world for work, have a corner office, and drive a $500,000 vehicle. What's my job?",
    "solutionHash": "497f0320f420803425bae6b288fc58ae42b6ed080743664f9985506e91ab09e5",
    "reward": [
      {
        "denom": "token",
        "amount": "100"
      }
    ],
    "solution": "",
    "scavenger": ""
  }
]
```

<!-- TODO: UI - hash, 
Let's check out our UI at `localhost:8080` - 

You'll notice that we still have inputs for the fields `Solution` and `Scavenger` when we have the option to create a new scavenge, so let's modify them  -->