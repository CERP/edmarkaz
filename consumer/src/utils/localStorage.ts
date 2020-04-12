import { v4 } from 'uuid';

export const saveDB = (db: RootReducerState) => {

	try {

		saveAuth(db.auth)
		saveSyncState(db)
		saveSnapshot(db.last_snapshot)
		saveQueue(db.queued)
		saveProducts(db.products)
		saveLessons(db.lessons)
		saveActiveStudent(db.activeStudent)
	}

	catch (err) {
		console.error(err);
	}
}

export const clearDB = () => {
	localStorage.removeItem("auth")
	localStorage.removeItem("sync_state")
	localStorage.removeItem("last_snapshot")
	localStorage.removeItem("school_db")
}

export const loadAuth = (): RootReducerState['auth'] => {

	const init_auth: RootReducerState['auth'] = {
		id: undefined,
		token: undefined,
		client_type: "consumer",
		sms_sent: false,
		verifying_user: false,
		user: undefined
	};

	try {
		const str = localStorage.getItem("auth")
		if (str === null) {
			return init_auth;
		}

		const auth: RootReducerState["auth"] = JSON.parse(str)

		if (auth.token && auth.id && auth.user === undefined) {
			return {
				...auth,
				user: "SCHOOL"
			}
		}

		return auth
	}
	catch (err) {
		console.error(err);
		return init_auth;
	}
}

const saveProducts = (products?: RootReducerState['products']) => {

	if (products !== undefined) {
		localStorage.setItem("products", JSON.stringify(products))
	}

}

const loadProducts = () => {

	const initial: RootReducerState['products'] = {
		last_sync: 0,
		db: {}
	}

	try {
		// @ts-ignore
		const prods = JSON.parse(localStorage.getItem("products")) || initial
		return prods
	}
	catch (e) {
		console.log('returning initial')
		return initial
	}
}

const saveLessons = (lessons?: RootReducerState["lessons"]) => {
	if (lessons !== undefined) {
		const { loading, ...rest } = lessons
		localStorage.setItem("lessons", JSON.stringify(rest))
	}
}

const loadLessons = () => {
	const initial: RootReducerState["lessons"] = {
		last_sync: 0,
		loading: true,
		db: {}
	}

	try {
		// @ts-ignore
		const lessons: RootReducerState["lessons"] = JSON.parse(localStorage.getItem("lessons")) || initial
		return {
			...lessons,
			loading: false
		}
	}
	catch (e) {
		console.log('returning initial')
		return initial
	}
}
const saveActiveStudent = (activeStudent?: RootReducerState["activeStudent"]) => {
	if (activeStudent !== undefined) {
		localStorage.setItem("activeStudent", JSON.stringify(activeStudent))
	}
}

const loadStudent = () => {
	const initial: RootReducerState["activeStudent"] = undefined

	try {
		//@ts-ignore
		return JSON.parse(localStorage.getItem("activeStudent")) || initial
	}
	catch {
		console.log('Error getting active student returning initial')
		return initial
	}
}

export const saveAuth = (auth: RootReducerState['auth']) => {
	localStorage.setItem("auth", JSON.stringify({
		...auth,
		sms_sent: false
	}))
}

const loadClientId = () => {

	const client_id = localStorage.getItem("client_id") || v4();
	localStorage.setItem("client_id", client_id)

	return client_id;
}

const loadSyncState = (): RootReducerState['sync_state'] => {

	const str = localStorage.getItem("sync_state");

	if (str) {
		const curr = JSON.parse(str) as RootReducerState['sync_state']
		return curr;
	}

	return {
		profile: {}
	};

}

const saveSyncState = (state: RootReducerState) => {

	if (state.auth.token) {
		localStorage.setItem("sync_state", JSON.stringify(state.sync_state));
	}
}

const saveQueue = (queue: RootReducerState['queued']) => {

	localStorage.setItem("queued", JSON.stringify(queue))

}

const loadQueue = () => {

	const current = JSON.parse(localStorage.getItem("queued") || "{\"analytics\": {}, \"mutations\": {}}")

	if (!current.mutations && !current.analytics) {
		return {
			mutations: {},
			analytics: {}
		}
	}
	else if (!current.mutations) {
		return {
			...current,
			mutations: {}
		}
	}
	else if (!current.analytics) {
		return {
			...current,
			analytics: {}
		}
	}

	return current
}

const saveSnapshot = (last_snapshot: number) => {

	//@ts-ignore
	localStorage.setItem("last_snapshot", last_snapshot);
}

const loadSnapshot = () => {
	return parseInt(localStorage.getItem("last_snapshot") || "0")
}

export const loadDB = (): RootReducerState => {

	return {
		client_id: loadClientId(),
		auth: loadAuth(),
		queued: loadQueue(),
		accept_snapshot: false,
		last_snapshot: loadSnapshot(),
		connected: false,
		sync_state: loadSyncState(),
		products: loadProducts(),
		lessons: loadLessons(),
		activeStudent: loadStudent()
	}
}
