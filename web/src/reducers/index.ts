import Dynamic from '@ironbay/dynamic'

import { MERGES, MergeAction, DELETES, DeletesAction, CONFIRM_SYNC, CONFIRM_SYNC_DIFF, QUEUE, QueueAction, SNAPSHOT, ON_CONNECT, ON_DISCONNECT, LOGIN_FAIL, LOGIN_SUCCEED, SNAPSHOT_DIFF, LoginSucceed, ConfirmSyncAction, SnapshotDiffAction, RPC_SUCCEED, RPCSucceedAction } from '~/src/actions/core'
import {Actions, ADD_SCHOOL, addSchoolAction, ADD_SCHOOLS, addNewSchoolAction, EditLoginNumberAction, EDIT_LOGIN_NUMBER, ADD_PRODUCTS, AddProductsAction, PRODUCT_IMAGE_ADDED, ProductImageAddedAction } from '~/src/actions'


const rootReducer = (state : RootBankState, action: Actions) : RootBankState => {

	console.log("action type:", action.type)

	switch(action.type) {

		case ON_CONNECT:
		{
			return {
				...state,
				connected: true
			}
		}

		case EDIT_LOGIN_NUMBER:
		{
			return {
				...state,
				auth: {
					...state.auth,
					//@ts-ignore
					number: (action as EditLoginNumberAction).number
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

		case LOGIN_SUCCEED: 
		{
			//@ts-ignore
			const succeed = <LoginSucceed>action

			console.log("LOGIN SUCCEED")
			console.log(succeed)
			
			return {
				...state,
				auth: {
					...state.auth,
					loading: false,
					token: succeed.token,
					attempt_failed: false,
					id: succeed.id,
					number: succeed.number
				},
				sync_state: {
					...state.sync_state,
					...succeed.sync_state
				},
				last_snapshot: new Date().getTime()
			}
		}

		case MERGES: 
		{
			const nextState = (action as MergeAction).merges.reduce((agg, curr) => {
				return Dynamic.put(agg, curr.path, curr.value)
			}, JSON.parse(JSON.stringify(state)));

			return {
				...nextState,
				accept_snapshot: false
			}
		}

		case DELETES: 
		{
			const state_copy = JSON.parse(JSON.stringify(state)) as RootBankState;

			(action as DeletesAction).paths.forEach(a => Dynamic.delete(state_copy, a.path));

			return {
				...state_copy,
				accept_snapshot: false
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
			//@ts-ignore
			const diff_action = action as ConfirmSyncAction;

			console.log(
				"confirm sync diff: ", 
				Object.keys(diff_action.new_writes).length, 
				" changes synced");
			
			const newQ = Object.keys(state.queued)
				.filter(t => {
					console.log(state.queued[t].date, diff_action.date, state.queued[t].date - diff_action.date)
					return state.queued[t].date > diff_action.date
				})
				.reduce((agg, curr) => {
					return Dynamic.put(agg, ["queued", state.queued[curr].action.path], state.queued[curr].action)
				}, {})
			
			if(Object.keys(diff_action.new_writes).length > 0) {

				const nextState = Object.values(diff_action.new_writes)
					.reduce((agg, curr) => {
						if(curr.type === "DELETE") {
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

		case RPC_SUCCEED: 
		{
			//@ts-ignore
			const rpc_action = action as RPCSucceedAction

			if(rpc_action.new_writes.length == 0) {
				return state
			}

			const nextState = rpc_action.new_writes.reduce((agg, curr) => {

				if(curr.type == "DELETE") {
					return Dynamic.delete(agg, curr.path)
				}
				return Dynamic.put(agg, curr.path, curr.value)

			}, JSON.parse(JSON.stringify(state))) as RootBankState

			return {
				...nextState
			}
		}

		case SNAPSHOT_DIFF:
		{
			// @ts-ignore
			const snapshot = action as SnapshotDiffAction;
			console.log("snapshot_diff:", Object.keys(snapshot.new_writes).length, "changes broadcast")

			if(!state.accept_snapshot) {
				return state;
			}

			if(Object.keys(snapshot.new_writes).length > 0) {

				const nextState = Object.values(snapshot.new_writes)
					.reduce((agg, curr) => {
						if(curr.type === "DELETE") {
							return Dynamic.delete(agg, curr.path)
						}
						return Dynamic.put(agg, curr.path, curr.value)
					}, JSON.parse(JSON.stringify(state))) as RootBankState;
				
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

		case ADD_SCHOOLS:
		{
			return {
				...state,
				new_school_db:  {
					...state.new_school_db,
					// @ts-ignore
					...(action as addNewSchoolAction).schools
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
					last_sync: new Date().getTime(), // this is useless for now
					db: {
						...state.products.db,
						...add_action.products
					}
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

		default:
			return state
	}
}

export default rootReducer;