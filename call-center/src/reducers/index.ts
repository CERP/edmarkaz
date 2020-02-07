import Dynamic from '@ironbay/dynamic'

import { MERGES, MergeAction, ON_CONNECT, ON_DISCONNECT, DELETES, DeletesAction, QueueAction, QUEUE, CONFIRM_SYNC_DIFF, ConfirmSyncAction, SnapshotDiffAction, SNAPSHOT_DIFF, RPC_SUCCEED, RPCSucceedAction, LOGIN_SUCCEED, LoginSucceed } from '../actions/core'
import { AnyAction, Reducer } from 'redux';
import { ADD_PRODUCTS, ADD_SCHOOLS, AddSchoolAction, INCOMING_PHONE_CALL, IncomingPhoneCallAction, PRODUCT_IMAGE_ADDED, ProductImageAddedAction, AddOrdersAction } from '../actions';
import { loadDB } from '../utils/localStorage';

const rootReducer: Reducer<RootReducerState, AnyAction> = (state: RootReducerState | undefined, action: AnyAction): RootReducerState => {

	// never actually gets called
	if (state === undefined) {
		return loadDB()
	}

	console.log(action)
	switch (action.type) {

		case LOGIN_SUCCEED:
			{
				const succeed = action as LoginSucceed

				return {
					...state,
					auth: {
						...state.auth,
						id: succeed.id,
						token: succeed.token
					}
				}
			}

		case ON_CONNECT:
			{
				return {
					...state,
					connected: true
				}
			}

		case ON_DISCONNECT:
			{
				return {
					...state,
					connected: false
				}
			}

		case "ADD_LOGS":
			{
				return {
					...state,
					logs: {
						...state.logs,
						db: {
							...state.logs.db,
							...action.logs
						},
						loading: false,
					}
				}
			}
		case "LOAD_LOGS":
			{
				return {
					...state,
					logs: {
						...state.logs,
						loading: true
					}
				}
			}

		case "LOAD_PRODUCTS":
			{
				return {
					...state,
					products: {
						...state.products,
						loading: true
					}
				}
			}

		case PRODUCT_IMAGE_ADDED:
			{
				// @ts-ignore
				const image_action = action as ProductImageAddedAction

				console.log(image_action)

				return {
					...state,
					products: {
						...state.products,
						db: {
							...state.products.db,
							[image_action.product_id]: {
								...(state.products.db[image_action.product_id]),
								image: {
									url: image_action.img_url,
									id: image_action.image_id
								}
							}
						}
					}
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
						loading: false,
						db: {
							...state.products.db,
							...add_action.products
						}
					}
				}
			}

		case "ADD_ORDERS":
			{
				// @ts-ignore
				const add_action = action as AddOrdersAction
				return {
					...state,
					orders: {
						last_sync: new Date().getTime(),
						loading: false,
						db: {
							...state.orders.db,
							...add_action.orders
						}
					}
				}
			}

		case "LOAD_ORDERS":
			{
				return {
					...state,
					orders: {
						...state.orders,
						loading: true
					}
				}
			}


		case INCOMING_PHONE_CALL:
			{
				const incoming = (action as IncomingPhoneCallAction)

				console.log("INCOMING", incoming)

				return {
					...state,
					caller_id: incoming.number
				}
			}

		case ADD_SCHOOLS:
			{
				const schools = (action as AddSchoolAction).schools

				return {
					...state,
					active_school: Object.values(schools)[0]
				}
			}

		case MERGES:
			{
				const nextState = (action as MergeAction).merges.reduce((agg, curr) => {
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

		case RPC_SUCCEED:
			{
				//@ts-ignore
				const rpc_action = action as RPCSucceedAction

				if (rpc_action.new_writes.length == 0) {
					return state
				}

				const nextState = rpc_action.new_writes.reduce((agg, curr) => {

					if (curr.type == "DELETE") {
						return Dynamic.delete(agg, curr.path)
					}
					return Dynamic.put(agg, curr.path, curr.value)

				}, JSON.parse(JSON.stringify(state))) as RootReducerState

				return {
					...nextState
				}
			}

		case QUEUE:
			{
				return {
					...state,
					queued: {
						...state.queued,
						...(action as QueueAction).payload
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

				const newQ = Object.keys(state.queued)
					.filter(t => {
						console.log(state.queued[t].date, diff_action.date, state.queued[t].date - diff_action.date)
						return state.queued[t].date > diff_action.date
					})
					.reduce((agg, curr) => {
						return Dynamic.put(agg, ["queued", state.queued[curr].action.path], state.queued[curr].action)
					}, {})

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

		default:
			return state
	}

}

export default rootReducer;