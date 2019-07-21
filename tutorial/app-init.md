# Start your application

Get started by creating a new file: `./app.go`. This file is the heart of your deterministic state-machine (blockchain). `app.go` is where the different modules are initialized and configured into a complete application using the `sdk.ModuleBasicManager`.

In `app.go`, you define what the application does when it receives a transaction. But first, it needs to be able to receive transactions in the correct order. This is the role of the [Tendermint consensus engine](https://github.com/tendermint/tendermint).

Start by importing the necessary dependencies:

# 프로그램 시작하기

프로젝트 폴더 바로 아래에 새로운 파일 `./app.go`를 만들면서 시작합니다. 이 파일은 우리의 결정적 상태 기계, 즉 블록체인의 가장 중요한 파일입니다. 'app.go' 파일은 다른 모듈들이 'sdk.ModuleBasicManager'를 사용하여 프로그램의 완벽한 동작을 위해 초기화되거나 설정값을 변경하는 파일입니다. 

이 'app.go' 파일에서, 우리는 프로그램이 거래를 받았을 때 어떻게 동작하는지를 정의합니다. 하지만 그 전에 먼저, 올바른 순서, 올바른 형식으로 거래를 받을 수 있어야 할 것입니다. 이는 [텐더민트 합의 엔진(Tendermint consensus engine)](https://github.com/tendermint/tendermint)의 역할입니다. 

필요한 의존성 파일들을 임포트하는 것으로 시작합니다. : 

```go
package app

import (
	"encoding/json"
	"os"

	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/x/auth"

	"github.com/cosmos/cosmos-sdk/x/auth/genaccounts"

	"github.com/cosmos/cosmos-sdk/x/bank"
	distr "github.com/cosmos/cosmos-sdk/x/distribution"
	"github.com/cosmos/cosmos-sdk/x/params"
	"github.com/cosmos/cosmos-sdk/x/staking"
	"github.com/cosmos/sdk-application-tutorial/x/nameservice"

	bam "github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
	cmn "github.com/tendermint/tendermint/libs/common"
	dbm "github.com/tendermint/tendermint/libs/db"
)
```

Links to godocs for each module and package imported:

- [`log`](https://godoc.org/github.com/tendermint/tendermint/libs/log): Tendermint's logger.
- [`auth`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth): The `auth` module for the Comsos SDK.
- [`dbm`](https://godoc.org/github.com/tendermint/tendermint/libs/db): Code for working with the Tendermint database.
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp): See below

각 모듈들과 패키지들의 godocs 링크입니다. :

- ['log'](https://godoc.org/github.com/tendermint/tendermint/libs/log): 텐더민트의 로거(기록하는 모듈)입니다. 
- ['auth'](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth): Cosmos SDK의 'auth' 모듈입니다.
- ['dbm'](https://godoc.org/github.com/tendermint/tendermint/libs/db): 텐더민트 데이터베이스를 사용하기 위한 코드입니다. 
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp): 이 문서에서 후술할 내용입니다. 

A couple of the packages here are `tendermint` packages. Tendermint passes transactions from the network to the application through an interface called the [ABCI](https://github.com/tendermint/tendermint/tree/master/abci). If you look at the architecture of the blockchain node you are building, it looks like the following:

여기있는 패키지들은 모두 '텐더민트' 패키지들입니다. 텐더민트는 [ABCI](https://github.com/tendermint/tendermint/tree/master/abci)라는 인터페이스를 통해서 트랜잭션을 네트워크에서 프로그램으로 전달합니다. 우리가 만들고 있는 블록체인 노드의 구조는 다음과 같습니다. : 

```
+---------------------+
|                     |
|     Application     |
|                     |
+--------+---+--------+
         ^   |
         |   | ABCI
         |   v
+--------+---+--------+
|                     |
|                     |
|     Tendermint      |
|                     |
|                     |
+---------------------+
```

Fortunately, you do not have to implement the ABCI interface. The Cosmos SDK provides a boilerplate implementation of it in the form of [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp).

다행히, 우리는 ABCI 인터페이스를 구현할 필요가 없습니다. Cosmos SDK는 [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp)의 형태로 표준형 구현체를 제공합니다. 

Here is what `baseapp` does:

- Decode transactions received from the Tendermint consensus engine.
- Extract messages from transactions and do basic sanity checks.
- Route the message to the appropriate module so that it can be processed. Note that `baseapp` has no knowledge of the specific modules you want to use. It is your job to declare such modules in `app.go`, as you will see later in this tutorial. `baseapp` only implements the core routing logic that can be applied to any module.
- Commit if the ABCI message is [`DeliverTx`](https://tendermint.com/docs/spec/abci/abci.html#delivertx) ([`CheckTx`](https://tendermint.com/docs/spec/abci/abci.html#checktx) changes are not persistent).
- Help set up [`Beginblock`](https://tendermint.com/docs/spec/abci/abci.html#beginblock) and [`Endblock`](https://tendermint.com/docs/spec/abci/abci.html#endblock), two messages that enable you to define logic executed at the beginning and end of each block. In practice, each module implements its own `BeginBlock` and `EndBlock` sub-logic, and the role of the app is to aggregate everything together (_Note: you won't be using these messages in your application_).
- Help initialise your state.
- Help set up queries.

다음은 'baseapp'의 기능입니다. : 

- 텐더민트 합의 엔진이 보낸 거래를 해석합니다. 
- 트랜잭션으로부터 메시지를 추출하고, 기본 상태를 검사합니다. 
- 메시지가 작동될 수 있도록 적절한 모듈에 메시지를 보내줍니다. 'baseapp'은 우리가 어떤 특정 모듈을 쓰고 싶어 하는지 알 수 없기 때문입니다. 우리는 'app.go'에서, 튜토리얼의 후반부에 볼 수 있겠지만, 이러한 모듈들을 선언해야 합니다. 'baseapp'은 어떤 모듈에도 적용될 수 있는 코어 연결 로직만을 실행합니다. 
- ABCI 메시지가 [`DeliverTx`](https://tendermint.com/docs/spec/abci/abci.html#delivertx)일 경우, 이를 커밋합니다. ([`CheckTx`](https://tendermint.com/docs/spec/abci/abci.html#checktx)는 지속적인 변경이 불가능합니다).
- [`Beginblock`](https://tendermint.com/docs/spec/abci/abci.html#beginblock) 과 [`Endblock`](https://tendermint.com/docs/spec/abci/abci.html#endblock)의 설정을 지원합니다. 이 두개의 메시지는 각 블록의 시작과 끝에 실행되는 로직을 정의합니다. 실제로, 각 모듈은 각자의 'BeginBlock' 과 'EndBlock'의 서브 로직을 실행하고, 프로그램의 역할은 각 모듈들이 실행한 'BeginBlock' 과 'EndBlock' 을 합치는 것입니다(우리의 프로그램에서는 이 메시지들을 사용하지 않습니다).
- 상태 초기화를 지원합니다. 
- 쿼리 설정을 지원합니다. 

Now you need to create a new custom type `nameServiceApp` for your application. This type will embed `baseapp` (embedding in Go similar to inheritance in other languages), meaning it will have access to all of `baseapp`'s methods.

이제 우리는 프로그램을 위한 새로운 사용자 정의 형식 'nameServiceApp' 을 생성해야 합니다. 이 형식은 'baseap'을 임베드(embed)합니다(Go에서 임베딩(embedding)은 다른 언어의 상속과 유사한 개념입니다). 이는 우리의 프로그램이 'baseapp' 의 모든 메서드에 접근 권한을 갖는다는 의미입니다. 

```go
const appName = "nameservice"

var (
	// default home directories for the application CLI
	DefaultCLIHome = os.ExpandEnv("$HOME/.nscli")

	// DefaultNodeHome sets the folder where the application data and configuration will be stored
	DefaultNodeHome = os.ExpandEnv("$HOME/.nsd")

	// ModuleBasicManager is in charge of setting up basic module elements
	ModuleBasics sdk.ModuleBasicManager
)

type nameServiceApp struct {
    *bam.BaseApp
}
```

Add a simple constructor for your application:

간단한 생성자를 추가합니다. : 

```go
func NewNameServiceApp(logger log.Logger, db dbm.DB) *nameServiceApp {

    // First define the top level codec that will be shared by the different modules. Note: Codec will be explained later
    cdc := MakeCodec()

    // BaseApp handles interactions with Tendermint through the ABCI protocol
    bApp := bam.NewBaseApp(appName, logger, db, auth.DefaultTxDecoder(cdc))

    var app = &nameServiceApp{
        BaseApp: bApp,
        cdc:     cdc,
    }

    return app
}
```

Great! You now have the skeleton of your application; however, it still lacks functionality.

`baseapp` has no knowledge of the routes or user interactions you want to use in your application. The primary role of your application is to define these routes. Another role is to define the initial state. Both these things require that you add modules to your application.

As you have seen in the [application design](./app-design.md) section, you need a couple modules for your nameservice: `auth`, `bank`, `staking`, `distribution`, `slashing` and `nameservice`. The first two already exist, but not the last! The `nameservice` module will define the bulk of your state machine. The next step is to build it.

좋습니다! 이제 우리의 프로그램은 뼈대를 갖추었습니다. 하지만 아직 많은 기능이 부족합니다. 

'baseapp' 은 프로그램에서 우리가 사용할 경로나 사용자 상호작용을 알지 못합니다. 우리 프로그램의 주 역할은 이 경로들을 정의하는 것입니다. 다른 역할은 초기 상태를 정의하는 것입니다. 두 가지 모두 작동을 위해 우리 프로그램에 모듈을 추가해야 합니다. 

[application design](./app-design.md) 에서 보았듯이, 네임서비스를 만들기 위해서는 `auth`, `bank`, `staking`, `distribution`, `slashing`, `nameservice` 등 많은 모듈들이 필요합니다. 이 중 두개는 이미 만들었지만, 나머지는 아직 없죠. 'nameservice' 모듈은 우리 상태 기계의 대부분을 정의할 것입니다. 다음 단계는 이 'nameservice' 모듈을 만드는 것입니다. 

### In order to complete your application, you need to include modules. Go ahead and [start building your nameservice module](types.md). You will come back to `app.go` later.

### 프로그램을 완성시키기 위해서, 우리는 모듈들이 필요합니다. [이제 nameservice 모듈을 만들 때 입니다](types.md). 나중에 우린 다시 'app.go' 로 되돌아 올 것입니다. 
