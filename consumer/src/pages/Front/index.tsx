import React from 'react'
import Header from '../../components/Header'
import StudentMain from './assets/student_main.png'
import SchoolMain from './assets/school_main.png'
import TeacherMain from './assets/teacher_main.png'

import Student from './assets/student.jpeg'
import School from './assets/school.jpeg'
import Teacher from './assets/teacher.png'

import './style.css'
import useWindowDimensions from '../../utils/useWindowDimensions'
import { Link } from 'react-router-dom'


const FrontPage = () => {

	const { height, width } = useWindowDimensions()

	return <div className="front">
		<div className="partition main bg-teal">
			<div className="info-container">
				<div className="heading white">PAKISTAN'S #1 ONLINE EDUCATION HUB</div>
				<div className="para">
					A library of best educational resources from around the world, carefully curated for Pakistan
				</div>
				<Link className="pill mob" to="/start-mob"> START HERE </Link>
			</div>

			<div className="img-container">
				{/* {
					width >
				}
				<img className="img" src={Demo} /> */}
				<div className="image-card coming-soon">
					<img className="img" src={TeacherMain} />
					<div className="pill">Teachers</div>
				</div>
				<div className="image-card">
					<img className="img" src={StudentMain} style={{ width: "200px", backgroundColor: "#2b8a9c" }} />
					<Link className="pill" to="/library">Students</Link>
				</div>
				<div className="image-card">
					<img className="img" src={SchoolMain} />
					<Link className="pill" to="/school">Schools</Link>
				</div>
			</div>
		</div>
		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Student} />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR STUDENTS</div>
				<div className="para">
					At ilmexchange, we aim to bring together the largest collection
					of digital educational resources for students in Pakistan.
					Whether you prefer learning in Urdu of English, we bring you fun,
					engaging content through lessons, video games and quizzes
				</div>
				<Link className="pill" to="/library"> Students, Start Here!</Link>
			</div>
		</div>

		<div className="partition reverse bg-teal">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Teacher} />
				</div>
			</div>
			<div className="info-container">
				<div className="heading white">FOR TEACHERS</div>
				<div className="para">
					Teaching is hard work, but there are countless resources out there to help.
					We curate and organize high quality materials and teacher training content
					to help you and your classroom be the very best!
				</div>
				<div className="pill coming-soon"> Teachers, Coming Soon!</div>
			</div>
		</div>

		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={School} />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR SCHOOLS</div>
				<div className="para">
					Join our network of 1500 schools and get access to information,
					tools for schools and Pakistan's largest Educational Marketplace
				</div>
				<Link className="pill" to="/school"> Schools, Start Here!</Link>
			</div>
		</div>

		<div className="partition bg-teal">
			{/* <div className="info-container">
				<div className="heading">Footer</div>
				<div className="para">
					Something
				</div>
			</div> */}
		</div>

	</div>
}
export default FrontPage