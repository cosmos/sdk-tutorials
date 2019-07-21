# Application Goals

# 프로그램 목적

The goal of the application you are building is to let users buy names and to set a value these names resolve to. The owner of a given name will be the current highest bidder. In this section, you will learn how these simple requirements translate to application design.

우리가 만드는 이 프로그램은 사용자들이 이름을 구매하고 이름이 정하는 값을 설정할 수 있게한다. 어떤 이름의 소유자는 현재 그 이름에 최고가에 입찰한 사람입니다. 우리는 이 단계에서 어떻게 이런 간단한 요구사항들이 프로그램 설계로 전환되는지를 배울 것입니다. 

A blockchain application is just a [replicated deterministic state machine](https://en.wikipedia.org/wiki/State_machine_replication). As a developer, you just have to define the state machine (i.e. what the state, a starting state and messages that trigger state transitions), and [_Tendermint_](https://tendermint.com/docs/introduction/introduction.html) will handle replication over the network for you.

블록체인 프로그램은 [결정적 이중화 상태 기계(replicated deterministic state machine)](https://en.wikipedia.org/wiki/State_machine_replication)입니다. 개발자로서, 우리는 상태 기계를 정의(상태 변화를 유발하는 상태 및 메시지로 시작하는 상태)할 수 있고, [_텐더민트(Tendermint)_](https://tendermint.com/docs/introduction/introduction.html)는 우리가 네트워크를 넘어서 복제 상태를 조절할 수 있게 해줍니다. 

> Tendermint is an application-agnostic engine that is responsible for handling the _networking_ and _consensus_ layers of your blockchain. In practice, this means that Tendermint is reponsible for propagating and ordering transaction bytes. Tendermint Core relies on an eponymous Byzantine-Fault-Tolerant (BFT) algorithm to reach consensus on the order of transactions. For more on Tendermint, click [here](https://tendermint.com/docs/introduction/introduction.html).

> 텐더민트는 블록체인의 _networking_ 및 _consensus_ 레이어를 우리가 관련지식이 없어도 처리할 수 있는 엔진입니다. 실제로, 이는 텐더민트가 트랜잭션 바이트를 전파하고 주문할 수 있다는 것을 의미합니다. 텐더민트 코어는 트랜잭션 주문이 합의에 도달할 때까지 이름 그대로 비잔틴 장애를 허용하는 BFT(Byzantine-Fault-Tolerant) 알고리즘에 의존합니다. 텐더민트에 대한 더 많은 정보는 [여기](https://tendermint.com/docs/introduction/introduction.html)서 볼 수 있습니다. 

The [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) is designed to help you build state machines. The SDK is a **modular framework**, meaning applications are built by aggregating a collection of interoperable modules. Each module contains its own message/transaction processor, while the SDK is responsible for routing each message to its respective module.

[Cosmos SDK](https://github.com/cosmos/cosmos-sdk/)는 상태 기계를 만들기 쉽게 하도록 설계되었습니다. SDK는  **모듈러 프레임워크**인데, 이는 프로그램이 상호운용 가능한 모듈의 모음으로 구성되는 것을 뜻합니다. 각 모듈에는 자체 메시지/트랜잭션 프로세서가 포함되어 있으며, SDK는 각 메시지를 해당 모듈로 라우팅하는 역할을 담당합니다.

Here are the modules you will need for the nameservice application:

- `auth`: This module defines accounts and fees and gives access to these functionalities to the rest of your application.
- `bank`: This module enables the application to create and manage tokens and token balances.
- `staking` : This module enables the application to have validators that people can delegate to.
- `distribution` : This module give a functional way to passively distribute rewards between validators and delegators.
- `slashing` : This module disincentivizes people with value staked in the network, ie. Validators.
- `nameservice`: This module does not exist yet! It will handle the core logic for the `nameservice` application you are building. It is the main piece of software you have to work on to build your application.

Now, take a look at the two main parts of your application: the state and the message types.

이 모듈들이 우리가 네임서비스 프로그램을 만들때 필요한 모듈들입니다. : 

- 'auth': 이 모듈은 계정과 수수료를 정의하고, 다른 모듈과 프로그램들에게 이러한 기능들에 대한 접근 권한을 부여합니다. 
- 'bank': 이 모듈은 프로그램이 토큰을 생성하고 관리할 수 있게 합니다. 
- 'staking': 이 모듈은 프로그램이 사람들이 그들의 자산을 위임할 검증인을 가질 수 있게 합니다.
- 'distribution': 이 모듈은 검증자와 위임자 사이에 보상을 분배해주는 기능적 방법을 제공합니다. 
- 'slashing': 이 모듈은 네트워크에 자산을 stake한 사람들, 즉 검증자들의 집중력을 저하시킵니다. => 검증자들의 지분을 삭감
- 'nameservice': 이 모듈은 아직 존재하지 않습니다! 이 모듈은 우리가 만들 네임세비스 프로그램의 핵심 로직을 다룰 것입니다. 이 모듈이 우리가 프로그램을 만들기 위해 주로 작업해야 하는 부분입니다. 

이제, 프로그램의 두 개의 주요 부분 : 상태와 메시지 타입을 볼 차례입니다. 

## State

The state represents your application at a given moment. It tells how much token each account possesses, what are the owners and price of each name, and to what value each name resolves to.

The state of tokens and accounts is defined by the `auth` and `bank` modules, which means you don't have to concern yourself with it for now. What you need to do is define the part of the state that relates specifically to your `nameservice` module.

In the SDK, everything is stored in one store called the `multistore`. Any number of key/value stores (called [`KVStores`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#KVStore) in the Cosmos SDK) can be created in this multistore. For this application, we will use one store to `name`s to its respective `whois`, a struct that holds a name's value, owner, and price.

## 상태

상태는 특정 시점에 프로그램을 나타냅니다. 이는 각 계정이 얼마나 많은 토큰을 소유하고 있는지, 각 이름의 소유자와 가격은 얼마인지, 그리고 각 이름이 어떤 값으로 결정되는지를 알려준다.

토큰과 계정의 상태는 우리가 지금은 신경 쓸 필요 없는 'auth'와 'bank' 모듈에 의해 정의됩니다. 우리가 해야 할 일은 네임서비스 모듈과 특별히 관련된 부분을 정의하는 것입니다. 

SDK에서, 모든 것은 'multistore'라는 공간에 저장됩니다. 많은 key/value Store가 (Cosmos SDK에서 이는 [`KVStores`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#KVStore)라고 불립니다.) multistore에서 만들어질 수 있습니다. 이 프로그램에서 우리는 'name'을 각각의 'whois'에 대응시킬 것입니다. 이때 whois는, 이름이 갖는 값과 소유자, 가격을 포함하는 구조체입니다. 

## Messages

Messages are contained in transactions. They trigger state transitions. Each module defines a list of messages and how to handle them. Here are the messages you need to implement the desired functionality for your nameservice application:

- `MsgSetName`: This message allows name owners to set a value for a given name.
- `MsgBuyName`: This message allows accounts to buy a name and become its owner.
  - When someone buys a name, they are required to pay the previous owner of the name a price higher than the price the previous owner paid for it. If a name does not have a previous owner yet, they must burn a `MinPrice` amount.

When a transaction (included in a block) reaches a Tendermint node, it is passed to the application via the [ABCI](https://github.com/tendermint/tendermint/tree/master/abci) and decoded to get the message. The message is then routed to the appropriate module and handled there according to the logic defined in the `Handler`. If the state needs to be updated, the `Handler` calls the `Keeper` to perform the update. You will learn more about these concepts in the next steps of this tutorial.

## 메시지

메시지는 트랜잭션 안에 들어있습니다. 그들은 상태 변화를 유발합니다. 각 모듈은 메시지 목록과, 이것을 어떻게 다루어야 할지 정의하고 있습니다. 이 네임서비스 프로그램에 필요한 기능을 넣기 위한 메시지들은 다음과 같습니다. :

- `MsgSetName`: 이 메시지는 이름의 주인이 이름이 갖는 값을 설정할 수 있게 합니다.
- `MsgBuyName`: 이 메시지는 계정들이 이름을 사고, 이름의 주인이 될 수 있게 합니다.
  - 만약에 Alice가 Bob이 가진 이름 Charlie를 사려고 하면, Alice는 이전 주인 Bob이 Charlie를 사기 위해 지불했던 금액보다 더 높은 금액을 지불해야만 Charlie를 살 수 있습니다. 만약 아직 Charlie의 주인이 없다면, Alice는 '최소금액(MinPrice)' 만큼을 소각해야합니다.

### Now that you have decided on how your application functions from a high-level perspective, it is time to [start implementing it](app-init.md)

## 이제 우리는 high-level 시점에서(from a high-level perspective) 프로그램이 어떻게 동작할지를 결정하고, [구현을 시작할 차례입니다.](app-init.md)
