interface SyncState {

}

type SUPPLIER_TYPE = "TEXTBOOKS" | "OTHER_BOOKS" | "EDTECH" | "STATIONARY" | "SOLAR" | "LEARNING_MATERIALS" | "MIS" | "TESTING_SERVICES" | "FINANCE" | "UNKNOWN"

interface Product {
	id: string
	supplier_id: string
	title: string
	description: string
	phone_number: string
	img_url: string
	image?: {
		id: string,
		url?: string
	}
	deleted?: boolean
}

interface RootReducerState {
	sync_state: SyncState 
	auth: {
		id?: string
		token?: string
		client_type: "consumer"
	}
	products: {
		last_sync: number
		db: {
			[product_id: string]: Product
		}
	}
	client_id: string
	queued: {
		[path: string]: {
			action: {
				path: string[]
				value?: any
				type: "MERGE" | "DELETE"
			}
			date: number
		}
	}
	last_snapshot: number
	accept_snapshot: boolean
	connected: boolean
}