import Syncr from 'src/syncr';

const SYNC = "SYNC"

// TODO: separate out connect, auth merges and deletes into separate folder
export const MERGES = "MERGES"

type Dispatch = (action: any) => any;
type GetState = () => RootBankState

interface Merge {
	path: string[];
	value: any;
}

export interface MergeAction {
	type: "MERGES";
	merges: Merge[];
}

export const createMerges = (merges: Merge[]) => (dispatch: (a: any) => any, getState: () => RootBankState, syncr: Syncr) => {
	// merges is a list of path, value

	const action = {
		type: MERGES,
		merges
	}

	dispatch(action)

	const new_merges = merges.reduce((agg, curr) => ({
		...agg,
		[curr.path.join(',')]: {
			action: {
				type: "MERGE",
				path: curr.path.map(p => p === undefined ? "" : p),
				value: curr.value
			},
			date: new Date().getTime()
		}
	}), {})

	const state = getState();
	const rationalized_merges = { ...state.queued, ...new_merges }

	const payload = {
		type: SYNC,
		id: state.auth.id,
		client_type: state.auth.client_type,
		last_snapshot: state.last_snapshot,
		payload: rationalized_merges
	}

	syncr.send(payload)
		.then(dispatch)
		.catch(err => dispatch(QueueUp(new_merges)))
}

type ImageMerges = Array<{ id: string; imageString: string; path: string[] }>

export const createImageMerges = (imageMerges: ImageMerges) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	// the path should be to an image object
	// which is { id: string, url: string }
	// we pass in the id here

	const state = getState()
	const merges = imageMerges.reduce((agg, curr) => {
		return {
			...agg,
			[curr.path.join(',')]: {
				action: {
					type: "IMAGE_MERGE",
					path: curr.path,
					value: {
						id: curr.id,
						image_string: curr.imageString
					}
				},
				date: new Date().getTime()
			}
		}
	}, {})

	const rationalized_merges = {
		...state.queued,
		...merges
	}

	// this would go right into the queued map
	// is there a chance that the path would overwrite something else...
	// example:
	/*
		A [product, id]: { ... image: {id: 1000 } }
		B [product, id, image]: { id: 1000 }
		C [product, id, image, id]: 1000

		then this image merge: 
		[product, id, image]: { id: [img id]}

		this overwrites C BUT does the same thing. have to ensure C doesnt come second
		C and B should never happen because if you are only altering the image, it should 
		only be an image write
	*/

	syncr.send({
		type: SYNC,
		id: state.auth.id,
		client_type: state.auth.client_type,
		last_snapshot: state.last_snapshot,
		payload: rationalized_merges
	})
		.then(dispatch) // should return a series of merges with an image url 
		.catch((err: Error) => {
			console.error(err)
			dispatch(QueueUp(merges))
		})

}

export const SMS = "SMS"
export const sendSMS = (text: string, number: string) => (dispatch: (a: any) => any, getState: () => RootBankState, syncr: Syncr) => {

	// should i keep a log of all messages sent in the db?

	const state = getState();
	syncr.send({
		type: SMS,
		client_type: state.auth.client_type,
		id: state.auth.id,
		payload: {
			text,
			number,
		}
	})
		.then(dispatch)
		.catch((err: Error) => console.error(err)) // this should backup to sending the sms via the android app?
}


export const BATCH_SMS = "BATCH_SMS"
interface SMS {
	text: string;
	number: string;
}

export const sendBatchSMS = (messages: SMS[]) => (dispatch: (a: any) => any, getState: () => RootBankState, syncr: Syncr) => {

	const state = getState();
	syncr.send({
		type: BATCH_SMS,
		client_type: state.auth.client_type,
		id: state.auth.id,
		payload: {
			messages
		}
	})
		.catch((err: Error) => {
			console.error(err) // send via android app?
		})
}

interface ServerAction {
	type: string;
	payload: any;
}

export const sendServerAction = (action: ServerAction) => (dispatch: Dispatch, getState: () => RootBankState, syncr: Syncr) => {
	const state = getState();

	console.log('send server action...', action)
	return syncr.send({
		type: action.type,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: action.payload
	})
		.then(dispatch)
		.catch((err: Error) => {
			console.error(err)
		})

	// should it get queued up....
}

export const DELETES = "DELETES"
interface Delete {
	path: string[];
}

export interface DeletesAction {
	type: "DELETES";
	paths: Delete[];
}

export const createDeletes = (paths: Delete[]) => (dispatch: Dispatch, getState: () => RootBankState, syncr: Syncr) => {

	const action = {
		type: DELETES,
		paths
	}

	dispatch(action)

	const state = getState();
	const payload = paths.reduce((agg, curr) => ({
		...agg,
		[curr.path.join(',')]: {
			action: {
				type: "DELETE",
				path: curr.path.map(x => x === undefined ? "" : x),
				value: 1
			},
			date: new Date().getTime()
		}
	}), {})

	const rationalized_deletes = { ...state.queued, ...payload }

	syncr.send({
		type: SYNC,
		client_type: state.auth.client_type,
		school_id: state.auth.id,
		last_snapshot: state.last_snapshot,
		payload: rationalized_deletes
	})
		.then(dispatch)
		.catch((err: Error) => dispatch(QueueUp(payload)))

}

// this is only produced by the server. 
// it will tell us it hsa confirmed sync up to { date: timestamp }
export const RPC_SUCCEED = "RPC_SUCCEED"
export interface RPCSucceedAction {
	type: "RPC_SUCCEED";
	new_writes: Write[];
}

export const CONFIRM_SYNC = "CONFIRM_SYNC"
export const CONFIRM_SYNC_DIFF = "CONFIRM_SYNC_DIFF"
export interface ConfirmSyncAction {
	type: "CONFIRM_SYNC_DIFF";
	date: number;
	new_writes: Write[];
}

export interface Write {
	date: number;
	value: any;
	path: string[];
	type: "MERGE" | "DELETE";
	client_id: string;
}

export const SNAPSHOT = "SNAPSHOT"
export const SNAPSHOT_DIFF = "SNAPSHOT_DIFF"

export interface SnapshotDiffAction {
	new_writes: {
		[path_string: string]: {
			type: "MERGE" | "DELETE";
			path: string[];
			value?: any;
		};
	};
}

export const QUEUE = "QUEUE"
// queue up an object where key is path, value is action/date
interface Queuable {
	[path: string]: {
		action: {
			type: "MERGE" | "DELETE";
			path: string[];
			value?: any;
		};
		date: number;
	};
}

export interface QueueAction {
	type: "QUEUE";
	payload: Queuable;
}

export const QueueUp = (action: Queuable) => {
	return {
		type: QUEUE,
		payload: action
	}
}

export const ON_CONNECT = "ON_CONNECT"
export const ON_DISCONNECT = "ON_DISCONNECT"
export const connected = () => (dispatch: (a: any) => any, getState: () => RootBankState, syncr: Syncr) => {
	const action = { type: ON_CONNECT }

	dispatch(action)

	const state = getState();

	if (state.auth.id && state.auth.token) {
		syncr
			.send({
				type: "VERIFY",
				client_type: state.auth.client_type,
				payload: {
					id: state.auth.id,
					token: state.auth.token,
					client_id: state.client_id,
				}
			})
			.then(res => {
				return syncr.send({
					type: SYNC,
					client_type: state.auth.client_type,
					id: state.auth.id,
					payload: state.queued,
					last_snapshot: state.last_snapshot
				})
			})
			.then(resp => {
				dispatch(resp)
			})
			.catch(err => {
				console.error(err)
				alert("Authorization Failed. Log out and Log in again.")
			})
	}
}

export const disconnected = () => ({ type: ON_DISCONNECT })

export const LOGIN_FAIL = "LOGIN_FAIL"
export const createLoginFail = () => ({ type: LOGIN_FAIL })

export const LOGIN_SUCCEED = "LOGIN_SUCCEED"
export interface LoginSucceed {
	type: "LOGIN_SUCCEED";
	id: string;
	token: string;
	sync_state: RootBankState['sync_state'];
	number: string;
}
export const createLoginSucceed = (id: string, token: string, sync_state: RootBankState['sync_state'], number: string): LoginSucceed => ({
	type: LOGIN_SUCCEED,
	id,
	token,
	sync_state,
	number
})
