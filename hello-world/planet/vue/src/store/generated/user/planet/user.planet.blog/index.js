import { txClient, queryClient, MissingWalletError } from './module';
// @ts-ignore
import { SpVuexError } from '@starport/vuex';
import { BlogPacketData } from "./module/types/blog/packet";
import { NoData } from "./module/types/blog/packet";
import { IbcPostPacketData } from "./module/types/blog/packet";
import { IbcPostPacketAck } from "./module/types/blog/packet";
import { Post } from "./module/types/blog/post";
import { SentPost } from "./module/types/blog/sent_post";
import { TimedoutPost } from "./module/types/blog/timedout_post";
export { BlogPacketData, NoData, IbcPostPacketData, IbcPostPacketAck, Post, SentPost, TimedoutPost };
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
function mergeResults(value, next_values) {
    for (let prop of Object.keys(next_values)) {
        if (Array.isArray(next_values[prop])) {
            value[prop] = [...value[prop], ...next_values[prop]];
        }
        else {
            value[prop] = next_values[prop];
        }
    }
    return value;
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
        TimedoutPost: {},
        TimedoutPostAll: {},
        SentPost: {},
        SentPostAll: {},
        Post: {},
        PostAll: {},
        _Structure: {
            BlogPacketData: getStructure(BlogPacketData.fromPartial({})),
            NoData: getStructure(NoData.fromPartial({})),
            IbcPostPacketData: getStructure(IbcPostPacketData.fromPartial({})),
            IbcPostPacketAck: getStructure(IbcPostPacketAck.fromPartial({})),
            Post: getStructure(Post.fromPartial({})),
            SentPost: getStructure(SentPost.fromPartial({})),
            TimedoutPost: getStructure(TimedoutPost.fromPartial({})),
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
        getTimedoutPost: (state) => (params = { params: {} }) => {
            if (!params.query) {
                params.query = null;
            }
            return state.TimedoutPost[JSON.stringify(params)] ?? {};
        },
        getTimedoutPostAll: (state) => (params = { params: {} }) => {
            if (!params.query) {
                params.query = null;
            }
            return state.TimedoutPostAll[JSON.stringify(params)] ?? {};
        },
        getSentPost: (state) => (params = { params: {} }) => {
            if (!params.query) {
                params.query = null;
            }
            return state.SentPost[JSON.stringify(params)] ?? {};
        },
        getSentPostAll: (state) => (params = { params: {} }) => {
            if (!params.query) {
                params.query = null;
            }
            return state.SentPostAll[JSON.stringify(params)] ?? {};
        },
        getPost: (state) => (params = { params: {} }) => {
            if (!params.query) {
                params.query = null;
            }
            return state.Post[JSON.stringify(params)] ?? {};
        },
        getPostAll: (state) => (params = { params: {} }) => {
            if (!params.query) {
                params.query = null;
            }
            return state.PostAll[JSON.stringify(params)] ?? {};
        },
        getTypeStructure: (state) => (type) => {
            return state._Structure[type].fields;
        }
    },
    actions: {
        init({ dispatch, rootGetters }) {
            console.log('Vuex module: user.planet.blog initialized!');
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
            state._Subscriptions.forEach(async (subscription) => {
                try {
                    await dispatch(subscription.action, subscription.payload);
                }
                catch (e) {
                    throw new SpVuexError('Subscriptions: ' + e.message);
                }
            });
        },
        async QueryTimedoutPost({ commit, rootGetters, getters }, { options: { subscribe, all } = { subscribe: false, all: false }, params: { ...key }, query = null }) {
            try {
                const queryClient = await initQueryClient(rootGetters);
                let value = (await queryClient.queryTimedoutPost(key.id)).data;
                commit('QUERY', { query: 'TimedoutPost', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QueryTimedoutPost', payload: { options: { all }, params: { ...key }, query } });
                return getters['getTimedoutPost']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                throw new SpVuexError('QueryClient:QueryTimedoutPost', 'API Node Unavailable. Could not perform query: ' + e.message);
            }
        },
        async QueryTimedoutPostAll({ commit, rootGetters, getters }, { options: { subscribe, all } = { subscribe: false, all: false }, params: { ...key }, query = null }) {
            try {
                const queryClient = await initQueryClient(rootGetters);
                let value = (await queryClient.queryTimedoutPostAll(query)).data;
                while (all && value.pagination && value.pagination.nextKey != null) {
                    let next_values = (await queryClient.queryTimedoutPostAll({ ...query, 'pagination.key': value.pagination.nextKey })).data;
                    value = mergeResults(value, next_values);
                }
                commit('QUERY', { query: 'TimedoutPostAll', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QueryTimedoutPostAll', payload: { options: { all }, params: { ...key }, query } });
                return getters['getTimedoutPostAll']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                throw new SpVuexError('QueryClient:QueryTimedoutPostAll', 'API Node Unavailable. Could not perform query: ' + e.message);
            }
        },
        async QuerySentPost({ commit, rootGetters, getters }, { options: { subscribe, all } = { subscribe: false, all: false }, params: { ...key }, query = null }) {
            try {
                const queryClient = await initQueryClient(rootGetters);
                let value = (await queryClient.querySentPost(key.id)).data;
                commit('QUERY', { query: 'SentPost', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QuerySentPost', payload: { options: { all }, params: { ...key }, query } });
                return getters['getSentPost']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                throw new SpVuexError('QueryClient:QuerySentPost', 'API Node Unavailable. Could not perform query: ' + e.message);
            }
        },
        async QuerySentPostAll({ commit, rootGetters, getters }, { options: { subscribe, all } = { subscribe: false, all: false }, params: { ...key }, query = null }) {
            try {
                const queryClient = await initQueryClient(rootGetters);
                let value = (await queryClient.querySentPostAll(query)).data;
                while (all && value.pagination && value.pagination.nextKey != null) {
                    let next_values = (await queryClient.querySentPostAll({ ...query, 'pagination.key': value.pagination.nextKey })).data;
                    value = mergeResults(value, next_values);
                }
                commit('QUERY', { query: 'SentPostAll', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QuerySentPostAll', payload: { options: { all }, params: { ...key }, query } });
                return getters['getSentPostAll']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                throw new SpVuexError('QueryClient:QuerySentPostAll', 'API Node Unavailable. Could not perform query: ' + e.message);
            }
        },
        async QueryPost({ commit, rootGetters, getters }, { options: { subscribe, all } = { subscribe: false, all: false }, params: { ...key }, query = null }) {
            try {
                const queryClient = await initQueryClient(rootGetters);
                let value = (await queryClient.queryPost(key.id)).data;
                commit('QUERY', { query: 'Post', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QueryPost', payload: { options: { all }, params: { ...key }, query } });
                return getters['getPost']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                throw new SpVuexError('QueryClient:QueryPost', 'API Node Unavailable. Could not perform query: ' + e.message);
            }
        },
        async QueryPostAll({ commit, rootGetters, getters }, { options: { subscribe, all } = { subscribe: false, all: false }, params: { ...key }, query = null }) {
            try {
                const queryClient = await initQueryClient(rootGetters);
                let value = (await queryClient.queryPostAll(query)).data;
                while (all && value.pagination && value.pagination.nextKey != null) {
                    let next_values = (await queryClient.queryPostAll({ ...query, 'pagination.key': value.pagination.nextKey })).data;
                    value = mergeResults(value, next_values);
                }
                commit('QUERY', { query: 'PostAll', key: { params: { ...key }, query }, value });
                if (subscribe)
                    commit('SUBSCRIBE', { action: 'QueryPostAll', payload: { options: { all }, params: { ...key }, query } });
                return getters['getPostAll']({ params: { ...key }, query }) ?? {};
            }
            catch (e) {
                throw new SpVuexError('QueryClient:QueryPostAll', 'API Node Unavailable. Could not perform query: ' + e.message);
            }
        },
        async sendMsgSendIbcPost({ rootGetters }, { value, fee = [], memo = '' }) {
            try {
                const txClient = await initTxClient(rootGetters);
                const msg = await txClient.msgSendIbcPost(value);
                const result = await txClient.signAndBroadcast([msg], { fee: { amount: fee,
                        gas: "200000" }, memo });
                return result;
            }
            catch (e) {
                if (e == MissingWalletError) {
                    throw new SpVuexError('TxClient:MsgSendIbcPost:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgSendIbcPost:Send', 'Could not broadcast Tx: ' + e.message);
                }
            }
        },
        async MsgSendIbcPost({ rootGetters }, { value }) {
            try {
                const txClient = await initTxClient(rootGetters);
                const msg = await txClient.msgSendIbcPost(value);
                return msg;
            }
            catch (e) {
                if (e == MissingWalletError) {
                    throw new SpVuexError('TxClient:MsgSendIbcPost:Init', 'Could not initialize signing client. Wallet is required.');
                }
                else {
                    throw new SpVuexError('TxClient:MsgSendIbcPost:Create', 'Could not create message: ' + e.message);
                }
            }
        },
    }
};
