import React from 'react'

const AboutUs = () => {
	const ProjectTeam = () => ([
		{
			position: "Principal Investigator",
			url: "",
			name: "Asim Ijaz Khwaja"
		},
		{
			position: "LEAPS Sr. Program Manager",
			url: "https://storage.googleapis.com/ilmx-product-images/aboutzainab.jpg",
			name: "Zainab Siddiqui"
		},
		{
			position: "Project Manager",
			url: "https://storage.googleapis.com/ilmx-product-images/aboutrooh.jpg",
			name: "Roohullah Gulzari"
		},
		{
			position: "Technology Lead",
			url: "https://storage.googleapis.com/ilmx-product-images/taimur.jpg",
			name: "Taimur Shah"
		},
		{
			position: "Research Assistant",
			url: "https://storage.googleapis.com/ilmx-product-images/aboutabsar.jpg",
			name: "Absar Ali"
		},
		{
			position: "Research Assistant",
			url: "https://storage.googleapis.com/ilmx-product-images/aboutfarah.jpeg",
			name: "Farah Basit"
		},
		{
			position: "Field Supervisor",
			url: "https://storage.googleapis.com/ilmx-product-images/aboutumer.jpg",
			name: "Umer Farooq"
		},
		{
			position: "Senior Developer",
			url: "https://storage.googleapis.com/ilmx-product-images/rao_ali_ahmad.jpg",
			name: "Ali Ahmad"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/aboutali.jpg",
			position: "Field Associate",
			name: "Ali Husnain"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/aboutasim.jpg",
			position: "Field Associate",
			name: "Asim Zaheer"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/aboutnasir.jpg",
			position: "Field Associate",
			name: "Nasir Saeed"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/aboutkaleem.jpg",
			position: "Field Associate",
			name: "Kaleem Majeed"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/aboutawais.jpg",
			position: "Field Associate",
			name: "Awais Sakhawat"
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/aboutzohaib.jpg",
			position: "Field Associate",
			name: "Muhammad Zohaib"
		}
	])
	const Partners = () => ([
		{
			url: "",
			name: "Oxford University Press",
			info: ""
		},
		{
			url: "",
			name: "The Citizens Foundation",
			info: ""
		},
		{
			url: "",
			name: "Developments in Literacy",
			info: ""
		},
		{
			url: "",
			name: "Alif Laila Book Bus Society",
			info: ""
		},
		{
			url: "",
			name: "Ilm Association",
			info: ""
		},
		{
			url: "",
			name: "Sabaq Muse",
			info: ""
		},
		{
			url: "",
			name: "EdKasa",
			info: ""
		},
		{
			url: "",
			name: "AZ Corp",
			info: ""
		},
		{
			url: "",
			name: "Radec",
			info: ""
		},
		{
			url: "",
			name: "Knowledge Platform",
			info: ""
		},
		{
			url: "",
			name: "Javed Publishers",
			info: ""
		},
		{
			url: "",
			name: "Kashf Foundation",
			info: ""
		},
		{
			url: "",
			name: "Finca",
			info: ""
		},

		{
			url: "",
			name: "JS Bank",
			info: ""
		}
	])

	return <div className="front about-us">
		<div className="partition bg-teal">
			<div className="info-container">
				<div className="heading white">Our Story</div>
				<div className="para white">
					Ilm Exchange is a digital education platform designed to connect schools,
					teachers and students with affordable, high quality educational resources to
					enable quality teaching and learning across Pakistan. Our long-term vision is
					to become Pakistan’s premier education hub that brings together school leaders,
					teachers, students, parents, education service providers, education financers,
					donors, researchers and policymakers, with the underlying goal of nurturing innovation and
					improving education quality at the system level.
				</div>
				<div className="para white">
					Ilm Exchange has been created by a part of the <a href="https://www.google.com/url?q=https://epod.cid.harvard.edu/initiative/leaps-program&sa=D&ust=1586116228054000&usg=AFQjCNFgHnauCjI1el6pNHmk9r9mjUAkqw" target="__blank">LEAPS</a> (Learning and Educational Achievements in
					Pakistan Schools) team at the Centre for Economic Research in Pakistan (<a href="https://www.cerp.org.pk/" target="__blank">CERP</a>).
					The project is built on findings from two decades of rigorous empirical <a href="https://www.google.com/url?q=https://epod.cid.harvard.edu/initiative/leaps-program&sa=D&ust=1586116228054000&usg=AFQjCNFgHnauCjI1el6pNHmk9r9mjUAkqw" target="__blank">research</a>
					on how to improve student learning outcomes in Pakistani schools.
				</div>
				<div className="para white">
					In response to the coronavirus pandemic that has forced schools to close,
					we have worked with schools, education technology partners and content
					creators to curate a huge library of digital educational resources so that Pakistani
					students can continue learning from home. Whether you prefer learning in Urdu or
					English, we bring you fun, engaging content through video lessons, games and quizzes.
					We encourage you to use this content and give us feedback through our discussion forum
				</div>
				<div className="para white">
					We are working towards becoming a trusted partner to an active
					community of over 100,000 schools that explore innovative products and
					services, engage in dialogue about best practices and share knowledge and experiences
					to learn from one another and grow as a sector. Together with innovators and dedicated
					education support providers, we dream of a bright future for the children of Pakistan.
				</div>
			</div>
		</div>
		{/* <div className="partition">
			<div className="info-container">
				<div className="heading">Our Mission</div>
				<div className="para">
					Our mission is to improve decision-making in
					Pakistan through evidence-based research, survey,
					analytics, executive education and advisory services.
				</div>
			</div>
		</div> */}
		<div className="partition">
			<div className="info-container">
				<div className="heading">Our Team</div>
				<div className="card-container">
					{
						ProjectTeam().map(({ url, name, position }) => <div className="card">
							<img crossOrigin="anonymous" className="icon" src={url} />
							<div className="title">{name}</div>
							<div className="subtitle">{position}</div>
						</div>)
					}
				</div>
			</div>
		</div>
		<div className="partition">
			<div className="info-container">
				<div className="heading">Our Partners</div>
				<div className="card-container">
					{
						Partners().map(({ url, name, info }) => <div className="card partner">
							<img crossOrigin="anonymous" className="icon" src={url} />
							<div className="title">{name}</div>
						</div>)
					}
				</div>
			</div>
		</div>
	</div>
}
export default AboutUs
