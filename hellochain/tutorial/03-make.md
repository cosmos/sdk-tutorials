# Makefile

Now let's add a short makefile so we can build our basic app. Open up your
`Makefile` and add the following code. Later we will add an additional command
to build our CLI tools.

```bash
# simple Makefile

all: lint install

install: go.sum
		GO111MODULE=on go install -tags "$(build_tags)" ./cmd/hcd

go.sum: go.mod
		@echo "--> Ensure dependencies have not been modified"
		GO111MODULE=on go mod verify

lint:
	golangci-lint run
	find . -name '*.go' -type f -not -path "./vendor*" -not -path "*.git*" | xargs gofmt -d -s
	go mod verify
```

Then install your basic blockchain with `make install`.

```bash
$ make install
--> Ensure dependencies have not been modified
GO111MODULE=on go mod verify
all modules verified
GO111MODULE=on go install -tags "" ./cmd/hcd
```

Wonderful. Next lets try out what we've built so far.

:::tip
Remember you need to have Go installed and a proper \$GOPATH configured
:::
