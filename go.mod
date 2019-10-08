module github.com/cosmos/sdk-application-tutorial

go 1.13

require (
	github.com/cosmos/cosmos-sdk v0.37.1
	github.com/gorilla/mux v1.7.3
	github.com/mattn/go-isatty v0.0.7 // indirect
	github.com/spf13/afero v1.2.2 // indirect
	github.com/spf13/cobra v0.0.5
	github.com/spf13/viper v1.4.0
	github.com/stretchr/testify v1.4.0
	github.com/tendermint/go-amino v0.15.0
	github.com/tendermint/tendermint v0.32.5
	github.com/tendermint/tm-db v0.2.0
	github.com/tkrajina/typescriptify-golang-structs v0.0.9
	golang.org/x/sys v0.0.0-20190329044733-9eb1bfa1ce65 // indirect
	google.golang.org/appengine v1.4.0 // indirect
	google.golang.org/genproto v0.0.0-20190327125643-d831d65fe17d // indirect
)

replace github.com/tendermint/go-amino => github.com/tendermint/go-amino v0.15.1-0.20191003185523-ddfc7fca5e86
