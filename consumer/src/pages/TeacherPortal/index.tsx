import React, { useState } from 'react'
import { Container, Avatar, makeStyles, Theme, Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core'
import { connect } from 'react-redux';
import { teacherUpdateProfile } from 'actions'

import Modal from '../../components/Modal'
import AssessmentGeneric from '../Library/Lesson/AssessmentGeneric'
import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'
import Youtube from 'react-youtube'
import './style.css'


type P = {
	teacher_portal: RootReducerState["teacher_portal"]
	submitAssessment: (teacherAssessment: Partial<TeacherProfile>) => void
}

type VData = {
	[id: string]: VideoMeta
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
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1),
	},
	actionsContainer: {
		marginBottom: theme.spacing(3),
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


type CardProps = {
	video: VideoMeta
}

const VideoCard = ({ video }: CardProps) => {

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

const TeacherPortal: React.FC<P> = ({ teacher_portal, submitAssessment }) => {

	const classes = useStyles()
	const [activeStep, setActiveStep] = useState(0)
	const [showAssessmentModal, setAssessmentModal] = useState(false)
	const [assessmentId, setAssessmentId] = useState('')
	const [videoId, setVideoId] = useState('')

	const { videos, assessments } = teacher_portal
	const flattened_data = Object.entries(videos)

	const getStepContent = (step: number) => {
		const [_, video] = flattened_data[step]
		return (
			<VideoCard video={video} />
		)
	}

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1)
	}

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1)
	}

	const takeAssessment = (videoId: string, assessmentId: string) => {
		setAssessmentModal(true)
		setAssessmentId(assessmentId)
		setVideoId(videoId)
	}

	const quitAssessment = () => {
		setAssessmentModal(false)
	}

	const submit = (questions: any) => {
		const teacherProfile = {
			attempted_assessments: {
				[`${videoId}-${assessmentId}`]: questions
			}
		}
		submitAssessment(teacherProfile)
	}

	const callLink = false ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

	return (
		<Layout>
			{
				showAssessmentModal && <Modal>
					<div className="modal-box video-modal" style={{ height: "90%" }}>
						<AssessmentGeneric
							assessment={assessments[assessmentId]}
							submitAssessment={submit}
							quit={quitAssessment} />
					</div>
				</Modal>
			}
			<div className={"teacher-portal " + classes.root} >
				<Container maxWidth="lg">
					<div className={classes.pageMain}>
						<Avatar variant="square" className={classes.ilmxLogo} src={ilmxLogo} alt="ilmx-logo" />
						<Typography variant="h4" align="center" color="primary">Teacher Portal</Typography>
					</div>
					<Stepper activeStep={activeStep} variant="elevation" orientation="vertical">
						{flattened_data.map(([id, value], index) => (<Step key={id + index}>
							<StepLabel>
								<Typography color="primary" className={activeStep === index ? classes.stepLabelActive : classes.stepLabel}>
									{value.title}
								</Typography>
							</StepLabel>
							<StepContent>
								{getStepContent(index)}
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
											{activeStep === flattened_data.length - 1 ? 'Finish' : 'Next'}
										</Button>
										<Button
											variant="outlined"
											color="primary"
											className={classes.button}
											onClick={() => takeAssessment(id, value.assessment_id)}
										>
											Take Assessment
											</Button>
									</div>
								</div>
							</StepContent>
						</Step>))}
					</Stepper>
					{activeStep === flattened_data.length && (
						<Paper square elevation={0} className={classes.resetContainer}>
							<Typography>All steps completed - you&apos;re finished</Typography>
						</Paper>
					)}
				</Container>

				<HelpFooter hlink={callLink} />
			</div>
		</Layout>
	)
}

export default connect((state: RootReducerState) => ({
	teacher_portal: state.teacher_portal
}), (dispatch: Function) => ({
	submitAssessment: (teacherProfile: Partial<TeacherProfile>) => dispatch(teacherUpdateProfile(teacherProfile))
}))(TeacherPortal);
