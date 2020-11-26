import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Container, Avatar, makeStyles, Theme, Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchTeacherVideosAssessments, teacherUpdateProfile } from 'actions'
import AssessmentForm from 'pages/Library/Lesson/AssessmentForm'
import Modal from '../../components/Modal'
import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'
import Youtube from 'react-youtube'
import { AppUserRole } from 'constants/app'
import Alert from 'components/Alert'

import './style.css'



type P = {
	teacher_portal: RootReducerState["teacher_portal"]
	auth: RootReducerState["auth"],
	fetchTeacherPortalData: () => void
	updateTeacherProfile: (teacherAssessment: Partial<TeacherProfile>) => void
}


type VideoMeta = {
	assessment_id: string
	title: string
	description: string
	link: string
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		width: '100%',
		marginBottom: '4rem'
	},
	button: {
		padding: theme.spacing(0.5),
		marginTop: theme.spacing(0.5),
		marginRight: theme.spacing(0.5),
	},
	buttonLogin: {
		padding: theme.spacing(0.75),
	},
	actionsContainer: {
		marginBottom: theme.spacing(2),
	},
	resetContainer: {
		padding: theme.spacing(4),
	},
	stepLabel: {
		fontSize: '1rem'
	},
	stepLabelActive: {
		fontSize: '1.25rem',
		fontWeight: 'bold'
	},
	pageMain: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(4),
	},
	pageHeading: {

	},
	ilmxLogo: {
		margin: 'auto',
		width: '280px',
		height: '100%'
	},
	videoCard: {
		padding: theme.spacing(2)
	}
}))


const TeacherPortal: React.FC<P> = ({ auth, teacher_portal, updateTeacherProfile, fetchTeacherPortalData }) => {

	const { videos, assessments } = teacher_portal

	const classes = useStyles()

	const [activeStep, setActiveStep] = useState(0)
	const [showAssessmentModal, setAssessmentModal] = useState(false)
	const [assessmentId, setAssessmentId] = useState('')
	const [videoId, setVideoId] = useState('')

	const flattened_videos = useMemo(() => (Object.entries(videos)), [videos])

	useEffect(() => {
		if (Object.keys(videos).length === 0) {
			fetchTeacherPortalData()
		}
	}, [videos, fetchTeacherPortalData])

	const handleTakeAssessment = (videoId: string, assessmentId: string) => {
		setAssessmentModal(true)
		setAssessmentId(assessmentId)
		setVideoId(videoId)
	}

	const handleQuitAssessment = () => {
		setAssessmentModal(false)
		setAssessmentId('')
		setVideoId('')
	}

	const handleNext = useCallback(() => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1)
	}, [])

	const handleBack = useCallback(() => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1)
	}, [])

	const handleAssessmentSubmission = (attemptedAssessment: AttemptedAssessment) => {

		const teacherProfile: Partial<TeacherProfile> = {
			attempted_assessments: {
				[`${videoId}-${assessmentId}`]: {
					questions: attemptedAssessment
				}
			}
		}

		updateTeacherProfile(teacherProfile)
	}

	return (
		<Layout>
			{
				showAssessmentModal && <Modal>
					<div className="modal-box video-modal" style={{ height: "90%" }}>
						<AssessmentForm
							assessment={assessments[assessmentId]}
							submitAssessment={handleAssessmentSubmission}
							quit={handleQuitAssessment} />
					</div>
				</Modal>
			}
			<div className={"teacher-portal " + classes.root} >

				<Container maxWidth="lg">
					<div className={classes.pageMain}>
						<Avatar variant="square" className={classes.ilmxLogo} src={ilmxLogo} alt="ilmx-logo" />
						<Typography variant="h4" align="center" color="primary">Teacher Portal</Typography>
					</div>
					{Object.keys(videos).length === 0 ? <div>Loading ...</div>
						: <>
							{
								!auth.token && auth.user !== AppUserRole.TEACHER && <div className="alert-banner">
									<Alert text="Please login as a teacher to take Assessment to get a certificate" />
								</div>
							}
							{
								!auth.token && auth.user !== AppUserRole.TEACHER && <div className="login-button">
									<Link to="/teacher-login">
										<Button
											variant={"contained"}
											color="primary"
											onClick={handleBack}
											className={classes.buttonLogin} >
											Login as Teacher</Button>
									</Link>
								</div>
							}
							<Stepper activeStep={activeStep} variant="elevation" orientation="vertical">
								{flattened_videos.map(([id, value], index) => (<Step key={id + index}>
									<StepLabel>
										<Typography color="primary" className={activeStep === index ? classes.stepLabelActive : classes.stepLabel}>
											{value.title}
										</Typography>
									</StepLabel>
									<StepContent>
										<VideoCard video={flattened_videos[activeStep][1]} />
										<div className={classes.actionsContainer}>
											<div>
												<Button
													disabled={activeStep === 0}
													onClick={handleBack}
													className={classes.button}
												>
													Back </Button>
												<Button
													variant="contained"
													color="primary"
													onClick={handleNext}
													className={classes.button}
												>
													{activeStep === flattened_videos.length - 1 ? 'Finish' : 'Next'}
												</Button>
												<Button
													disabled={!auth.token && auth.user !== AppUserRole.TEACHER}
													variant="outlined"
													color="primary"
													className={classes.button}
													onClick={() => handleTakeAssessment(id, value.assessment_id)}
												>
													Take Assessment
												</Button>
											</div>
										</div>
									</StepContent>
								</Step>))}
							</Stepper>
							{activeStep === flattened_videos.length && (
								<Paper square elevation={0} className={classes.resetContainer}>
									<Typography>All steps completed - you&apos;re finished</Typography>
								</Paper>
							)}
						</>
					}
				</Container>


				<HelpFooter hlink={'tel:0348-1119-119'} />
			</div>

		</Layout>
	)
}

export default connect((state: RootReducerState) => ({
	teacher_portal: state.teacher_portal,
	auth: state.auth
}), (dispatch: Function) => ({
	fetchTeacherPortalData: () => dispatch(fetchTeacherVideosAssessments()),
	updateTeacherProfile: (teacherProfile: Partial<TeacherProfile>) => dispatch(teacherUpdateProfile(teacherProfile))
}))(TeacherPortal)


type CardProps = {
	video: VideoMeta
}

const VideoCard: React.FC<CardProps> = ({ video }) => {

	const classes = useStyles()

	return (
		<div className={classes.videoCard}>
			<Youtube
				videoId={video.link}
				className={"video-card"}
				opts={{
					playerVars: {
						rel: 0,
						showinfo: 0,
						autoplay: 0
					}

				}} />
			<Typography variant="h6" color={"primary"}>Description:</Typography>
			<Typography variant="body2" style={{ margin: 0 }} className={classes.actionsContainer}>{video.description}</Typography>
		</div>
	)
}
