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
					<Link to="/teacher" className="image-card" >
						<img className="img" src={TeacherMain} style={{ backgroundColor: "#B1E1E8", objectFit: "cover" }} alt="teacher-menu" />
						<div className="pill" style={{ lineHeight: '40px' }}>
							<div className="i-am-a">I am a</div>
							<div className="i-am-a-title">Teacher</div>
						</div>
					</Link>
					<Link to="/student" className="image-card">
						<img className="img cen" src={StudentMain} alt="student-menu" />
						<div className="pill" style={{ lineHeight: '40px' }}>
							<div className="i-am-a">I am a</div>
							<div className="i-am-a-title">Student</div>
						</div>
					</Link>
					<Link to="/school" className="image-card">
						<img className="img" src={SchoolMain} style={{ backgroundColor: "#B1E1E8" }} alt="school-menu" />
						<div className="pill" style={{ lineHeight: '40px' }}>
							<div className="i-am-a">I am a</div>
							<div className="i-am-a-title">School</div>
						</div>
					</Link>
				</div>
			</div>
		</div>
		<div className="partition" style={{ justifyContent: "space-between" }}>
			<div className="gallery">
				<figure className={"gallery-item gallery-item-1"}>
					<img src="/images/students.jpg" className="item-img" alt="Edkasa" />
				</figure>
				<figure className={"gallery-item gallery-item-2"}>
					<img src="/images/books.jpg" className="item-img" alt="Books" />
				</figure>
				<figure className={"gallery-item gallery-item-3"}>
					<img src="/images/loan.jpg" className="item-img" alt="Loans" />
				</figure>
				<figure className={"gallery-item gallery-item-4"}>
					<img src="/images/abacus.jpg" className="item-img" alt="Abacus" />
				</figure>
			</div>
			<div className="info-container bazaar">
				<div className="heading">Ilm Exchange Taleemi Bazaar</div>
				<div className="para">
					<ul className="arrow">
						<li>More Variety Than Anywhere Else</li>
						<li>Best Quality</li>
						<li>Cheaper Prices</li>
						<li>Convenient Delivery</li>
					</ul>
				</div>
				<Link className="pill" to="/bazaar"> Bazaar </Link>
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
				<div className="para">
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
				<Link className="pill" to="/teacher"> Teacher Portal</Link>
			</div>
		</div>

		<div className="partition bg-teal reverse">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Student} alt="student" />
				</div>
			</div>
			<div className="info-container">
				<div className="heading white">FOR STUDENTS</div>
				<div className="para white">
					At ilmexchange, we aim to bring together the largest collection
					of digital educational resources for students in Pakistan.
					Whether you prefer learning in Urdu or English, we bring you fun,
					engaging content through lessons, video games and quizzes
				</div>
				<Link className="pill" to="/student"> Student Portal</Link>
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

	</div >
}
export default FrontPage