package keeper_test

import (
	"testing"

	ns "github.com/cosmos/sdk-tutorials/tutorials/ns-auction/x/ns-auction"

	"github.com/stretchr/testify/require"
)

func TestMsgReserve(t *testing.T) {
	f := initFixture(t)
	require := require.New(t)

	testCases := []struct {
		name         string
		request      *ns.MsgBid
		expectErrMsg string
	}{
		{
			name:         "Success",
			request:      &ns.MsgBid{},
			expectErrMsg: "",
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			_, err := f.msgServer.Bid(f.ctx, tc.request)
			if tc.expectErrMsg != "" {
				require.Error(err)
				require.ErrorContains(err, tc.expectErrMsg)
			} else {
				require.NoError(err)
			}
		})
	}
}
