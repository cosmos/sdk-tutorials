# 构建你的程序

## `Makefile`

通过在根目录中编写包含常用命令的`./Makefile`来帮助用户编译应用程序：

> 注意：下面的 Makefile 包含一些与Cosmos SDK 和 Tendermint 的 Makefiles 相同的命令。

```makefile
all: install

install: go.sum
	go install -tags "$(build_tags)" ./cmd/nsd
	go install -tags "$(build_tags)" ./cmd/nscli

go.sum: go.mod
	@echo "--> Ensure dependencies have not been modified"
	@go mod verify
```

### 如何增加 Ledger Nano S 支持？

这需要一些小的修改：

- 创建文件 `Makefile.ledger`，填入下面的内容：
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
- 在 `Makefile` 文件首部添加 `include Makefile.ledger` ：

```makefile
include Makefile.ledger

all: install

install: go.sum
	GO111MODULE=1 go install -tags "$(build_tags)" ./cmd/nsd
	GO111MODULE=1 go install -tags "$(build_tags)" ./cmd/nscli

go.sum: go.mod
	@echo "--> Ensure dependencies have not been modified"
	GO111MODULE=1 @go mod verify
```

##  `go.mod`

Golang有一些依赖管理工具。在本教程中，你将使用[`Go Modules`](https://github.com/golang/go/wiki/Modules)。`Go Modules`使用仓库根目录中的`go.mod`文件来定义应用程序所需的依赖项。Cosmos SDK 应用程序目前依赖于某些库的特定版本。以下列表包含所有必需的版本。开始构建之前，用下面的内容替换`./go.mod`文件。

```
module sdk-tutorials

go 1.13

require (
	github.com/bartekn/go-bip39 v0.0.0-20171116152956-a05967ea095d
	github.com/beorn7/perks v0.0.0-20180321164747-3a771d992973
	github.com/bgentry/speakeasy v0.1.0
	github.com/btcsuite/btcd v0.0.0-20190115013929-ed77733ec07d
	github.com/btcsuite/btcutil v0.0.0-20180706230648-ab6388e0c60a
	github.com/cosmos/cosmos-sdk v0.33.0
	github.com/cosmos/go-bip39 v0.0.0-20180618194314-52158e4697b8
	github.com/cosmos/ledger-cosmos-go v0.9.8
	github.com/cosmos/sdk-application-tutorial/nameservice v0.0.0-20190401171757-ef9c78014e84
	github.com/davecgh/go-spew v1.1.1
	github.com/ethereum/go-ethereum v1.8.23
	github.com/fsnotify/fsnotify v1.4.7
	github.com/go-kit/kit v0.8.0
	github.com/go-logfmt/logfmt v0.4.0
	github.com/go-stack/stack v1.8.0
	github.com/gogo/protobuf v1.1.1
	github.com/golang/protobuf v1.2.0
	github.com/golang/snappy v0.0.1
	github.com/gorilla/mux v1.7.0
	github.com/gorilla/websocket v1.4.0
	github.com/hashicorp/hcl v1.0.0
	github.com/inconshreveable/mousetrap v1.0.0
	github.com/jmhodges/levigo v1.0.0
	github.com/kr/logfmt v0.0.0-20140226030751-b84e30acd515
	github.com/magiconair/properties v1.8.0
	github.com/mattn/go-isatty v0.0.7
	github.com/matttproud/golang_protobuf_extensions v1.0.1
	github.com/mitchellh/mapstructure v1.1.2
	github.com/pelletier/go-toml v1.2.0
	github.com/pkg/errors v0.8.0
	github.com/pmezard/go-difflib v1.0.0
	github.com/prometheus/client_golang v0.9.2
	github.com/prometheus/client_model v0.0.0-20190129233127-fd36f4220a90
	github.com/prometheus/common v0.2.0
	github.com/prometheus/procfs v0.0.0-20190328153300-af7bedc223fb
	github.com/rakyll/statik v0.1.4
	github.com/rcrowley/go-metrics v0.0.0-20180503174638-e2704e165165
	github.com/rs/cors v1.6.0
	github.com/spf13/afero v1.2.2
	github.com/spf13/cast v1.3.0
	github.com/spf13/cobra v0.0.3
	github.com/spf13/jwalterweatherman v1.1.0
	github.com/spf13/pflag v1.0.3
	github.com/spf13/viper v1.0.3
	github.com/stretchr/testify v1.2.2
	github.com/syndtr/goleveldb v1.0.0
	github.com/tendermint/btcd v0.1.1
	github.com/tendermint/go-amino v0.14.1
	github.com/tendermint/iavl v0.12.1
	github.com/tendermint/tendermint v0.31.0-dev0
	github.com/zondax/hid v0.9.0
	github.com/zondax/ledger-go v0.8.0
	golang.org/x/net v0.0.0-20190213061140-3a22650c66bd
	golang.org/x/sys v0.0.0-20190329044733-9eb1bfa1ce65
	golang.org/x/text v0.3.0
	google.golang.org/genproto v0.0.0-20190327125643-d831d65fe17d
	google.golang.org/grpc v1.19.1
	gopkg.in/yaml.v2 v2.2.2
)

replace golang.org/x/crypto => github.com/tendermint/crypto v0.0.0-20180820045704-3764759f34a5
```

## 编译应用程序

```bash
# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

### 恭喜，您已完成名称服务应用！ 尝试[运行并使用](./15-build-run.md)吧！

