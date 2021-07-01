---
order: 1
---


# Building our PoFE blockchain using Starport

We can scaffold our application by running `starport scaffold chain github.com/user/pofe`. This command creates a new folder called `pofe` that contains the code for your app.

```
starport scaffold chain github.com/user/pofe --sdk-version launchpad
```

## Run application

After scaffolding our application, let's open up a separate terminal window in the newly created `pofe` folder and run `starport chain serve`, which will start our application. Here, you should be able to see the following output, as well as any errors that might show up in your application.

```
$ starport chain serve
Cosmos' version is: Launchpad

📦 Installing dependencies...
🛠️  Building the app...
🙂 Created an account. Password (mnemonic): joy manage firm arrange finish bounce power shove bring bundle issue chief quiz spread symptom sword slender vote hobby water weird trim panther slot
🙂 Created an account. Password (mnemonic): meat skirt slab smart impulse region clump genuine zero clog version father spray midnight tip poem input fantasy decide buddy work strategy nest shaft
🌍 Running a Cosmos 'pofe' app with Tendermint at http://localhost:26657.
🌍 Running a server at http://localhost:1317 (LCD)

🚀 Get started: http://localhost:12345/
```
*Note: use* `starport chain serve --verbose` *to visualize detailed operations happening in the background* 

## Creating our `Claim` type

Open a new terminal inside the `pofe` directory and create a type called `claim` with the field `proof`:

```bash
starport type claim proof:string
```

```bash
🎉 Created a type `claim`.
```

This creates the `claim` type, as well as adding its relevant CLI commands, handlers, messages, type, queriers, and keepers.

At this point, we have a working application - you can verify this by checking the output of the secondary terminal window.

However, we want to modify our application so it better fits our requirements.

## Modifying our application

We want to implement an interface that allows someone to hash a file and submit the hash to the blockchain, without directly uploading its contents. We'll be implementing this via the CLI in `./x/pofe/client/cli/txClaim.go`.

### `x/pofe/client/cli/txClaim.go`

First, make sure to add the import of the following packages:
```go
package cli

import (
	...

	"crypto/sha256"
	"encoding/hex"
	"io/ioutil"
)
```

Next, we want to update our `GetCmdCreateClaim` function so it looks as follows:

```go
// CLI transaction command to create a claim
func GetCmdCreateClaim(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "create-claim [path-to-file]",
		Short: "Creates a new claim from a path to a file",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// accept a filepath, read the file, and hash it
			hasher := sha256.New()
			s, _ := ioutil.ReadFile(args[0])
			hasher.Write(s)
			argsProof := hex.EncodeToString(hasher.Sum(nil))

			// automatically scaffolded by `starport type`
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))
			msg := types.NewMsgCreateClaim(cliCtx.GetFromAddress(), string(argsProof))
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
```

We can keep the `GetCmdSetClaim` and `GetCmdDeleteClaim` functions as is.

Lastly, instead of using the auto-generated uuid `ID` as our key, we will be using the `Proof` value in our struct instead. This will make it a lot easier to query an occurrence of `Proof` in our database. We can start by modifying the `CreateClaim` method in our `./x/pofe/keeper/claim.go` file, as well as all other relevant files that use `claim.ID`, to use `claim.Proof` instead of `claim.ID`.

### `x/pofe/keeper/claim.go`

```go
func (k Keeper) CreateClaim(ctx sdk.Context, claim types.Claim) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.ClaimPrefix + claim.Proof)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(claim)
	store.Set(key, value)
}
```

In order to import types.Claim from the kepper, we have to edit our `handlerMsgCreateClaim.go` file in

### `x/pofe/handerMsgCreateClaim.go`

```go
package pofe

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/user/pofe/x/pofe/keeper"
	"github.com/user/pofe/x/pofe/types"
)

func handleMsgCreateClaim(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateClaim) (*sdk.Result, error) {
	var claim = types.Claim{
		Creator: msg.Creator,
		Proof:   msg.Proof,
	}
	k.CreateClaim(ctx, claim)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}

```

## Submit a Proof of File Existence claim

Once there are no more errors to run through, we can start submitting claims on our blockchain!

Let's start with the easiest one - let's say we want to prove that we made this blockchain.

When we run `starport chain serve`, we're also building the application to a binary called `pofed`, so we can use this file to submit a claim:

```
pofecli tx pofe create-claim $(which pofed) --from user1
```

After confirming the transaction, run:

``` 
pofecli q pofe list-claim
```

You should see an output like this:

```
[
  {
    "creator": "cosmos165hphx98d767c99gtm0n7gevq2q0nwrg75pfkd",
    "proof": "534f056e58115dd106d026e00da22a32f8c776a0cd5b3dd6431598d73b5f623c"
  }
]
```

Congratulations! Your claim is now on the blockchain, proving you built this app!

If you ever want to remove or delete the claim, you can simply run the command by - of course - replacing the proof:

```
pofecli tx pofe delete-claim 534f056e58115dd106d026e00da22a32f8c776a0cd5b3dd6431598d73b5f623c --from user1
```

In the next section, we will be implementing a user interface in vue for our application.
