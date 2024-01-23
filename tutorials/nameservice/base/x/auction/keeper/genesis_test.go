package keeper_test

import (
	"testing"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"

)

func TestInitGenesis(t *testing.T) {
	fixture := initFixture(t)

	data := &auction.GenesisState{}
	err := fixture.k.InitGenesis(fixture.ctx, data)
	if err != nil {
		t.Errorf("InitGenesis returned an error: %v", err)
	}
}

func TestExportGenesis(t *testing.T) {
	fixture := initFixture(t)

	_, err := fixture.k.ExportGenesis(fixture.ctx)
	if err != nil {
		t.Errorf("InitGenesis returned an error: %v", err)
	}
}
