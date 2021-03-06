import Syncr from '~/src/syncr'
import { MergeAction, DeletesAction, QueueAction, sendServerAction, createLoginSucceed, createMerges, createDeletes, createImageMerges } from './core'

export const SELECT_LOCATION = "SELECT_LOCATION"

type Dispatch = (action: any) => any;
type GetState = () => RootBankState

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
		.then((res: { token: string; sync_state: RootBankState['sync_state'] }) => {

			if (res.sync_state.matches === undefined || Object.keys(res.sync_state.matches).length === 0) {
				// dispatch(forceSaveFullStatePotentiallyCausingProblems())
			}

			dispatch(createLoginSucceed(username, res.token, res.sync_state, number))
		})
}

export const forceSaveFullStatePotentiallyCausingProblems = () => (dispatch: Dispatch, getState: GetState) => {
	const state = getState();

	/*
	dispatch(createMerges([
		{
			path: ["sync_state"],
			value: state.sync_state
		}
	]))
	*/
}

export const saveProductAction = (product: Product) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

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
			product
		},
		client_type: state.auth.client_type,
		client_id: state.auth.id,
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
	type: "PRODUCT_IMAGE_ADDED";
	product_id: string;
	image_id: string;
	img_url: string;
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

export const saveSupplierProfile = (name: string, description: string) => (dispatch: Dispatch) => {

	dispatch(createMerges([
		{
			path: ["sync_state", "profile", "name"],
			value: name
		},
		{
			path: ["sync_state", "profile", "description"],
			value: description
		}
	]))
}

export const saveSupplierLogo = (imageId: string, dataUrl: string) => (dispatch: Dispatch) => {
	dispatch(createImageMerges(
		[
			{
				id: imageId,
				imageString: dataUrl,
				path: ["sync_state", "profile", "logo"]
			}
		]
	))

}

export const saveSupplierBanner = (imageId: string, dataUrl: string) => (dispatch: Dispatch) => {
	dispatch(createImageMerges(
		[
			{
				id: imageId,
				imageString: dataUrl,
				path: ["sync_state", "profile", "banner"]
			}
		]
	))
}

export const ADD_SCHOOLS = "ADD_SCHOOLS"

export interface AddNewSchoolAction {
	readonly type: "ADD_SCHOOLS";
	schools: { [id: string]: CERPSchool };
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

export interface AddProductsAction {
	type: "ADD_PRODUCTS";
	products: {
		[id: string]: Product;
	};
}

export const ADD_PRODUCTS = "ADD_PRODUCTS"

export const GET_OWN_PRODUCTS = "GET_OWN_PRODUCTS"
export const getOwnProducts = (filters = {}) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	dispatch({
		type: "LOAD_PRODUCTS"
	})

	syncr.send({
		type: "GET_OWN_PRODUCTS",
		client_type: state.auth.client_type,
		client_id: state.auth.id,
		id: state.auth.id,
		payload: {
			filters
		}
	})
		.then((res: any) => {
			// now dispatch an action that 'saves' these products

			dispatch({
				type: "ADD_PRODUCTS",
				products: res.products
			})

			return res
		})
		.catch(err => {
			console.error(err)

			setTimeout(() => dispatch(getOwnProducts()), 1000)
		})

}


export const ADD_SCHOOL = "ADD_SCHOOL"
export interface addSchoolAction {
	type: string;
	school: PMIUSchool;
}

export const addToSchoolDB = (school: PMIUSchool) => {

	return {
		type: ADD_SCHOOL,
		school
	}
}

export const reserveMaskedNumber = (school_id: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState();

	syncr.send({
		type: "RESERVE_NUMBER",
		payload: {
			school_id,
			user: {
				number: state.auth.number,
				name: state.sync_state.numbers[state.auth.number].name
			}
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

export const releaseMaskedNumber = (school_id: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "RELEASE_NUMBER",
		payload: {
			school_id,
			user: {
				number: state.auth.number,
				name: state.sync_state.numbers[state.auth.number].name
			}
		},
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		last_snapshot: state.last_snapshot
	})
		.then(res => {
			console.log(res);
			dispatch(res)
		})
		.catch(err => {
			console.error(err)
		})
}

export const saveSchoolRejectedSurvey = (school_id: string, survey: NotInterestedSurvey['meta']) => (dispatch: Dispatch, getState: GetState) => {

	const time = new Date().getTime()

	const state = getState()

	const event: NotInterestedSurvey = {
		event: "MARK_REJECTED_SURVEY",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))

}

export const saveSchoolCompletedSurvey = (school_id: string, survey: MarkCompleteSurvey['meta']) => (dispatch: Dispatch, getState: GetState) => {

	const time = new Date().getTime()

	const state = getState()

	const event: MarkCompleteSurvey = {
		event: "MARK_COMPLETE_SURVEY",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const saveCallEndSurvey = (school_id: string, survey: CallEndSurvey['meta']) => (dispatch: Dispatch, getState: GetState) => {

	const time = new Date().getTime()

	// if no follow up then auto-mark as done?

	const state = getState();

	const event: CallEndSurvey = {
		event: "CALL_END_SURVEY",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const saveCallEndSurveyFollowUp = (school_id: string, survey: CallEndSurveyFollowUp['meta']) => (dispatch: Dispatch, getState: GetState) => {
	const time = new Date().getTime()

	const state = getState()

	const event: CallEndSurveyFollowUp = {
		event: "CALL_END_SURVEY_FOLLOWUP",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const rejectSchool = (school_id: string) => (dispatch: Dispatch, getState: GetState) => {

	// check if school was in progress... if so we need to release
	// not sure how this could happen so ignoring for now.

	const time = new Date().getTime()

	const state = getState();

	const event: SupplierInteractionEvent = {
		event: "MARK_REJECTED",
		time,
		user: {
			number: state.auth.number,
			name: state.sync_state.numbers[state.auth.number].name
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "status"],
			value: "REJECTED"
		},
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const addSupplierNumber = (number: string, name: string) => (dispatch: Dispatch, getState: GetState) => {

	const state = getState()
	const numbers = state.sync_state.numbers
	const main_already_exists = Object.entries(numbers).find(([, n]) => n.type && n.type === "MAIN")

	if (!main_already_exists) {
		dispatch(createMerges([
			{
				path: ["sync_state", "numbers", number],
				value: {
					name,
					type: "MAIN"
				}
			}
		]))
		return
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "numbers", number],
			value: {
				name
			}
		}
	]))
}

export const makeSupplierMainNumber = (number: string) => (dispatch: Dispatch, getState: GetState) => {

	const state = getState()
	const numbers = state.sync_state.numbers
	const main_already_exists = Object.entries(numbers).find(([, n]) => n.type && n.type === "MAIN")

	if (main_already_exists) {
		dispatch(createMerges([
			{
				path: ["sync_state", "numbers", main_already_exists[0]],
				value: {
					name: numbers[main_already_exists[0]].name,
				}
			},
			{
				path: ["sync_state", "numbers", number],
				value: {
					...numbers[number],
					type: "MAIN"
				}
			}
		]))

		return
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "numbers", number],
			value: {
				...numbers[number],
				type: "MAIN"
			}
		}
	]))
}

export const updateOrderMeta = (order: OrderPlacedEvent, meta: any) => (dispatch: Dispatch) => {

	const school_id = order.meta.school_id
	const time = order.time

	const merges = Object.entries(meta).map(([key, val]) => ({
		path: ["sync_state", "matches", school_id, "history", `${time}`, "meta", key],
		value: val
	}))

	dispatch(createMerges(merges))
}


export const deleteSupplierNumber = (number: string) => (dispatch: Dispatch, getState: GetState) => {
	dispatch(createDeletes([
		{
			path: ["sync_state", "numbers", number]
		}
	]))
}

export type EditLoginNumberAction = ReturnType<typeof editLoginNumber>
export const EDIT_LOGIN_NUMBER = "EDIT_LOGIN_NUMBER"
export const editLoginNumber = (number: string) => ({
	type: EDIT_LOGIN_NUMBER as typeof EDIT_LOGIN_NUMBER,
	number
})

export type Actions = addSchoolAction | MergeAction | DeletesAction | QueueAction;