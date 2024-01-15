###############################################################################
###                                Linting                                  ###
###############################################################################

golangci_version=v1.55.0

lint-install:
	@echo "--> Installing golangci-lint $(golangci_version)"
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@$(golangci_version)

lint:
	@echo "--> Running linter"
	$(MAKE) lint-install
	@./scripts/go-lint-all.bash --timeout=15m

lint-fix:
	@echo "--> Running linter"
	$(MAKE) lint-install
	@./scripts/go-lint-all.bash --fix

.PHONY: lint lint-fix
