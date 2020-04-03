import React from 'react'
import StudentMain from './assets/student_main.png'
import SchoolMain from './assets/school_main.png'
import TeacherMain from './assets/teacher_main.png'
import { Link } from 'react-router-dom'

const OptionsMobile = () => {
	return <div className="start-mob">
		<div className="card-container">
			<div className="card">
				<img className="icon" src={StudentMain} />
				<Link className="pill" to="/library">Students</Link>
			</div>
			<div className="card">
				<img className="icon" src={SchoolMain} />
				<Link className="pill" to="/school">School</Link>
			</div>
			<div className="card coming-soon">
				<img className="icon" src={TeacherMain} />
				<div className="pill">Teachers</div>
			</div>
		</div>
	</div>
}
export default OptionsMobile