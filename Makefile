include Makefile.ledger
all: install
install: go.sum
		GO111MODULE=on go install -tags "$(build_tags)" ./cmd/nsd
		GO111MODULE=on go install -tags "$(build_tags)" ./cmd/nscli
go.sum: go.mod
		@echo "--> Ensure dependencies have not been modified"
		GO111MODULE=on go mod verify