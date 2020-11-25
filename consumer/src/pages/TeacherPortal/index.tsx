import React, { useState } from 'react'
import { Container, Avatar, makeStyles, Theme, Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core'
import { connect } from 'react-redux';
import { trackTeacherAssessmentAnalytics } from '../../actions'

import Modal from '../../components/Modal'
import AssessmentGeneric from '../Library/Lesson/AssessmentGeneric'
import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'
import Youtube from 'react-youtube'
import './style.css'


type P = {
	teacher_portal: RootReducerState["teacher_portal"]
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

const vdata: VData = {
	"1": {
		"assessment_id": "1",
		"title": "What makes a good teacher great?",
		"description": "Azul Terronez is the author of the best-selling book 'The art of Apprenticeship' Azul has coached teachers and schools leaders around the world",
		"link": "vrU6YJle6Q4",
	},
	"2": {
		"assessment_id": "1",
		"title": "Teaching Methods for Inspiring",
		"description": "Joe Ruhl received his bachelors and masters degrees at Purdue University and he has been sharing the joys of biology with kids for 37 years.",
		"link": "UCFg9bcW7Bk",
	},
	"3": {
		"assessment_id": "1",
		"title": "Teaching science: we're doing it wrong",
		"description": "The world needs scientists and engineers more than ever, but our approach to raising them is backwards and ineffective. ",
		"link": "5duz42kHqPs",
	},
	"4": {
		"assessment_id": "1",
		"title": "Teaching Methods for Inspiring",
		"description": "Joe Ruhl received his bachelors and masters degrees at Purdue University and he has been sharing the joys of biology with kids for 37 years.",
		"link": "UCFg9bcW7Bk",
	},
	"5": {
		"assessment_id": "1",
		"title": "Teaching science: we're doing it wrong",
		"description": "The world needs scientists and engineers more than ever, but our approach to raising them is backwards and ineffective. ",
		"link": "5duz42kHqPs",
	},
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

const flattened_data = Object.entries(vdata)

const getStepContent = (step: number) => {
	const [_, video] = flattened_data[step]
	return (
		<VideoCard video={video} />
	)
}

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

const TeacherPortal: React.FC<P> = ({ teacher_portal }) => {

	const classes = useStyles()
	const [activeStep, setActiveStep] = useState(0)
	const [showAssessmentModal, setAssessmentModal] = useState(false)
	const [assessment, serAssessment] = useState<ILMXAssessment | undefined>(undefined)
	const [assessmentId, setAssessmentId] = useState('')

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1)
	}

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1)
	}

	const takeAssessment = (id: any) => {
		setAssessmentModal(true)
		serAssessment(teacher_portal.assessments[id])
		setAssessmentId(id)
	}

	const quitAssessment = () => {
		setAssessmentModal(false)
	}

	const callLink = false ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

	return (
		<Layout>
			{
				showAssessmentModal && <Modal>
					<div className="modal-box video-modal" style={{ height: "90%" }}>
						<AssessmentGeneric
							assessment_id={assessmentId}
							assessment={assessment}
							submitAssessment={trackTeacherAssessmentAnalytics}
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
											onClick={() => takeAssessment(value.assessment_id)}
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
}))(TeacherPortal);
