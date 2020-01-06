---
order: 3
---

# Makefile

Now let's add a short makefile so we can build our basic app. Open up your
`Makefile` and add the following code. Later we will add an additional command
to build our CLI tools.

```bash
VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

ldflags = -X github.com/cosmos/cosmos-sdk/version.Name=HelloChain \
	-X github.com/cosmos/cosmos-sdk/version.ServerName=hcd \
	-X github.com/cosmos/cosmos-sdk/version.ClientName=hccli \
	-X github.com/cosmos/cosmos-sdk/version.Version=$(VERSION) \
	-X github.com/cosmos/cosmos-sdk/version.Commit=$(COMMIT)

BUILD_FLAGS := -ldflags '$(ldflags)'

all: install

install: go.sum
	go install -mod=readonly $(BUILD_FLAGS) ./cmd/hcd
	go install -mod=readonly $(BUILD_FLAGS) ./cmd/hccli

go.sum: go.mod
		@echo "--> Ensure dependencies have not been modified"
		go mod verify

```

Then install your basic blockchain with `make install`.

```bash
$ make install
--> Ensure dependencies have not been modified
go mod verify
all modules verified
go install -tags "" ./cmd/hcd
```

Wonderful. Next lets try out what we've built so far.

:::tip
Remember you need to have Go installed and a proper \$GOPATH configured
:::
