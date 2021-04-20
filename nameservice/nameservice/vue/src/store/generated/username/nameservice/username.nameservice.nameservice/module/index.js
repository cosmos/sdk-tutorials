// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY.
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreateWhois } from "./types/nameservice/tx";
import { MsgUpdateWhois } from "./types/nameservice/tx";
import { MsgDeleteWhois } from "./types/nameservice/tx";
const types = [
    ["/username.nameservice.nameservice.MsgCreateWhois", MsgCreateWhois],
    ["/username.nameservice.nameservice.MsgUpdateWhois", MsgUpdateWhois],
    ["/username.nameservice.nameservice.MsgDeleteWhois", MsgDeleteWhois],
];
const registry = new Registry(types);
const defaultFee = {
    amount: [],
    gas: "200000",
};
const txClient = async (wallet, { addr: addr } = { addr: "http://localhost:26657" }) => {
    if (!wallet)
        throw new Error("wallet is required");
    const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
    const { address } = (await wallet.getAccounts())[0];
    return {
        signAndBroadcast: (msgs, { fee = defaultFee, memo = null }) => memo ? client.signAndBroadcast(address, msgs, fee, memo) : client.signAndBroadcast(address, msgs, fee),
        msgCreateWhois: (data) => ({ typeUrl: "/username.nameservice.nameservice.MsgCreateWhois", value: data }),
        msgUpdateWhois: (data) => ({ typeUrl: "/username.nameservice.nameservice.MsgUpdateWhois", value: data }),
        msgDeleteWhois: (data) => ({ typeUrl: "/username.nameservice.nameservice.MsgDeleteWhois", value: data }),
    };
};
const queryClient = async ({ addr: addr } = { addr: "http://localhost:1317" }) => {
    return new Api({ baseUrl: addr });
};
export { txClient, queryClient, };
