import React, { Component } from 'react'
import Former from 'former'

interface P {

}

interface S {
	survey_type: "REGISTRATION"
	form: {
		starttime: string
		endtime: string
		deviceid: string
		subscriberid: string
		simid: string
		devicephonenum: string
		sales_rep_id: string
		school_name: string
		address: string
		union_council: string
		mauza: string
		tehsil: string
		district: string
		gps: string
		phone_number_1: string
		phone_number_2: string
		whatsapp_number: string
		school_sign_up: string
		school_id_qr: string
		school_pef: string
		year_established: string
		branches: string
		branch_main: string
		branch_main_details: string
		instruction_medium: string
		low_grade: string
		high_grade: string
		teachers_employed: string
		total_enrollment: string
		low_fee: string
		high_fee: string
		building_ownership: string
		building_rooms: string
		facilities: {
			boundary_wall: string
			library: string
			ups: string
			generator: string
			computer_tables: string
			multimedia_projectors: string
			sports_ground_equipment: string
			internet: string
			solar_power: string
		}
		respondent_name: string
		respondent_gender: string
		respondent_dob: string
		respondent_owner: string
		respondent_role: string
		respondent_role_other: string
		respondent_education: string
		respondent_facebook: string
		respondent_ecommerce: string
		financing_interest: string
		ess_current: {
			textbooks: string
			lib_books_and_co_cur: string
			ed_tech: string
			school_mis: string
			tech_and_learning: string
			solar_power: string
		}
		ess_interest: {
			textbooks: string
			lib_books_and_co_cur: string
			ed_tech: string
			school_mis: string
			tech_and_learning: string
			solar_power: string
		}
		ess_suggest: string
		consent: string
		post_visit_note: string
		school_image: string
		su_pitch_type: string
		su_pitch_interest: string
		su_device_type: string
		su_customer_type: string
		su_purchase_likelihood: string
		su_products_purchase: {
			textbooks: string
			lib_books_and_co_cur: string
			ed_tech: string
			school_mis: string
			tech_and_learning: string
			solar_power: string
		}
		nsu_reason: string
		nsu_pitch_type: string
		nsu_pitch_complete: string
		nsu_customer_type: string
		nsu_interest_reason: string
		nsu_interest_reason_other: string
		nsu_revisit: string
		nsu_revisit_no_reason: string
		product_suggestion: string
		advice_feedback: string
		rep_comments: string
	}
}

type propTypes = P

class SinUpSurvey extends Component<propTypes, S> {
	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			survey_type: "REGISTRATION",
			form: {
				starttime: "",
				endtime: "",
				deviceid: "",
				subscriberid: "",
				simid: "",
				devicephonenum: "",
				sales_rep_id: "",
				school_name: "",
				address: "",
				union_council: "",
				mauza: "",
				tehsil: "",
				district: "",
				gps: "",
				phone_number_1: "",
				phone_number_2: "",
				whatsapp_number: "",
				school_sign_up: "0",
				school_id_qr: "",
				school_pef: "",
				year_established: "",
				branches: "",
				branch_main: "",
				branch_main_details: "",
				instruction_medium: "",
				low_grade: "",
				high_grade: "",
				teachers_employed: "",
				total_enrollment: "",
				low_fee: "",
				high_fee: "",
				building_ownership: "",
				building_rooms: "",
				facilities: {
					boundary_wall: "",
					library: "",
					ups: "",
					generator: "",
					computer_tables: "",
					multimedia_projectors: "",
					sports_ground_equipment: "",
					internet: "",
					solar_power: "",
				},
				respondent_name: "",
				respondent_gender: "",
				respondent_dob: "",
				respondent_owner: "",
				respondent_role: "",
				respondent_role_other: "",
				respondent_education: "",
				respondent_facebook: "",
				respondent_ecommerce: "",
				financing_interest: "",
				ess_current: {
					textbooks: "",
					lib_books_and_co_cur: "",
					ed_tech: "",
					school_mis: "",
					tech_and_learning: "",
					solar_power: "",
				},
				ess_interest: {
					textbooks: "",
					lib_books_and_co_cur: "",
					ed_tech: "",
					school_mis: "",
					tech_and_learning: "",
					solar_power: "",
				},
				ess_suggest: "",
				consent: "",
				post_visit_note: "",
				school_image: "",
				su_pitch_type: "",
				su_pitch_interest: "",
				su_device_type: "",
				su_customer_type: "",
				su_purchase_likelihood: "",
				su_products_purchase: {
					textbooks: "",
					lib_books_and_co_cur: "",
					ed_tech: "",
					school_mis: "",
					tech_and_learning: "",
					solar_power: ""
				},
				nsu_reason: "",
				nsu_pitch_type: "",
				nsu_pitch_complete: "",
				nsu_customer_type: "",
				nsu_interest_reason: "",
				nsu_interest_reason_other: "",
				nsu_revisit: "",
				nsu_revisit_no_reason: "",
				product_suggestion: "",
				advice_feedback: "",
				rep_comments: "",
			}
		}

		let school_paths = [
			["school_pef"],
			["year_established"],
			["branches"],
			["branch_main"],
			["branch_main_details"],
			["instruction_medium"],
			["low_grade"],
			["high_grade"],
			["teachers_employed"],
			["total_enrollment"],
			["low_fee"],
			["high_fee"],
			["building_ownership"],
			["building_rooms"],
			["facilities"],
			["respondent_name"],
			["respondent_gender"],
			["respondent_dob"],
			["respondent_owner"],
			["respondent_role"],
			["respondent_role_other"],
			["respondent_education"],
			["respondent_facebook"],
			["respondent_ecommerce"],
			["financing_interest"],
			["ess_current"],
			["ess_interest"],
			["ess_suggest"],
			["consent"],
			["su_pitch_type"],
			["su_pitch_interest"],
			["su_device_type"],
			["su_customer_type"],
			["su_purchase_likelihood"]
		].map(p => {
			return {
				path: p,
				value: "",
				depends: [
					{
						path: ["school_sign_up"],
						value: "1"
					}
				]
			}
		})
		const post_no_signup = [
			["nsu_reason"],
			["nsu_pitch_type"],
			["nsu_pitch_complete"],
			["nsu_customer_type"],
			["nsu_interest_reason"],
			["nsu_interest_reason_other"],
			["nsu_revisit"],
			["nsu_revisit_no_reason"]
		].map(p => {
			return {
				path: p,
				value: "",
				depends: [
					{
						path: ["school_sign_up"],
						value: "0"
					}
				]
			}
		})

		this.former = new Former(this, ["form"],
			[
				...post_no_signup,
				...school_paths
			])
	}


	render() {

		const sales_rep_opts = {
			101: "Ali Hussnain",
			102: "Asim Zaheer",
			103: "Awais Sakhawat",
			104: "Kaleem Majeed",
			105: "Muhammad Zohaib",
			106: "Nasir Saeed"
		}
		const yn_opts = {
			1: "Yes",
			0: "No"
		}
		const district_opts = {
			1: "Lahore",
			2: "Kasur",
			3: "Sheikhupura"
		}
		const tehsil_opts = {
			11: "Lahore City",
			21: "Chunian",
			24: "Pattoki",
			35: "Sheikhupura"
		}
		const intruction_medium_opts = {
			0: "Both",
			1: "English",
			2: "Urdu"
		}
		const grade_opts = {
			111: "Play Group",
			222: "Nursery",
			333: "Prep",
			1: "Grade 1",
			2: "Grade 2",
			3: "Grade 3",
			4: "Grade 4",
			5: "Grade 5",
			6: "Grade 6",
			7: "Grade 7",
			8: "Grade 8",
			10: "Matric/O'Levels",
			12: "FA/FSc/A'Levels"
		}
		const building_ownership_opts = {
			1: "Owned",
			2: "Rented",
			3: "Government Property",
			4: "Donation",
			5: "Without Rent"
		}
		// const facilities_opts = {
		// 	0: "Boundary Wall",
		// 	1: "Library",
		// 	2: "UPS",
		// 	3: "Generator",
		// 	4: "Computers/Tablets",
		// 	5: "Multimedia Projector",
		// 	6: "Sports gruond and equipment",
		// 	7: "Internet",
		// 	8: "Solar power"
		// }
		const gender_opts = {
			1: "Male",
			2: "Female",
			777: "Other"
		}
		const role_opts = {
			1: "Principal",
			2: "Deputy Principal",
			3: "Head Teacher",
			4: "Teacher",
			5: "Admin",
			777: "Other (specify)"
		}
		const education_opts = {
			0: "No education",
			5: "Primary",
			8: "Class 8",
			10: "Matric",
			12: "FA/FSc",
			16: "BA/BEd/BSc",
			18: "Masters or above"
		}
		const ess_opts = {
			1: "Textbooks",
			2: "Library books and co-curricular activities",
			3: "Education technology",
			4: "School Management Information System",
			5: "Teaching and learning materials",
			6: "Solar power",
		}
		const ilmx_type_opts = {
			1: "IlmX",
			2: "IlmX Plus"
		}
		const interest_opts = {
			0: "Not at all",
			1: "Unsure",
			2: "Somewhat interested",
			3: "Very interested"
		}
		const device_type_opts = {
			1: "Smart Phone",
			2: "Computer",
			3: "Tablet",
			4: "Sales rep device",
		}
		const customer_profile_opts = {
			1: "High ability, high drive",
			2: "High ability, low drive",
			3: "Low ability, high drive",
			4: "Low ability, low drive",
		}
		const likelihood_opts = {
			0: "Not at all",
			1: "Unsure",
			2: "Somewhat likely",
			3: "Very likely",
		}
		const no_signup_opts = {
			1: "Pitch completed but respondent was not interested",
			2: "Pitch completed but respondent needs time to think about it",
			3: "Decision maker was not available",
			4: "Did not get permission to enter school",
			5: "School was closed at this time"
		}
		const no_interest_reason_opts = {
			1: "Respondent does not want to use an online/phone-based service",
			2: "Respondent feels there aren't enough products",
			3: "Respondent does not like the quality of our products",
			4: "Respondent does not like the price of our products",
			5: "Respondent does not trust us",
			777: "Other (specify below)",
		}
		return <div className="survey-page">
			<div className="form">
				{/**Group School Information*/}
				<div className="title">School Information</div>
				<SelectRow label={"Sales Rep"} path={["sales_rep_id"]} options={sales_rep_opts} former={this.former} />
				<InputRow label={"School Name"} type={"text"} path={["school_name"]} former={this.former} />
				{/** Sub Group School Address */}
				<div className="subtitle">School Address</div>
				<InputRow label={"Address"} type={"text"} path={["address"]} former={this.former} />
				<InputRow label={"Union Council"} type={"text"} path={["union_council"]} former={this.former} />
				<InputRow label={"Mauza"} type={"text"} path={["mauza"]} former={this.former} />
				<SelectRow label={"Sales Rep"} path={["tehsil"]} options={tehsil_opts} former={this.former} />
				<SelectRow label={"Sales Rep"} path={["district"]} options={district_opts} former={this.former} />
				{/**Sub Group End */}
				{/**Sub Group Contact Information */}
				<div className="subtitle">Contact Information</div>
				<InputRow label={"Phone Number 1"} type={"text"} path={["phone_number_1"]} former={this.former} />
				<InputRow label={"Phone Number 2"} type={"text"} path={["phone_number_2"]} former={this.former} />
				<InputRow label={"WhatsApp Number"} type={"text"} path={["whatsapp_number"]} former={this.former} />
				{/**Sub Group End Contact Information */}
				{/**Group End School Information*/}
				<SelectRow label={"School Signed Up"} path={["school_sign_up"]} options={yn_opts} former={this.former} />
				{/** Proceed to 2nd Group If yes*/}

				{/** Group School-SignUp */}
				{this.state.form.school_sign_up === "1" && <div className="title">School SignUp</div>}
				{this.state.form.school_sign_up === "1" && <div className="row">
					<div>Get School_id</div>
				</div>}
				{/**Sub Group School Details */}
				{this.state.form.school_sign_up === "1" && <div className="subtitle">School Details</div>}
				<SelectRow label={"Is your school a part of PEF?"} path={["school_pef"]} options={yn_opts} former={this.former} />
				<InputRow label={"In what year was the school established?"} type={"number"} path={["year_established"]} former={this.former} />
				<InputRow label={"Including this school, how many branches does your school have?"} type={"number"} path={["branches"]} former={this.former} />
				{/** In case of more than one branch */}
				<SelectRow label={"Is this the main branch/head office?"} path={["branch_main"]} options={yn_opts} former={this.former} />
				{/** If current is not the main branch */}
				<InputRow label={"Enter the details for the main branch/head office: (Owner/principal name, address, contact number etc.)"} type={"text"} path={["branch_main_details"]} former={this.former} />
				<SelectRow label={"What is the medium of instruction?"} path={["instruction_medium"]} options={intruction_medium_opts} former={this.former} />
				<SelectRow label={"What is the lowest class offered at your school?"} path={["low_grade"]} options={grade_opts} former={this.former} />
				<SelectRow label={"What is the highest class offered at your school?"} path={["high_grade"]} options={grade_opts} former={this.former} />
				<InputRow label={"How many teachers are employed at your school?"} type={"number"} path={["teachers_employed"]} former={this.former} />
				<InputRow label={"What is the total enrollment at the school?"} type={"number"} path={["total_enrollment"]} former={this.former} />
				<InputRow label={"What is the lowest fee charged for a class?"} type={"number"} path={["low_fee"]} former={this.former} />
				<InputRow
					label={"What is the highest fee charged for a class?"}
					type={"number"}
					path={["high_fee"]}
					former={this.former}
				/>
				<SelectRow
					label={"What is the ownership status of the school building?"}
					path={["building_ownership"]}
					options={building_ownership_opts}
					former={this.former}
				/>
				<InputRow label={"How many rooms does the school building have?"} type={"number"} path={["building_rooms"]} former={this.former} />
				{/**Select Multiple */}
				{this.state.form.school_sign_up === "1" && <div className="row" style={{ flexDirection: "column" }}>
					<div>Which of the following facilities does your school have?</div>
					<SelectRow
						label={"Boundary Wall"}
						path={["facilities", "boundary_wall"]}
						options={{
							0: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Library"}
						path={["facilities", "library"]}
						options={{
							1: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"UPS"}
						path={["facilities", "ups"]}
						options={{
							2: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Generator"}
						path={["facilities", "generator"]}
						options={{
							3: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Computer Tablets"}
						path={["facilities", "computer_tables"]}
						options={{
							4: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Multimedia Projectors"}
						path={["facilities", "multimedia_projectors"]}
						options={{
							5: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Sports Ground Equipment"}
						path={["facilities", "sports_ground_equipment"]}
						options={{
							6: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Internet"}
						path={["facilities", "internet"]}
						options={{
							7: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Solar Power"}
						path={["facilities", "solar_power"]}
						options={{
							8: "Yes"
						}}
						former={this.former}
					/>
				</div>}
				{/** Sub Group End School Details */}
				{/**Sub Group Respondent Details */}
				{this.state.form.school_sign_up === "1" && <div className="subtitle">Respondent Details</div>}
				{/**Sub Sub Group Respondent Details 1*/}
				<InputRow
					label={"Name"}
					type={"text"}
					path={["respondent_name"]}
					former={this.former}
				/>
				<SelectRow label={"Gender"} path={["respondent_gender"]} options={gender_opts} former={this.former} />
				<InputRow label={"Date of Birth"} type={"date"} path={["respondent_dob"]} former={this.former} />
				<SelectRow label={"Are you the owner of the school?"} path={["respondent_owner"]} options={yn_opts} former={this.former} />
				{/**Sub Sub Group End Respondent Details 1*/}
				<SelectRow label={"What is your primary role in the school?"} path={["respondent_role"]} options={role_opts} former={this.former} />
				<InputRow label={"Specify other role"} type={"text"} path={["respondent_role_other"]} former={this.former} />
				{/**Sub Sub Group Start Respondent Details 2*/}
				<SelectRow label={"What is your level of completed education"} path={["respondent_education"]} options={education_opts} former={this.former} />
				<InputRow label={"Facebook ID (In order to join the Ilm Exchange Facebook Group)"} type={"text"} path={["respondent_facebook"]} former={this.former} />
				<SelectRow label={"Have you ever used an e-commerce platform to purchase any kinds of goods or services before?"} path={["respondent_ecommerce"]} options={yn_opts} former={this.former} />
				{/**Sub Sub Group End Respondent Details 2*/}
				{/**Sub Group END Respondent Details */}
				{/**Sub Group Start Platform Preferences */}
				{this.state.form.school_sign_up === "1" && <div className="subtitle">Platform Preferences</div>}
				<SelectRow label={"Are you interested in obtaining a loan for your school?"} path={["financing_interest"]} options={yn_opts} former={this.former} />
				{this.state.form.school_sign_up === "1" && <div className="row" style={{ flexDirection: "column" }}>
					<label>Which of the following education support products have you purchased during the last year?</label>
					<SelectRow
						label={"Text Books"}
						path={["ess_current", "textbooks"]}
						options={{
							1: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Library books and co-curricular activities"}
						path={["ess_current", "lib_books_and_co_cur"]}
						options={{
							2: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Education technology"}
						path={["ess_current", "ed_tech"]}
						options={{
							3: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"School Management Information System"}
						path={["ess_current", "school_mis"]}
						options={{
							4: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Teaching and learning materials"}
						path={["ess_current", "tech_and_learning"]}
						options={{
							5: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Solar power"}
						path={["ess_current", "solar_power"]}
						options={{
							6: "Yes"
						}}
						former={this.former}
					/>
				</div>}
				{this.state.form.school_sign_up === "1" && <div className="row" style={{ flexDirection: "column" }}>
					<div>Which of the following education support products are you interested in availing for your school?</div>
					<SelectRow
						label={"Text Books"}
						path={["ess_interest", "textbooks"]}
						options={{
							1: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Library books and co-curricular activities"}
						path={["ess_interest", "lib_books_and_co_cur"]}
						options={{
							2: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Education technology"}
						path={["ess_interest", "ed_tech"]}
						options={{
							3: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"School Management Information System"}
						path={["ess_interest", "school_mis"]}
						options={{
							4: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Teaching and learning materials"}
						path={["ess_interest", "tech_and_learning"]}
						options={{
							5: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Solar power"}
						path={["ess_interest", "solar_power"]}
						options={{
							6: "Yes"
						}}
						former={this.former}
					/>
				</div>}
				<InputRow label={"Is there anything you need that we should add to our marketplace?"} type={"text"} path={["ess_suggest"]} former={this.former} />
				<SelectRow label={"Our online platform is a free service for your school through which educational products will be made available to you at or below market prices. Here you will be able to search for the products and financing that you need, and banks and suppliers of educational products will contact you to give you information about their promotions and offers. Should we include your school in this service?"} path={["consent"]} options={yn_opts} former={this.former} />
				{/**Sub Group End Platform Preferences */}
				{/**Group End School Signup */}

				{/**Group Start Post Visit Questionaire */}
				<div className="title">Post Visit  Questionaire</div>
				<div className="subtitle">
					If you are in the school, please pause this questionnaire here. The remaining questions are to be filled by you once you have completed your interaction with the school.
				</div>
				<div className="row">
					<div>Capture An image of school</div>
				</div>
				{/** Sub Group Start Post Visit: Signed Up*/}
				{this.state.form.school_sign_up === "1" && <div className="subtitle">Post Visit:Signed Up</div>}
				<SelectRow label={"Which version of IlmX did you pitch to this school?"} path={["su_pitch_type"]} options={ilmx_type_opts} former={this.former} />
				<SelectRow label={"How interested did the respondent seem in your sales pitch?"} path={["su_pitch_interest"]} options={interest_opts} former={this.former} />
				<SelectRow label={"Which device did the respondent register on?"} path={["su_device_type"]} options={device_type_opts} former={this.former} />
				<SelectRow label={"In your opinion, which customer type does this person best fit?"} path={["su_customer_type"]} options={customer_profile_opts} former={this.former} />
				<SelectRow label={"In your opinion, what is the likelihood of this person making a purchase through IlmX??"} path={["su_purchase_likelihood"]} options={likelihood_opts} former={this.former} />
				{this.state.form.school_sign_up === "1" && <div className="row" style={{ flexDirection: "column" }}>
					<div>Which products do you think is the respondent most likely to purchase?</div>
					<SelectRow
						label={"Text Books"}
						path={["su_products_purchase", "textbooks"]}
						options={{
							1: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Library books and co-curricular activities"}
						path={["su_products_purchase", "lib_books_and_co_cur"]}
						options={{
							2: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Education technology"}
						path={["su_products_purchase", "ed_tech"]}
						options={{
							3: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"School Management Information System"}
						path={["su_products_purchase", "school_mis"]}
						options={{
							4: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Teaching and learning materials"}
						path={["su_products_purchase", "tech_and_learning"]}
						options={{
							5: "Yes"
						}}
						former={this.former}
					/>
					<SelectRow
						label={"Solar power"}
						path={["su_products_purchase", "solar_power"]}
						options={{
							6: "Yes"
						}}
						former={this.former}
					/>
				</div>}
				{/** Sub Group End Post Visit: Signed Up*/}
				{/** Sub Group Start Post Visit: Not Signed Up*/}
				{this.state.form.school_sign_up === "0" && <div className="subtitle">Post Visit:Not Signed Up</div>}
				<SelectRow label={"Why did this school not sign up?"} path={["nsu_reason"]} options={no_signup_opts} former={this.former} />
				{/** Sub sub Group Start Post Visit: No interest */}
				<SelectRow label={"Which version of IlmX did you pitch to this school?"} path={["nsu_pitch_type"]} options={ilmx_type_opts} former={this.former} />
				<SelectRow label={"Were you able to complete your pitch?"} path={["nsu_pitch_complete"]} options={yn_opts} former={this.former} />
				<SelectRow label={"In your opinion, which customer type does this person best fit?"} path={["nsu_customer_type"]} options={customer_profile_opts} former={this.former} />
				<SelectRow label={"Why was the respondent not interested in signing up?"} path={["nsu_interest_reason"]} options={no_interest_reason_opts} former={this.former} />
				{/** Sub sub Group End Post Visit: No interest */}
				<InputRow label={"Specify other reason respondent was not interested in signing up:"} type={"text"} path={["nsu_interest_reason_other"]} former={this.former} />
				{/** Sub sub Group Start Post Visit: Not available */}
				<SelectRow label={"Are you going to visit this school again?"} path={["nsu_revisit"]} options={yn_opts} former={this.former} />
				{/** Sub sub Group End Post Visit: No interest */}
				{/** If choose not to visit */}
				<InputRow label={"Why aren't you going to visit this school again?"} type={"text"} path={["nsu_revisit_no_reason"]} former={this.former} />
				{/** Sub sub Group End Post Visit: Not available */}
				{/** Sub Group End Post Visit: Not Signed Up*/}

				{/**Sub Group Start Feedback Questions */}
				<div className="subtitle">Feedback Questions</div>
				<InputRow label={"Please list any specific information or products that the respondent said would be valuable to them and they would like to see Ilm Exchange"} type={"text"} path={["product_suggestion"]} former={this.former} />
				<InputRow label={"Please enter any advice or feedback that the respondent gave"} type={"text"} path={["advice_feedback"]} former={this.former} />
				<InputRow label={"Please enter any comments you may have"} type={"text"} path={["rep_comments"]} former={this.former} />
				{/**Sub Group End Feedback Questions */}
				{/**Group End Post Visit Questionaire */}
			</div>
		</div>
	}
}

interface InputRowRrops {
	label: string
	type: string
	former: Former
	path: string[]
	placeholder?: string
}
interface SelectRowRrops {
	label: string
	former: Former
	path: string[]
	options: {
		[value: string]: string
	}
}

const InputRow = ({ label, type, path, former, placeholder = "Enter" }: InputRowRrops) => {
	return former.check(path) ? <div className="row">
		<label>{label}</label>
		<input type={type} {...former.super_handle(path)} placeholder={placeholder} />
	</div> : null
}

const SelectRow = ({ label, path, options, former }: SelectRowRrops) => {
	return former.check(path) ? <div className="row">
		<label>{label}</label>
		<select {...former.super_handle(path)}>
			<option value="" >Select</option>
			{
				Object.entries(options)
					.map(([val, label]) => <option value={val}>{label}</option>)
			}
		</select>
	</div> : null
}

export default SinUpSurvey
