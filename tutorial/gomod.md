# Building your app

## `Makefile`

Help users build your application by writing a `./Makefile` in the root directory that includes common commands:

> _*NOTE*_: The below Makefile contains some of same commands as the Cosmos SDK and Tendermint Makefiles.

```makefile
all: lint install

install: go.sum
		go install -mod=readonly $(BUILD_FLAGS) ./cmd/nsd
		go install -mod=readonly $(BUILD_FLAGS) ./cmd/nscli

go.sum: go.mod
		@echo "--> Ensure dependencies have not been modified"
		GO111MODULE=on go mod verify

lint:
	golangci-lint run
	@find . -name '*.go' -type f -not -path "./vendor*" -not -path "*.git*" | xargs gofmt -d -s
	go mod verify
```

### How about including Ledger Nano S support?

This requires a few small changes:

- Create a file `Makefile.ledger` with the following content:

```makefile
LEDGER_ENABLED ?= true

build_tags =
ifeq ($(LEDGER_ENABLED),true)
  ifeq ($(OS),Windows_NT)
    GCCEXE = $(shell where gcc.exe 2> NUL)
    ifeq ($(GCCEXE),)
      $(error gcc.exe not installed for ledger support, please install or set LEDGER_ENABLED=false)
    else
      build_tags += ledger
    endif
  else
    UNAME_S = $(shell uname -s)
    ifeq ($(UNAME_S),OpenBSD)
      $(warning OpenBSD detected, disabling ledger support (https://github.com/cosmos/cosmos-sdk/issues/1988))
    else
      GCC = $(shell command -v gcc 2> /dev/null)
      ifeq ($(GCC),)
        $(error gcc not installed for ledger support, please install or set LEDGER_ENABLED=false)
      else
        build_tags += ledger
      endif
    endif
  endif
endif
```

- Add `include Makefile.ledger` at the beginning of the Makefile:

```makefile
include Makefile.ledger
all: lint install

install: go.sum
		go install -mod=readonly $(BUILD_FLAGS) ./cmd/nsd
		go install -mod=readonly $(BUILD_FLAGS) ./cmd/nscli

go.sum: go.mod
		@echo "--> Ensure dependencies have not been modified"
		GO111MODULE=on go mod verify

lint:
	golangci-lint run
	find . -name '*.go' -type f -not -path "./vendor*" -not -path "*.git*" | xargs gofmt -d -s
	go mod verify

```

## `go.mod`

Golang has a few dependency management tools. In this tutorial you will be using [`Go Modules`](https://github.com/golang/go/wiki/Modules). `Go Modules` uses a `go.mod` file in the root of the repository to define what dependencies the application needs. Cosmos SDK apps currently depend on specific versions of some libraries. The below manifest contains all the necessary versions. To get started replace the contents of the `./go.mod` file with the `constraints` and `overrides` below:

> _*NOTE*_: If you are following along in your own repo you will need to change the module path to reflect that (`github.com/{ .Username }/{ .Project.Repo }`).

```
module github.com/cosmos/sdk-application-tutorial

go 1.12

require (
	github.com/cosmos/cosmos-sdk v0.37.0
	github.com/go-logfmt/logfmt v0.4.0 // indirect
	github.com/gorilla/mux v1.7.0
	github.com/mattn/go-isatty v0.0.7 // indirect
	github.com/prometheus/procfs v0.0.0-20190328153300-af7bedc223fb // indirect
	github.com/spf13/afero v1.2.2 // indirect
	github.com/spf13/cobra v0.0.5
	github.com/spf13/viper v1.3.2
	github.com/tendermint/go-amino v0.15.0
	github.com/tendermint/tendermint v0.32.2
	github.com/tendermint/tm-db v0.1.1
	golang.org/x/sys v0.0.0-20190329044733-9eb1bfa1ce65 // indirect
	google.golang.org/appengine v1.4.0 // indirect
	google.golang.org/genproto v0.0.0-20190327125643-d831d65fe17d // indirect
)
```

## Building the app

```bash
# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

### Congratulations, you have finished your nameservice application! Try [running and interacting with it](./build-run.md)!
