import React, { useState } from 'react'
import { RadioGroup, FormControlLabel, Radio, Typography, Paper, Button } from '@material-ui/core'

import Done from '@material-ui/icons/AssignmentTurnedIn'
import Quit from '@material-ui/icons/Close'

interface Props {
	path: string
	data: {}
	assessment: ILMXAssessment | undefined
	submitAssessment: (path: string, score: number, total_score: number, assessment_meta: any) => void
	quit: () => void
}

const AssessmentForm: React.FC<Props> = ({ assessment, path, data, quit, submitAssessment }) => {
	const [responses, setResponse] = useState<{ [id: string]: string }>({})
	const [submitted, setSubmitted] = useState(false)
	const [meta, setMeta] = useState(data)

	const chooseAnswer = (question_id: string, answer_id: string) => {
		setResponse({
			...responses,
			[question_id]: answer_id
		})
	}

	const submitQuiz = () => {
		if (!window.confirm("Are you sure you want to submit? You won't be able to change your responses once submitted.")) {
			return
		}
		if (assessment !== undefined) {
			const total_marks = Object.keys(assessment.questions).length
			let obtained_marks = 0

			const wrong_responses = Object.entries(assessment.questions)
				.reduce((agg, [q_id, question]) => {
					const correct_ans = Object.entries(question.answers).find(([a_id, ans]) => responses[q_id] === a_id && ans.correct_answer)
					if (!Boolean(correct_ans)) {
						return {
							...agg,
							[q_id]: true
						}
					}
					return agg
				}, {} as { [id: string]: boolean })

			setMeta({
				...meta,
				wrong_responses
			})

			submitAssessment(path, obtained_marks, total_marks, meta)
			setSubmitted(true)
		}
	}

	const quitAssessment = () => {
		if (!submitted && !window.confirm("Are you sure you want to quit? Your responses will be discarded.")) {
			return
		}
		quit()
	}

	return <div className="assessment-form">

		<Typography
			variant="h4"
			color="primary"
			align="center"
		>
			Choose the correct answer !
		</Typography>

		<div style={{ overflow: "auto", height: "100%" }}>
			{
				Object.entries((assessment && assessment.questions) || {})
					.map(([qid, qs]) => {
						return <Paper elevation={2} key={qid} style={submitted && responses[qid] === undefined ? { margin: "5px", padding: "20px", border: "1px solid red" } : { margin: "5px", padding: "20px" }}>
							<div className="qs-row">
								<Typography
									variant="h6"
									color="textPrimary"
									align="left"
								>
									{qs.title ? `Qs: ${(qs.title || "").replace("$", "______")}` : qs.title_urdu}
								</Typography>
								{
									qs.image !== "" && <img className="qs-img" src={qs.image} alt="qs-img" />
								}
							</div>

							<RadioGroup value={responses[qid] || ""}>
								{
									Object.entries(qs.answers).map(([aid, ans]) => {
										return <div className="ans-row" key={`${qid}-${aid}`}>
											<FormControlLabel
												className="ans-statement"
												style={submitted && ans.correct_answer ? { border: "2px solid green" } : submitted && !ans.correct_answer && responses[qid] === aid ? { border: "2px solid red" } : {}}
												onChange={() => chooseAnswer(qid, aid)}
												value={aid}
												control={<Radio />}
												label={ans.answer}
												disabled={submitted}
											/>
											{
												ans.image !== "" && <img className="ans-img" src={ans.image} alt="ans-img" />
											}
										</div >
									})
								}
							</RadioGroup>
						</Paper>
					})
			}
		</div>
		{!submitted && <Button
			variant="contained"
			size="medium"
			startIcon={<Done />}
			color="primary"
			onClick={submitQuiz}
			style={{ margin: "5px" }}
		>
			Submit
		</Button>}
		<Button
			variant="contained"
			size="medium"
			startIcon={<Quit />}
			color="secondary"
			onClick={quitAssessment}
			style={{ margin: "5px" }}
		>
			Quit
		</Button>
	</div>
}

export default AssessmentForm
