package keeper_test

import (
	"testing"

	"github.com/golang/mock/gomock"

	storetypes "cosmossdk.io/store/types"
	addresscodec "github.com/cosmos/cosmos-sdk/codec/address"
	"github.com/cosmos/cosmos-sdk/runtime"
	"github.com/cosmos/cosmos-sdk/testutil"
	simtestutil "github.com/cosmos/cosmos-sdk/testutil/sims"
	sdk "github.com/cosmos/cosmos-sdk/types"
	moduletestutil "github.com/cosmos/cosmos-sdk/types/module/testutil"
	ns "github.com/cosmos/sdk-tutorials/x/ns-auction"
	keeper "github.com/cosmos/sdk-tutorials/x/ns-auction/keeper"
)

type testFixture struct {
	ctx         sdk.Context
	k           keeper.Keeper
	msgServer   ns.MsgServer
	queryServer ns.QueryServer

	addrs []sdk.AccAddress
}

func initFixture(t *testing.T) *testFixture {
	encCfg := moduletestutil.MakeTestEncodingConfig()
	key := storetypes.NewKVStoreKey(ns.ModuleName)
	testCtx := testutil.DefaultContextWithDB(t, key, storetypes.NewTransientStoreKey("transient_test"))
	storeService := runtime.NewKVStoreService(key)
	addrs := simtestutil.CreateIncrementalAccounts(3)
	// gomock initializations
	ctrl := gomock.NewController(t)
	bankKeeper := ns.NewMockBankKeeper(ctrl)
	defaultDenom := "stake"
	k := keeper.NewKeeper(
		encCfg.Codec,
		addresscodec.NewBech32Codec("tutorial"),
		storeService,
		addrs[0].String(),
		bankKeeper,
		defaultDenom,
	)

	err := k.InitGenesis(testCtx.Ctx, ns.NewGenesisState())
	if err != nil {
		panic(err)
	}

	return &testFixture{
		ctx:         testCtx.Ctx,
		k:           k,
		msgServer:   keeper.NewMsgServerImpl(k),
		queryServer: keeper.NewQueryServerImpl(k),
		addrs:       addrs,
	}
}
