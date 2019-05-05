import Syncr from '../syncr'
import { MergeAction, DeletesAction, QueueAction, sendServerAction, createLoginSucceed, createMerges, createDeletes } from './core'

type Dispatch = (action: any) => any;
type GetState = () => RootReducerState

export const ADD_SCHOOLS = "ADD_SCHOOLS"

export const createLogin = (username: string, password: string, number: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "LOGIN",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			id: username,
			password
		}
	})
	.then((res: { token: string  }) => {

		dispatch(createLoginSucceed(username, res.token, {}, number))
	})
}

export const getSchoolProfiles = (school_ids: string[]) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "GET_SCHOOL_PROFILES",
		client_type: state.auth.client_type,
		client_id: state.auth.id,
		id: state.auth.id,
		payload: {
			school_ids
		}
	})
	.then(res => {
			console.log(res);
			dispatch({
				type: ADD_SCHOOLS,
				schools: res,
			})

			return res;
		})
		.catch(err => {
			console.error(err);

			setTimeout(() => dispatch(getSchoolProfiles(school_ids)), 1000)
		})
}

export const editSchoolProfile = (school_id: string, school: CERPSchool) => (dispatch: Dispatch, getState: GetState, syncr: Syncr)  => {

	const state = getState();

	syncr.send({
		type: "SAVE_SCHOOL",
		payload: {
			school
		},
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		last_snapshot: state.last_snapshot
	})
	.then(res => {
		console.log(res)
	})
	.catch(err => {
		console.error(err)
	})

}

export const reserveMaskedNumber = (school_id: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	// from the pool in state.mask_pairs select an unused number
	const state = getState();

	syncr.send({
		type: "RESERVE_NUMBER",
		payload: {
			school_id
		},
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		last_snapshot: state.last_snapshot
	})
	.then(res => {
		console.log(res)
		dispatch(res)
	})
	.catch(err => {
		console.error(err)
	})

}