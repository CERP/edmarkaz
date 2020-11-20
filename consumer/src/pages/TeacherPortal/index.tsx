import React from 'react'
import { Container, Avatar, makeStyles, Theme, Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core'

import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'
import Youtube from 'react-youtube'


type P = {

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
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1),
	},
	actionsContainer: {
		marginBottom: theme.spacing(4),
	},
	resetContainer: {
		padding: theme.spacing(4),
	},
	stepLabel: {
		fontSize: '1rem'
	},
	stepLabelActive: {
		fontSize: '1.5rem',
		fontWeight: 'bold'
	}
}))

const flattened_data = Object.entries(vdata)

const getSteps = () => {
	return flattened_data.reduce<string[]>((agg, [id, value]) => ([...agg, value.title]), [])
}

const getStepContent = (step: number) => {
	const [id, video] = flattened_data[step]
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
		<div>
			<Typography variant="h5">Description:</Typography>
			<Typography variant="body1" className={classes.actionsContainer}>{video.description}</Typography>
			<Youtube
				videoId={video.link}
				opts={{
					width: "100%",
					height: "480px",
					playerVars: {
						rel: 0,
						showinfo: 0,
						autoplay: 1
					}

				}} />
		</div>
	)
}

const TeacherPortal: React.FC<P> = () => {

	const classes = useStyles()
	const [activeStep, setActiveStep] = React.useState(0)
	const steps = getSteps()

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1)
	}

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1)
	}

	const callLink = false ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

	return (
		<Layout>
			<div className={classes.root} >
				<Container maxWidth="lg">
					<div
						className="section"
						style={{
							border: "none",
							display: "flex",
							flexDirection: "column",
						}}>
						<Avatar variant="square" style={{
							height: "100%",
							width: "280px",
							margin: "auto"
						}} src={ilmxLogo} alt="ilmx-logo" />
					</div>
					<Stepper activeStep={activeStep} variant="elevation" orientation="vertical">
						{steps.map((label, index) => (
							<Step key={label + index}>
								<StepLabel>
									<Typography color="primary" className={activeStep === index ? classes.stepLabelActive : classes.stepLabel}>
										{label}
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
												{activeStep === steps.length - 1 ? 'Finish' : 'Next'}
											</Button>
											<Button
												variant="outlined"
												color="primary"
												className={classes.button}
											>
												Take Assessment
											</Button>
										</div>
									</div>
								</StepContent>
							</Step>
						))}
					</Stepper>
					{activeStep === steps.length && (
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

export { TeacherPortal }