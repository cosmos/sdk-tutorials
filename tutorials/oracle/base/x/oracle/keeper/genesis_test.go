package keeper_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle"
)

func TestInitGenesis(t *testing.T) {
	fixture := initFixture(t)

	data := &oracle.GenesisState{
		Counters: []oracle.Counter{
			{
				Address: fixture.addrs[0].String(),
				Count:   5,
			},
		},
	}
	err := fixture.k.InitGenesis(fixture.ctx, data)
	require.NoError(t, err)

	count, err := fixture.k.Counter.Get(fixture.ctx, fixture.addrs[0].String())
	require.NoError(t, err)
	require.Equal(t, uint64(5), count)
}

func TestExportGenesis(t *testing.T) {
	fixture := initFixture(t)

	_, err := fixture.msgServer.IncrementCounter(fixture.ctx, &oracle.MsgIncrementCounter{
		Sender: fixture.addrs[0].String(),
	})
	require.NoError(t, err)

	out, err := fixture.k.ExportGenesis(fixture.ctx)
	require.NoError(t, err)

	require.Equal(t, uint64(1), out.Counters[0].Count)
}
