import { txClient, queryClient } from './module'
// @ts-ignore
import { SpVuexError } from '@starport/vuex'

import { Vote } from "./module/types/voter/vote"
import { Poll } from "./module/types/voter/poll"


async function initTxClient(vuexGetters) {
	return await txClient(vuexGetters['common/wallet/signer'], {
		addr: vuexGetters['common/env/apiTendermint']
	})
}

async function initQueryClient(vuexGetters) {
	return await queryClient({
		addr: vuexGetters['common/env/apiCosmos']
	})
}

function getStructure(template) {
	let structure = { fields: [] }
	for (const [key, value] of Object.entries(template)) {
		let field: any = {}
		field.name = key
		field.type = typeof value
		structure.fields.push(field)
	}
	return structure
}

const getDefaultState = () => {
	return {
        Vote: {},
        VoteAll: {},
        Poll: {},
        PollAll: {},
        
        _Structure: {
            Vote: getStructure(Vote.fromPartial({})),
            Poll: getStructure(Poll.fromPartial({})),
            
		},
		_Subscriptions: new Set(),
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	mutations: {
		RESET_STATE(state) {
			Object.assign(state, getDefaultState())
		},
		QUERY(state, { query, key, value }) {
			state[query][JSON.stringify(key)] = value
		},
		SUBSCRIBE(state, subscription) {
			state._Subscriptions.add(subscription)
		},
		UNSUBSCRIBE(state, subscription) {
			state._Subscriptions.delete(subscription)
		}
	},
	getters: {
        getVote: (state) => (params = {}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.Vote[JSON.stringify(params)] ?? {}
		},
        getVoteAll: (state) => (params = {}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.VoteAll[JSON.stringify(params)] ?? {}
		},
        getPoll: (state) => (params = {}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.Poll[JSON.stringify(params)] ?? {}
		},
        getPollAll: (state) => (params = {}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.PollAll[JSON.stringify(params)] ?? {}
		},
        
		getTypeStructure: (state) => (type) => {
			return state._Structure[type].fields
		}
	},
	actions: {
		init({ dispatch, rootGetters }) {
			console.log('init')
			if (rootGetters['common/env/client']) {
				rootGetters['common/env/client'].on('newblock', () => {
					dispatch('StoreUpdate')
				})
			}
		},
		resetState({ commit }) {
			commit('RESET_STATE')
		},
		unsubscribe({ commit }, subscription) {
			commit('UNSUBSCRIBE', subscription)
		},
		async StoreUpdate({ state, dispatch }) {
			state._Subscriptions.forEach((subscription) => {
				dispatch(subscription.action, subscription.payload)
			})
		},
		async QueryVote({ commit, rootGetters, getters }, { options: { subscribe = false , all = false}, params: {...key}, query=null }) {
			try {
				
				let value = query?(await (await initQueryClient(rootGetters)).queryVote( key.id,  query)).data:(await (await initQueryClient(rootGetters)).queryVote( key.id )).data
				
				commit('QUERY', { query: 'Vote', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryVote', payload: { options: { all }, params: {...key},query }})
				return getters['getVote']( { params: {...key}, query}) ?? {}
			} catch (e) {
				console.error(new SpVuexError('QueryClient:QueryVote', 'API Node Unavailable. Could not perform query.'))
				return {}
			}
		},
		async QueryVoteAll({ commit, rootGetters, getters }, { options: { subscribe = false , all = false}, params: {...key}, query=null }) {
			try {
				
				let value = query?(await (await initQueryClient(rootGetters)).queryVoteAll( query)).data:(await (await initQueryClient(rootGetters)).queryVoteAll()).data
				
				while (all && (<any> value).pagination && (<any> value).pagination.nextKey!=null) {
					let next_values=(await (await initQueryClient(rootGetters)).queryVoteAll({...query, 'pagination.key':(<any> value).pagination.nextKey})).data
					for (let prop of Object.keys(next_values)) {
						if (Array.isArray(next_values[prop])) {
							value[prop]=[...value[prop], ...next_values[prop]]
						}else{
							value[prop]=next_values[prop]
						}
					}
				}
				
				commit('QUERY', { query: 'VoteAll', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryVoteAll', payload: { options: { all }, params: {...key},query }})
				return getters['getVoteAll']( { params: {...key}, query}) ?? {}
			} catch (e) {
				console.error(new SpVuexError('QueryClient:QueryVoteAll', 'API Node Unavailable. Could not perform query.'))
				return {}
			}
		},
		async QueryPoll({ commit, rootGetters, getters }, { options: { subscribe = false , all = false}, params: {...key}, query=null }) {
			try {
				
				let value = query?(await (await initQueryClient(rootGetters)).queryPoll( key.id,  query)).data:(await (await initQueryClient(rootGetters)).queryPoll( key.id )).data
				
				commit('QUERY', { query: 'Poll', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryPoll', payload: { options: { all }, params: {...key},query }})
				return getters['getPoll']( { params: {...key}, query}) ?? {}
			} catch (e) {
				console.error(new SpVuexError('QueryClient:QueryPoll', 'API Node Unavailable. Could not perform query.'))
				return {}
			}
		},
		async QueryPollAll({ commit, rootGetters, getters }, { options: { subscribe = false , all = false}, params: {...key}, query=null }) {
			try {
				
				let value = query?(await (await initQueryClient(rootGetters)).queryPollAll( query)).data:(await (await initQueryClient(rootGetters)).queryPollAll()).data
				
				while (all && (<any> value).pagination && (<any> value).pagination.nextKey!=null) {
					let next_values=(await (await initQueryClient(rootGetters)).queryPollAll({...query, 'pagination.key':(<any> value).pagination.nextKey})).data
					for (let prop of Object.keys(next_values)) {
						if (Array.isArray(next_values[prop])) {
							value[prop]=[...value[prop], ...next_values[prop]]
						}else{
							value[prop]=next_values[prop]
						}
					}
				}
				
				commit('QUERY', { query: 'PollAll', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryPollAll', payload: { options: { all }, params: {...key},query }})
				return getters['getPollAll']( { params: {...key}, query}) ?? {}
			} catch (e) {
				console.error(new SpVuexError('QueryClient:QueryPollAll', 'API Node Unavailable. Could not perform query.'))
				return {}
			}
		},
		
		async sendMsgCreateVote({ rootGetters }, { value, fee, memo }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgCreateVote(value)
				const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], {fee: { amount: fee, 
  gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgCreateVote:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgCreateVote:Send', 'Could not broadcast Tx.')
				}
			}
		},
		async sendMsgCreatePoll({ rootGetters }, { value, fee, memo }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgCreatePoll(value)
				const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], {fee: { amount: fee, 
  gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgCreatePoll:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgCreatePoll:Send', 'Could not broadcast Tx.')
				}
			}
		},
		async sendMsgDeleteVote({ rootGetters }, { value, fee, memo }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgDeleteVote(value)
				const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], {fee: { amount: fee, 
  gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgDeleteVote:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgDeleteVote:Send', 'Could not broadcast Tx.')
				}
			}
		},
		async sendMsgUpdateVote({ rootGetters }, { value, fee, memo }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgUpdateVote(value)
				const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], {fee: { amount: fee, 
  gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgUpdateVote:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgUpdateVote:Send', 'Could not broadcast Tx.')
				}
			}
		},
		async sendMsgUpdatePoll({ rootGetters }, { value, fee, memo }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgUpdatePoll(value)
				const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], {fee: { amount: fee, 
  gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgUpdatePoll:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgUpdatePoll:Send', 'Could not broadcast Tx.')
				}
			}
		},
		async sendMsgDeletePoll({ rootGetters }, { value, fee, memo }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgDeletePoll(value)
				const result = await (await initTxClient(rootGetters)).signAndBroadcast([msg], {fee: { amount: fee, 
  gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgDeletePoll:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgDeletePoll:Send', 'Could not broadcast Tx.')
				}
			}
		},
		
		async MsgCreateVote({ rootGetters }, { value }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgCreateVote(value)
				return msg
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgCreateVote:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgCreateVote:Create', 'Could not create message.')
				}
			}
		},
		async MsgCreatePoll({ rootGetters }, { value }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgCreatePoll(value)
				return msg
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgCreatePoll:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgCreatePoll:Create', 'Could not create message.')
				}
			}
		},
		async MsgDeleteVote({ rootGetters }, { value }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgDeleteVote(value)
				return msg
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgDeleteVote:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgDeleteVote:Create', 'Could not create message.')
				}
			}
		},
		async MsgUpdateVote({ rootGetters }, { value }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgUpdateVote(value)
				return msg
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgUpdateVote:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgUpdateVote:Create', 'Could not create message.')
				}
			}
		},
		async MsgUpdatePoll({ rootGetters }, { value }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgUpdatePoll(value)
				return msg
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgUpdatePoll:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgUpdatePoll:Create', 'Could not create message.')
				}
			}
		},
		async MsgDeletePoll({ rootGetters }, { value }) {
			try {
				const msg = await (await initTxClient(rootGetters)).msgDeletePoll(value)
				return msg
			} catch (e) {
				if (e.toString()=='wallet is required') {
					throw new SpVuexError('TxClient:MsgDeletePoll:Init', 'Could not initialize signing client. Wallet is required.')
				}else{
					throw new SpVuexError('TxClient:MsgDeletePoll:Create', 'Could not create message.')
				}
			}
		},
		
	}
}
