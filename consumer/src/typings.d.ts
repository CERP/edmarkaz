interface SyncState {

}

interface Product {
	id: string
	supplier_id: string
	title: string
	description: string
	phone_number: string
	img_url: string
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