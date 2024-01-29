package keeper_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle"
)

func TestQueryCounter(t *testing.T) {
	f := initFixture(t)
	require := require.New(t)

	resp, err := f.queryServer.Counter(f.ctx, &oracle.QueryCounterRequest{Address: f.addrs[0].String()})
	require.NoError(err)
	require.Equal(uint64(0), resp.Counter)

	_, err = f.msgServer.IncrementCounter(f.ctx, &oracle.MsgIncrementCounter{Sender: f.addrs[0].String()})
	require.NoError(err)

	resp, err = f.queryServer.Counter(f.ctx, &oracle.QueryCounterRequest{Address: f.addrs[0].String()})
	require.NoError(err)
	require.Equal(uint64(1), resp.Counter)
}
