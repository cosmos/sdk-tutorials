package module

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/spf13/cobra"

	abci "github.com/cometbft/cometbft/abci/types"
	gwruntime "github.com/grpc-ecosystem/grpc-gateway/runtime"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"

	"github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction/keeper"
)

const ConsensusVersion = 1

type AppModule struct {
	cdc    codec.Codec
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.Codec, keeper keeper.Keeper) AppModule {
	return AppModule{
		cdc:    cdc,
		keeper: keeper,
	}
}

func NewAppModuleBasic(m AppModule) module.AppModuleBasic {
	return module.CoreAppModuleBasicAdaptor(m.Name(), m)
}

func (AppModule) Name() string { return auction.ModuleName }

func (AppModule) RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
	auction.RegisterLegacyAminoCodec(cdc)
}

func (AppModule) RegisterGRPCGatewayRoutes(clientCtx client.Context, mux *gwruntime.ServeMux) {
	if err := auction.RegisterQueryHandlerClient(context.Background(), mux, auction.NewQueryClient(clientCtx)); err != nil {
		panic(err)
	}
}

func (AppModule) RegisterInterfaces(registry codectypes.InterfaceRegistry) {
	auction.RegisterInterfaces(registry)
}

func (AppModule) ConsensusVersion() uint64 { return ConsensusVersion }

func (am AppModule) RegisterServices(cfg module.Configurator) {
	auction.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServerImpl(am.keeper))
	auction.RegisterQueryServer(cfg.QueryServer(), keeper.NewQueryServerImpl(am.keeper))

	// Register in place module state migration migrations
	// m := keeper.NewMigrator(am.keeper)
	// if err := cfg.RegisterMigration(ns.ModuleName, 1, m.Migrate1to2); err != nil {
	// 	panic(fmt.Sprintf("failed to migrate x/%s from version 1 to 2: %v", ns.ModuleName, err))
	// }
}

func (AppModule) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	return cdc.MustMarshalJSON(auction.NewGenesisState())
}

func (AppModule) ValidateGenesis(cdc codec.JSONCodec, _ client.TxEncodingConfig, bz json.RawMessage) error {
	var data auction.GenesisState
	if err := cdc.UnmarshalJSON(bz, &data); err != nil {
		return fmt.Errorf("failed to unmarshal %s genesis state: %w", auction.ModuleName, err)
	}

	return data.Validate()
}

func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
	var genesisState auction.GenesisState
	cdc.MustUnmarshalJSON(data, &genesisState)

	if err := am.keeper.InitGenesis(ctx, &genesisState); err != nil {
		panic(fmt.Sprintf("failed to initialize %s genesis state: %v", auction.ModuleName, err))
	}

	return nil
}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	gs, err := am.keeper.ExportGenesis(ctx)
	if err != nil {
		panic(fmt.Sprintf("failed to export %s genesis state: %v", auction.ModuleName, err))
	}

	return cdc.MustMarshalJSON(gs)
}

func (AppModule) GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:  auction.ModuleName,
		Args: cobra.ExactArgs(1),
		RunE: client.ValidateCmd,
	}

	cmd.AddCommand(
		ReserveCmd(),
	)
	return cmd
}

func ReserveCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "reserve [name] [resolve_address] [amount]",
		Short: "Create a new game",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}
			cmd.Println(fmt.Sprintf("This is the name: %s", args[0]))
			cmd.Println(fmt.Sprintf("This is the resolve: %s", args[1]))
			cmd.Println(fmt.Sprintf("This is the amount: %s", args[2]))

			sender := clientCtx.GetFromAddress()

			amt, err := sdk.ParseCoinsNormalized(args[2])
			if err != nil {
				return err
			}

			msg := &auction.MsgBid{
				Name:           args[0],
				ResolveAddress: args[1],
				Owner:          sender.String(),
				Amount:         amt,
			}

			cmd.Println("Reserve Name: %s", msg)

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func QueryWhoisCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "whois [name]",
		Short: "Get the resolve address and owner for a name record",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			queryClient := auction.NewQueryClient(clientCtx)
			params := &auction.QueryNameRequest{Name: args[0]}
			res, err := queryClient.Name(context.Background(), params)
			if err != nil {
				return err
			}

			cmd.Println(fmt.Sprintf("This is the name: %s", args[0]))
			cmd.Println(fmt.Sprintf("This is the resolve: %s", res.Name))
			cmd.Println(fmt.Sprintf("This is the owner: %s", res.Name.Owner))

			return nil
		},
	}

	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}
