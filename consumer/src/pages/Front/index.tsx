import React, { useState } from 'react'
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
import Modal from '../../components/Modal'


const FrontPage = () => {

	const [showModal, setShowModal] = useState(false)
	const { height, width } = useWindowDimensions()

	return <div className="front">

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
				<div className="para white">
					A library of the best educational resources from around the world, carefully curated for Pakistan
				</div>
				<Link className="pill mob" to="/start-mob"> start here </Link>
			</div>

			<div className="img-container">
				{/* {
					width >
				}
				<img className="img" src={Demo} /> */}
				<div className="image-card-container">
					<div className="image-card">
						<img className="img" src={TeacherMain} />
						<div className="pill" onClick={() => setShowModal(true)}>Teachers</div>
					</div>
					<div className="image-card">
						<img className="img cen" src={StudentMain} />
						<Link className="pill" to="/library">Students</Link>
					</div>
					<div className="image-card">
						<img className="img" src={SchoolMain} />
						<Link className="pill" to="/school">Schools</Link>
					</div>
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
				<Link className="pill" to="/library"> student portal</Link>
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
				<div className="para white">
					Teaching is hard work, but there are countless resources out there to help.
					We curate and organize high quality materials and teacher training content
					to help you and your classroom be the very best!
				</div>
				<div className="pill" onClick={() => setShowModal(true)}> teacher portal</div>
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
					Join our network of over 1500 schools and get access to information,
					tools for schools and Pakistan's largest Education Marketplace
				</div>
				<Link className="pill" to="/school"> school portal</Link>
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