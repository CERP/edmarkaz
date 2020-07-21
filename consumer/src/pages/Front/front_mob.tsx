import React, { useState } from 'react'
import StudentMain from './assets/student_main.png'
import SchoolMain from './assets/school_main.png'
import TeacherMain from './assets/teacher_main.png'
import { Link } from 'react-router-dom'
import Modal from '../../components/Modal'
import Layout from '../../components/Layout'

const OptionsMobile = () => {
	const [showModal, setShowModal] = useState(false)

	return <Layout>
		<div className="start-mob">
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
				<Link className="card" to="/school">
					<img className="icon" src={SchoolMain} alt="school-icon" />
					<div className="heading teal" >SCHOOLS</div>
				</Link>
				<Link className="card" to="/student">
					<img className="icon" src={StudentMain} alt="student-icon" />
					<div className="heading teal">STUDENTS</div>
				</Link>
				<div className="card" onClick={() => setShowModal(true)}>
					<img className="icon" src={TeacherMain} alt="teacher-icon" />
					<div className="heading teal" >TEACHERS</div>
				</div>
			</div>
		</div>
	</Layout>
}
export default OptionsMobile