import { StdFee } from "@cosmjs/launchpad";
import { OfflineSigner, EncodeObject } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgCreateVote } from "./types/voter/tx";
import { MsgCreatePoll } from "./types/voter/tx";
import { MsgDeleteVote } from "./types/voter/tx";
import { MsgUpdateVote } from "./types/voter/tx";
import { MsgUpdatePoll } from "./types/voter/tx";
import { MsgDeletePoll } from "./types/voter/tx";
interface TxClientOptions {
    addr: string;
}
interface SignAndBroadcastOptions {
    fee: StdFee;
    memo?: string;
}
declare const txClient: (wallet: OfflineSigner, { addr: addr }?: TxClientOptions) => Promise<{
    signAndBroadcast: (msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions) => Promise<import("@cosmjs/stargate").BroadcastTxResponse>;
    msgCreateVote: (data: MsgCreateVote) => EncodeObject;
    msgCreatePoll: (data: MsgCreatePoll) => EncodeObject;
    msgDeleteVote: (data: MsgDeleteVote) => EncodeObject;
    msgUpdateVote: (data: MsgUpdateVote) => EncodeObject;
    msgUpdatePoll: (data: MsgUpdatePoll) => EncodeObject;
    msgDeletePoll: (data: MsgDeletePoll) => EncodeObject;
}>;
interface QueryClientOptions {
    addr: string;
}
declare const queryClient: ({ addr: addr }?: QueryClientOptions) => Promise<Api<unknown>>;
export { txClient, queryClient, };
