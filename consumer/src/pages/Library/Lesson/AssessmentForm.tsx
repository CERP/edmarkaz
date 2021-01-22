import React, { useState } from 'react'
import { RadioGroup, FormControlLabel, Radio, Typography, Paper, Button } from '@material-ui/core'

import Done from '@material-ui/icons/AssignmentTurnedIn'
import Quit from '@material-ui/icons/Close'
interface Props {
	assessment?: ILMXAssessment
	submitAssessment: (attemptedAssessment: AttemptedAssessment) => void
	quit: () => void
}
/**
 * Todo:
 *  Needs a Timer
 *  Maybe attempt restriction
 *  Need to handle questions with images
 *  .
 *  .
 *  .
 * can only think of these right now
 */

const AssessmentForm: React.FC<Props> = ({ assessment, quit, submitAssessment }) => {
	const [responses, setResponse] = useState<{ [id: string]: string }>({})
	const [submitted, setSubmitted] = useState(false)

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

			const attemptedResponse = Object.entries(assessment.questions)
				.reduce<AttemptedAssessment>((agg, [q_id, question]) => {
					const is_correct = Object.entries(question.answers).find(([a_id, ans]) => responses[q_id] === a_id && ans.correct_answer) ? true : false
					return {
						...agg,
						[q_id]: {
							correct: is_correct
						}
					}
				}, {})


			submitAssessment(attemptedResponse)
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

		{/* <Paper elevation={2} style={{ margin: "5px", padding: "20px" }}>
			<Typography variant="subtitle1" style={{ marginTop: "5px" }}>
				{`Time-Left: `}
			</Typography>
		</Paper> */}

		<div style={{ overflow: "auto", height: "100%" }}>
			{
				Object.entries((assessment && assessment.questions) || {})
					.filter(([qid, qs]) =>  qs.title_urdu || qs.title)
					.map(([qid, qs]) => {
						return <Paper elevation={2} key={qid} style={submitted && responses[qid] === undefined ? { margin: "5px", padding: "20px", border: "1px solid red" } : { margin: "5px", padding: "20px" }}>
							<div className="qs-row" style={{ alignItems: qs.title_urdu ? 'flex-end' : 'flex-start' }}>
								<Typography
									variant="h6"
									color="textPrimary"
									align={qs.title_urdu ? 'right' : 'left' }
									style={{direction: qs.title_urdu ? 'rtl' : 'ltr'}}
								>
									{qs.title ? `Qs: ${(qs.title || "").replace("$", "______")}` : qs.title_urdu}
								</Typography>
								{
									qs.image !== "" && <img className="qs-img" src={qs.image} alt="qs-img" />
								}
							</div>

							<RadioGroup value={responses[qid] || ""}>
								{
									Object.entries(qs.answers)
										.filter(([aid, ans]) =>  ans.answer || ans.urdu_answer)
										.map(([aid, ans]) => {
											return <div className="ans-row" key={`${qid}-${aid}`} 	style={{direction: ans.urdu_answer ? 'rtl' : 'ltr'}}>
												<FormControlLabel
													className="ans-statement"
													style={submitted && ans.correct_answer ? { border: "2px solid green" } : submitted && !ans.correct_answer && responses[qid] === aid ? { border: "2px solid red" } : {}}
													onChange={() => chooseAnswer(qid, aid)}
													value={aid}
													control={<Radio />}
													label={ans.answer || ans.urdu_answer}
													disabled={submitted}
												/>
												{
													ans.image !== "" && <img className="ans-img" src={ans.image} alt="ans-img" />
												}
											</div >
									})
								}
							</RadioGroup>
							{/* <Divider /> */}
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
