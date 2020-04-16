import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'
import './style.css'

interface P {
	lessons: RootReducerState["lessons"]["db"]
}

interface RouteInfo {
	medium: string
	grade: string
	subject: string
}

type Props = P & RouteComponentProps<RouteInfo>

const Library: React.FC<Props> = ({ lessons, match }) => {

	const p_medium = match.params.medium
	const p_grade = match.params.grade
	const p_subject = match.params.subject

	const [activeChapter, setActiveChapter] = useState("")
	const [searchText, setSearchText] = useState("")
	const curr = lessons[p_medium][p_grade][p_subject]

	const items = Object.entries(curr || {})
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

	return <div className="lesson-page">
		<div className="heading"> {`Class ${p_grade} - ${p_subject}`} </div>
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
						return <Link
							to={`${match.url}/${chapter_id}/${val.meta.chapter_name}`}
							key={chapter_id}
							className={`lesson-box ${getRandomColorBorder(val.meta.chapter_name)}`}
						>
							<div className="title">{`Unit ${chapter_id}`}</div>
							<div className="header">{`${val.meta.chapter_name}`}</div>
						</Link>
					})
			}
		</div>
	</div >
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db
}))(Library)