package keeper_test

import (
	"testing"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"

	"github.com/stretchr/testify/require"
)

func TestMsg(t *testing.T) {
	f := initFixture(t)
	require := require.New(t)

	testCases := []struct {
		name         string
		request      *auction.MsgBid
		expectErrMsg string
	}{
		{
			name:         "Success",
			request:      &auction.MsgBid{},
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
