DEP := $(shell command -v dep 2> /dev/null)
# TODO: Uncomment once tagged versions exist
# VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
VERSION := 0.0.1
COMMIT := $(shell git log -1 --format='%H')

ldflags = -X github.com/cosmos/sdk-application-tutorial/version.Version=$(VERSION) \
	-X github.com/cosmos/sdk-application-tutorial/version.Commit=$(COMMIT)

get_tools:
ifndef DEP
	@echo "Installing dep"
	go get -u -v github.com/golang/dep/cmd/dep
else
	@echo "Dep is already installed..."
endif

get_vendor_deps:
	@echo "--> Generating vendor directory via dep ensure"
	@rm -rf .vendor-new
	@dep ensure -v -vendor-only

update_vendor_deps:
	@echo "--> Running dep ensure"
	@rm -rf .vendor-new
	@dep ensure -v -update

install:
	go install -ldflags '$(ldflags)' ./cmd/nsd
	go install -ldflags '$(ldflags)' ./cmd/nscli
