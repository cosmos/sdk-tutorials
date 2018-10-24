get_tools:
ifdef DEP_CHECK
	@echo "Dep is already installed.  Run 'make update_tools' to update."
else
	@echo "Installing dep"
	go get -v $(DEP)
endif
ifdef STATIK_CHECK
	@echo "Statik is already installed.  Run 'make update_tools' to update."
else
	@echo "Installing statik"
	go version
	go get -v $(STATIK)
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
	go install ./cmd/nameserviced
	go install ./cmd/nameservicecli