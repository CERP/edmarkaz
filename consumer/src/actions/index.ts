import Syncr from '@cerp/syncr'
import { v4 } from 'uuid';
import { createLoginSucceed, analyticsEvent, submitError } from './core';
import { TeacherActionTypes } from 'constants/index';
import { AppUserRole } from 'constants/app';

type Dispatch = (action: any) => any
type GetState = () => RootReducerState


export const autoLogin = (user: string, school_id: string, client_id: string, token: string, phone: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(autoLogin(user, school_id, client_id, token, phone)))
		return
	}

	dispatch({
		type: "AUTO_LOGIN"
	})

	syncr.send({
		type: "AUTO_LOGIN",
		client_type: state.auth.client_type,
		payload: {
			user,
			mis_token: token,
			school_id,
			client_id: state.client_id,
			mis_client_id: client_id,
			phone
		}
	})
		.then((res: { id: string; token: string; user: RootReducerState["auth"]["user"]; sync_state: SyncState }) => {
			dispatch(createLoginSucceed(res.id, res.token, res.user, res.sync_state))
		})
		.catch(err => {
			console.log("AutoLogin failed")

			if (err === "timeout") {
				setTimeout(() => dispatch(autoLogin(user, school_id, client_id, token, phone)), 2000)
			}
		})
}

// export const saveStudentProfile = (profile: ILMXStudent) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

// 	const state = getState()

// 	if (!state.connected) {
// 		syncr.onNext('connect', () => dispatch(saveStudentProfile(profile)))
// 		return
// 	}

// 	syncr.send({
// 		type: "SAVE_STUDENT_INFORMATION",
// 		client_type: state.auth.client_type,
// 		client_id: state.client_id,
// 		payload: {
// 			profile,
// 			school_id: state.sync_state.profile.refcode
// 		}
// 	})
// 		.then(res => dispatch({
// 			type: "SET_ACTIVE_STUDENT",
// 			profile
// 		}))
// 		.catch(err => {
// 			if (err.message === "not ready") {
// 				alert("not yet connected...")
// 			}
// 			else if (err === "timeout") {
// 				setTimeout(() => dispatch(saveStudentProfile(profile)), 2000)
// 			}
// 			else {
// 				dispatch(submitError(err))
// 			}
// 		})
// }
// export interface SET_ACTIVE_STUDENT_ACTION {
// 	type: "SET_ACTIVE_STUDENT",
// 	profile: ILMXStudent
// }

export const createUniqueStudentLogin = (token: string, std_id: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(createUniqueStudentLogin(token, std_id)))
		return
	}

	dispatch({
		type: "VERIFYING_USER"
	})

	syncr.send({
		type: "VERIFY_STUDENT_TOKEN",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			token: token,
			student_id: std_id
		}
	})
		.then((res: { token: string, number: string, school: Partial<CERPSchool>, student: MISStudent }) => {
			dispatch({
				type: "STUDENT_LOGIN",
				user: "STUDENT",
				token: res.token,
				id: res.number,
				school: res.school,
				student: res.student
			})
			return res
		})
		.catch(err => {
			if (err.message === "not ready") {
				alert("not yet connected...")
			}
			else if (err === "timeout") {
				setTimeout(() => dispatch(createUniqueStudentLogin(token, std_id)), 2000)
			}
			else {
				dispatch({
					type: "STUDENT_LOGIN",
					user: undefined,
					token: undefined,
					id: undefined,
					student: undefined,
					school: undefined
				})
				alert("login failed" + JSON.stringify(err))
				dispatch(submitError(err))
			}
		})
}

export const createGeneralStudentLogin = (token: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(createGeneralStudentLogin(token)))
		return
	}

	dispatch({
		type: "VERIFYING_USER"
	})

	syncr.send({
		type: "VERIFY_STUDENT_TOKEN",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			token: token
		}
	})
		.then((res: { token: string, number: string, school: Partial<CERPSchool> }) => {
			dispatch({
				type: "STUDENT_LOGIN",
				user: "STUDENT",
				token: res.token,
				id: res.number,
				school: res.school,
				student: undefined
			})
			return res
		})
		.catch(err => {
			if (err.message === "not ready") {
				alert("not yet connected...")
			}
			else if (err === "timeout") {
				setTimeout(() => dispatch(createGeneralStudentLogin(token)), 2000)
			}
			else {
				dispatch({
					type: "STUDENT_LOGIN",
					user: undefined,
					token: undefined,
					id: undefined,
					student: undefined,
					school: undefined
				})
				alert("login failed" + JSON.stringify(err))
				dispatch(submitError(err))
			}
		})
}

export interface STUDENT_LOGIN_ACTION {
	type: "STUDENT_LOGIN",
	user: "STUDENT" | undefined,
	token: string | undefined,
	id: string | undefined,
	student: MISStudent | undefined
	school: Partial<CERPSchool> | undefined
}

export const createGuestStudentLogin = () => (dispatch: Dispatch) => {
	dispatch({
		type: "GUEST_STUDENT_LOGIN"
	})
}


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
		.then((res: { token: string; user: RootReducerState["auth"]["user"]; sync_state: SyncState }) => {
			dispatch(createLoginSucceed(username, res.token, res.user, res.sync_state))
		})
		.catch(res => {
			console.error(res)
			alert("login failed" + JSON.stringify(res))
		})

}

export const SMSAuth = (phone: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(SMSAuth(phone)))
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
		syncr.onNext('connect', () => dispatch(verifyUrlAuth(token)))
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
		.then((res: { id: string; token: string; user: RootReducerState["auth"]["user"]; sync_state: SyncState }) => {
			dispatch(createLoginSucceed(res.id, res.token, res.user, res.sync_state))
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

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(getProducts(filters)))
		return;
	}

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

export const trackAssessmentAnalytics = (path: string, score: number, total_score: number, assessment_meta: any) => (dispatch: Dispatch, getState: GetState) => {

	const state = getState()
	const generalMeta = {
		route: path.split("/").splice(1),
		score,
		total_score,
		assessment_meta
	}

	const specificMeta = state.auth.user === "SCHOOL" || (state.auth.user === "STUDENT" && state.activeStudent === undefined) ?
		{
			refcode: state.sync_state.profile.refcode,
			phone: state.sync_state.profile.phone_number,
			user: state.auth.user
		} : state.auth.user === "STUDENT" ?
			{
				refcode: state.sync_state.profile.refcode,
				phone: state.sync_state.profile.phone_number,
				user: state.auth.user,
				student_id: state.activeStudent && state.activeStudent.id,
			} : {}

	const meta = { ...generalMeta, ...specificMeta }

	dispatch(analyticsEvent([{
		type: "ASSESSMENT",
		meta
	}]))
}

export const trackVideoAnalytics = (path: string, chapter_id: string, lessons_id: string, time: number) => (dispatch: Dispatch, getState: GetState) => {

	const state = getState()
	const generalMeta = {
		route: path.split("/").splice(1),
		chapter_id,
		lessons_id,
		time
	}

	const specificMeta = state.auth.user === "SCHOOL" || (state.auth.user === "STUDENT" && state.activeStudent === undefined) ?
		{
			refcode: state.sync_state.profile.refcode,
			phone: state.sync_state.profile.phone_number,
			user: state.auth.user
		} : state.auth.user === "STUDENT" ?
			{
				refcode: state.sync_state.profile.refcode,
				phone: state.sync_state.profile.phone_number,
				user: state.auth.user,
				student_id: state.activeStudent && state.activeStudent.id
			} : {}

	const meta = { ...generalMeta, ...specificMeta }

	dispatch(analyticsEvent([{
		type: "VIDEO",
		meta
	}]))
}

export const getAssessments = () => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState()

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(getAssessments()))
	}

	if (Object.keys(state.assessments.db).length === 0) {
		dispatch({
			type: "LOAD_ASSESSMENTS"
		})
	}

	syncr.send({
		type: "GET_ASSESSMENTS",
		payload: {},
		client_type: state.auth.client_type,
		client_id: state.client_id
	}, 20000)
		.then(resp => {
			dispatch({
				type: "ADD_ASSESSMENTS",
				assessments: resp
			})
			return resp
		})
		.catch(err => {
			if (err.message === "not ready") {
				console.error("No connection while getting assessments")
			}
			else if (err === "timeout") {
				setTimeout(() => dispatch(getAssessments()), 2000)
				return err
			}
			console.log("Error while getting assessments", err)
			dispatch(submitError(err))
			return err
		})
}
export interface ADD_ASSESSMENT_ACTION {
	type: "ADD_ASSESSMENTS",
	assessments: RootReducerState["assessments"]["db"]
}

export const ADD_COURSES = "ADD_COURSES"
export const getLessons = () => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	if (!state.connected) {
		syncr.onNext('connect', () => dispatch(getLessons()))
	}

	if (Object.keys(state.lessons.db).length === 0) {
		dispatch({
			type: "LOAD_COURSES"
		})
	}

	syncr.send({
		type: "GET_ALL_COURSES",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {}
	}, 20000)
		.then((resp: RootReducerState["lessons"]["db"]) => {
			dispatch({
				type: ADD_COURSES,
				lessons: resp
			})
			return resp
		})
		.catch(err => {
			if (err.message === "not ready") {
				console.error("No connection while getting lessons")
			}
			else if (err === "timeout") {
				setTimeout(() => dispatch(getLessons()), 2000)
				return err
			}
			console.error("Something happened while getting lessons", err)
			dispatch(submitError(err))
			return err
		})
}
export interface ADD_COURSES_ACTION {
	type: "ADD_COURSES",
	lessons: RootReducerState["lessons"]["db"]
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

	dispatch({
		type: "SCHOOL_SIGNUP"
	})

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
		.then((res: { token: string; user: RootReducerState["auth"]["user"] }) => {
			// get token back
			console.log(res)
			const token: string = res.token;

			dispatch(createLoginSucceed(number, token, res.user, { profile }))
			// set auth
		})
		.catch(err => {
			console.error(err)
			alert(err)

			dispatch({
				type: "SCHOOL_SIGNUP_FAILED"
			})
			// dispatch sign-up failed (phone number not unique?)
		})

}

export const teacherLogin = (phone: string, password: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	dispatch({
		type: TeacherActionTypes.LOGIN
	})

	syncr.send({
		type: TeacherActionTypes.LOGIN,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			id: phone,
			password
		}
	})
		.then((res: { token: string, teacher_profile: TeacherProfile }) => {

			const { token, teacher_profile } = res

			dispatch({
				type: TeacherActionTypes.LOGIN_SUCCEED,
				payload: {
					id: phone,
					user: AppUserRole.TEACHER,
					token,
					profile: teacher_profile
				}
			})

		})
		.catch(err => {
			console.error(err)

			alert(err)

			dispatch({
				type: TeacherActionTypes.LOGIN_FAILURE
			})
		})

}

export const teacherSignup = (phone: string, password: string, profile: TeacherProfile) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	dispatch({
		type: TeacherActionTypes.SIGNUP
	})

	syncr.send({
		type: TeacherActionTypes.SIGNUP,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			id: phone,
			password,
			profile
		}
	})
		.then((res: { token: string }) => {

			const { token } = res

			dispatch({
				type: TeacherActionTypes.SIGNUP_SUCCEED,
				payload: {
					id: phone,
					user: AppUserRole.TEACHER,
					token,
					profile: profile
				}
			})

		})
		.catch(err => {
			console.error(err)

			alert(err)

			dispatch({
				type: TeacherActionTypes.SIGNUP_FAILURE
			})
		})

}

export const teacherUpdateProfile = (profile: Partial<TeacherProfile>) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	dispatch({
		type: TeacherActionTypes.UPDATE_PROFILE,
	})

	syncr.send({
		type: TeacherActionTypes.UPDATE_PROFILE,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			id: state.auth.id,
			value: profile
		}
	})
		.then(resp => {

			console.log(resp)

			dispatch({
				type: TeacherActionTypes.UPDATE_PROFILE_SUCCEED,
				payload: profile
			})

		})
		.catch(err => {
			console.error(err)
			dispatch({
				type: TeacherActionTypes.UPDATE_PROFILE_FAILURE
			})
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

export const placeOrderAsVisitor = (order: ProductOrderAsVisitor) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	const profile = {
		...order.request,
		refcode: v4()
	}

	syncr.send({
		type: "PLACE_ORDER_AS_VISITOR",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			product: order.product,
			profile,
			password: order.request.phone_number.substr(7) // last four digit, this is temporary
		}
	})
		.then((res: { token: string; user: RootReducerState["auth"]["user"] }) => {
			// get token back
			console.log(res)
			const token: string = res.token;

			dispatch(createLoginSucceed(profile.phone_number, token, res.user, { profile }))
		})
		.catch(err => {
			console.error(err)
			dispatch({
				type: "SCHOOL_SIGNUP_FAILED"
			})
		})
}


export const trackRoute = (path: string) => (dispatch: Dispatch, getState: () => RootReducerState) => {

	const state = getState()

	const meta = state.auth.user === "SCHOOL" ?
		{
			route: path.split("/").splice(1),
			refcode: state.sync_state.profile.refcode,
			phone: state.sync_state.profile.phone_number,
			user: state.auth.user
		} : state.auth.user === "STUDENT" ?
			{
				route: path.split("/").splice(1),
				refcode: state.sync_state.profile.refcode,
				phone: state.sync_state.profile.phone_number,
				user: state.auth.user,
				student_id: state.activeStudent && state.activeStudent.id
			} : {
				route: path.split("/").splice(1),
			}

	dispatch(analyticsEvent([{
		type: "ROUTE",
		meta
	}]))
}

export const GET_ANALYTICS_EVENTS = "GET_ANALYTICS_EVENTS"
export const GET_ANALYTICS_EVENTS_SUCCESS = "GET_ANALYTICS_EVENTS_SUCCESS"
export const GET_ANALYTICS_EVENTS_FAILURE = "GET_ANALYTICS_EVENTS_FAILURE"

export const getAnalyticsEvents = () => ({
	type: GET_ANALYTICS_EVENTS
})

export const getAnalyticsEventsSuccess = (analytics_events: any) => ({
	type: GET_ANALYTICS_EVENTS_SUCCESS,
	payload: analytics_events
})

export const getAnalyticsEventsFailure = () => ({
	type: GET_ANALYTICS_EVENTS_FAILURE
})

export const fetchAnalyticsEvents = () => (dispatch: Dispatch, getState: () => RootReducerState, syncr: Syncr) => {

	if (!syncr.ready) {
		syncr.onNext('connect', () => dispatch(fetchAnalyticsEvents()))
		return;
	}

	const state = getState()
	// start loading
	dispatch(getAnalyticsEvents())

	syncr.send({
		type: GET_ANALYTICS_EVENTS,
		id: state.auth.id,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			refcode: state.sync_state.profile.refcode,
		}
	})
		.then(res => {
			console.log("Events fetch success")
			dispatch(getAnalyticsEventsSuccess(res))
		})
		.catch(err => {
			console.log("Unable to fetch events")
			dispatch(getAnalyticsEventsFailure())
		})
}

export const getTeacherPortalVideos = () => ({
	type: "TEACHER_PORTAL_VIDEOS_ASSESSMENTS"
})

export const getTeacherPortalVideosSuccess = (targeted_instruction: any) => ({
	type: "TEACHER_PORTAL_VIDEOS_ASSESSMENTS_SUCCESS",
	payload: targeted_instruction
})

export const getTeacherPortalVideosFailure = () => ({
	type: "TEACHER_PORTAL_VIDEOS_ASSESSMENTS_FAILURE"
})

export const fetchTargetedInstruction = () => (dispatch: Dispatch, getState: () => RootReducerState, syncr: Syncr) => {
	const state = getState()
	dispatch(getTeacherPortalVideos())
	syncr.send({
		type: "TEACHER_PORTAL_VIDEOS_ASSESSMENTS",
		client_type: state.auth.client_type,
		payload: {
			client_id: state.client_id
		}
	})
		.then(response => dispatch(getTeacherPortalVideosSuccess(response)))
		.catch(err => dispatch(getTeacherPortalVideosFailure()))
}