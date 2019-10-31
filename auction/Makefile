VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

ldflags = -X github.com/cosmos/cosmos-sdk/version.Name=NftAuction \
	-X github.com/cosmos/cosmos-sdk/version.ServerName=aud \
	-X github.com/cosmos/cosmos-sdk/version.ClientName=aucli \
	-X github.com/cosmos/cosmos-sdk/version.Version=$(VERSION) \
	-X github.com/cosmos/cosmos-sdk/version.Commit=$(COMMIT) \
	-X "github.com/cosmos/cosmos-sdk/version.BuildTags=$(build_tags)" \
	-compressdwarf=false

BUILD_FLAGS := -tags "$(build_tags)" -ldflags '$(ldflags)'

install: go.sum
		go install -mod=readonly $(BUILD_FLAGS) ./cmd/aud
		go install -mod=readonly $(BUILD_FLAGS) ./cmd/aucli