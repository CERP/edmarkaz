import React, { Dispatch, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { getLessons, trackVideoAnalytics } from '../../actions'
import Youtube from 'react-youtube'
import Plus from '../../icons/plus.svg'
import Minus from '../../icons/minus.svg'
import Play from '../../icons/play.svg'
import { Link, RouteComponentProps } from 'react-router-dom'
import './style.css'
import Modal from '../../components/Modal'

interface P {
	connected: RootReducerState["connected"]
	lessons: RootReducerState["lessons"]["db"]
	getLessons: () => void
	trackVideoAnalytics: (path: string, chapter_id: string, lessons_id: string, time: number) => void
}

interface RouteInfo {
	medium: string
	grade: string
	subject: string
}

type Props = P & RouteComponentProps<RouteInfo>

const Library: React.FC<Props> = ({ trackVideoAnalytics, getLessons, lessons, match, connected, location }) => {

	const p_medium = match.params.medium
	const p_grade = match.params.grade
	const p_subject = match.params.subject

	const [activeChapter, setActiveChapter] = useState("")
	const [activeLesson, setActiveLesson] = useState("")
	const [searchText, setSearchText] = useState("")
	const [showModal, setShowModal] = useState(false)
	const [videoId, setVideoID] = useState("")
	const [startTime, setStartTime] = useState(0)

	const curr = lessons[p_medium][p_grade][p_subject]

	const items = Object.entries(curr)
		.reduce((agg, [chapter_id, less]) => {
			const temp = Object.entries(less)
				.reduce((acc, [lesson_id, value]) => {
					return {
						...acc,
						[`${chapter_id}`]: {
							...value,
							lessons: curr[chapter_id]
						}
					}
				}, {})

			return {
				...agg,
				...temp
			}
		}, {} as { [chapter_id: string]: { lessons: { [id: string]: Lesson } } & Lesson })

	const setChapter = (chapter: string) => {
		if (activeChapter === chapter) {
			setActiveChapter("")
			return
		}
		setActiveChapter(chapter)

	}
	const getRandomColorBorder = (chapter_id: string): string => {
		const length = chapter_id.length

		if (length < 10) {
			return "border-yellow"
		}
		else if (length < 20) {
			return "border-red"
		}
		else if (length < 30) {
			return "border-green"
		}
		else if (length < 40) {
			return "border-blue"
		}
		else if (length < 50) {
			return "border-purple";
		}
		return "border-grey"
	}

	const getIDFromYoutbeLink = (link: string) => {
		const id = link.split("/").pop()

		if (id) {
			if (id.length === 11) {
				return id
			}
			return id.split("=").pop() as string
		}
		return ""
	}

	const playLesson = (val: Lesson) => {

		if (connected) {
			setStartTime(Date.now())
		}

		setVideoID(getIDFromYoutbeLink(val.meta.link))
		setActiveLesson(val.lesson_id)
		setShowModal(true)
	}

	const onBack = () => {

		if (startTime !== 0) {
			const timePassed = (Date.now() - startTime) / 1000
			trackVideoAnalytics(location.pathname, activeChapter, activeLesson, timePassed)
		}

		setActiveLesson("");
		setShowModal(false);

	}

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
				{connected ? <Youtube
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

					}}
				/> : <div>
						<div className="heading">Something Went Wrong</div>
						<div className="subtitle">Try again or <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank">Click Here</a> to watch this on your browser</div>
					</div>}

				<div className="button" style={{ marginTop: '5px', backgroundColor: "#f05967" }} onClick={() => onBack()}>Back</div>
				{/* <div className="next-container">
					<div className="button" onClick={() => onPrev()}>{'<'}</div>
					<div className="button" onClick={() => onNext()}>{'>'}</div>
				</div> */}
			</div>
		</Modal>}
		<div className="heading"> {`Class ${p_grade} > ${p_subject}`} </div>
		<input
			className="search-bar"
			type="text"
			onChange={(e: any) => setSearchText(e.target.value)}
			value={searchText}
			placeholder="Search by Chapter No | Chapter Name"
		/>

		<div className="lesson-box-container">
			{
				Object.entries(items)
					.filter(([chapter_id, val]) => searchText === "" || `${val.meta.chapter_name}-${chapter_id}`.toLowerCase().includes(searchText.toLowerCase()))
					.map(([chapter_id, val]) => {
						return <div key={chapter_id} className={activeChapter === chapter_id ? `lesson-box ${getRandomColorBorder(val.meta.chapter_name)} active` : `lesson-box ${getRandomColorBorder(val.meta.chapter_name)}`}>
							<div className="info" onClick={() => setChapter(chapter_id)}>
								<div className="title">{`Unit ${chapter_id}`}</div>
								<img className="icon" src={activeChapter === chapter_id ? Minus : Plus} alt="arrow" />
							</div>
							<div className="list-container">
								<div className="header">{`${val.meta.chapter_name}`}</div>
								{(activeChapter === chapter_id) && <div className="lb-list">
									{
										Object.entries(val.lessons)
											.sort(([a_id,], [b_id,]) => parseFloat(a_id) - parseFloat(b_id))
											.map(([lesson_id, val]) => {
												return <div className="item" key={lesson_id} onClick={() => playLesson(val)}>
													<img className="play-icon" src={Play} alt="play" />
													<div className="title">{`${val.meta.name}`}</div>
												</div>
											})
									}
								</div>}
							</div>
						</div>
					})
			}
		</div>
	</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	connected: state.connected
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons()),
	trackVideoAnalytics: (path: string, chapter_id: string, lessons_id: string, time: number) => dispatch(trackVideoAnalytics(path, chapter_id, lessons_id, time))
}))(Library)