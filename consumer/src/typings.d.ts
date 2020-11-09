interface SyncState {

	profile: Partial<CERPSchool>;

}

type SUPPLIER_TYPE = "TEXTBOOKS" | "OTHER_BOOKS" | "EDTECH" | "STATIONARY" | "SOLAR" | "LEARNING_MATERIALS" | "MIS" | "TESTING_SERVICES" | "FINANCE" | "UNKNOWN"

interface Product {
	id: string;
	supplier_id: string;
	title: string;
	description: string;
	phone_number: string;
	img_url: string;
	image?: {
		id: string;
		url?: string;
	};
	price: string;
	old_price: string;
	deleted?: boolean;
	tags: {
		[tag: string]: boolean;
	};
	categories: { string: boolean };
	supplier_profile: {
		name: string;
		description: string;
		logo?: {
			id: string;
			url: string;
		};
		banner?: {
			id: string;
			url: string;
		};
		order?: number;
	};
	order?: number;
	location?: {
		province: string
		district: string
		tehsil: string
	}
}

interface Lesson {
	medium: string
	class: string
	subject: string
	chapter_id: string
	lesson_id: string
	meta: {
		type: string
		name: string
		link: string
		chapter_name: string
		video_type?: "Lesson Video" | "Additional Video"
		source?: string
		module_name?: string
		module_id?: string
	}
}
interface RootReducerState {
	sync_state: SyncState;
	auth: {
		id?: string;
		token?: string;
		client_type: "consumer";
		sms_sent: boolean;
		verifying_user: boolean;
		user?: "SCHOOL" | "TEACHER" | "STUDENT" | "GUEST_STUDENT" | "GUEST_TEACHER";
		loading: boolean
	};
	products: {
		last_sync: number;
		db: {
			[product_id: string]: Product;
		};
	};
	lessons: {
		last_sync: number
		loading: boolean
		db: {
			[medium: string]: {
				[grade: string]: {
					[subject: string]: {
						[chapter_id: string]: {
							[lesson_id: string]: Lesson
						}
					}
				}
			}
		}
	}
	assessments: {
		last_sync: number
		loading: boolean
		db: {
			[medium: string]: {
				[grade: string]: {
					[subject: string]: {
						[chapter_id: string]: {
							[lesson_id: string]: {
								[id: string]: ILMXAssessment
							}
						}
					}
				}
			}
		}
	}
	client_id: string;
	queued: {
		mutations: {
			[path: string]: {
				action: {
					path: string[];
					value?: any;
					type: "MERGE" | "DELETE";
				};
				date: number;
			};
		};
		analytics: {
			[id: string]: RouteAnalyticsEvent;
		};
	};
	analytics_events: {
		signup_events: SignupEvents
		video_events: AnalyticsEvents
		assessment_events: AssessmentEvents
		is_loading: boolean
		has_error: boolean
	}
	activeStudent?: MISStudent
	last_snapshot: number;
	accept_snapshot: boolean;
	connected: boolean;
}

interface SignupEvents {
	[client_id: string]: number // timestamp
}

interface VideoEvents {
	[client_id: string]: {
		[timestamp: number]: {
			time: number
			user: string
			phone: string
			route: string[]
			refcode: string
			chapter_id: string
			lesson_id: string
			student_id: string
		}
	}
}
interface AssessmentEvents {
	[client_id: string]: {
		[timestamp: number]: {
			user: string
			phone: string
			route: string[]
			refcode: string
			student_id: string
			total_score: number
			score: number
			assessment_meta: {
				medium: string
				subject: string
				chapter_id: string
				lesson_id: string
				attempt_time: number
				excercise_id: string
				total_duration: number
				wrong_responses: {
					[id: string]: boolean
				}
			}
		}
	}
}

interface ILMXAssessment {
	type: string,
	id: string,
	chapter_id: string,
	lesson_id: string,
	subject: string,
	grade: string,
	title: string,
	description: string,
	order: string,
	time: string,
	total_marks: string,
	active: boolean,
	questions: {
		[id: string]: ILMXQuestion
	},
	source: string
}
interface ILMXQuestion {
	order: string,
	id: string,
	title: string,
	title_urdu: string,
	response_limit: number,
	multi_response: boolean,
	active: boolean,
	image: string,
	urdu_image: string,
	audio: string,
	answers: {
		[id: string]: ILMXAnswer
	}
}
interface ILMXAnswer {
	answer: string
	correct_answer: boolean
	urdu_answer: string
	id: string
	image: string
	audio: string
	active: boolean
}
interface ILMXStudent {
	name: string
	grade: string
	phone: string
}

interface MISStudent {
	id: string
	Name: string
	RollNumber: string
	BForm: string
	Gender: string
	Phone: string
	AlternatePhone?: string
	Fee: number
	Active: boolean

	ProfilePicture?: {
		id?: string
		url?: string
		image_string?: string
	}

	ManCNIC: string
	ManName: string
	Birthdate: string
	Address: string
	Notes: string
	StartDate: number
	AdmissionNumber: string
	BloodType?: "" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
	FamilyID?: string
	Religion?: string
	section_id: string
	prospective_section_id?: string

	// fees: {
	// 	[id: string]: MISStudentFee
	// }
	// payments: {
	// 	[id: string]: MISStudentPayment
	// }
	// attendance: {
	// 	[date: string]: MISStudentAttendanceEntry
	// }
	// exams: {
	// 	[id: string]: MISStudentExam
	// }
	// tags: { [tag: string]: boolean }
	// certificates: {
	// 	[id: string]: MISCertificate
	// }
}
interface CERPSchool {
	alt_number: string;
	alt_phone_number: string;
	call_answer_no: string;
	call_back_time: string;
	call_consent: string;
	call_response: string;
	date: string;
	duration: string;
	endtime: string;
	enrolment_range: string;
	enumerator_comments: string;
	enumerator_id: string;
	ess_current: string;
	ess_current_0: string;
	ess_current_1: string;
	ess_current_2: string;
	ess_current_3: string;
	ess_current_4: string;
	ess_current_5: string;
	ess_current_6: string;
	ess_current_7: string;
	ess_current_all: string;
	ess_interest: string;
	ess_interest_0: string;
	ess_interest_1: string;
	ess_interest_2: string;
	ess_interest_3: string;
	ess_interest_4: string;
	ess_interest_5: string;
	ess_interest_6: string;
	ess_interest_7: string;
	ess_interest_all: string;
	ess_satisfaction: string;
	ess_satisfaction_0: string;
	ess_satisfaction_1: string;
	ess_satisfaction_2: string;
	ess_satisfaction_3: string;
	ess_satisfaction_all: string;
	financing_interest: string;
	financing_no_other: string;
	financing_no_reason: string;
	financing_no_reason_0: string;
	financing_no_reason_1: string;
	financing_no_reason_2: string;
	financing_no_reason_3: string;
	financing_no_reason_4: string;
	financing_no_reason_5: string;
	financing_no_reason_6: string;
	financing_no_reason_8: string;
	financing_no_reason_777: string;
	formdef_version: string;
	high_fee_range: string;
	highest_fee: string;
	highest_grade: string;
	income_source: string;
	instruction_medium: string;
	key: string;
	low_fee_range: string;
	lowest_fee: string;
	lowest_grade: string;
	monthly_fee_collected: string;
	no_of_rooms: string;
	owner_phonenumber: string;
	phone_number: string;
	phone_number_1: string;
	phone_number_2: string;
	phone_number_3: string;
	platform_interest: string;
	platform_interest_no: string;
	platform_interest_no_other: string;
	platform_no_calling: string;
	platform_no_internet: string;
	platform_no_need: string;
	previous_loan: string;
	previous_loan_amount: string;
	private_tuition: string;
	pulled_address: string;
	pulled_altnumber: string;
	pulled_district: string;
	pulled_phonenumber: string;
	pulled_province: string;
	pulled_schoolname: string;
	pulled_tehsil: string;
	pulled_uc: string;
	refcode: string;
	refusal_reason: string;
	refusal_reason_0: string;
	refusal_reason_1: string;
	refusal_reason_2: string;
	refusal_reason_3: string;
	refusal_reason_777: string;
	refusal_reason_other: string;
	respondent_consent: string;
	respondent_gender: string;
	respondent_name: string;
	respondent_owner: string;
	respondent_relation: string;
	respondent_relation_other: string;
	school_address: string;
	school_branches: string;
	school_building_rent: string;
	school_district: string;
	school_district_confirm: string;
	school_facilities: string;
	school_facilities_0: string;
	school_facilities_1: string;
	school_facilities_2: string;
	school_facilities_3: string;
	school_facilities_4: string;
	school_facilities_5: string;
	school_facilities_6: string;
	school_facilities_7: string;
	school_facilities_8: string;
	school_fef: string;
	school_name: string;
	school_pef: string;
	school_registration: string;
	school_sef: string;
	school_tehsil: string;
	school_uc: string;
	smart_phone: string;
	starttime: string;
	submissiondate: string;
	switch_call: string;
	switch_call_pos: string;
	teachers_employed: string;
	textbook_provider_interest: string;
	textbook_publisher: string;
	textbook_publisher_0: string;
	textbook_publisher_1: string;
	textbook_publisher_2: string;
	textbook_publisher_3: string;
	textbook_publisher_4: string;
	textbook_publisher_5: string;
	textbook_publisher_6: string;
	textbook_publisher_7: string;
	textbook_publisher_8: string;
	textbook_publisher_9: string;
	textbook_publisher_777: string;
	textbook_publisher_other: string;
	textbook_purchase_mode: string;
	textbook_reason: string;
	textbook_reason_0: string;
	textbook_reason_1: string;
	textbook_reason_2: string;
	textbook_reason_3: string;
	textbook_reason_777: string;
	textbook_reason_other: string;
	total_enrolment: string;
	tuition_students: string;
	tuition_teachers: string;
	unmet_financing_needs: string;
	wrong_number_detail: string;
	wrong_number_detail_no: string;
	wrong_number_detail_sc: string;
	year_established: string;
}

interface BaseAnalyticsEvent {
	type: string;
	time: number;
	meta: any;
}
interface RouteAnalyticsEvent extends BaseAnalyticsEvent {
	type: "ROUTE";
}

type OrderRequestForm = {
	school_owner: string
	school_name: string
	phone_number: string
	school_address: string
	school_district: string

	respondent_owner?: string
	highest_fee?: string
	lowest_fee?: string
	school_tehsil?: string
	total_enrolment?: string
}

type ProductOrderAsVisitor = {
	product: Product
	request: OrderRequestForm
}