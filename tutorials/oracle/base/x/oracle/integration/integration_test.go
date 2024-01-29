package integration_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	// blank import for app wiring registration
	_ "github.com/cosmos/cosmos-sdk/x/auth"
	_ "github.com/cosmos/cosmos-sdk/x/auth/tx/config"
	_ "github.com/cosmos/cosmos-sdk/x/bank"
	_ "github.com/cosmos/cosmos-sdk/x/consensus"
	_ "github.com/cosmos/cosmos-sdk/x/genutil"
	_ "github.com/cosmos/cosmos-sdk/x/mint"
	_ "github.com/cosmos/sdk-tutorials/x/staking"
	_ "github.com/cosmos/sdk-tutorials/x/oracle"

	appv1alpha1 "cosmossdk.io/api/cosmos/app/v1alpha1"
	"cosmossdk.io/core/appconfig"
	"cosmossdk.io/depinject"
	"cosmossdk.io/log"
	"github.com/cosmos/cosmos-sdk/testutil/configurator"
	simtestutil "github.com/cosmos/cosmos-sdk/testutil/sims"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/x/oracle"
	oraclemodulev1 "github.com/cosmos/sdk-tutorials/tutorials/oracle/x/oracle/api/module/v1"
	"github.com/cosmos/sdk-tutorials/tutorials/oracle/x/oracle/keeper"
)

// ExampleModule is a configurator.ModuleOption that add the oracle module to the app config.
var ExampleModule = func() configurator.ModuleOption {
	return func(config *configurator.Config) {
		config.ModuleConfigs[oracle.ModuleName] = &appv1alpha1.ModuleConfig{
			Name:   oracle.ModuleName,
			Config: appconfig.WrapAny(&oraclemodulev1.Module{}),
		}
	}
}

func TestIntegration(t *testing.T) {
	t.Parallel()

	logger := log.NewTestLogger(t)
	appConfig := depinject.Configs(
		configurator.NewAppConfig(
			configurator.AuthModule(),
			configurator.BankModule(),
			configurator.StakingModule(),
			configurator.TxModule(),
			configurator.ConsensusModule(),
			configurator.GenutilModule(),
			configurator.MintModule(),
			ExampleModule(),
			configurator.WithCustomInitGenesisOrder(
				"auth",
				"bank",
				"staking",
				"mint",
				"genutil",
				"consensus",
				oracle.ModuleName,
			),
		),
		depinject.Supply(logger))

	var keeper keeper.Keeper
	app, err := simtestutil.Setup(appConfig, &keeper)
	require.NoError(t, err)
	require.NotNil(t, app) // use the app or the keeper for running integration tests
}
