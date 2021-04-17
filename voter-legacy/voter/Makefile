PACKAGES=$(shell go list ./... | grep -v '/simulation')

VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

ldflags = -X github.com/cosmos/cosmos-sdk/version.Name=voter \
	-X github.com/cosmos/cosmos-sdk/version.ServerName=voterd \
	-X github.com/cosmos/cosmos-sdk/version.ClientName=votercli \
	-X github.com/cosmos/cosmos-sdk/version.Version=$(VERSION) \
	-X github.com/cosmos/cosmos-sdk/version.Commit=$(COMMIT) 

BUILD_FLAGS := -ldflags '$(ldflags)'

all: install

install: go.sum
		@echo "--> Installing voterd & votercli"
		@go install -mod=readonly $(BUILD_FLAGS) ./cmd/voterd
		@go install -mod=readonly $(BUILD_FLAGS) ./cmd/votercli

go.sum: go.mod
		@echo "--> Ensure dependencies have not been modified"
		GO111MODULE=on go mod verify

test:
	@go test -mod=readonly $(PACKAGES)
