import React, { useState } from 'react'
import StudentMain from './assets/student_main.png'
import SchoolMain from './assets/school_main.png'
import TeacherMain from './assets/teacher_main.png'
import { Link } from 'react-router-dom'
import Modal from '../../components/Modal'

const OptionsMobile = () => {
	const [showModal, setShowModal] = useState(false)

	return <div className="start-mob">
		{showModal && <Modal>
			<div className="modal-box">
				<div className="title">Coming Soon</div>
				<div className="button save" onClick={() => setShowModal(false)}>
					Great
					</div>
			</div>
		</Modal>
		}
		<div className="card-container">
			<div className="card">
				<img className="icon" src={StudentMain} />
				<Link className="pill" to="/library">students</Link>
			</div>
			<div className="card">
				<img className="icon" src={SchoolMain} />
				<Link className="pill" to="/school">schools</Link>
			</div>
			<div className="card">
				<img className="icon" src={TeacherMain} />
				<div className="pill" onClick={() => setShowModal(true)}>teachers</div>
			</div>
		</div>
	</div>
}
export default OptionsMobile