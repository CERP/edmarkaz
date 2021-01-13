import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Container,
	Avatar,
	makeStyles,
	Theme,
	Button,
	Step,
	StepContent,
	Stepper,
	Typography,
	StepButton
} from '@material-ui/core'
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
import { FinalAssessment } from 'constants/teacher'

import './style.css'

type P = {
	teacher_portal: RootReducerState["teacher_portal"]
	auth: RootReducerState["auth"],
	fetchTeacherPortalData: () => void
	updateTeacherProfile: (teacherAssessment: Partial<TeacherProfile>) => void
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		paddingBottom: '90px'
	},
	button: {
		padding: theme.spacing(0.75),
		marginRight: theme.spacing(0.25),
	},
	buttonLogin: {
		padding: theme.spacing(0.75),
	},
	buttonLoginContainer: {
		width: '100%',
		textAlign: 'right',
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
	videoCard: {}
}))


const TeacherPortal: React.FC<P> = ({ auth, teacher_portal, updateTeacherProfile, fetchTeacherPortalData }) => {

	const { profile, videos, assessments } = teacher_portal

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

	const handleStep = (step: number) => () => {
		setActiveStep(step)
	}

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
			<div className={"teacher-portal " + classes.root}>

				<Container maxWidth="lg">
					<div className={classes.pageMain}>
						<Avatar variant="square" className={classes.ilmxLogo} src={ilmxLogo} alt="ilmx-logo" />
						<Typography variant="h4" align="center" style={{ marginTop: 10, fontFamily: "futura" }} color="primary">Teaching After COVID-19</Typography>
					</div>

					{Object.keys(videos).length === 0 ? <div>Loading, Please wait...</div>
						: <>

							{
								(auth.token ? auth.user !== AppUserRole.TEACHER : true) && <>
									<div className={classes.buttonLoginContainer}>
										<div className="login-button">
											<Link to="/teacher-login">
												<Button
													variant={"contained"}
													color="primary"
													onClick={handleBack}
													className={classes.buttonLogin} >
													Login as Teacher</Button>
											</Link>
										</div>
									</div>
								</>
							}

							<div style={{marginBottom: '15px', padding: 5}}>
								<Typography
									style={{ fontFamily: "futura", marginBottom: '10px' }}
									color="primary"
									variant="h4">Introduction</Typography>
								<div className="">This training course has been very carefully tailored to aid teachers with knowledge regarding changes students may experience upon their return to 'physical' school during the time of Covid-19 like learning losses and disruption in their social emotional learning.
									The course also equips teachers with appropriate riate and easy to implement strategies that can be used to navigate gaps and curate their lessons and activities in a manner that it restores the classroom environment.
								</div>
							</div>

							<Stepper activeStep={activeStep} variant="elevation" nonLinear orientation="vertical" style={{ padding: 4 }}>
								{
									flattened_videos
										.sort(([, a], [, b]) => a.order - b.order)
										.map(([id, value], index) => (<Step key={id + index}>
											<StepButton onClick={handleStep(index)} completed={checkAssessmentTaken(id, value.assessment_id, profile)}>
												<Typography
													color="primary"
													className={activeStep === index ? classes.stepLabelActive : classes.stepLabel}>
													{value.title}
												</Typography>
											</StepButton>
											<StepContent>
												<VideoCard video={flattened_videos[activeStep][1]} />
												<div className={classes.actionsContainer}>
													<div>
														<Button
															disabled={activeStep === 0}
															onClick={handleBack}
															color={"default"}
															variant="contained"
															className={classes.button}
														>
															Back </Button>
														<Button
															variant="contained"
															color="primary"
															onClick={(activeStep !== flattened_videos.length - 1) ? handleNext : () => { }}
															className={classes.button}
														>
															{activeStep === flattened_videos.length - 1 ? 'Feedback' : 'Next'}
														</Button>
														<Button
															disabled={checkAssessmentTaken(id, value.assessment_id, profile)}
															variant="contained"
															color="secondary"
															className={classes.button}
															onClick={() => auth.token && auth.user === AppUserRole.TEACHER ?  handleTakeAssessment(id, value.assessment_id) : window.alert('Please login as Teacher to continue')}
														>
															{checkAssessmentTaken(id, value.assessment_id, profile) ? 'Assessment Taken' : 'Take Assessment'}
														</Button>
													</div>
												</div>
											</StepContent>
										</Step>))}
							</Stepper>
						</>
					}

					<div className="final-assessment">
						<div className="heading">اہم ہدایت:</div>
						<div className="intro">{FinalAssessment.introduction}</div>
						<div className="contact">0348-1119119</div>
						{
							<ul>
								{
									FinalAssessment.questions
										.map((q, index) => <li key={index + q.length}>{q}</li>)
								}
							</ul>
						}
					</div>
				</Container>
			</div>
			<HelpFooter hlink={'tel:0348-1119-119'} />
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
	video: TeacherPortalVideo
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
						autoplay: 0,
						controls: 0,
					}

				}} />
			<Typography variant="h6" color={"primary"}>Description:</Typography>
			<Typography variant="body1" style={{ margin: '10px 0px' }} className={classes.actionsContainer}>{video.description}</Typography>
			<Typography variant="body1" style={{ margin: '10px 0px', direction: "rtl" }} className={classes.actionsContainer}>{video.description_urdu}</Typography>

		</div>
	)
}

const checkAssessmentTaken = (videoId: string, assessmentId: string, profile: Partial<TeacherProfile>): boolean => {

	const assessment_key = videoId + "-" + assessmentId
	const { attempted_assessments } = profile
	// @ts-ignore
	return attempted_assessments ? Boolean(attempted_assessments[assessment_key]) : false
}
