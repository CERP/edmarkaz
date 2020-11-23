import Dynamic from '@ironbay/dynamic'
import { AnyAction } from 'redux'

import { MERGES, MergeAction, ON_CONNECT, ON_DISCONNECT, DELETES, DeletesAction, QUEUE, CONFIRM_SYNC_DIFF, ConfirmSyncAction, SnapshotDiffAction, SNAPSHOT_DIFF, LOGIN_SUCCEED, LoginSucceed, ConfirmAnalyticsSync, QueueAction } from '../actions/core'
import {
	ADD_PRODUCTS,
	LOAD_PROFILE,
	ADD_COURSES,
	ADD_COURSES_ACTION,
	STUDENT_LOGIN_ACTION,
	ADD_ASSESSMENT_ACTION,
	GET_ANALYTICS_EVENTS,
	GET_ANALYTICS_EVENTS_SUCCESS,
	GET_ANALYTICS_EVENTS_FAILURE
} from '../actions'

import { TeacherActionTypes } from 'constants/index'

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

		case "VERIFYING_USER":
			{
				return {
					...state,
					auth: {
						...state.auth,
						verifying_user: true
					}
				}
			}

		case "STUDENT_LOGIN":
			{
				const { token, id, user, school, student } = action as STUDENT_LOGIN_ACTION
				return {
					...state,
					auth: {
						...state.auth,
						id,
						verifying_user: false,
						user,
						token
					},
					sync_state: {
						...state.sync_state,
						profile: school || {}
					},
					activeStudent: student
				}
			}

		// case "SET_ACTIVE_STUDENT": {

		// 	const { profile } = action as SET_ACTIVE_STUDENT_ACTION
		// 	return {
		// 		...state,
		// 		activeStudent: profile
		// 	}

		// }

		case "GUEST_STUDENT_LOGIN":
			{
				return {
					...state,
					auth: {
						...state.auth,
						user: "GUEST_STUDENT"
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
						db: {
							...state.products.db,
							...add_action.products
						}
					}
				}
			}

		case "LOAD_COURSES":
			{
				return {
					...state,
					lessons: {
						...state.lessons,
						loading: true
					}
				}
			}

		case ADD_COURSES:
			{
				const { lessons } = action as ADD_COURSES_ACTION
				return {
					...state,
					lessons: {
						last_sync: new Date().getTime(),
						loading: false,
						db: lessons
					}
				}
			}

		case "LOAD_ASSESSMENTS":
			{
				return {
					...state,
					assessments: {
						...state.assessments,
						loading: true
					}
				}
			}
		case "ADD_ASSESSMENTS":
			{
				const { assessments } = action as ADD_ASSESSMENT_ACTION
				return {
					...state,
					assessments: {
						last_sync: new Date().getTime(),
						loading: false,
						db: assessments
					}
				}
			}

		case GET_ANALYTICS_EVENTS:
			return {
				...state,
				analytics_events: {
					...state.analytics_events,
					is_loading: true,
					has_error: false
				}
			}
		case GET_ANALYTICS_EVENTS_SUCCESS:
			return {
				...state,
				analytics_events: {
					...state.analytics_events,
					...action.payload as any,
					isLoading: false,
					hasError: false
				}
			}
		case GET_ANALYTICS_EVENTS_FAILURE:
			return {
				...state,
				analytics_events: {
					...state.analytics_events,
					is_loading: false,
					has_error: true
				}
			}
		case "AUTO_LOGIN":
			{
				return {
					...state,
					auth: {
						...state.auth,
						loading: true
					}
				}
			}
		case "AUTO_LOGIN_SUCCESS":
			{
				return {
					...state,
					auth: {
						...state.auth,
						loading: false
					}
				}
			}
		case "SCHOOL_SIGNUP":
			{
				return {
					...state,
					auth: {
						...state.auth,
						loading: true
					}
				}
			}
		case "SCHOOL_SIGNUP_FAILED":
			{
				return {
					...state,
					auth: {
						...state.auth,
						loading: false
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
						user: login_action.user,
						loading: false
					}
				}
			}

		case TeacherActionTypes.SIGNUP || TeacherActionTypes.LOGIN_SUCCEED:
			{
				return {
					...state,
					auth: {
						...state.auth,
						loading: true
					}
				}
			}

		case TeacherActionTypes.LOGIN_SUCCEED:
			{
				const { profile, ...rest } = action.payload

				return {
					...state,
					teacher_portal: {
						...state.teacher_portal,
						profile
					},
					auth: {
						...state.auth,
						...rest,
						loading: false
					}
				}
			}

		case TeacherActionTypes.UPDATE_PROFILE_SUCCEED:
			{

				const flattened_update_profile = Dynamic.flatten(action.payload)

				const { profile } = state.teacher_portal

				const updated_profile = flattened_update_profile.reduce((agg, { path, value }) => Dynamic.put(agg, path, value), profile)

				return {
					...state,
					teacher_portal: {
						...state.teacher_portal,
						profile: updated_profile
					}
				}
			}
		case TeacherActionTypes.GET_TEACHER_ASSESSMENT:
			{
				return {
					...state,
					teacher_portal: {
						...state.teacher_portal,
						assessments: {},
						videos: {}
					}
				}
			}

		case TeacherActionTypes.TEACHER_PORTAL_VIDEOS_ASSESSMENTS_FAILURE:
		{
			return {
				...state,
				teacher_portal: {
					...state.teacher_portal,
					assessments: {},
					videos: {}
				}
			}
		}

		case TeacherActionTypes.TEACHER_PORTAL_VIDEOS_ASSESSMENTS_SUCCEED:
		{
			return {
				...state,
				teacher_portal: {
					...state.teacher_portal,
					assessments: action.payload.assessments,
					videos: action.payload.videos
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