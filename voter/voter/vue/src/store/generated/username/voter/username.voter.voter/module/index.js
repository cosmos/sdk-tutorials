// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY.
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreatePoll } from "./types/voter/tx";
import { MsgUpdatePoll } from "./types/voter/tx";
import { MsgDeletePoll } from "./types/voter/tx";
const types = [
    ["/username.voter.voter.MsgCreatePoll", MsgCreatePoll],
    ["/username.voter.voter.MsgUpdatePoll", MsgUpdatePoll],
    ["/username.voter.voter.MsgDeletePoll", MsgDeletePoll],
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
        msgCreatePoll: (data) => ({ typeUrl: "/username.voter.voter.MsgCreatePoll", value: data }),
        msgUpdatePoll: (data) => ({ typeUrl: "/username.voter.voter.MsgUpdatePoll", value: data }),
        msgDeletePoll: (data) => ({ typeUrl: "/username.voter.voter.MsgDeletePoll", value: data }),
    };
};
const queryClient = async ({ addr: addr } = { addr: "http://localhost:1317" }) => {
    return new Api({ baseUrl: addr });
};
export { txClient, queryClient, };
