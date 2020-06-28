import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import Youtube from 'react-youtube'
import Play from '../../../icons/play.svg'
import { trackVideoAnalytics, trackAssessmentAnalytics, getLessons } from '../../../actions'
import Modal from '../../../components/Modal'
import { List, ListItem, ListItemIcon, Typography, Divider, Container, Avatar } from '@material-ui/core'
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { getColorsFromChapter } from 'utils/getColorsFromChapter'

import "../style.css"
import AssessmentForm from './AssessmentForm'

interface P {
	lessons: RootReducerState["lessons"]["db"]
	assessments: RootReducerState["assessments"]["db"]
	connected: RootReducerState["connected"]
	getLessons: () => void
	trackVideoAnalytics: (path: string, chapter_id: string, lessons_id: string, time: number) => void
	trackAssessmentAnalytics: (path: string, score: number, total_score: number, assessment_meta: any) => void
}

interface RouteInfo {
	medium: string
	grade: string
	subject: string
	chapter: string
	chapter_name: string
}

type Props = P & RouteComponentProps<RouteInfo>

const getIDFromYoutbeLink = (link: string) => {

	// eslint-disable-next-line
	const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = link.match(regExp);

	if (match && match[2].length === 11) {
		return match[2]
	}

	return ""
}

const LessonPage: React.FC<Props> = ({ lessons, assessments, match, connected, location, trackVideoAnalytics, trackAssessmentAnalytics }) => {

	const { medium, grade, subject, chapter, chapter_name } = match.params
	const curr_unit = lessons[medium]
		&& lessons[medium][grade]
		&& lessons[medium][grade][subject] ?
		lessons[medium][grade][subject][chapter] || {}
		: {}
	const curr_assessments = assessments[medium]
		&& assessments[medium][grade]
		&& assessments[medium][grade][subject] ?
		assessments[medium][grade][subject][chapter] || {}
		: {}

	const [activeChapter] = useState("")
	const [activeLesson, setActiveLesson] = useState("")
	const [showVideoModal, setVideoModal] = useState(false)
	const [showAssessmentModal, setAssessmentModal] = useState(false)
	const [videoId, setVideoID] = useState("")
	const [startTime, setStartTime] = useState(0)
	const [currentLessonURL, setCurrentLessonURL] = useState("")
	const [currentAssessment, setCurrentAssessment] = useState<ILMXAssessment | undefined>(undefined)

	const playLesson = (val: Lesson) => {

		setCurrentLessonURL(val.meta.link)
		setVideoID(getIDFromYoutbeLink(val.meta.link))
		setActiveLesson(val.lesson_id)

		if (connected) {
			setStartTime(Date.now())
			if (!isYoutubeUrl(val.meta.link) && (val.meta.source ? val.meta.source !== "Sabaq Muse" : true)) {
				trackVideoAnalytics(location.pathname, val.chapter_id, val.lesson_id, 0)
			}
		}
		setVideoModal(true)
	}

	const onBack = () => {

		if (startTime !== 0) {
			const timePassed = (Date.now() - startTime) / 1000
			trackVideoAnalytics(location.pathname, chapter, activeLesson, timePassed)
		}

		setCurrentLessonURL("")
		setVideoID("")
		setActiveLesson("");
		setVideoModal(false);
	}

	// eslint-disable-next-line
	const isYoutubeUrl = (link: string) => Boolean(link.match("^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+"))

	const redirectToUrl = () => {
		window.location.href = currentLessonURL
		return true
	}

	const takeAssessment = (assessment: ILMXAssessment) => {
		setCurrentAssessment(assessment)
		setAssessmentModal(true)
	}
	const quitAssessment = () => {
		setAssessmentModal(false)
		setCurrentAssessment(undefined)
	}

	const additional_videos = Object.entries(curr_unit).filter(([lesson_id, lesson]) => lesson.meta.video_type && lesson.meta.video_type === "Additional Video")
	const filtered_assessments = Object.entries(curr_assessments)
		.reduce((agg, [lesson_id, exercises]) => {
			return [...agg, ...Object.values(exercises)]
		}, [] as ILMXAssessment[])
		.filter(ex => ex.type === "MCQs" || ex.type.search("Fill in the Blanks \\(Input ") !== -1)

	return <div className="lesson-page" style={{ overflow: "auto" }}>
		{!showAssessmentModal && showVideoModal && <Modal>
			<div className="modal-box video-modal">
				{connected ?
					isYoutubeUrl(currentLessonURL) ? <Youtube
						videoId={videoId}
						className={'iframe'}
						opts={{
							width: "100%",
							height: "100%",
							playerVars: {
								rel: 0,
								showinfo: 0,
								autoplay: 1
							}

						}} />
						: curr_unit[activeLesson] && curr_unit[activeLesson].meta.source === "Sabaq Muse" ?
							<video className="iframe" src={currentLessonURL} controls autoPlay>
								your browser doesn't support html video, please update it and use chrome for best experience.
							</video> :
							redirectToUrl()
					: <div>
						<div className="heading">Something Went Wrong</div>
						<div className="subtitle">Try again or <a href={isYoutubeUrl(currentLessonURL) ? `https://youtube.com/watch?v=${videoId}` : currentLessonURL} target="_blank" rel="noopener noreferrer">Click Here</a> to watch this on your browser</div>
					</div>
				}
				<div className="button" style={{ marginTop: '5px', backgroundColor: "#f05967" }} onClick={() => onBack()}>Back</div>
			</div>
		</Modal>}
		{
			!showVideoModal && showAssessmentModal && <Modal>
				<div className="modal-box video-modal" style={{ height: "90%" }}>
					<AssessmentForm
						path={location.pathname}
						medium={medium}
						subject={subject}
						chapter_id={chapter}
						assessment={currentAssessment}
						startTime={Date.now()}
						submitAssessment={trackAssessmentAnalytics}
						quit={quitAssessment} />
				</div>
			</Modal>
		}
		{Object.keys(curr_unit).length === 0 ? <Container maxWidth="sm">
			<Typography
				variant="h5"
				color="textSecondary"
				align="center"
				gutterBottom
			>
				We couldn't find anything.
			Please write to us via <a href="tel:0348-1119-119">Sms</a>
				<br />or <a href="https://api.whatsapp.com/send?phone=923481119119">Whatsapp</a>,
			and help us make Ilmexchange better for you.
		</Typography>
		</Container> : <div className="lb-list">
				<div className="styled-intro-box">
					<div
						className="bar"
						style={{ background: `${getColorsFromChapter(chapter_name)}` }} />
					<div className="box">
						<Typography
							color="textSecondary"
							variant="subtitle2"
							align="left">
							Lesson {chapter}
						</Typography>
						<Typography
							variant="h5"
							color="primary"
							align="left">
							{chapter_name}
						</Typography>
					</div>
				</div>
				<Typography
					style={{ marginTop: "10px" }}
					variant="h6"
					color="primary"
					align="left">
					Lesson Videos
				</Typography>
				{
					Object.entries(curr_unit)
						.map(([lesson_id, lesson]) => {
							return <List key={lesson_id}>
								<ListItem button onClick={() => playLesson(lesson)}>
									<ListItemIcon style={{ minWidth: "30px" }}>
										<img className="play-icon" src={Play} alt="play-icon" />
									</ListItemIcon>
									<Typography variant="subtitle2" align="left">{lesson.meta.name}</Typography>
								</ListItem>
								<Divider />
							</List>
						})
				}
				{filtered_assessments.length > 0 && <Typography
					color="primary"
					style={{ marginTop: "10px" }}
					variant="h6"
					align="left">
					Practice
				</Typography>}
				{
					filtered_assessments
						.map((ex) => {
							return <List key={`${ex.lesson_id}-${ex.order}`}>
								<ListItem button onClick={() => takeAssessment(ex)}>
									<ListItemIcon style={{ minWidth: "30px" }}>
										<BorderColorIcon />
									</ListItemIcon>
									<Typography variant="subtitle2" align="left">{ex.title}</Typography>
								</ListItem>
								<Divider />
							</List>
						})
				}

				{additional_videos.length > 0 && <Typography
					color="primary"
					style={{ marginTop: "10px" }}
					variant="h6"
					align="left">
					Additional Videos
				</Typography>}
				{
					additional_videos
						.map(([lesson_id, lesson]) => {
							return <List key={lesson_id}>
								<ListItem button onClick={() => playLesson(lesson)}>
									<ListItemIcon style={{ minWidth: "30px" }}>
										<img className="play-icon" src={Play} alt="play-icon" />
									</ListItemIcon>
									<Typography variant="subtitle2" align="left">{lesson.meta.name}</Typography>
								</ListItem>
								<Divider />
							</List>
						})
				}
			</div>}
	</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	assessments: state.assessments.db,
	connected: state.connected
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons()),
	trackVideoAnalytics: (path: string, chapter_id: string, lessons_id: string, time: number) => dispatch(trackVideoAnalytics(path, chapter_id, lessons_id, time)),
	trackAssessmentAnalytics: (path: string, score: number, total_score: number, assessment_meta: any) => dispatch(trackAssessmentAnalytics(path, score, total_score, assessment_meta))
}))(withRouter(LessonPage))