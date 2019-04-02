# 构建你的程序

## `Makefile`

通过在根目录中编写包含常用命令的`./Makefile`来帮助用户编译应用程序：

> 注意：下面的Makefile包含一些与Cosmos SDK和Tendermint的Makefiles相同的命令。

```makefile
DEP := $(shell command -v dep 2> /dev/null)

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
	go install ./cmd/nsd
	go install ./cmd/nscli
```

## `Gopkg.toml`

**即将被 go.mod 替代。Update tutorial to use go.mod instead of dep [#51](https://github.com/cosmos/sdk-application-tutorial/issues/51)**

Golang有一些依赖管理工具。在本教程中，你将使用[`dep`](https://golang.github.io/dep/)。`dep`使用仓库根目录中的`Gopkg.toml`文件来定义应用程序所需的依赖项。Cosmos SDK应用程序目前依赖于某些库的特定版本。以下列表包含所有必需的版本。首先使用下面的`constraints`和`overrides`项替换`./Gopkg.toml`文件的内容：

```go
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
  version = "v0.33.0"

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
  version = "v0.14.1"

[[override]]
  name = "github.com/tendermint/tendermint"
  revision = "v0.31.0-dev0"

[[override]]
  name = "github.com/tendermint/iavl"
  version = "=v0.12.1"

[[override]]
  name = "golang.org/x/crypto"
  source = "https://github.com/tendermint/crypto"
  revision = "3764759f34a542a3aef74d6b02e35be7ab893bba"

[[override]]
  name = "github.com/otiai10/copy"
  revision = "7e9a647135a142c2669943d4a4d29be015ce9392"

[[override]]
  name = "github.com/btcsuite/btcd"
  revision = "ed77733ec07dfc8a513741138419b8d9d3de9d2d"

[prune]
  go-tests = true
  unused-packages = true
```

> 注意：如果你再你自己的仓库重头开始编写项目，请确定在运行`dep ensure -v`之前你已经导入路径`github.com/cosmos/sdk-application-tutorial`替换成你自己的整个仓库(可能是`github.com/{.Username}/{.Project.Repo}`)。如果不这样做，则需要在再次运行`dep ensure -v`之前删除`./vendor`目录（`rm -rf ./vendor`）以及`Gopkg.lock`文件（`rm Gopkg.lock`）。

既然已经完成了这项管理工作，是时候安装dep以及项目依赖：

```bash
make get_tools
dep ensure -v
```

## 编译应用程序

```bash
# Update dependencies to match the constraints and overrides above
dep ensure -update -v

# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

### 恭喜，您已完成名称服务应用！ 尝试[运行并使用](./15-build-run.md)吧！

