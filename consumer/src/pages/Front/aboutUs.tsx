import React from 'react'
import Header from '../../components/Header'

const AboutUs = () => {
	const ProjectTeam = () => ([
		{
			position: "Principal Investigator",
			url: "https://storage.googleapis.com/ilmx-product-images/asimk-min.jpg",
			name: "Asim Khwaja"
		},
		{
			position: "LEAPS Director",
			url: "https://storage.googleapis.com/ilmx-product-images/aboutzainab.jpg",
			name: "Zainab Qureshi"
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
			position: "Field Manager",
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
			url: "https://storage.googleapis.com/ilmx-product-images/bluelogo-1.png",
			name: "Oxford University Press",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/tcf%20logo.png",
			name: "The Citizens Foundation",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/dil%20new.png",
			name: "Developments in Literacy",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/Alif%20Laila.jpg",
			name: "Alif Laila Book Bus Society",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/ilm.png",
			name: "Ilm Association",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/Sabaq%20logo.png",
			name: "Sabaq Muse",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/edkasa%20new%20logo.png",
			name: "EdKasa",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/AzCorp%20Logo%20-%20New.png",
			name: "AZ Corp",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/Radec.png",
			name: "Radec",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/kp%20logo%20new.png",
			name: "Knowledge Platform",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/jp%20logo.png",
			name: "Javed Publishers",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/KASHFLOGO-High%20Res.jpg",
			name: "Kashf Foundation",
			info: ""
		},
		{
			url: "https://storage.googleapis.com/ilmx-product-images/Finca%20Updated%20Logo%20right.jpg",
			name: "Finca",
			info: ""
		},

		{
			url: "https://storage.googleapis.com/ilmx-product-images/jsbank.png",
			name: "JS Bank",
			info: ""
		}
	])

	return <div className="front about-us">
		<Header path={"/about-us"} />
		<div className="partition bg-teal">
			<div className="info-container">
				<div className="heading white">Our Story</div>
				<div className="para white">
					Ilm Exchange is a digital education platform that connects schools,
					teachers and students with affordable resources to enable quality
					teaching and learning across Pakistan. Our long-term vision is to become
					Pakistan’s premier education hub that brings together stakeholders across
					the education ecosystem — from school leaders to service providers and
					financers to researchers and policymakers. Our underlying goal is to nurture
					innovation and improve education quality at the system level.
				</div>
				<div className="para white">
					Ilm Exchange has been created by a part of the <a href="https://www.google.com/url?q=https://epod.cid.harvard.edu/initiative/leaps-program&sa=D&ust=1586116228054000&usg=AFQjCNFgHnauCjI1el6pNHmk9r9mjUAkqw" target="__blank">LEAPS</a> (Learning and Educational Achievements in
					Pakistan Schools) team at the Centre for Economic Research in Pakistan (<a href="https://www.cerp.org.pk/" target="__blank">CERP</a>).
					The project is built on findings from two decades of rigorous empirical <a href="https://www.google.com/url?q=https://epod.cid.harvard.edu/initiative/leaps-program&sa=D&ust=1586116228054000&usg=AFQjCNFgHnauCjI1el6pNHmk9r9mjUAkqw" target="__blank">research</a>
					on how to improve student learning outcomes in Pakistani schools.
				</div>
				<div className="para white">
					In response to the Covid-19 pandemic that has forced schools to close,
					we have worked with schools, education technology partners and content
					creators to curate a library of digital resources so that students can
					continue learning from home. Whether you prefer learning in Urdu or English,
					we bring you fun, engaging content through video lessons, games and quizzes.
					We encourage you to use this content and give us feedback through our discussion
					forum.
				</div>
				<div className="para white">
					We are working towards becoming a trusted partner to an active community
					of over 100,000 schools that explore innovative products and services,
					engage in dialogue about best practices and share knowledge and experiences
					to learn from one another and grow as a sector. Together with innovators and
					dedicated education support providers, we dream of a bright future for the
					children of Pakistan.
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
		<div className="partition bg-orange">
			<div className="info-container">
				<div className="heading">Our Team</div>
				<div className="card-container">
					{
						ProjectTeam().map(({ url, name, position }) => <div className="card">
							<img crossOrigin="anonymous" className="icon" src={url} alt={name} />
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
						Partners().map(({ url, name }) => <div className="card partner">
							<img crossOrigin="anonymous" className="icon" src={url} alt={name} />
							<div className="title">{name}</div>
						</div>)
					}
				</div>
			</div>
		</div>
		<div className="partition">
			<div className="info-container">
				<div className="heading">Contact Us</div>
				<ul style={{ textAlign: "left" }}>
					<li style={{ marginBottom: "10px" }}><b>Address:</b> <a href="https://maps.app.goo.gl/cDmhLohH8tGYxDbJ6" target="__blank">29-P, Mushtaq Ahmed Gurmani Road Gulberg II, Lahore - Pakistan</a> </li>
					<li><b>Helpline:</b> <a href="tel:+923481119119">0348-1119119</a></li>
				</ul>
			</div>
		</div>
	</div>
}
export default AboutUs
