import Syncr from '../syncr'
import { createLoginSucceed } from './core';

type Dispatch = (action: any) => any
type GetState = () => RootReducerState

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
		.then((res: { token: string; sync_state: SyncState }) => {
			dispatch(createLoginSucceed(username, res.token, res.sync_state))
		})
		.catch(res => {
			console.error(res)
			alert("login failed" + JSON.stringify(res))
		})

}

export const SMSAuth = (phone: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		setTimeout(() => dispatch(SMSAuth(phone)), 2000)
		return
	}

	dispatch({
		type: "SENDING_AUTH_SMS"
	})

	syncr.send({
		type: "SMS_AUTH_CODE",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			phone
		}
	})
		.then(res => {
			dispatch({
				type: "SMS_SENT"
			})
		})
		.catch(err => {
			window.alert(err)
		})
}

export const verifyUrlAuth = (token: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	if (!state.connected) {
		setTimeout(() => dispatch(verifyUrlAuth(token)), 2000)
		return
	}

	syncr.send({
		type: "URL_AUTH",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			token
		}
	})
		.then((res: { id: string; token: string; sync_state: SyncState }) => {
			dispatch(createLoginSucceed(res.id, res.token, res.sync_state))
		})
		.catch(res => {
			console.error(res)
			if (res === "timeout") {
				setTimeout(() => dispatch(verifyUrlAuth(token)), 2000)
			}
			else {
				alert("login failed" + JSON.stringify(res))
			}
		})

}

export const ADD_PRODUCTS = "ADD_PRODUCTS"
export const GET_PRODUCTS = "GET_PRODUCTS"
export const getProducts = (filters = {}) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "GET_PRODUCTS",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			filters
		},
		last_sync: state.products.last_sync
	})
		.then((res: any) => {
			// now dispatch an action that 'saves' these products

			dispatch({
				type: ADD_PRODUCTS,
				products: res.products
			})

			return res
		})
		.catch(err => {
			console.error(err)

			setTimeout(() => dispatch(getProducts()), 1000)
		})
}

export const LOAD_PROFILE = "LOAD_PROFILE"
export const loadProfile = (number: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "GET_PROFILE",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: { number },
		last_sync: state.products.last_sync
	})
		.then(res => {
			console.log(res)

			dispatch({
				type: LOAD_PROFILE,
				school_id: res.school_id,
				school: res.school
			})
		})
		.catch((err: Error) => {
			if (err.message === "not ready") {
				alert("not yet connected...")
			}
			else {
				alert("No existing school found")
				dispatch({
					type: LOAD_PROFILE,
					school_id: "",
					school: undefined
				})
			}
		})

}

export const SIGN_UP = "SIGN_UP"
export const signUp = (number: string, password: string, profile: Partial<CERPSchool>) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: SIGN_UP,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			number,
			password,
			profile
		}
	})
		.then(res => {
			// get token back
			console.log(res)
			const token: string = res.token;

			dispatch(createLoginSucceed(number, token, { profile }))
			// set auth
		})
		.catch(err => {
			console.error(err)

			// dispatch sign-up failed (phone number not unique?)
		})

}

export const placeOrder = (product: Product) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "PLACE_ORDER",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			product,
			refcode: state.sync_state.profile.refcode,
			school_name: state.sync_state.profile.school_name
		}
	})
		.then(res => {
			// get token back
			console.log(res)
		})
		.catch(err => {
			console.error(err)
		})
}
