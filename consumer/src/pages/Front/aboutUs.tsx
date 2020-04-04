import React from 'react'

const AboutUs = () => {
	const ProjectTeam = () => ([
		{
			position: "",
			url: "",
			name: "Zainab Siddiqui"
		},
		{
			position: "Program Manager",
			url: "https://storage.googleapis.com/ilmx-product-images/Roohullah.jpg",
			name: "Roohullah Gulzari"
		},
		{
			position: "",
			url: "",
			name: "Taimur Shah"
		},
		{
			position: "Research Assistant",
			url: "https://storage.googleapis.com/ilmx-product-images/absar.jpg",
			name: "Absar Ali"
		},
		{
			position: "Research Assistant",
			url: "https://storage.googleapis.com/ilmx-product-images/farah.jpeg",
			name: "Farah Basit"
		},
		{
			position: "Field Manager",
			url: "https://storage.googleapis.com/ilmx-product-images/umer.JPG",
			name: "Umer Farooq"
		},
		{
			position: "Senior Developer",
			url: "https://storage.googleapis.com/ilmx-product-images/rao_ali_ahmad.jpg",
			name: "Ali Ahmad"
		}
	])
	const FieldTeam = () => ([
		{
			url: "https://storage.googleapis.com/ilmx-product-images/ali.jpg",
			position: "Sales Associate",
			name: "Ali Husnain"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/asim.jpg",
			position: "Sales Associate",
			name: "Asim Zaheer"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/nasir.jpg",
			position: "Sales Associate",
			name: "Nasir Saeed"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/kaleem.jpg",
			position: "Sales Associate",
			name: "Kaleem Majeed"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/awais.jpg",
			position: "Sales Associate",
			name: "Awais Sakhawat"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/zohaib.jpg",
			position: "Sales Associate",
			name: "Muhammad Zohaib"
		}
	])
	return <div className="front about-us">

		<div className="partition bg-teal">
			<div className="info-container">
				<div className="heading white">Our Story</div>
				<div className="para">
					The Centre for Economic Research in Pakistan,
					or CERP, is a leading independent non-partisan
					policy institution focused on improving decision making in Pakistan through rigorous quantitative research,
					engaging with policy counterparts with real policy challenges and designing and
					advising on high impact reforms based on data. At CERP, we also deploy cutting edge
					pedagogy tailored for Pakistan and provide data insights to the private sector on the
					product and process design.
				</div>
			</div>
		</div>
		<div className="partition">
			<div className="info-container">
				<div className="heading">Our Mission</div>
				<div className="para">
					Our mission is to improve decision-making in
					Pakistan through evidence-based research, survey,
					analytics, executive education and advisory services.
				</div>
			</div>
		</div>
		<div className="partition bg-teal">
			<div className="info-container">
				<div className="heading white">Management Team</div>
				<div className="card-container">
					{
						ProjectTeam().map(({ url, name, position }) => <div className="card">
							<img className="icon" src={url} />
							<div className="title">{name}</div>
							<div className="subtitle">{position}</div>
						</div>)
					}
				</div>
			</div>
		</div>
		<div className="partition">
			<div className="info-container">
				<div className="heading">Field Team</div>
				<div className="card-container">
					{
						FieldTeam().map(({ url, name, position }) => <div className="card">
							<img className="icon" src={url} />
							<div className="title">{name}</div>
							<div className="subtitle">{position}</div>
						</div>)
					}
				</div>
			</div>
		</div>
	</div>
}
export default AboutUs
