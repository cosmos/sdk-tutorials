/* Do not change, this code is generated from Golang structs */


export class StdSignature {
    pub_key: any;
    signature: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new StdSignature();
        result.pub_key = source["pub_key"];
        result.signature = source["signature"];
        return result;
    }

    //[StdSignature:]


    //[end]
}
export class Int {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Int();
        return result;
    }

    //[Int:]


    //[end]
}
export class Coin {
    denom: string;
    amount: Int;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Coin();
        result.denom = source["denom"];
        result.amount = source["amount"] ? Int.createFrom(source["amount"]) : null;
        return result;
    }

    //[Coin:]


    //[end]
}
export class StdFee {
    amount: Coin[];
    gas: number;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new StdFee();
        result.amount = source["amount"] ? source["amount"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        result.gas = source["gas"];
        return result;
    }

    //[StdFee:]


    //[end]
}
export class StdTx {
    msg: any[];
    fee: StdFee;
    signatures: StdSignature[];
    memo: string;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new StdTx();
        result.msg = source["msg"];
        result.fee = source["fee"] ? StdFee.createFrom(source["fee"]) : null;
        result.signatures = source["signatures"] ? source["signatures"].map(function(element: any) { return StdSignature.createFrom(element); }) : null;
        result.memo = source["memo"];
        return result;
    }

    //[StdTx:]


    //[end]
}
export class MsgSend {
    from_address: number[];
    to_address: number[];
    amount: Coin[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgSend();
        result.from_address = source["from_address"];
        result.to_address = source["to_address"];
        result.amount = source["amount"] ? source["amount"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        return result;
    }

    //[MsgSend:]


    //[end]
}
export class PubKeyMultisigThreshold {
    threshold: number;
    pubkeys: any[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new PubKeyMultisigThreshold();
        result.threshold = source["threshold"];
        result.pubkeys = source["pubkeys"];
        return result;
    }

    //[PubKeyMultisigThreshold:]


    //[end]
}
export class MsgBuyName {
    name: string;
    bid: Coin[];
    buyer: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgBuyName();
        result.name = source["name"];
        result.bid = source["bid"] ? source["bid"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        result.buyer = source["buyer"];
        return result;
    }

    //[MsgBuyName:]


    //[end]
}
export class MsgWithdrawDelegatorReward {
    delegator_address: number[];
    validator_address: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgWithdrawDelegatorReward();
        result.delegator_address = source["delegator_address"];
        result.validator_address = source["validator_address"];
        return result;
    }

    //[MsgWithdrawDelegatorReward:]


    //[end]
}
export class PubKeyEd25519 {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new PubKeyEd25519();
        return result;
    }

    //[PubKeyEd25519:]


    //[end]
}
export class Supply {
    total: Coin[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Supply();
        result.total = source["total"] ? source["total"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        return result;
    }

    //[Supply:]


    //[end]
}
export class MsgSetName {
    name: string;
    value: string;
    owner: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgSetName();
        result.name = source["name"];
        result.value = source["value"];
        result.owner = source["owner"];
        return result;
    }

    //[MsgSetName:]


    //[end]
}
export class CommunityPoolSpendProposal {
    title: string;
    description: string;
    recipient: number[];
    amount: Coin[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new CommunityPoolSpendProposal();
        result.title = source["title"];
        result.description = source["description"];
        result.recipient = source["recipient"];
        result.amount = source["amount"] ? source["amount"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        return result;
    }

    //[CommunityPoolSpendProposal:]


    //[end]
}
export class Int {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Int();
        return result;
    }

    //[Int:]


    //[end]
}
export class Dec {
    int: Int;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Dec();
        result.int = source["int"] ? Int.createFrom(source["int"]) : null;
        return result;
    }

    //[Dec:]


    //[end]
}
export class CommissionRates {
    rate: Dec;
    max_rate: Dec;
    max_change_rate: Dec;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new CommissionRates();
        result.rate = source["rate"] ? Dec.createFrom(source["rate"]) : null;
        result.max_rate = source["max_rate"] ? Dec.createFrom(source["max_rate"]) : null;
        result.max_change_rate = source["max_change_rate"] ? Dec.createFrom(source["max_change_rate"]) : null;
        return result;
    }

    //[CommissionRates:]


    //[end]
}
export class Description {
    moniker: string;
    identity: string;
    website: string;
    details: string;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Description();
        result.moniker = source["moniker"];
        result.identity = source["identity"];
        result.website = source["website"];
        result.details = source["details"];
        return result;
    }

    //[Description:]


    //[end]
}
export class MsgCreateValidator {
    description: Description;
    commission: CommissionRates;
    min_self_delegation: Int;
    delegator_address: number[];
    validator_address: number[];
    pubkey: any;
    value: Coin;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgCreateValidator();
        result.description = source["description"] ? Description.createFrom(source["description"]) : null;
        result.commission = source["commission"] ? CommissionRates.createFrom(source["commission"]) : null;
        result.min_self_delegation = source["min_self_delegation"] ? Int.createFrom(source["min_self_delegation"]) : null;
        result.delegator_address = source["delegator_address"];
        result.validator_address = source["validator_address"];
        result.pubkey = source["pubkey"];
        result.value = source["value"] ? Coin.createFrom(source["value"]) : null;
        return result;
    }

    //[MsgCreateValidator:]


    //[end]
}
export class ModuleAccount {
    name: string;
    permissions: string[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new ModuleAccount();
        result.name = source["name"];
        result.permissions = source["permissions"];
        return result;
    }

    //[ModuleAccount:]


    //[end]
}
export class PubKeySecp256k1 {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new PubKeySecp256k1();
        return result;
    }

    //[PubKeySecp256k1:]


    //[end]
}
export class MsgBeginRedelegate {
    delegator_address: number[];
    validator_src_address: number[];
    validator_dst_address: number[];
    amount: Coin;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgBeginRedelegate();
        result.delegator_address = source["delegator_address"];
        result.validator_src_address = source["validator_src_address"];
        result.validator_dst_address = source["validator_dst_address"];
        result.amount = source["amount"] ? Coin.createFrom(source["amount"]) : null;
        return result;
    }

    //[MsgBeginRedelegate:]


    //[end]
}
export class BaseVestingAccount {
    original_vesting: Coin[];
    delegated_free: Coin[];
    delegated_vesting: Coin[];
    end_time: number;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new BaseVestingAccount();
        result.original_vesting = source["original_vesting"] ? source["original_vesting"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        result.delegated_free = source["delegated_free"] ? source["delegated_free"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        result.delegated_vesting = source["delegated_vesting"] ? source["delegated_vesting"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        result.end_time = source["end_time"];
        return result;
    }

    //[BaseVestingAccount:]


    //[end]
}
export class MsgDeleteName {
    name: string;
    owner: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgDeleteName();
        result.name = source["name"];
        result.owner = source["owner"];
        return result;
    }

    //[MsgDeleteName:]


    //[end]
}
export class BaseAccount {
    address: number[];
    coins: Coin[];
    public_key: any;
    account_number: number;
    sequence: number;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new BaseAccount();
        result.address = source["address"];
        result.coins = source["coins"] ? source["coins"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        result.public_key = source["public_key"];
        result.account_number = source["account_number"];
        result.sequence = source["sequence"];
        return result;
    }

    //[BaseAccount:]


    //[end]
}
export class MsgSetWithdrawAddress {
    delegator_address: number[];
    withdraw_address: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgSetWithdrawAddress();
        result.delegator_address = source["delegator_address"];
        result.withdraw_address = source["withdraw_address"];
        return result;
    }

    //[MsgSetWithdrawAddress:]


    //[end]
}
export class MsgUnjail {
    address: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgUnjail();
        result.address = source["address"];
        return result;
    }

    //[MsgUnjail:]


    //[end]
}
export class PrivKeyEd25519 {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new PrivKeyEd25519();
        return result;
    }

    //[PrivKeyEd25519:]


    //[end]
}
export class PrivKeySecp256k1 {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new PrivKeySecp256k1();
        return result;
    }

    //[PrivKeySecp256k1:]


    //[end]
}
export class MsgEditValidator {
    moniker: string;
    identity: string;
    website: string;
    details: string;
    address: number[];
    commission_rate: Dec;
    min_self_delegation: Int;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgEditValidator();
        result.moniker = source["moniker"];
        result.identity = source["identity"];
        result.website = source["website"];
        result.details = source["details"];
        result.address = source["address"];
        result.commission_rate = source["commission_rate"] ? Dec.createFrom(source["commission_rate"]) : null;
        result.min_self_delegation = source["min_self_delegation"] ? Int.createFrom(source["min_self_delegation"]) : null;
        return result;
    }

    //[MsgEditValidator:]


    //[end]
}
export class ParamChange {
    subspace: string;
    key: string;
    subkey: string;
    value: string;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new ParamChange();
        result.subspace = source["subspace"];
        result.key = source["key"];
        result.subkey = source["subkey"];
        result.value = source["value"];
        return result;
    }

    //[ParamChange:]


    //[end]
}
export class ParameterChangeProposal {
    title: string;
    description: string;
    changes: ParamChange[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new ParameterChangeProposal();
        result.title = source["title"];
        result.description = source["description"];
        result.changes = source["changes"] ? source["changes"].map(function(element: any) { return ParamChange.createFrom(element); }) : null;
        return result;
    }

    //[ParameterChangeProposal:]


    //[end]
}
export class Output {
    address: number[];
    coins: Coin[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Output();
        result.address = source["address"];
        result.coins = source["coins"] ? source["coins"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        return result;
    }

    //[Output:]


    //[end]
}
export class Input {
    address: number[];
    coins: Coin[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new Input();
        result.address = source["address"];
        result.coins = source["coins"] ? source["coins"].map(function(element: any) { return Coin.createFrom(element); }) : null;
        return result;
    }

    //[Input:]


    //[end]
}
export class MsgMultiSend {
    inputs: Input[];
    outputs: Output[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgMultiSend();
        result.inputs = source["inputs"] ? source["inputs"].map(function(element: any) { return Input.createFrom(element); }) : null;
        result.outputs = source["outputs"] ? source["outputs"].map(function(element: any) { return Output.createFrom(element); }) : null;
        return result;
    }

    //[MsgMultiSend:]


    //[end]
}
export class MsgWithdrawValidatorCommission {
    validator_address: number[];

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgWithdrawValidatorCommission();
        result.validator_address = source["validator_address"];
        return result;
    }

    //[MsgWithdrawValidatorCommission:]


    //[end]
}
export class MsgDelegate {
    delegator_address: number[];
    validator_address: number[];
    amount: Coin;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgDelegate();
        result.delegator_address = source["delegator_address"];
        result.validator_address = source["validator_address"];
        result.amount = source["amount"] ? Coin.createFrom(source["amount"]) : null;
        return result;
    }

    //[MsgDelegate:]


    //[end]
}
export class DelayedVestingAccount {

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new DelayedVestingAccount();
        return result;
    }

    //[DelayedVestingAccount:]


    //[end]
}
export class MsgUndelegate {
    delegator_address: number[];
    validator_address: number[];
    amount: Coin;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new MsgUndelegate();
        result.delegator_address = source["delegator_address"];
        result.validator_address = source["validator_address"];
        result.amount = source["amount"] ? Coin.createFrom(source["amount"]) : null;
        return result;
    }

    //[MsgUndelegate:]


    //[end]
}
export class ContinuousVestingAccount {
    start_time: number;

    static createFrom(source: any) {
        if ('string' === typeof source) source = JSON.parse(source);
        const result = new ContinuousVestingAccount();
        result.start_time = source["start_time"];
        return result;
    }

    //[ContinuousVestingAccount:]


    //[end]
}
