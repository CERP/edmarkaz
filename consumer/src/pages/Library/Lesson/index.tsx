import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import Youtube from 'react-youtube'

import "../style.css"

interface P {
	lessons: RootReducerState["lessons"]["db"]
}

interface RouteInfo {
	medium: string
	grade: string
	subject: string
}
type Props = P & RouteComponentProps<RouteInfo>

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

const LessonPage: React.FC<Props> = ({ lessons, match }) => {

	const { medium, grade, subject } = match.params

	const [playTime, setPlayTime] = useState(0)
	useEffect(() => {
		return () => {
			console.log("ENDED", playTime)
		}
	}, [])

	// const link = `https://youtube.com/embed/${getIDFromYoutbeLink(lesson.meta.link)}`

	const onPlay = (e: { target: any, data: any }) => {
		setPlayTime(Math.round(e.target.getCurrentTime()))
	}
	const onPause = (e: { target: any, data: any }) => {
		setPlayTime(Math.round(e.target.getCurrentTime()))
	}

	const onStop = (e: { target: any, data: any }) => {
		console.log("onstop", e)
		setPlayTime(Math.round(e.target.getCurrentTime()))
	}

	const onPlayerStateChange = (e: { target: any, data: any }) => {
		console.log("SC", e)
	}
	return <div className="item-page lesson">
		{/* <Youtube
			videoId={getIDFromYoutbeLink(lesson.meta.link)}
			className={'iframe'}
			opts={{
				width: "100%",
				height: "100%",
				playerVars: {
					rel: 0,
					showinfo: 0,
				}
			}}
			onStateChange={onPlayerStateChange}
			onPlay={onPlay}
			onPause={onPause}
			onEnd={onStop}
		/>
		<div className="item-info">
			<div className="heading">{lesson.meta.module_name}</div>
			<div className="title">{`Lesson No. ${lesson.lesson_id}`}</div>
			<div className="subtitle">{lesson.meta.chapter_name}</div>
		</div> */}
	</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db
}), (dispatch: Function) => ({

}))(withRouter(LessonPage))