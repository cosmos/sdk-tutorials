package keeper_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle"
)

func TestIncrementCounter(t *testing.T) {
	f := initFixture(t)
	require := require.New(t)

	testCases := []struct {
		name            string
		request         *oracle.MsgIncrementCounter
		expectErrMsg    string
		expectedCounter uint64
	}{
		{
			name: "set invalid sender (not an address)",
			request: &oracle.MsgIncrementCounter{
				Sender: "foo",
			},
			expectErrMsg: "invalid sender address",
		},
		{
			name: "set valid sender",
			request: &oracle.MsgIncrementCounter{
				Sender: "cosmos139f7kncmglres2nf3h4hc4tade85ekfr8sulz5",
			},
			expectErrMsg:    "",
			expectedCounter: 1,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			_, err := f.msgServer.IncrementCounter(f.ctx, tc.request)
			if tc.expectErrMsg != "" {
				require.Error(err)
				require.ErrorContains(err, tc.expectErrMsg)
			} else {
				require.NoError(err)

				counter, err := f.k.Counter.Get(f.ctx, tc.request.Sender)
				require.NoError(err)
				require.Equal(tc.expectedCounter, counter)
			}
		})
	}
}
