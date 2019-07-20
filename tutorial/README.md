# Getting Started

In this tutorial, you will build a functional [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) application and, in the process, learn the basic concepts and structures of the SDK. The example will showcase how quickly and easily you can **build your own blockchain from scratch** on top of the Cosmos SDK.

# 시작하기

이 튜토리얼의 목적은 [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/)를 사용한 실용적인 프로그램을 만들어봄과 동시에, 그 과정속에서 SDK의 기본적인 개념과 구조를 배울 수 있게 하기 위함입니다. 이 튜토리얼을 통해서, Cosmos SDK를 이용하여 우리가 얼마나 빠르고 쉽게 **아무런 사전 지식 없이 우리만의 블록체인을 만들 수 있는지** 알 수 있을 것입니다. 

By the end of this tutorial you will have a functional `nameservice` application, a mapping of strings to other strings (`map[string]string`). This is similar to [Namecoin](https://namecoin.org/), [ENS](https://ens.domains/), or [Handshake](https://handshake.org/), which all model the traditional DNS systems (`map[domain]zonefile`). Users will be able to buy unused names, or sell/trade their name.

튜토리얼을 끝까지 마치면, 우리는 잘 작동하는 '네임서비스(nameservice)'라는 프로그램을 얻게 됩니다. 네임서비스란 문자열을 다른 문자열에 대응시켜주는(`map[string]string`) 프로그램 입니다. 이 프로그램은 전통적인 DNS 시스템(`map[domain]zonefile`)인 [(Namecoin)](https://namecoin.org/), [ENS](https://ens.domains/), [Handshake](https://handshake.org/)과 비슷합니다. 프로그램의 사용자들은 아무도 쓰지 않는 이름을 사거나 팔고, 서로 이름을 바꿀 수 있습니다. 

All of the final source code for this tutorial project is in this directory (and compiles). However, it is best to follow along manually and try building the project yourself!

이 튜토리얼의 모든 최종 소스 코드는 이 디렉토리 내에 있습니다. 그러나, 스스로 직접 따라해보는 것이 실력향상과 Cosmos SDK를 이해하는데에 가장 좋을 것입니다!

## Requirements

- [`golang` >1.12.1](https://golang.org/doc/install) installed
- A working [`$GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH)
- Desire to create your own blockchain!

## 필요한 것들

- [1.12.1버전 이상의 'golang'](https://golang.org/doc/install)이 설치되어 있어야 합니다. 
- [`$GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH) 환경 변수가 설정되어 있어야 합니다. 
- 가장 중요한 것은 우리만의 블록체인을 만들 의지입니다!

## Tutorial

Through the course of this tutorial you will create the following files that make up your application:

## 튜토리얼

이 튜토리얼을 통해, 프로그램을 만들기 위한 다음과 같은 파일들을 만들게 될 것입니다. :

```bash
./nameservice
├── Gopkg.toml
├── Makefile
├── app.go
├── cmd
│   ├── nscli
│   │   └── main.go
│   └── nsd
│       └── main.go
└── x
    └── nameservice
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   └── rest
        │       └── rest.go
        ├── types
            ├── codec.go
            ├── key.go
            ├── msgs.go
            ├── querier.go
            └── types.go
        ├── alias.go
        ├── genesis.go
        ├── handler.go
        ├── keeper.go
        ├── module.go
        └── querier.go

```

Start by creating a new git repository:

처음 시작은 새로운 git reopsitory를 만드는 것입니다. 

```bash
mkdir -p $GOPATH/src/github.com/{ .Username }/nameservice
cd $GOPATH/src/github.com/{ .Username }/nameservice
git init
```

Then, just follow along! The first step describes the design of your application. If you want to jump directly to the coding section, you can start with the [second step](./keeper.md)

이제 그대로 따라가면 됩니다! 첫번째 단계에서는 프로그램의 구조를 만들 것입니다. 만약 바로 코딩 단계로 넘어가고 싶다면, [두번째 단계](./keeper.md)부터 시작해도 좋습니다. 

### Tutorial parts

1. [Design](./app-design.md) the application.
2. Begin the implementation of your application in [`./app.go`](./app-init.md).
3. Start building your module by defining some basic [`Types`](types.md).
4. Define the keys needed for your module [`key`](./key.md)
5. Create the main core of the module using the [`Keeper`](./keeper.md).
6. Define state transitions through [`Msgs` and `Handlers`](./msgs-handlers.md).
   - [`SetName`](./set-name.md)
   - [`BuyName`](./buy-name.md)
7. Make views on your state machine with [`Queriers`](./queriers.md).
8. Create the [`alias file`](./alias.md)
9. Register your types in the encoding format using [`sdk.Codec`](./codec.md).
10. Create [CLI interactions for your module](./cli.md).
11. Create [HTTP routes for clients to access your nameservice](./rest.md).
12. Implement the [AppModule interface](./module.md)
13. Configure your [Genesis state](./genesis.md).
14. Import your module and [finish building your application](./app-complete.md)!
15. Create the [`nsd` and `nscli` entry points](./entrypoint.md) to your application.
16. Setup [dependency management using `go.mod`](./gomod.md).
17. [Build and run](./build-run.md) the example.
18. [Run REST routes](./run-rest.md).

### 튜토리얼 목차

1. 프로그램을 [Design](./app-design.md)합니다. 
2. [`./app.go`](./app-init.md)에서 프로그램 구현을 시작합니다.
3. 몇가지 기본 [`타입들(Types)`](types.md)를 정의함으로써 모듈들을 만듦니다. 
4. 모듈에 필요한 [`키(key)`](./key.md)를 정의합니다. 
5. 모듈의 가장 중요한 부분을 [`Keeper`](./keeper.md)를 사용하여 만듦니다. 
6. [`메시지(Msgs)` 와 `핸들러(Handlers)`](./msgs-handlers.md)를 통해 상태 변화를 정의합니다. 
   - [`SetName`](./set-name.md)
   - [`BuyName`](./buy-name.md)
7. [`Queriers`](./queriers.md)와 함께 상태 머신에 대한 보기를 만듦니다. 
8. [`alias file`](./alias.md)을 만듦니다. 
9. [`sdk.Codec`](./codec.md)을 사용하여 인코딩 포멧에 정의한 [Types](types.md)를 등록합니다. 
10. [모듈을 위한 CLI 상호작용](./cli.md)을 설정합니다.
11. [사용자가 nameservice에 접근하기 위한 HTTP routes](./rest.md)를 설정합니다. 
12. [모듈 인터페이스](./module.md)를 구현합니다. 
13. [제네시스 상태](./genesis.md)를 설정합니다. 
14. 모듈을 import하고 [프로그램을 완성합니다](./app-complete.md)!
15. 프로그램의 [`nsd` 와 `nscli` 진입점](./entrypoint.md)을 설정합니다. 
16. [`go.mod`를 사용해 의존성 관리](./gomod.md)를 설정합니다. 
17. 예제를 [빌드하고 실행](./build-run.md)합니다. 
18. [REST routes를 실행](./run-rest.md)합니다. 

## [Click here](./app-design.md) to get started with the tutorial!

## 이제 튜토리얼을 [시작하세요!](./app-design.md)
