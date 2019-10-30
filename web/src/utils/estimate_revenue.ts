
export default function EstimateRevenue(school: CERPSchool) {

	if(isValid(school.lowest_fee) && isValid(school.highest_fee) && isValid(school.total_enrolment)) {
		const estimated_monthly_revenue = ((parseInt(school.lowest_fee) + parseInt(school.highest_fee))/2 * parseInt(school.total_enrolment))

		return estimated_monthly_revenue;
	}

}

const isValid = (field: string) => {
	return field && !(field.trim() === "" || field === "999")
}
