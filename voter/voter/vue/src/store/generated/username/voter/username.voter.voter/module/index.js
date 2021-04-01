// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY.
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgUpdateVote } from "./types/voter/tx";
import { MsgCreateVote } from "./types/voter/tx";
import { MsgDeleteVote } from "./types/voter/tx";
import { MsgCreatePoll } from "./types/voter/tx";
import { MsgDeletePoll } from "./types/voter/tx";
import { MsgUpdatePoll } from "./types/voter/tx";
const types = [
    ["/username.voter.voter.MsgUpdateVote", MsgUpdateVote],
    ["/username.voter.voter.MsgCreateVote", MsgCreateVote],
    ["/username.voter.voter.MsgDeleteVote", MsgDeleteVote],
    ["/username.voter.voter.MsgCreatePoll", MsgCreatePoll],
    ["/username.voter.voter.MsgDeletePoll", MsgDeletePoll],
    ["/username.voter.voter.MsgUpdatePoll", MsgUpdatePoll],
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
        msgUpdateVote: (data) => ({ typeUrl: "/username.voter.voter.MsgUpdateVote", value: data }),
        msgCreateVote: (data) => ({ typeUrl: "/username.voter.voter.MsgCreateVote", value: data }),
        msgDeleteVote: (data) => ({ typeUrl: "/username.voter.voter.MsgDeleteVote", value: data }),
        msgCreatePoll: (data) => ({ typeUrl: "/username.voter.voter.MsgCreatePoll", value: data }),
        msgDeletePoll: (data) => ({ typeUrl: "/username.voter.voter.MsgDeletePoll", value: data }),
        msgUpdatePoll: (data) => ({ typeUrl: "/username.voter.voter.MsgUpdatePoll", value: data }),
    };
};
const queryClient = async ({ addr: addr } = { addr: "http://localhost:1317" }) => {
    return new Api({ baseUrl: addr });
};
export { txClient, queryClient, };
