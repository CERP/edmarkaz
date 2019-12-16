import Dynamic from '@ironbay/dynamic'

import { MERGES, MergeAction, ON_CONNECT, ON_DISCONNECT, DELETES, DeletesAction, QUEUE, CONFIRM_SYNC_DIFF, ConfirmSyncAction, SnapshotDiffAction, SNAPSHOT_DIFF, LOGIN_SUCCEED, LoginSucceed, ConfirmAnalyticsSync, QueueAction } from '../actions/core'
import { ADD_PRODUCTS, LOAD_PROFILE } from '../actions'
import { AnyAction } from 'redux';

const rootReducer = (state: RootReducerState, action: AnyAction): RootReducerState => {

	switch (action.type) {

		case ON_CONNECT:
			{
				return {
					...state,
					connected: true
				}
			}

		case "CONFIRM_ANALYTICS_SYNC": {
			const newA = Object.entries(state.queued.analytics)
				.reduce((agg, [key, val]) => {
					if (val.time > (action as ConfirmAnalyticsSync).time) {
						return {
							...agg,
							[key]: val
						}
					}
					return agg
				}, {})

			return {
				...state,
				queued: {
					...state.queued,
					analytics: newA
				}
			}
		}

		case "SENDING_AUTH_SMS":
			{
				return {
					...state,
					auth: {
						...state.auth,
						sms_sent: false
					}
				}
			}

		case "SMS_SENT":
			{
				return {
					...state,
					auth: {
						...state.auth,
						sms_sent: true
					}
				}
			}


		case ON_DISCONNECT:
			{
				return {
					...state,
					connected: false
				}
			}

		case MERGES:
			{
				const nextState = (action as MergeAction).merges.reduce((agg, curr) => {

					if (curr.value.no_local_apply) {
						return agg;
					}

					return Dynamic.put(agg, curr.path, curr.value)
				}, JSON.parse(JSON.stringify(state)))

				return {
					...nextState,
					accept_snapshot: false
				}
			}

		case DELETES:
			{
				const state_copy = JSON.parse(JSON.stringify(state)) as RootReducerState

				(action as DeletesAction).paths.forEach(a => Dynamic.delete(state_copy, a.path))

				return {
					...state_copy,
					accept_snapshot: false
				}
			}

		case QUEUE:
			{
				const queueAction = action as QueueAction;

				if (queueAction.queue_type === "analytics") {
					return {
						...state,
						queued: {
							...state.queued,
							analytics: {
								...state.queued.analytics,
								...queueAction.payload
							}
						}
					}
				}
				return {
					...state,
					queued: {
						...state.queued,
						mutations: {
							...state.queued.mutations,
							...queueAction.payload
						}
					}
				}
			}

		case CONFIRM_SYNC_DIFF:
			{
				const diff_action = action as ConfirmSyncAction

				console.log(
					"confirm sync diff: ",
					Object.keys(diff_action.new_writes).length,
					"changes synced")

				const newM = Object.keys(state.queued.mutations)
					.filter(t => {
						console.log(state.queued.mutations[t].date, diff_action.date, state.queued.mutations[t].date - diff_action.date)
						return state.queued.mutations[t].date > diff_action.date
					})
					.reduce((agg, curr) => {
						return Dynamic.put(agg, [state.queued.mutations[curr].action.path], state.queued.mutations[curr])
					}, {})

				const newQ = {
					...state.queued,
					mutations: newM
				}

				if (Object.keys(diff_action.new_writes).length > 0) {
					const nextState = Object.values(diff_action.new_writes)
						.reduce((agg, curr) => {
							if (curr.type === "DELETE") {
								return Dynamic.delete(agg, curr.path)
							}
							return Dynamic.put(agg, curr.path, curr.value)
						}, JSON.parse(JSON.stringify(state)))

					return {
						...nextState,
						queued: newQ,
						accept_snapshot: true,
						last_snapshot: new Date().getTime()
					}
				}

				return {
					...state,
					queued: newQ,
					accept_snapshot: true,
					last_snapshot: new Date().getTime()
				}
			}

		case SNAPSHOT_DIFF:
			{
				//@ts-ignore
				const snapshot = action as SnapshotDiffAction;
				console.log("snapshot diff: ", Object.keys(snapshot.new_writes).length, "changes broadcast")

				if (!state.accept_snapshot) {
					return state;
				}

				if (Object.keys(snapshot.new_writes).length > 0) {

					const nextState = Object.values(snapshot.new_writes)
						.reduce((agg, curr) => {
							if (curr.type === "DELETE") {
								return Dynamic.delete(agg, curr.path)
							}
							return Dynamic.put(agg, curr.path, curr.value)
						}, JSON.parse(JSON.stringify(state))) as RootReducerState;

					return {
						...nextState,
						last_snapshot: new Date().getTime()
					}

				}

				return {
					...state,
					last_snapshot: new Date().getTime()
				}
			}

		case ADD_PRODUCTS:
			{
				// @ts-ignore
				const add_action = action as AddProductsAction
				console.log(add_action)

				return {
					...state,
					products: {
						last_sync: new Date().getTime(),
						db: {
							...state.products.db,
							...add_action.products
						}
					}
				}
			}

		case LOGIN_SUCCEED:
			{
				const login_action = action as LoginSucceed

				return {
					...state,
					sync_state: login_action.sync_state,
					auth: {
						...state.auth,
						id: login_action.id,
						token: login_action.token,
					}
				}
			}

		case LOAD_PROFILE:
			{
				return {
					...state,
					sync_state: {
						...state.sync_state,
						profile: action.school
					}
				}
			}

		default:
			return state
	}

}

export default rootReducer;