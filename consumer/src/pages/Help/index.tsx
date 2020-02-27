import React, { useState } from 'react'
import DownArrow from './icons/downArrow.svg'
import "./style.css"

const answer = (question: number) => {

	switch (question) {
		case 1:
			return <div className="answer">
				<h3>There are two ways to order products on the IlmExchange Platform. </h3>
				<li>
					Go to our website or mobile app. Choose the category, supplier and product you want, and click the
					‘Request Information’ Button. The IlmExchange team will call you back within 2 business hours, confirm
					your order, and notify the supplier to send you a demo or dispatch the materials.
				</li>
				<li>
					Call our Helpline at this number <a href="tel:0348-1119-119">0348-1119-119</a>.
					Let our representative know what you would like to order or request a demo for
				</li>
			</div>
		case 2:
			return <div className="answer">
				<h3>For one BIG reason. We work for YOU. We:</h3>
				<li>offer more variety of products than you will find anywhere else, including products that are not easily available;</li>
				<li>guarantee high quality products from known suppliers;</li>
				<li>offer very LOW PRICES, for the best products;</li>
				<li>provide convenient, door step demos and delivery;</li>
				<li>guarantee excellent customer service. You can call us anytime, for any reason</li>
			</div>
		case 3:
			return <div className="answer">
				<div>For many products, we offer free demos and even trial periods. Someone from our team will contact you directly and show you the product in detail. Then you can decide whether it is appropriate for your school.</div>
			</div>
		case 4:
			return <div className="answer">
				<div>You can call our helpline <a href="tel:0348-1119-119">0348-1119-119</a> at any time. Someone will walk you through the process. </div>
			</div>
		case 5:
			return <div className="answer">
				<div>When an order is confirmed with the supplier, they will collect payment from you by cash or cheque.</div>
			</div>
		case 6:
			return <div className="answer">
				<div>Yes, absolutely. As long as the sales rep can confirm he represents IlmExchange with a business card and our product catalogue, you can trust him to give you reliable information and provide information.</div>
			</div>
		case 7:
			return <div className="answer">
				<div>Yes! We guarantee that we will not give your school’s information to anyone else.</div>
			</div>
		default:
			break;
	}
}


export default () => {

	const [selectedQuestion, setSelectedQuestion] = useState(0)

	return <div className="help-page">

		<div className="q-bar" onClick={() => selectedQuestion !== 1 ? setSelectedQuestion(1) : setSelectedQuestion(0)}>
			<div className="q-title"> How can I order a product on IlmExchange?</div>
			<div className={`q-img ${selectedQuestion === 1 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 1 && answer(selectedQuestion)
		}

		<div className="q-bar" onClick={() => selectedQuestion !== 2 ? setSelectedQuestion(2) : setSelectedQuestion(0)}>
			<div className="q-title"> Why should I order things from IlmExchange instead of buying them from somewhere else?</div>
			<div className={`q-img ${selectedQuestion === 2 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 2 && answer(selectedQuestion)
		}

		<div className="q-bar" onClick={() => selectedQuestion !== 3 ? setSelectedQuestion(3) : setSelectedQuestion(0)}>
			<div className="q-title"> What if I want to see a product before ordering it? </div>
			<div className={`q-img ${selectedQuestion === 3 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 3 && answer(selectedQuestion)
		}

		<div className="q-bar" onClick={() => selectedQuestion !== 4 ? setSelectedQuestion(4) : setSelectedQuestion(0)}>
			<div className="q-title"> What if I need help in the ordering process?</div>
			<div className={`q-img ${selectedQuestion === 4 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 4 && answer(selectedQuestion)
		}

		<div className="q-bar" onClick={() => selectedQuestion !== 5 ? setSelectedQuestion(5) : setSelectedQuestion(0)}>
			<div className="q-title"> How do I pay for products?</div>
			<div className={`q-img ${selectedQuestion === 5 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 5 && answer(selectedQuestion)
		}

		<div className="q-bar" onClick={() => selectedQuestion !== 6 ? setSelectedQuestion(6) : setSelectedQuestion(0)}>
			<div className="q-title"> Can I trust the IlmExchange Sales Rep who comes to my school?</div>
			<div className={`q-img ${selectedQuestion === 6 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 6 && answer(selectedQuestion)
		}

		<div className="q-bar" onClick={() => selectedQuestion !== 7 ? setSelectedQuestion(7) : setSelectedQuestion(0)}>
			<div className="q-title"> Is my school’s information safe with IlmExchange?</div>
			<div className={`q-img ${selectedQuestion === 7 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 7 && answer(selectedQuestion)
		}
		<div className="q-bar" onClick={() => selectedQuestion !== 8 ? setSelectedQuestion(8) : setSelectedQuestion(0)}>
			<div className="q-title">What is my device ID?</div>
			<div className={`q-img ${selectedQuestion === 8 ? "rot" : ""}`} style={{ backgroundImage: `url(${DownArrow})` }} />
		</div>
		{
			selectedQuestion === 8 && localStorage.getItem("client_id")
		}

	</div>
}