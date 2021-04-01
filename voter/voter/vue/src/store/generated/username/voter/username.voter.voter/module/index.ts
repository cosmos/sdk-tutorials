// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY.

import { StdFee } from "@cosmjs/launchpad";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry, OfflineSigner, EncodeObject, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreatePoll } from "./types/voter/tx";
import { MsgUpdatePoll } from "./types/voter/tx";
import { MsgDeletePoll } from "./types/voter/tx";
import { MsgDeleteVote } from "./types/voter/tx";
import { MsgUpdateVote } from "./types/voter/tx";
import { MsgCreateVote } from "./types/voter/tx";


const types = [
  ["/username.voter.voter.MsgCreatePoll", MsgCreatePoll],
  ["/username.voter.voter.MsgUpdatePoll", MsgUpdatePoll],
  ["/username.voter.voter.MsgDeletePoll", MsgDeletePoll],
  ["/username.voter.voter.MsgDeleteVote", MsgDeleteVote],
  ["/username.voter.voter.MsgUpdateVote", MsgUpdateVote],
  ["/username.voter.voter.MsgCreateVote", MsgCreateVote],
  
];

const registry = new Registry(<any>types);

const defaultFee = {
  amount: [],
  gas: "200000",
};

interface TxClientOptions {
  addr: string
}

interface SignAndBroadcastOptions {
  fee: StdFee,
  memo?: string
}

const txClient = async (wallet: OfflineSigner, { addr: addr }: TxClientOptions = { addr: "http://localhost:26657" }) => {
  if (!wallet) throw new Error("wallet is required");

  const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
  const { address } = (await wallet.getAccounts())[0];

  return {
    signAndBroadcast: (msgs: EncodeObject[], { fee=defaultFee, memo=null }: SignAndBroadcastOptions) => memo?client.signAndBroadcast(address, msgs, fee,memo):client.signAndBroadcast(address, msgs, fee),
    msgCreatePoll: (data: MsgCreatePoll): EncodeObject => ({ typeUrl: "/username.voter.voter.MsgCreatePoll", value: data }),
    msgUpdatePoll: (data: MsgUpdatePoll): EncodeObject => ({ typeUrl: "/username.voter.voter.MsgUpdatePoll", value: data }),
    msgDeletePoll: (data: MsgDeletePoll): EncodeObject => ({ typeUrl: "/username.voter.voter.MsgDeletePoll", value: data }),
    msgDeleteVote: (data: MsgDeleteVote): EncodeObject => ({ typeUrl: "/username.voter.voter.MsgDeleteVote", value: data }),
    msgUpdateVote: (data: MsgUpdateVote): EncodeObject => ({ typeUrl: "/username.voter.voter.MsgUpdateVote", value: data }),
    msgCreateVote: (data: MsgCreateVote): EncodeObject => ({ typeUrl: "/username.voter.voter.MsgCreateVote", value: data }),
    
  };
};

interface QueryClientOptions {
  addr: string
}

const queryClient = async ({ addr: addr }: QueryClientOptions = { addr: "http://localhost:1317" }) => {
  return new Api({ baseUrl: addr });
};

export {
  txClient,
  queryClient,
};
