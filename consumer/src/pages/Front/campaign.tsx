import React, { useState, useEffect } from 'react'
import Header from 'components/Header'
import './style.css'


interface HC_QS {
	title: string,
	grade: string,
	subject: string,
	week: string,
	sub_qs: {
		[key: string]: string
	},
	ans: {
		[key: string]: string
	}
}

const qs_list: HC_QS[] = [
	{
		title: "Add:",
		grade: "3",
		subject: "Math",
		week: "1",
		sub_qs: {
			a: "2217 + 1323",
			b: "6781 + 2100",
			c: "4321 + 2744",
			d: "1150 + 3567"
		},
		ans: {
			a: "3540",
			b: "8881",
			c: "7065",
			d: "4717"
		}
	},
	{
		title: "Fill in the blanks with a, e, i, o, u:",
		grade: "3",
		subject: "English",
		week: "1",
		sub_qs: {
			a: "__pple",
			b: "__ce",
			c: "F__ __ d",
			d: "F__sh",
			e: "R__ pe",
			f: "Fl__w__r",
			g: "S__n"
		},
		ans: {
			a: "a",
			b: "a/i",
			c: "o,o",
			d: "i",
			e: "i",
			f: "o,e",
			g: "o/u"
		}
	},
	{
		title: "Add the following numbers:",
		grade: "4",
		subject: "Math",
		week: "1",
		sub_qs: {
			a: "62875 + 22187",
			b: "24073 + 8683",
			c: "98706 + 567",
		},
		ans: {
			a: "85062",
			b: "32756",
			c: "99273",
		}
	},
	{
		title: "Answer the following.",
		grade: "4",
		subject: "English",
		week: "1",
		sub_qs: {
			a: "Name one word that has the SHORT U sound:",
			b: "Name one word that has the LONG U sound",
		},
		ans: {
			a: "Jump, mug, sun, duck, bus, truck, plum, drum.",
			b: "Blue, cute, flew, grew, huge, bruise, do, fruit",
		}
	},
	{
		title: "Answer the following.",
		grade: "5",
		subject: "Math",
		week: "1",
		sub_qs: {
			a: "Sara has 55 buttons. Each button costs 5 rs. What is the total cost of the buttons?",
		},
		ans: {
			a: "55 * 5 =  Rs 275",
		}
	},
	{
		title: "Answer the following.",
		grade: "5",
		subject: "English",
		week: "1",
		sub_qs: {
			a: "List any three qualities of the father of the nation, Muhammad Ali Jinnah",
		},
		ans: {
			a: "Efficient, hard working, charismatic,",
		}
	},
	{
		title: "Answer the following questions.",
		grade: "6",
		subject: "Math",
		week: "1",
		sub_qs: {
			a: "HCF of 8 and 12",
			b: "HCF of 16 and 24"
		},
		ans: {
			a: "4",
			b: "8"
		}
	},
	{
		title: "Select the adjectives in each sentence.",
		grade: "6",
		subject: "English",
		week: "1",
		sub_qs: {
			a: "The building is very old.",
			b: "I like looking at the blue ocean.",
			c: "The homework was challenging but I finished it."
		},
		ans: {
			a: "old",
			b: "blue",
			c: "challenging"
		}
	},
	{
		title: "Find x.",
		grade: "7",
		subject: "English",
		week: "1",
		sub_qs: {
			a: "5x + 6 = 16",
			b: "7x – 8 = 13",
			c: "8x –17= 7"
		},
		ans: {
			a: "x=2",
			b: "x=3",
			c: "x=3"
		}
	},
	{
		title: "Find the common noun in the following sentences:",
		grade: "7",
		subject: "English",
		week: "1",
		sub_qs: {
			a: "He went home quickly.",
			b: "Ali is playing at the park.",
			c: "They are sitting in the classroom."
		},
		ans: {
			a: "Home",
			b: "Park",
			c: "Classroom"
		}
	}
]


export default () => {
	useEffect(() => {
		try {
			window.scroll({ top: 0, left: 0, behavior: "smooth" })
		}
		catch (e) {
			console.error(e)
		}
	})
	const [grade, set_grade] = useState("")
	const [week, set_week] = useState("")
	const [subject, set_subject] = useState("")

	const grades = Array.from(new Set(qs_list.map(q => q.grade)))

	return <>
		<div className="campaign front">
			<Header path={"/"} />
			<div className="partition">
				<div className="info-container">
					<div className="heading">Back To School SMS Program</div>
					<div className="ws-cont">
						<div className="select-row">
							<select onChange={(e) => set_week(e.target.value)}>
								<option value="">Week</option>
								<option value="1">Week 1</option>
							</select>
							<select onChange={(e) => set_subject(e.target.value)}>
								<option value="">Subject</option>
								<option value="English">English</option>
								<option value="Math">Math</option>
							</select>
							<select onChange={(e) => set_grade(e.target.value)}>
								<option value="">Grade</option>
								{
									grades.map(g => <option value={g} key={g}>{`Class ${g}`}</option>)
								}
							</select>
						</div>
						<div className="qs-cont" >
							{
								qs_list
									.filter(q =>
										(grade ? q.grade === grade : true) &&
										(subject ? q.subject === subject : true) &&
										(week ? q.week === week : true)
									)
									.map((q, index) => {
										return <div className="qs-card" key={index}>
											<div className="qs">{`Q: ${q.title}`}</div>
											<ol type="a">
												{
													Object.entries(q.sub_qs)
														.map(([key, val]) => <li style={{ textAlign: "left", padding: "5px" }}>
															<div style={{ textAlign: "left" }}>{`${val} `} </div>
															<div><span style={{ fontWeight: "bold" }}>Answer: <u>{q.ans[key]}</u></span></div>
														</li>)
												}
											</ol>
										</div>
									})
							}

						</div>

					</div>
				</div>
			</div>
		</div>
	</>

}
