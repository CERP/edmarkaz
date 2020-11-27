import React from 'react'
import StudentMain from './assets/student_main.png'
import SchoolMain from './assets/school_main.png'
import TeacherMain from './assets/teacher_main.png'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'

const OptionsMobile = () => {

	return <Layout>
		<div className="start-mob">
			<div className="card-container">
				<Link className="card" to="/school">
					<img className="icon" src={SchoolMain} alt="school-icon" />
					<div className="heading teal" >SCHOOLS</div>
				</Link>
				<Link className="card" to="/student">
					<img className="icon" src={StudentMain} alt="student-icon" />
					<div className="heading teal">STUDENTS</div>
				</Link>
				<Link className="card" to="/teacher">
					<img className="icon" src={TeacherMain} alt="teacher-icon" />
					<div className="heading teal" >TEACHERS</div>
				</Link>
			</div>
		</div>
	</Layout>
}
export default OptionsMobile