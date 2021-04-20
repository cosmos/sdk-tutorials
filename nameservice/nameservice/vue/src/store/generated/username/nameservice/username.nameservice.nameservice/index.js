import { txClient, queryClient } from './module';
// @ts-ignore
import { SpVuexError } from '@starport/vuex';
import { Whois } from "./module/types/nameservice/whois";
async function initTxClient(vuexGetters) {
    return await txClient(vuexGetters['common/wallet/signer'], {
        addr: vuexGetters['common/env/apiTendermint']
    });
}
async function initQueryClient(vuexGetters) {
    return await queryClient({
        addr: vuexGetters['common/env/apiCosmos']
    });
}
function getStructure(template) {
    let structure = { fields: [] };
    for (const [key, value] of Object.entries(template)) {
        let field = {};
        field.name = key;
        field.type = typeof value;
        structure.fields.push(field);
    }
    return structure;
}
const getDefaultState = () => {
    return {
        Whois: {},
        WhoisAll: {},
        _Structure: {
            Whois: getStructure(Whois.fromPartial({})),
        },
        _Subscriptions: new Set(),
    };
};
// initial state
const state = getDefaultState();
export default {
    namespaced: true,
    state,
    mutations: {
        RESET_STATE(state) {
            Object.assign(state, getDefaultState());
        },
        QUERY(state, { query, key, value }) {
            state[query][JSON.stringify(key)] = value;
        },
        SUBSCRIBE(state, subscription) {
            state._Subscriptions.add(subscription);
        },
        UNSUBSCRIBE(state, subscription) {
            state._Subscriptions.delete(subscription);
        }
    },
    getters: {
        getWhois: (state) => (params = {}) => {
            if (!params.query) {
                params.query = null;
            }
            return state.Whois[JSON.stringify(params)] ?? {};
        },
        getWhoisAll: (state) => (params = {}) => {
            if (!params.query) {
                params.query = null;
            }
            return state.WhoisAll[JSON.stringify(params)] ?? {};
        },
        getTypeStructure: (state) => (type) => {
            return state._Structure[type].fields;
        }
    },
    actions: {
        init({ dispatch, rootGetters }) {
            console.log('init');
            if (rootGetters['common/env/client']) {
                rootGetters['common/env/client'].on('newblock', () => {
                    dispatch('StoreUpdate');
                });
            }
        },
        resetState({ commit }) {
            commit('RESET_STATE');
        },
        unsubscribe({ commit }, subscription) {
            commit('UNSUBSCRIBE', subscription);
        },
        async StoreUpdate({ state, dispatch }) {
            state._Subscriptions.forEach((subscription) => {
                dispatch(subscription.action, subscription.payload);
            });
        },
        async QueryWhois({ commit, rootGetters, getters }, { options: { subscribe = false, all = false }, params: { ...key }, query = null }) {
            try {
                let value = query ? (await (await initQueryClient(rootGetters)).queryWhois(key.id, query)).data : (await (await initQueryClient(rootGetters)).queryWhois(key.id)).data;
                commit('QUERY', { query: 'Whois', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QueryWhois', payload: { options: { all }, params: { ...key }, query } });
                return getters['getWhois']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                console.error(new SpVuexError('QueryClient:QueryWhois', 'API Node Unavailable. Could not perform query.'));
                return {};
            }
        },
        async QueryWhoisAll({ commit, rootGetters, getters }, { options: { subscribe = false, all = false }, params: { ...key }, query = null }) {
            try {
                let value = query ? (await (await initQueryClient(rootGetters)).queryWhoisAll(query)).data : (await (await initQueryClient(rootGetters)).queryWhoisAll()).data;
                while (all && value.pagination && value.pagination.nextKey != null) {
                    let next_values = (await (await initQueryClient(rootGetters)).queryWhoisAll({ ...query, 'pagination.key': value.pagination.nextKey })).data;
                    for (let prop of Object.keys(next_values)) {
                        if (Array.isArray(next_values[prop])) {
                            value[prop] = [...value[prop], ...next_values[prop]];
                        }
                        else {
                            value[prop] = next_values[prop];
                        }
                    }
                }
                commit('QUERY', { query: 'WhoisAll', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QueryWhoisAll', payload: { options: { all }, params: { ...key }, query } });
                return getters['getWhoisAll']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                console.error(new SpVuexError('QueryClient:QueryWhoisAll', 'API Node Unavailable. Could not perform query.'));
                return {};
            }
        },
        async sendMsgCreateWhois({ rootGetters }, { value, fee, memo }) {
            try {
                const msg = await (await initTxClient(rootGetters)).msgCreateWhois(value);
                const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], { fee: { amount: fee,
                        gas: "200000" }, memo });
                return result;
            }
            catch (e) {
                if (e.toString() == 'wallet is required') {
                    throw new SpVuexError('TxClient:MsgCreateWhois:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgCreateWhois:Send', 'Could not broadcast Tx.');
                }
            }
        },
        async sendMsgUpdateWhois({ rootGetters }, { value, fee, memo }) {
            try {
                const msg = await (await initTxClient(rootGetters)).msgUpdateWhois(value);
                const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], { fee: { amount: fee,
                        gas: "200000" }, memo });
                return result;
            }
            catch (e) {
                if (e.toString() == 'wallet is required') {
                    throw new SpVuexError('TxClient:MsgUpdateWhois:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgUpdateWhois:Send', 'Could not broadcast Tx.');
                }
            }
        },
        async sendMsgDeleteWhois({ rootGetters }, { value, fee, memo }) {
            try {
                const msg = await (await initTxClient(rootGetters)).msgDeleteWhois(value);
                const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], { fee: { amount: fee,
                        gas: "200000" }, memo });
                return result;
            }
            catch (e) {
                if (e.toString() == 'wallet is required') {
                    throw new SpVuexError('TxClient:MsgDeleteWhois:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgDeleteWhois:Send', 'Could not broadcast Tx.');
                }
            }
        },
        async MsgCreateWhois({ rootGetters }, { value }) {
            try {
                const msg = await (await initTxClient(rootGetters)).msgCreateWhois(value);
                return msg;
            }
            catch (e) {
                if (e.toString() == 'wallet is required') {
                    throw new SpVuexError('TxClient:MsgCreateWhois:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgCreateWhois:Create', 'Could not create message.');
                }
            }
        },
        async MsgUpdateWhois({ rootGetters }, { value }) {
            try {
                const msg = await (await initTxClient(rootGetters)).msgUpdateWhois(value);
                return msg;
            }
            catch (e) {
                if (e.toString() == 'wallet is required') {
                    throw new SpVuexError('TxClient:MsgUpdateWhois:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgUpdateWhois:Create', 'Could not create message.');
                }
            }
        },
        async MsgDeleteWhois({ rootGetters }, { value }) {
            try {
                const msg = await (await initTxClient(rootGetters)).msgDeleteWhois(value);
                return msg;
            }
            catch (e) {
                if (e.toString() == 'wallet is required') {
                    throw new SpVuexError('TxClient:MsgDeleteWhois:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgDeleteWhois:Create', 'Could not create message.');
                }
            }
        },
    }
};
