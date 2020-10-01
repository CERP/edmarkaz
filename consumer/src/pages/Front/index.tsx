import React, { useState } from 'react'
import Header from '../../components/Header'
import StudentMain from './assets/student_main.png'
import SchoolMain from './assets/school_main.png'
import TeacherMain from './assets/teacher_main.png'
import Flag from './assets/flag-background.jpg'

import Student from './assets/student.jpeg'
import School from './assets/school.jpeg'
import Teacher from './assets/teacher.png'
import Campaign from './assets/campaign.jpg'

import './style.css'
import { Link } from 'react-router-dom'
import Modal from '../../components/Modal'


const FrontPage = () => {

	const [showModal, setShowModal] = useState(false)

	return <div className="front">
		<Header path={"/"} />


		{showModal && <Modal>
			<div className="modal-box">
				<div className="title">Coming Soon</div>
				<div className="button save" onClick={() => setShowModal(false)}>
					Great
					</div>
			</div>
		</Modal>
		}
		<div className="partition main bg-teal">
			<div className="info-container">
				<div className="heading white">PAKISTAN'S #1 DIGITAL EDUCATION HUB</div>
				{/* <div className="para white">
					A library of the best educational resources from around the world, carefully curated for Pakistan
				</div> */}
				<Link className="pill mob" to="/start-mob"> Start Here </Link>
			</div>

			<div className="img-container">
				{/* {
					width >
				}
				<img className="img" src={Demo} /> */}
				<div className="image-card-container">
					<div className="image-card" onClick={() => setShowModal(true)}>
						<img className="img" src={TeacherMain} style={{ backgroundColor: "#B1E1E8", objectFit: "cover" }} alt="teacher-menu" />
						<div className="pill" >Teachers</div>
					</div>
					<Link to="/student" className="image-card">
						<img className="img cen" src={StudentMain} alt="student-menu" />
						<div className="pill">Students</div>
					</Link>
					<Link to="/school" className="image-card">
						<img className="img" src={SchoolMain} style={{ backgroundColor: "#B1E1E8" }} alt="school-menu" />
						<div className="pill">Schools</div>
					</Link>
				</div>
			</div>
		</div>
		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Flag} alt="student" />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">14th August Competition!</div>
				<div className="para">
					Send us art, poems or essays to celebrate the spirit of being Pakistani. Find out more details about how to participate
				</div>
				<Link className="pill" to="/challenge"> Enter </Link>
			</div>
		</div>
		<div className="partition bg-teal">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Campaign} alt="student" />
				</div>
			</div>
			<div className="info-container">
				<div className="heading white">Back to School SMS Program</div>
				<div className="para white">
					Schools are reopening soon. Get back into learning mode with ilmexchange! Challenge yourself with these questions.
				</div>
				<Link className="pill" to="/sms"> Enter </Link>
			</div>
		</div>
		<div className="partition
		">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Student} alt="student" />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR STUDENTS</div>
				<div className="para">
					At ilmexchange, we aim to bring together the largest collection
					of digital educational resources for students in Pakistan.
					Whether you prefer learning in Urdu or English, we bring you fun,
					engaging content through lessons, video games and quizzes
				</div>
				<Link className="pill" to="/student"> Student Portal</Link>
			</div>
		</div>

		<div className="partition bg-teal reverse">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={School} alt="school" />
				</div>
			</div>
			<div className="info-container">
				<div className="heading white">FOR SCHOOLS</div>
				<div className="para white">
					Join our network of over 1500 schools and get access to information,
					tools for schools and Pakistan's largest Education Marketplace
				</div>
				<Link className="pill" to="/school"> School Portal</Link>
			</div>
		</div>

		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Teacher} alt="teacher" />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR TEACHERS</div>
				<div className="para">
					Teaching is hard work, but there are countless resources out there to help.
					We curate and organize high quality materials and teacher training content
					to help you and your classroom be the very best!
				</div>
				<div className="pill" onClick={() => setShowModal(true)}> Teacher Portal</div>
			</div>
		</div>

		{/* <div className="partition bg-teal">
			<div className="info-container">
				<div className="heading">Footer</div>
				<div className="para">
					Something
				</div>
			</div>
		</div> */}

	</div>
}
export default FrontPage