# Building your app

## `Makefile`

Help users build your application by writing a `Makefile` that includes common commands:

> _*NOTE*_: The below Makefile contains some of same commands as the Cosmos SDK and Tendermint Makefiles.

```make
DEP := $(shell command -v dep 2> /dev/null)

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
	go install ./cmd/nameserviced
	go install ./cmd/nameservicecli
```

## `Gopkg.toml`

Golang has a few dependency management tools. In this tutorial you will be using [`dep`](https://golang.github.io/dep/). `dep` uses a `Gopkg.toml` file in the root of the repository to define what dependencies the application needs. Cosmos SDK apps currently depend on specific versions of some libraries. The below manifest contains all the necessary versions. First, to initialize `dep`, run the following command (this may take a few minutes):


```bash
make get_tools
dep init -v
```
> _*NOTE*_: If you are starting from scratch in your own repo, before running `dep init -v` BE SURE YOU HAVE REPLACED THE IMPORT FOR `github.com/cosmos/sdk-application-tutorial` WITH THE IMPORT FOR YOUR REPO (probably `github.com/{{ .Username }}/{{ .Project.Repo }}`). If you don't you will need to remove the `./vendor` directory (`rm -rf ./vendor`) as well as the `Gopkg.toml` and `Gopkg.lock` files (`rm Gopkg.*`) before running `dep init -v` again.

Once that has finished running replace the contents of the `./Gopkg.toml` file with the `constraints` and `overrides` below:

```toml
# Gopkg.toml example
#
# Refer to https://golang.github.io/dep/docs/Gopkg.toml.html
# for detailed Gopkg.toml documentation.
#
# required = ["github.com/user/thing/cmd/thing"]
# ignored = ["github.com/user/project/pkgX", "bitbucket.org/user/project/pkgA/pkgY"]
#
# [[constraint]]
#   name = "github.com/user/project"
#   version = "1.0.0"
#
# [[constraint]]
#   name = "github.com/user/project2"
#   branch = "dev"
#   source = "github.com/myfork/project2"
#
# [[override]]
#   name = "github.com/x/y"
#   version = "2.4.0"
#
# [prune]
#   non-go = false
#   go-tests = true
#   unused-packages = true

[[constraint]]
  name = "github.com/cosmos/cosmos-sdk"
  branch = "develop"

[[override]]
  name = "github.com/golang/protobuf"
  version = "=1.1.0"

[[constraint]]
  name = "github.com/spf13/cobra"
  version = "~0.0.1"

[[constraint]]
  name = "github.com/spf13/viper"
  version = "~1.0.0"

[[override]]
  name = "github.com/tendermint/go-amino"
  version = "=v0.12.0"

[[override]]
  name = "github.com/tendermint/iavl"
  version = "=v0.11.0"

[[override]]
  name = "github.com/tendermint/tendermint"
  version = "=0.25.0"

[[override]]
  name = "golang.org/x/crypto"
  source = "https://github.com/tendermint/crypto"
  revision = "3764759f34a542a3aef74d6b02e35be7ab893bba"

[prune]
  go-tests = true
  unused-packages = true
```

## Building the app

```bash
# Update dependencies to match the constraints and overrides above
dep ensure -update -v

# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nameserviced help
nameservicecli help
```

### Congratulations, you have finished your nameservice application! Try [running and interacting with it](../README.md#running-the-live-network-and-using-the-commands)!
