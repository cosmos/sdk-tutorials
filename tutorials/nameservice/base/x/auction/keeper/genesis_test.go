package keeper_test

import (
	"testing"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"

	"github.com/stretchr/testify/require"
)

func TestInitGenesis(t *testing.T) {
	fixture := initFixture(t)

	data := &auction.GenesisState{}
	err := fixture.k.InitGenesis(fixture.ctx, data)
	require.NoError(t, err)
}

func TestExportGenesis(t *testing.T) {
	fixture := initFixture(t)

	_, err := fixture.k.ExportGenesis(fixture.ctx)
	require.NoError(t, err)
}
