/* Do not change, this code is generated from Golang structs */


export interface Int {
}
export interface Coin {
    denom: string;
    amount: Int;
}
export interface CommunityPoolSpendProposal {
    title: string;
    description: string;
    recipient: number[];
    amount: Coin[];
}
export interface Int {
}
export interface Dec {
    int: Int;
}
export interface CommissionRates {
    rate: Dec;
    max_rate: Dec;
    max_change_rate: Dec;
}
export interface Description {
    moniker: string;
    identity: string;
    website: string;
    details: string;
}
export interface MsgCreateValidator {
    description: Description;
    commission: CommissionRates;
    min_self_delegation: Int;
    delegator_address: number[];
    validator_address: number[];
    pubkey: any;
    value: Coin;
}
export interface MsgUnjail {
    address: number[];
}
export interface PrivKeySecp256k1 {
}
export interface Supply {
    total: Coin[];
}
export interface MsgDelegate {
    delegator_address: number[];
    validator_address: number[];
    amount: Coin;
}
export interface PubKeyEd25519 {
}
export interface BaseVestingAccount {
    original_vesting: Coin[];
    delegated_free: Coin[];
    delegated_vesting: Coin[];
    end_time: number;
}
export interface ContinuousVestingAccount {
    start_time: number;
}
export interface StdSignature {
    pub_key: any;
    signature: number[];
}
export interface StdFee {
    amount: Coin[];
    gas: number;
}
export interface StdTx {
    msg: any[];
    fee: StdFee;
    signatures: StdSignature[];
    memo: string;
}
export interface MsgWithdrawDelegatorReward {
    delegator_address: number[];
    validator_address: number[];
}
export interface PubKeyMultisigThreshold {
    threshold: number;
    pubkeys: any[];
}
export interface Output {
    address: number[];
    coins: Coin[];
}
export interface Input {
    address: number[];
    coins: Coin[];
}
export interface MsgMultiSend {
    inputs: Input[];
    outputs: Output[];
}
export interface MsgEditValidator {
    moniker: string;
    identity: string;
    website: string;
    details: string;
    address: number[];
    commission_rate: Dec;
    min_self_delegation: Int;
}
export interface MsgUndelegate {
    delegator_address: number[];
    validator_address: number[];
    amount: Coin;
}
export interface ModuleAccount {
    name: string;
    permissions: string[];
}
export interface MsgDeleteName {
    name: string;
    owner: number[];
}
export interface BaseAccount {
    address: number[];
    coins: Coin[];
    public_key: any;
    account_number: number;
    sequence: number;
}
export interface MsgWithdrawValidatorCommission {
    validator_address: number[];
}
export interface PubKeySecp256k1 {
}
export interface DelayedVestingAccount {
}
export interface MsgSend {
    from_address: number[];
    to_address: number[];
    amount: Coin[];
}
export interface MsgBuyName {
    name: string;
    bid: Coin[];
    buyer: number[];
}
export interface MsgBeginRedelegate {
    delegator_address: number[];
    validator_src_address: number[];
    validator_dst_address: number[];
    amount: Coin;
}
export interface ParamChange {
    subspace: string;
    key: string;
    subkey?: string;
    value: string;
}
export interface ParameterChangeProposal {
    title: string;
    description: string;
    changes: ParamChange[];
}
export interface MsgSetWithdrawAddress {
    delegator_address: number[];
    withdraw_address: number[];
}
export interface MsgSetName {
    name: string;
    value: string;
    owner: number[];
}
export interface PrivKeyEd25519 {
}