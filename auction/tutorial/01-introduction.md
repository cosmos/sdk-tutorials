---
order: 1
---

# Introduction

We will begin by setting up your go environment. If you have your go environment set up then you skip this part of the tutorial.

- We recommend following the official documentation on how to install Go, you can find more [here](https://golang.org/doc/install).

Test out that you have Go installed by typing:

```bash
go env
```

## Scaffolding

We will be using the scaffolding tool to build out the app. With the scaffolding tool you get a ready built app for real world uses that you can add your modules to to customize the chain for your use case.

### Install 

Install the app by:

```bash 
git clone https://github.com/cosmos/scaffold.git
cd scaffold
make install
```