package keeper_test

import (
	"fmt"
	"testing"

	"github.com/cosmos/sdk-tutorials/x/oracle"
	"github.com/stretchr/testify/require"
)

func TestUpdateParams(t *testing.T) {
	f := initFixture(t)
	require := require.New(t)

	testCases := []struct {
		name         string
		request      *oracle.MsgUpdateParams
		expectErrMsg string
	}{
		{
			name: "set invalid authority (not an address)",
			request: &oracle.MsgUpdateParams{
				Authority: "foo",
			},
			expectErrMsg: "invalid authority address",
		},
		{
			name: "set invalid authority (not defined authority)",
			request: &oracle.MsgUpdateParams{
				Authority: f.addrs[1].String(),
			},
			expectErrMsg: fmt.Sprintf("unauthorized, authority does not match the module's authority: got %s, want %s", f.addrs[1].String(), f.k.GetAuthority()),
		},
		{
			name: "set valid params",
			request: &oracle.MsgUpdateParams{
				Authority: f.k.GetAuthority(),
				Params:    oracle.Params{},
			},
			expectErrMsg: "",
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			_, err := f.msgServer.UpdateParams(f.ctx, tc.request)
			if tc.expectErrMsg != "" {
				require.Error(err)
				require.ErrorContains(err, tc.expectErrMsg)
			} else {
				require.NoError(err)
			}
		})
	}
}

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
