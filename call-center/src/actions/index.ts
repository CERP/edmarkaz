import Syncr from '@cerp/syncr'
import { createLoginSucceed } from './core'
import moment from 'moment';

type Dispatch = (action: any) => any;
type GetState = () => RootReducerState

export const ADD_SCHOOLS = "ADD_SCHOOLS"

export const createLogin = (username: string, password: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

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
		.then((res: { token: string }) => {

			dispatch(createLoginSucceed(username, res.token, {}))
		})
}

export const placeOrder = (product: Product, school: CERPSchool) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState();

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(placeOrder(product, school)))
		return;
	}

	syncr.send({
		type: "PLACE_ORDER",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			product,
			refcode: school.refcode,
			school_name: school.school_name,
			school_number: school.phone_number
		}
	})
		.then(res => alert("successfully placed order"))
		.catch(err => {
			console.error(err)
			alert(err)
		})
}

export const verifyOrder = (order: Order, product: Product, school: CERPSchool, start_date: number) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState();

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(verifyOrder(order, product, school, start_date)))
		return;
	}

	syncr.send({
		type: "VERIFY_ORDER",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			order,
			product,
			school_name: school.school_name,
			school_number: school.phone_number
		}
	})
		.then(res => {
			dispatch(getOrders(start_date))
			alert(res)
		})
		.catch(err => {
			console.error(err)
			alert(err)
		})
}

export const rejectOrder = (order: Order, product: Product, start_date: number) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(rejectOrder(order, product, start_date)))
		return
	}

	syncr.send({
		type: "REJECT_ORDER",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			order,
			product
		}
	})
		.then(res => {
			dispatch(getOrders(start_date))
			alert(res)
		})
		.catch(err => {
			console.log(err)
			alert(err)
		})
}

export const updateOrderMeta = (order: Order, meta: any, supplier_id: string, start_date: number) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(updateOrderMeta(order, meta, supplier_id, start_date)))
		return
	}

	syncr.send({
		type: "UPDATE_ORDER_META",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			order,
			meta,
			supplier_id
		}
	})
		.then(res => {
			dispatch(getOrders(start_date))
			alert(res)
		})
		.catch(err => {
			alert(err)
		})

}

export const getOrders = (start_date = moment().subtract(3, "days").valueOf()) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState();

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(getOrders(start_date)))
		return;
	}

	dispatch({
		type: "LOAD_ORDERS"
	})

	syncr.send({
		type: "GET_ORDERS",
		payload: {
			start_date,
		},
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id
	})
		.then(res => {
			dispatch({
				type: "ADD_ORDERS",
				orders: res
			})
			return res
		})
		.catch(err => console.error("ERROR FROM GET ORDERS", err))
}

export interface AddOrdersAction {
	type: "ADD_ORDERS"
	orders: {
		[supplier_id: string]: {
			[id: string]: {
				order: Order
				school: CERPSchool
			}
		}
	}
}

export const getLogs = (start_date: number, end_date: number) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	if (!state.connected) {
		syncr.onNext("connect", () => dispatch(getLogs(start_date, end_date)))
		return
	}

	dispatch({
		type: "LOAD_LOGS"
	})

	syncr.send({
		type: "GET_LOGS",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			start_date,
			end_date
		}
	})
		.then(res => {
			dispatch({
				type: "ADD_LOGS",
				logs: res
			})
		})
		.catch(err => console.error("ERROR GETTING LOGS", err))
}

export const ADD_PRODUCTS = "ADD_PRODUCTS"
export const getProducts = (filters = {}) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(getProducts(filters)))
		return;
	}

	dispatch({
		type: "LOAD_PRODUCTS"
	})

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
		})
}

export interface AddSchoolAction {
	type: "ADD_SCHOOLS"
	schools: { [id: string]: CERPSchool }
}

export const getSchoolProfileFromNumber = (phone_number: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(getSchoolProfileFromNumber(phone_number)))
		return;
	}

	syncr.send({
		type: "GET_SCHOOL_FROM_NUMBER",
		client_type: state.auth.client_type,
		client_id: state.auth.id,
		id: state.auth.id,
		payload: {
			phone_number
		}
	})
		.then(res => {
			console.log(res)
			dispatch({
				type: ADD_SCHOOLS,
				schools: {
					[res.id]: res.profile
				}
			})
		})
		.catch(err => {
			console.error(err)
			alert(err)
		})

}

export const getSchoolProfiles = (school_ids: string[]) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	if (school_ids.length > 1) {
		alert("only do 1 at a time....")
	}

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

export const INCOMING_PHONE_CALL = "INCOMING_PHONE_CALL";
export interface IncomingPhoneCallAction {
	type: "INCOMING_PHONE_CALL"
	number: string
	dialed: string
	event: string
	unique_id: string
}

export const editSchoolProfile = (school_id: string, school: CERPSchool) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "SAVE_SCHOOL",
		payload: {
			school,
			school_id
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

export interface AddProductsAction {
	type: "ADD_PRODUCTS"
	products: {
		[id: string]: Product
	}
}

export const saveProductAction = (product: Product, supplier_id: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	console.log('saving product')

	// save product...

	const state = getState();

	const a: AddProductsAction = {
		type: "ADD_PRODUCTS",
		products: {
			[product.id]: product
		}
	}

	dispatch(a)

	syncr.send({
		type: "MERGE_PRODUCT",
		payload: {
			id: product.id,
			product: product,
			supplier_id: supplier_id
		},
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		last_snapshot: state.last_snapshot
	})
		.then(res => {
			console.log('add product action...')
		})
		.catch(err => {
			console.error(err)
		})

}

export const PRODUCT_IMAGE_ADDED = "PRODUCT_IMAGE_ADDED"
export interface ProductImageAddedAction {
	type: "PRODUCT_IMAGE_ADDED"
	product_id: string
	image_id: string
	img_url: string
}

export const saveProductImage = (imageId: string, dataUrl: string, product: Product) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();
	syncr.send({
		type: "MERGE_PRODUCT_IMAGE",
		payload: {
			id: imageId,
			product_id: product.id,
			data_url: dataUrl
		},
		client_type: state.auth.client_type,
		client_id: state.auth.id
	})
		.then(res => {
		})
		.catch(err => {
			console.error(err)
		})

}