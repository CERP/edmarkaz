import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import {
	Paper,
	Typography,
	Button,
	Container,
	Step,
	Stepper,
	StepButton
} from '@material-ui/core'
import { teacherUpdateProfile, teacherLogout } from 'actions'
import { AppUserRole } from 'constants/app'

type P = {
	auth: RootReducerState["auth"]
	teacher_portal: RootReducerState["teacher_portal"]
	logout: () => void
	updateProfile: (profile: Partial<TeacherProfile>) => void

} & RouteComponentProps

const TeacherProfile: React.FC<P> = ({ teacher_portal, auth, logout }) => {

	const { profile, videos } = teacher_portal

	const onLogout = useCallback(() => {
		if (window.confirm('Are you sure you want to logout?')) {
			logout()
		}
	}, [logout])

	if (auth.token ? auth.user !== AppUserRole.TEACHER : true) {
		return <Redirect to='/' />
	}

	return (
		<div className="teacher-portal profile">
			<Container maxWidth="md" >
				<Paper style={{ padding: '30px' }}>
					<div className="title">Your Information</div>
					<Typography
						variant="subtitle1">
						<span>Name:</span> {profile.name}
					</Typography>
					<Typography
						variant="subtitle1">
						<span>Gender:</span> {profile.gender}
					</Typography>
					<Typography
						variant="subtitle1">
						<span>Phone:</span> {profile.phone}
					</Typography>
					<Typography
						variant="subtitle1">
						<span>School Name:</span> {profile.school_name || 'Not available'}
					</Typography>

					<Button
						onClick={onLogout}
						variant="contained"
						color="secondary"
						style={{ width: "100%", marginTop: '15px' }}>
						Logout
					</Button>

				</Paper>
				<Paper style={{ padding: '30px', marginTop: '15px' }}>
					<div className="title">Your Course Progress</div>
					<Stepper nonLinear variant="elevation" orientation="vertical">
						{
							Object.entries(videos)
								.sort(([, a], [, b]) => a.order - b.order)
								.map(([id, value], index) => (<Step key={id + index}>
									<StepButton completed={checkAssessmentTaken(id, value.assessment_id, profile)}>
										{value.title}
									</StepButton>
								</Step>))
						}
					</Stepper>
					<Typography
						color="error"
						variant="subtitle1">
						<span>Note:</span> Please take all assessments of the course to get verified certificate of completion.
					</Typography>
				</Paper>
			</Container>
		</div>
	)
}

export default connect((state: RootReducerState) => ({
	auth: state.auth,
	teacher_portal: state.teacher_portal
}), (dispatch: Function) => ({
	logout: () => dispatch(teacherLogout()),
	updateProfile: (profile: Partial<TeacherProfile>) => dispatch(teacherUpdateProfile(profile))
}))(TeacherProfile)

const checkAssessmentTaken = (videoId: string, assessmentId: string, profile: Partial<TeacherProfile>): boolean => {

	const assessment_key = videoId + "-" + assessmentId
	const { attempted_assessments } = profile
	// @ts-ignore
	return attempted_assessments ? Boolean(attempted_assessments[assessment_key]) : false
}
