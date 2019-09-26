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
	.then((res: {token: string, sync_state: SyncState }) => {
		dispatch(createLoginSucceed(username, res.token, res.sync_state ))
	})
	.catch(res => {
		console.error(res)
		alert("login failed" + JSON.stringify(res))
	})

}

export const ADD_PRODUCTS = "ADD_PRODUCTS"
export const GET_PRODUCTS = "GET_PRODUCTS"
export const getProducts = (filters = {}) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "GET_PRODUCTS",
		client_type: state.auth.client_type,
		client_id: state.auth.id,
		id: state.auth.id,
		payload: {
			filters
		},
		last_sync: state.products.last_sync
	})
	.then((res : any) => {
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
