package module

import (
	autocliv1 "cosmossdk.io/api/cosmos/autocli/v1"

	nsv1 "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction/api/v1"
)

// AutoCLIOptions implements the autocli.HasAutoCLIConfig interface.
func (am AppModule) AutoCLIOptions() *autocliv1.ModuleOptions {
	return &autocliv1.ModuleOptions{
		Query: &autocliv1.ServiceCommandDescriptor{
			Service: nsv1.Query_ServiceDesc.ServiceName,
			RpcCommandOptions: []*autocliv1.RpcCommandOptions{
				{
					RpcMethod: "Name",
					Use:       "whois [name]",
					Short:     "Get the resolve address and owner for a name record",
					PositionalArgs: []*autocliv1.PositionalArgDescriptor{
						{ProtoField: "name"},
					},
				},
			},
		},
	}
}
