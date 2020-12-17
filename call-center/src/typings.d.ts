interface RootReducerState {
	sync_state: {

	}

	auth: {
		id?: string
		token?: string
		client_type: "portal_call_center"
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
	products: {
		last_sync: number
		loading: boolean
		db: {
			[product_id: string]: Product
		}
	}
	orders: {
		last_sync: number
		loading: boolean
		db: {
			[supplier_id: string]: {
				[id: string]: {
					order: Order
					school: CERPSchool
				}
			}
		}
	}
	logs: {
		loading: boolean
		db: {
			[key: string]: {
				id: string
				value: CallStartEvent | CallEndEvent
			}
		}
	}
	active_school?: CERPSchool
	caller_id?: string
	last_snapshot: number
	accept_snapshot: boolean
	connected: boolean
}

interface Product {
	id: string
	supplier_id: string
	title: string
	description: string
	phone_number: string
	img_url: string
	image?: {
		id: string
		url?: string
	}
	price: string
	deleted?: boolean
	tags: {
		[tag: string]: boolean
	}
	categories: { [id: string]: boolean }
	supplier_profile?: {
		name: string
		description: string
		logo?: {
			id: string
			url: string
		}
		banner?: {
			id: string
			url: string
		}
		order?: number
	}
	order?: number
	location: {
		province: string
		district: string
		tehsil: string
	}
}

interface Order {
	event: "ORDER_PLACED"
	meta: {
		product_id: string
		school_id: string
		sales_rep: string
		cancellation_reason: string
		call_one: string
		call_two: string
		actual_product_ordered: string
		quantity: string
		expected_completion_date: number
		expected_date_of_delivery: number
		actual_date_of_delivery: number
		total_amount: string
		payment_received: string
		status: "ORDER_PLACED" | "IN_PROGRESS" | "COMPLETED" | "SCHOOL_CANCELLED" | "SUPPLIER_CANCELLED"
		strategy: "ONLINE" | "HELPLINE" | "SALES_REP"
		notes: string
	}
	time: number
	user: {
		name: string
		number: string
	}
	verified?: "VERIFIED" | "NOT_VERIFIED" | "REJECTED"
}

interface CustomerExperience {
	school_name: string
	contact_number: string
	location: string
	sales_representative: string
	product_ordered: string
	date_of_delivery: string
	complete_orders: CompleteOrders
	cancel_orders: CancelOrders
}

interface CompleteOrders {
	will_order_again: string
	rating: RatingCompleteOrders
}

interface RatingCompleteOrders {
	product_price: number
	product_quality: number
	product_range: number
	delivery: number
	processing_time: number
	customer_service: number
}

interface CancelOrders {
	purchase_cancel_reason: string
	will_order_again: string
	rating: RatingCancelOrders
}

interface RatingCancelOrders {
	product_price: number
	product_quality: number
	product_range: number
	customer_service: number
}

interface CERPSchool {
	alt_number: string
	alt_phone_number: string
	call_answer_no: string
	call_back_time: string
	call_consent: string
	call_response: string
	date: string
	duration: string
	endtime: string
	enrolment_range: string
	enumerator_comments: string
	enumerator_id: string
	ess_current: string
	ess_current_0: string
	ess_current_1: string
	ess_current_2: string
	ess_current_3: string
	ess_current_4: string
	ess_current_5: string
	ess_current_6: string
	ess_current_7: string
	ess_current_all: string
	ess_interest: string
	ess_interest_0: string
	ess_interest_1: string
	ess_interest_2: string
	ess_interest_3: string
	ess_interest_4: string
	ess_interest_5: string
	ess_interest_6: string
	ess_interest_7: string
	ess_interest_all: string
	ess_satisfaction: string
	ess_satisfaction_0: string
	ess_satisfaction_1: string
	ess_satisfaction_2: string
	ess_satisfaction_3: string
	ess_satisfaction_all: string
	financing_interest: string
	financing_no_other: string
	financing_no_reason: string
	financing_no_reason_0: string
	financing_no_reason_1: string
	financing_no_reason_2: string
	financing_no_reason_3: string
	financing_no_reason_4: string
	financing_no_reason_5: string
	financing_no_reason_6: string
	financing_no_reason_8: string
	financing_no_reason_777: string
	formdef_version: string
	high_fee_range: string
	highest_fee: string
	highest_grade: string
	income_source: string
	instruction_medium: string
	key: string
	low_fee_range: string
	lowest_fee: string
	lowest_grade: string
	monthly_fee_collected: string
	no_of_rooms: string
	owner_phonenumber: string
	phone_number: string
	phone_number_1: string
	phone_number_2: string
	phone_number_3: string
	platform_interest: string
	platform_interest_no: string
	platform_interest_no_other: string
	platform_no_calling: string
	platform_no_internet: string
	platform_no_need: string
	previous_loan: string
	previous_loan_amount: string
	private_tuition: string
	pulled_address: string
	pulled_altnumber: string
	pulled_district: string
	pulled_phonenumber: string
	pulled_province: string
	pulled_schoolname: string
	pulled_tehsil: string
	pulled_uc: string
	refcode: string
	refusal_reason: string
	refusal_reason_0: string
	refusal_reason_1: string
	refusal_reason_2: string
	refusal_reason_3: string
	refusal_reason_777: string
	refusal_reason_other: string
	respondent_consent: string
	respondent_gender: string
	respondent_name: string
	respondent_owner: string
	respondent_relation: string
	respondent_relation_other: string
	school_address: string
	school_branches: string
	school_building_rent: string
	school_district: string
	school_district_confirm: string
	school_facilities: string
	school_facilities_0: string
	school_facilities_1: string
	school_facilities_2: string
	school_facilities_3: string
	school_facilities_4: string
	school_facilities_5: string
	school_facilities_6: string
	school_facilities_7: string
	school_facilities_8: string
	school_fef: string
	school_name: string
	school_pef: string
	school_registration: string
	school_sef: string
	school_tehsil: string
	school_uc: string
	smart_phone: string
	starttime: string
	submissiondate: string
	switch_call: string
	switch_call_pos: string
	teachers_employed: string
	textbook_provider_interest: string
	textbook_publisher: string
	textbook_publisher_0: string
	textbook_publisher_1: string
	textbook_publisher_2: string
	textbook_publisher_3: string
	textbook_publisher_4: string
	textbook_publisher_5: string
	textbook_publisher_6: string
	textbook_publisher_7: string
	textbook_publisher_8: string
	textbook_publisher_9: string
	textbook_publisher_777: string
	textbook_publisher_other: string
	textbook_purchase_mode: string
	textbook_reason: string
	textbook_reason_0: string
	textbook_reason_1: string
	textbook_reason_2: string
	textbook_reason_3: string
	textbook_reason_777: string
	textbook_reason_other: string
	total_enrolment: string
	tuition_students: string
	tuition_teachers: string
	unmet_financing_needs: string
	wrong_number_detail: string
	wrong_number_detail_no: string
	wrong_number_detail_sc: string
	year_established: string

}

interface PlatformInteractionEvent {
	event: string
	time: number
	user: {
		name: string
		number?: string
	}
}

interface CallEndEvent extends PlatformInteractionEvent {
	event: "CALL_END" | "CALL_BACK_END"
	meta: {
		call_status: "ANSWER" | "NO ANSWER" | "BUSY" | "CANCEL" | "FAILED" | "CONGESTION"
		duration: string
		unique_id: string
	}
}
interface CallStartEvent extends PlatformInteractionEvent {
	event: "CALL_START" | "CALL_BACK"
}

// interface AddLogsAction {
// 	type: "ADD_LOGS",
// 	val:
// }