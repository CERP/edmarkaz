import React, { useEffect } from 'react'
import Layout from '../../components/Layout'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Typography } from '@material-ui/core'
import { getLessons } from '../../actions'
import LoadingIcon from '../../icons/load.svg'

interface P {
	lessons: RootReducerState["lessons"]["db"]
	lesson_loading: RootReducerState["lessons"]["loading"]
	getLessons: () => void
}
const LibraryInstructionMedium: React.FC<P> = ({ lessons, lesson_loading, getLessons }) => {

	useEffect(() => {
		getLessons()
	}, [])

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} />
		<div className="text">Loading</div>
	</div> : <div className="medium-page">
			<div className="title" style={{ paddingTop: "20px" }}>Select Medium</div>
			<div className="card-container">
				{
					Object.keys(lessons)
						.map(medium => {
							return <Link key={medium} to={`/library/${medium}`} className="card-circle">
								<div className="title">{medium}</div>
							</Link>
						})
				}
			</div>

		</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	lesson_loading: state.lessons.loading
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons())
}))(LibraryInstructionMedium)
