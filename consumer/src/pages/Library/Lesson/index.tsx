import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import Youtube from 'react-youtube'
import Play from '../../../icons/play.svg'
import { trackVideoAnalytics, getLessons } from '../../../actions'
import Modal from '../../../components/Modal'
import LoadingIcon from '../../../icons/load.svg'
import { List, ListItem, ListItemIcon, Typography, Divider, Container } from '@material-ui/core'

import "../style.css"
interface P {
	lessons: RootReducerState["lessons"]["db"]
	connected: RootReducerState["connected"]
	getLessons: () => void
	trackVideoAnalytics: (path: string, chapter_id: string, lessons_id: string, time: number) => void

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

	const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = link.match(regExp);

	if (match && match[2].length == 11) {
		return match[2]
	}

	return ""
}

const LessonPage: React.FC<Props> = ({ lessons, match, connected, location, trackVideoAnalytics }) => {

	const { medium, grade, subject, chapter, chapter_name } = match.params
	const curr_unit = lessons[medium]
		&& lessons[medium][grade]
		&& lessons[medium][grade][subject] ?
		lessons[medium][grade][subject][chapter] || {}
		: {}

	const [activeChapter, setActiveChapter] = useState("")
	const [activeLesson, setActiveLesson] = useState("")
	const [showModal, setShowModal] = useState(false)
	const [videoId, setVideoID] = useState("")
	const [startTime, setStartTime] = useState(0)
	const [currentLessonURL, setCurrentLessonURL] = useState("")

	const playLesson = (val: Lesson) => {

		if (connected) {
			setStartTime(Date.now())
		}
		setCurrentLessonURL(val.meta.link)
		setVideoID(getIDFromYoutbeLink(val.meta.link))
		setActiveLesson(val.lesson_id)
		setShowModal(true)
	}

	const onBack = () => {

		if (startTime !== 0) {
			const timePassed = (Date.now() - startTime) / 1000
			trackVideoAnalytics(location.pathname, activeChapter, activeLesson, timePassed)
		}

		setCurrentLessonURL("")
		setVideoID("")
		setActiveLesson("");
		setShowModal(false);
	}

	const isYoutubeUrl = (link: string) => Boolean(link.match("^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+"))

	// const onPrev = () => {

	// 	const key = `${parseFloat(activeLesson) - 1}`
	// 	const prevLesson = curr[activeChapter][key]

	// 	if (prevLesson) {

	// 		if (startTime !== 0) {
	// 			//Tracking analytics for curr lecture before moving to prev
	// 			const timePassed = (Date.now() - startTime) / 1000
	// 			trackVideoAnalytics(location.pathname, activeChapter, activeLesson, timePassed)
	// 		}

	// 		//For prev
	// 		if (connected) {
	// 			setStartTime(Date.now())
	// 		}
	// 		else {
	// 			setStartTime(0)
	// 		}

	// 		setVideoID(getIDFromYoutbeLink(prevLesson.meta.link))
	// 		setActiveLesson(key)
	// 	}
	// }

	// const onNext = () => {

	// 	const key = `${parseFloat(activeLesson) + 1}`
	// 	const nextLesson = curr[activeChapter][key]

	// 	if (nextLesson) {

	// 		if (startTime !== 0) {
	// 			//Tracking analytics for curr lecture before moving to next
	// 			const timePassed = (Date.now() - startTime) / 1000
	// 			trackVideoAnalytics(location.pathname, activeChapter, activeLesson, timePassed)

	// 		}

	// 		//For next
	// 		if (connected) {
	// 			setStartTime(Date.now())
	// 		}
	// 		else {
	// 			setStartTime(0)
	// 		}

	// 		setVideoID(getIDFromYoutbeLink(nextLesson.meta.link))
	// 		setActiveLesson(key)
	// 	}
	// }

	return <div className="lesson-page">
		{showModal && <Modal>
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
						: <iframe src={currentLessonURL}
							width="100%"
							height="100%"
							className="iframe"
							allowFullScreen>
							<div>
								<div className="heading">Your Browser does not support Embeded Player</div>
								<div className="subtitle">Please update your browser(Chrome recommended) or <a href={currentLessonURL} target="_blank">Click Here</a> to visit there page</div>
							</div>
						</iframe>
					: <div>
						<div className="heading">Something Went Wrong</div>
						<div className="subtitle">Try again or <a href={isYoutubeUrl(currentLessonURL) ? `https://youtube.com/watch?v=${videoId}` : currentLessonURL} target="_blank">Click Here</a> to watch this on your browser</div>
					</div>
				}
				<div className="button" style={{ marginTop: '5px', backgroundColor: "#f05967" }} onClick={() => onBack()}>Back</div>
			</div>
		</Modal>}
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
				{
					Object.entries(curr_unit)
						.map(([lesson_id, lesson]) => {
							return <List key={lesson_id}>
								<ListItem button onClick={() => playLesson(lesson)}>
									<ListItemIcon style={{ minWidth: "30px" }}>
										<img className="play-icon" src={Play} />
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

{/* <div key={lesson_id}>
	<div className="item" key={lesson_id} onClick={() => playLesson(lesson)}>
		<img className="play-icon" src={Play} alt="play" />
		<div className="title">{`${lesson.meta.name}`}</div>
	</div>
</div> */}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	connected: state.connected
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons()),
	trackVideoAnalytics: (path: string, chapter_id: string, lessons_id: string, time: number) => dispatch(trackVideoAnalytics(path, chapter_id, lessons_id, time))
}))(withRouter(LessonPage))