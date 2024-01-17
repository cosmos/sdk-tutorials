package keeper_test

import (
	"testing"

	ns "github.com/cosmos/sdk-tutorials/x/ns-auction"

	"github.com/stretchr/testify/require"
)

func TestInitGenesis(t *testing.T) {
	fixture := initFixture(t)

	data := &ns.GenesisState{}
	err := fixture.k.InitGenesis(fixture.ctx, data)
	require.NoError(t, err)
}

func TestExportGenesis(t *testing.T) {
	fixture := initFixture(t)

	_, err := fixture.k.ExportGenesis(fixture.ctx)
	require.NoError(t, err)
}
