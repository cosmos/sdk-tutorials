---
order: 2
---
# Module migration

In this section, you migrate the `pofe` module from your v0.39 application.

## Module differences

Before you start the migration, review the differences between v0.39 and v0.40 and later Stargate modules. This overview shows the differences for modules that are scaffolded with Starport:

```sh
# # removed in Staragte
# +++ added in Stargate 

├── proto
│   └── pofe
│       ├── +++ claim.proto
│       ├── +++ genesis.proto
│       └── +++ query.proto
└── x
    └── pofe
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   ├── queryClaim.go
        │   │   ├── tx.go
        │   │   └── txClaim.go
        │   └── rest
        │       ├── queryClaim.go
        │       ├── rest.go
        │       └── txClaim.go
        ├── genesis.go
        ├── handler.go
        ├── +++ handler_claim.go
        ├── # handlerMsgCreateClaim.go
        ├── # handlerMsgDeleteClaim.go
        ├── # handlerMsgSetClaim.go
        ├── keeper
        │   ├── claim.go
        │   ├── +++ grpc_query.go
        │   ├── +++ grpc_query_claim.go
        │   ├── keeper.go
        │   ├── # params.go
        │   ├── # querier.go
        │   ├── +++ query.go
        │   └── +++ query_claim.go
        ├── module.go
        └── types
            ├── # MsgCreateClaim.go
            ├── # MsgDeleteClaim.go
            ├── # MsgSetClaim.go
            ├── +++ messages_claim.go
            ├── # TypeClaim.go
            ├── +++ claim.pb.go
            ├── codec.go
            ├── errors.go
            ├── # events.go
            ├── # expected_keepers.go
            ├── genesis.go
            ├── +++ genesis.pb.go
            ├── keys.go
            ├── # params.go
            ├── query.go
            ├── +++ query.pb.go
            ├── +++ query.pb.gw.go
            └── types.go
```

One of the key differences is the integration of gRPC and protobuf in your application. Protobufs are an efficient method for serializing messages and the current industry standard.

## Scaffolding your Stargate module

In theory, you **could** copy a module from your existing application and make relevant changes based on the information in the [App and Modules Migration](https://docs.cosmos.network/v0.42/migrations/app_and_modules.html#app-and-modules-migration) documentation. 

This tutorial uses Starport to generate fresh Stargate-compatible files and migrate the logic from a v0.39 application. You will also change some of the logic to make your application Stargate compatible.

The first step is to inspect the `Claim` type that is defined in your v0.39 application.

```go
// launchpad/pofe/x/pofe/types/TypeClaim.go

package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Claim struct {
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  ID      string         `json:"id" yaml:"id"`
  Proof   string         `json:"proof" yaml:"proof"`
}
```

As `Creator` and `ID` are both default fields for Starport, we can use the `starport type` command to create our `Claim` type while defining the `proof` as a `string` - 

```
$ starport type claim proof:string

🎉 Created a type `claim`.

``` 

Once this is done, you should see a few new files added to your application - 
- `proto/pofe/claim.proto`
- `x/pofe/{cli|rest}/{queryClaim|txClaim}.go`
- `x/pofe/keeper/claim.go`
- `x/pofe/keeper/grpc_query_claim.go`
- `x/pofe/keeper/query_claim.go`
- `x/pofe/keeper/query.go`
- `x/pofe/types/claim.pb.go`
- `x/pofe/types/messages_claim.go`
- `x/pofe/types/query.pb.gw.go`
- `x/pofe/handler_claim.go`

## Protobuf and gRPC

Compared to your v0.39 application, the key differences in type scaffolding is the addition of `proto/pofe/claim.proto`, `x/pofe/keeper/grpc_query_claim.go`, and `x/pofe/types/query_pb.go` files.

When you look inside the `claim.proto` file, you see the following file that contains transaction (`tx`) messages. It is safe to assume that these transaction messages mutate state.

```go
// stargate/pofe/proto/pofe/claim.proto
syntax = "proto3";
package user.pofe.pofe;

option go_package = "github.com/user/pofe/x/pofe/types";

import "gogoproto/gogo.proto";

message Claim {
  string creator = 1;
  string id = 2;
  string proof = 3; 
}

message MsgCreateClaim {
  string creator = 1;
  string proof = 2; 
}

message MsgUpdateClaim {
  string creator = 1;
  string id = 2;
  string proof = 3; 
}

message MsgDeleteClaim {
  string creator = 1;
  string id = 2;
}
```

You will also see a `query.proto` file, which contains messages used for querying the state of the blockchain. You will notice that there is a gRPC Query service defined.

```go
// stargate/pofe/proto/pofe/query.proto

syntax = "proto3";
package user.pofe.pofe;

import "google/api/annotations.proto";
import "cosmos/base/query/v1beta1/pagination.proto";
// this line is used by starport scaffolding # 1
import "pofe/claim.proto";

option go_package = "github.com/user/pofe/x/pofe/types";

// Query defines the gRPC querier service.
service Query {
    // this line is used by starport scaffolding # 2
	rpc Claim(QueryGetClaimRequest) returns (QueryGetClaimResponse) {
		option (google.api.http).get = "/user/pofe/pofe/claim/{id}";
	}
	rpc ClaimAll(QueryAllClaimRequest) returns (QueryAllClaimResponse) {
		option (google.api.http).get = "/user/pofe/pofe/claim";
	}

}

// this line is used by starport scaffolding # 3
message QueryGetClaimRequest {
	string id = 1;
}

message QueryGetClaimResponse {
	Claim Claim = 1;
}

message QueryAllClaimRequest {
	cosmos.base.query.v1beta1.PageRequest pagination = 1;
}

message QueryAllClaimResponse {
	repeated Claim Claim = 1;
	cosmos.base.query.v1beta1.PageResponse pagination = 2;
}
```

If you are unfamiliar with gRPC, a simple explanation is that each gRPC query is registered with a message structure that it receives, and the message structure of the response. For example, `QueryGetClaimRequest` would require an string `id`, and would return a `Claim`, which is defined in the `claim.proto` file in the same directory.

As a matter of fact, these messages will be used to generate the messages used in the application. You will notice this in `x/pofe/types/claim.pb.go` - take for example the `Claim` type. There will also be a few pre-generated helper functions including getters and marshaling methods for the messages.

```go
// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: pofe/claim.proto

package types

import (
	fmt "fmt"
	_ "github.com/gogo/protobuf/gogoproto"
	proto "github.com/gogo/protobuf/proto"
	io "io"
	math "math"
	math_bits "math/bits"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.GoGoProtoPackageIsVersion3 // please upgrade the proto package

type Claim struct {
	Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
	Id      string `protobuf:"bytes,2,opt,name=id,proto3" json:"id,omitempty"`
	Proof   string `protobuf:"bytes,3,opt,name=proof,proto3" json:"proof,omitempty"`
}

func (m *Claim) Reset()         { *m = Claim{} }
func (m *Claim) String() string { return proto.CompactTextString(m) }
func (*Claim) ProtoMessage()    {}
func (*Claim) Descriptor() ([]byte, []int) {
	return fileDescriptor_6792804c00432dd8, []int{0}
}
func (m *Claim) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Claim) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Claim.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *Claim) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Claim.Merge(m, src)
}
func (m *Claim) XXX_Size() int {
	return m.Size()
}
func (m *Claim) XXX_DiscardUnknown() {
	xxx_messageInfo_Claim.DiscardUnknown(m)
}

var xxx_messageInfo_Claim proto.InternalMessageInfo

func (m *Claim) GetCreator() string {
	if m != nil {
		return m.Creator
	}
	return ""
}

func (m *Claim) GetId() string {
	if m != nil {
		return m.Id
	}
	return ""
}

func (m *Claim) GetProof() string {
	if m != nil {
		return m.Proof
	}
	return ""
}

// MsgCreateClaim, MsgUpdateClaim, MsgDeleteClaim
```

Note that you can also generate these `.pb.go` files by running `./scripts/protocgen`.

The same concept goes for the query methods - so updating the `proto/pofe/query.proto` file and running the script will update the contents of `types/query.pb.go` and `query.pb.gw.go`.

Now, we can continue to migrate our logic to Stargate!

## Migrating your logic

As the core logic that we implemented was within the CLI, we need to be able to modify the contents and adapt them to the Stargate release.

The most important file to note is the modification we made in the `launchpad/pofe/x/pofe/client/cli/txClaim.go` file:

```go
// launchpad

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
	"github.com/user/pofe/x/pofe/types"
)

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

func GetCmdSetClaim(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "set-claim [id]  [proof]",
		Short: "Set a new claim",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			id := args[0]
			argsProof := string(args[1])

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))
			msg := types.NewMsgSetClaim(cliCtx.GetFromAddress(), id, string(argsProof))
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}

func GetCmdDeleteClaim(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "delete-claim [id]",
		Short: "Delete a new claim by ID",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))

			msg := types.NewMsgDeleteClaim(args[0], cliCtx.GetFromAddress())
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
```

As well as boilerplate `txClaim.go` file in our Stargate application:

```go
package cli

import (

	"github.com/spf13/cobra"

    "github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/user/pofe/x/pofe/types"
)

func CmdCreateClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-claim [proof]",
		Short: "Creates a new claim",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
      		argsProof := string(args[0])

        	clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgCreateClaim(clientCtx.GetFromAddress().String(), string(argsProof))
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

    return cmd
}

func CmdUpdateClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "update-claim [id] [proof]",
		Short: "Update a claim",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
            id := args[0]
      argsProof := string(args[1])

        	clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgUpdateClaim(clientCtx.GetFromAddress().String(), id, string(argsProof))
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

    return cmd
}

func CmdDeleteClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "delete-claim [id] [proof]",
		Short: "Delete a claim by id",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
            id := args[0]

        	clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgDeleteClaim(clientCtx.GetFromAddress().String(), id)
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

    return cmd
}
```

If we compare the two files, we will notice that there is a difference in how the commands are defined. For instance, the Stargate version of the functions no longer require a codec as an argument - eg. `func GetCmdXClaim(cdc *codec.Codec)` vs `func CmdXClaim()`. In this case, we can remove `cdc *codec.Codec` from each of the functions as well as the `"github.com/cosmos/cosmos-sdk/codec"` import.

Another difference you will notice is how the application reads CLI commands. This includes reading the command, building the message, and Generating or broadcasting the command. For instance, the contents of the `GetCmdCreateClaim` command will be updated as such when following the updates generated by Starport and described in further detail [here](https://docs.cosmos.network/master/migrations/app_and_modules.html#cli).

```go
func GetCmdCreateClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-claim [proof]",
		Short: "Creates a new claim",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			hasher := sha256.New()
			s, _ := ioutil.ReadFile(args[0])
			hasher.Write(s)
			argsProof := hex.EncodeToString(hasher.Sum(nil))
        	clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgCreateClaim(clientCtx.GetFromAddress().String(), string(argsProof))
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

    return cmd
}
```

Once we finish updating the rest of our custom logic, our new file `stargate/pofe/x/pofe/client/cli/txClaim.go` should look as such:

```go
package cli

import (
	"crypto/sha256"
	"encoding/hex"
	"io/ioutil"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/user/pofe/x/pofe/types"
)

func GetCmdCreateClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-claim [proof]",
		Short: "Creates a new claim",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			hasher := sha256.New()
			s, _ := ioutil.ReadFile(args[0])
			hasher.Write(s)
			argsProof := hex.EncodeToString(hasher.Sum(nil))
			clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgCreateClaim(clientCtx.GetFromAddress().String(), string(argsProof))
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}

func GetCmdUpdateClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "update-claim [id] [proof]",
		Short: "Update a claim",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			id := args[0]
			argsProof := string(args[1])

			clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgUpdateClaim(clientCtx.GetFromAddress().String(), id, string(argsProof))
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}

func GetCmdDeleteClaim() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "delete-claim [id] [proof]",
		Short: "Delete a claim by id",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			id := args[0]

			clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgDeleteClaim(clientCtx.GetFromAddress().String(), id)
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}

```

The last thing we need to do is rename the CLI commands in the `stargate/pofe/x/pofe/client/cli/tx.go` file:

```go
package cli

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	// "github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/user/pofe/x/pofe/types"
)

// GetTxCmd returns the transaction commands for this module
func GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      fmt.Sprintf("%s transactions subcommands", types.ModuleName),
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

    // this line is used by starport scaffolding # 1

	cmd.AddCommand(GetCmdCreateClaim())
	cmd.AddCommand(GetCmdUpdateClaim())
	cmd.AddCommand(GetCmdDeleteClaim())


	return cmd 
}

```

Once this has been updated, we can try to run the app with `starport chain serve`, and our application should run as expected!

```sh
$ pofed tx pofe create-claim $(which pofed) --from=user1


{"body":{"messages":[{"@type":"/lukitsbrian.pofe.pofe.MsgCreateClaim","creator":"cosmos1et76j637haxpp4kzddah6l6cfxn9ytcqsrltj0","proof":"d301c4933c688d1d890e7b44fe14df91e4bf14719c8a1fd720445366b060507d"}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[],"fee":{"amount":[],"gas_limit":"200000","payer":"","granter":""}},"signatures":[]}

confirm transaction before signing and broadcasting [y/N]: y
{"height":"199","txhash":"536258DEFA8A4C46FC8ABA75684C967D61BABBB467058F8381B8AB5A3400A9F3","codespace":"","code":0,"data":"0A0D0A0B437265617465436C61696D","raw_log":"[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"CreateClaim\"}]}]}]","logs":[{"msg_index":0,"log":"","events":[{"type":"message","attributes":[{"key":"action","value":"CreateClaim"}]}]}],"info":"","gas_wanted":"200000","gas_used":"47011","tx":null,"timestamp":""}
```

## Migrating your own application

Throughout this tutorial, you learned how to use Starport to migrate your application from v0.39 to v0.40 and later Stargate. Starport always generates the most up-to-date Cosmos SDK boilerplate code. 

Although it is possible to manually change your application code, this tutorial minimizes the changes required to migrate an application. Instead of manually modifying each file that required updates, you migrated only the custom logic that was implemented. The generated boilerplate code also serves as a useful reference to examine the fundamental changes within the application.
