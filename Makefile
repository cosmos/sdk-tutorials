include Makefile.ledger

all: install

install: go.sum
	go  install -tags "$(build_tags)" ./cmd/nsd
	go  install -tags "$(build_tags)" ./cmd/nscli

go.sum: go.mod
	@echo "--> Ensure dependencies have not been modified"
	@go mod verify
