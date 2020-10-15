---
order: 1
---


# Building our PoFE blockchain using Starport

We can scaffold our application by running `starport app github.com/user/pofe`. This creates a new folder called `pofe` which contains the code for your app.

```
starport app github.com/user/pofe
```

## Run application

After scaffolding our application, let's open up a separate terminal window in the newly created `pofe` folder and run `starport serve`, which will start our application. Here, you should be able to see the following output, as well as any errors that show up in your application.

```
$ starport serve
Cosmos' version is: Launchpad

📦 Installing dependencies...
🛠️  Building the app...
🙂 Created an account. Password (mnemonic): joy manage firm arrange finish bounce power shove bring bundle issue chief quiz spread symptom sword slender vote hobby water weird trim panther slot
🙂 Created an account. Password (mnemonic): meat skirt slab smart impulse region clump genuine zero clog version father spray midnight tip poem input fantasy decide buddy work strategy nest shaft
🌍 Running a Cosmos 'pofe' app with Tendermint at http://localhost:26657.
🌍 Running a server at http://localhost:1317 (LCD)

🚀 Get started: http://localhost:12345/
```

## Creating our `Claim` type

Switch back to terminal inside the `pofe` directory and create a type called `claim` with the field `proof`:

```
starport type claim proof:string
```

This creates the `claim` type, as well as adding its relevant CLI commands, handlers, messages, type, queriers, and keepers.

At this point, we have a working application that we can use - you can verify this by checking the output of the secondary terminal window.

However, we want to modify our application so it better fits our requirements.

## Modifying our application

We want to implement an interface that allows someone to hash a file and submit the hash to the blockchain, without directly uploading its contents. We'll be implementing this via the command line in `./x/pofe/client/cli/txClaim.go`:

```go
package cli

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"io/ioutil"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/lukitsbrian/poe/x/pofe/types"
)

func GetCmdCreateClaim(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "create-claim [path]",
		Short: "Creates a new claim",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// accept a filepath
			hasher := sha256.New()
			s, _ := ioutil.ReadFile(args[0])
			hasher.Write(s)
			argsProof := hex.EncodeToString(hasher.Sum(nil))

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

Lastly, instead of using the auto-generated uuid `ID` as our key, we will be using the `Proof` value in our struct instead. This will make it a lot easier to query an occurrence of `Proof` in our database. We can start by modifying the `CreateClaim` method in our `./x/pofe/keeper/claim.go` file, as well as all other relevant files that use `claim.ID`, to use `claim.Proof` instead of `claim.ID`.

```go
func (k Keeper) CreateClaim(ctx sdk.Context, claim types.Claim) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.ClaimPrefix + claim.Proof)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(claim)
	store.Set(key, value)
}
```

According our application design, we would only need the `Creator` and the hash of the file `Proof`. We can leave instances of `ID` in the struct for the sake of this tutorial.

However, if you wish to clean up you struct and methods, an incremental way of doing this would be to remove the `ID` field from the `Claim` struct inside the `./x/pofe/types/TypeClaim.go` file so it looks as follows:

```go
type Claim struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	Proof   string         `json:"proof" yaml:"proof"`
}
```

In your second window, you should see errors pop up, which you can incrementally change based on the errors shown.

## Submit a Proof of File Existence claim

Once there are no more errors to run through, we can start submitting claims on our blockchain!

Let's start with the easiest one - let's say we want to prove that we made this blockchain.

When we run `starport serve`, we're also building the application to a binary called `pofed`, so we can use this file to submit a claim.

```
pofecli tx pofe create-claim $(which pofed) --from user1
```

After confirming the transaction, run `pofecli q pofe list-claim`, and you should see an output like this:

```
[
  {
    "creator": "cosmos165hphx98d767c99gtm0n7gevq2q0nwrg75pfkd",
    "proof": "534f056e58115dd106d026e00da22a32f8c776a0cd5b3dd6431598d73b5f623c"
  }
]
```

Congratulations! Your claim is now on the blockchain, proving you built this app!

If you ever want to remove or delete the claim, you can simply run the command:

```
pofecli tx pofe delete-claim 534f056e58115dd106d026e00da22a32f8c776a0cd5b3dd6431598d73b5f623c --from user1
```
