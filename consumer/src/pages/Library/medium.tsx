import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Typography, Avatar } from '@material-ui/core'
import { getLessons, getAssessments } from '../../actions'
import LoadingIcon from '../../icons/load.svg'
import Modal from '../../components/Modal'
import ilmxLogo from '../../components/Header/ilmx.svg'
import bookIcon from '../../icons/book.png'
import EngLang from '../../icons/eng-lang.png'
import UrduLang from '../../icons/urdu-lang.png'


interface P {
	user: RootReducerState["auth"]["user"]
	lessons: RootReducerState["lessons"]["db"]
	lesson_loading: RootReducerState["lessons"]["loading"]
	school: RootReducerState["sync_state"]["profile"]
	getLessons: () => void
	getAssessments: () => void
}
const LibraryInstructionMedium: React.FC<P> = ({ lessons, lesson_loading, getLessons, getAssessments, school, user }) => {

	useEffect(() => {
		getLessons()
		getAssessments()
	}, [getLessons, getAssessments])

	const [showModal, setShowModal] = useState(false)

	const welcome = Boolean(localStorage.getItem("student-welcome"))
	if (!welcome) {
		localStorage.setItem("student-welcome", "true")
		setShowModal(true)
	}

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} alt="loading-icon" />
		<div className="text">Fetching Lessons, It might take a few minutes depending on your connection speed</div>
	</div> : <div className="medium-page" style={{ margin: "20px 0px" }}>
			{
				showModal && <Modal>
					<div className="modal-box" style={{ maxWidth: "400px", padding: "30px 0px" }}>
						<Avatar variant="square" style={{
							height: "100%",
							width: "70%",
							margin: "auto"
						}} src={ilmxLogo} alt="ilmx-logo" />

						<img src={bookIcon} style={{
							width: "70%",
							margin: "10% 15%"
						}} alt="book" />
						<Typography
							variant="subtitle1"
							color="primary"
							align="center"
							gutterBottom
						>
							Welcome To Ilmexchange!
							</Typography>
						<Typography variant="h6" color="primary" align="center" gutterBottom>
							STUDENT PORTAL
						</Typography>
						{user === "STUDENT" && <Typography
							variant="h3"
							align="center"
							color="primary"
							gutterBottom
						>
							{school.school_name}
						</Typography>}
						<div className="pill" style={{ margin: "auto" }} onClick={() => setShowModal(!showModal)}>
							START
						</div>
					</div>
				</Modal>
			}
			<Typography
				variant="h6"
				color="primary"
				align="center"
			>
				Select Language of Instruction
			</Typography>
			{/* <div className="title" style={{ paddingTop: "20px" }}>Select Language of Instruction</div> */}
			<div className="card-container">
				{
					Object.keys(lessons)
						.map(medium => {
							return <Link
								style={{ background: `url(${medium === "Urdu" ? UrduLang : EngLang}) center/cover no-repeat` }}
								key={medium}
								to={`/library/${medium}`} className="card-medium">
							</Link>
						})
				}
			</div>

		</div>
}

export default connect((state: RootReducerState) => ({
	user: state.auth.user,
	lessons: state.lessons.db,
	lesson_loading: state.lessons.loading,
	school: state.sync_state.profile
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons()),
	getAssessments: () => dispatch(getAssessments())
}))(LibraryInstructionMedium)
