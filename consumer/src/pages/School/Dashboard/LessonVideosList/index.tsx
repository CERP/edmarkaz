import React, { useMemo, useState } from 'react'
import moment from 'moment'

import { getTimeString } from 'utils/helper'

import SortDescendingIcon from 'icons/dashboard/react/SortDescending'
import SortAscendingIcon from 'icons/dashboard/react/SortAscending'
import CalendarIcon from 'icons/dashboard/react/Calendar'
import { PlayIcon } from 'icons/index'


type PropsType = {
	video_events: VideoEvents
	lessons: RootReducerState["lessons"]["db"]
}

const MostWatchedLessons: React.FC<PropsType> = ({ video_events, lessons }) => {

	const current_date = moment.now()

	const [toggleSortOrder, setToggleSortOrder] = useState(false)
	const [toggleCalendar, setToggleCalendar] = useState(false)
	const [classFilter, setClassFilter] = useState('')
	const [subjectFilter, setSubjectFilter] = useState('')
	const [dateFilter, setDateFilter] = useState<undefined | number>()

	const watched_lessons_data = useMemo(
		() => computeWatchedLessonsData(video_events, dateFilter, classFilter, subjectFilter),
		[video_events, dateFilter, classFilter, subjectFilter]
	)

	const [classes, subjects] = useMemo(
		() => getClassesAndSubjects(lessons),
		[lessons]
	)

	const sorted_entries = getSortedEntries(watched_lessons_data, toggleSortOrder)

	const hanleToggleCalender = () => {
		if (!toggleCalendar) {
			setDateFilter(current_date)
		} else {
			setDateFilter(undefined)
		}

		setToggleCalendar(!toggleCalendar)
	}

	const handleDateChange = (input_date: string) => {
		const date = moment(input_date, "YYYY-MM-DD").unix() * 1000
		setDateFilter(date)
	}

	return <div className="">
		<div className="row filter-container">
			<select onChange={(e) => setClassFilter(e.target.value)}>
				<option value="">Select Class</option>
				{
					classes
						.map(title => <option key={title} value={title}>Class {title}</option>)
				}
			</select>
			<select onChange={(e) => setSubjectFilter(e.target.value)}>
				<option value="">Select Subject</option>
				{
					[...subjects]
						.sort()
						.map(subject => <option key={subject}>{subject}</option>)
				}
			</select>
			<div className="toggle-actions-container">
				<div className="toggle-actions" onClick={() => setToggleSortOrder(!toggleSortOrder)} title="Sort Videos">
					{toggleSortOrder ? <SortAscendingIcon /> : <SortDescendingIcon />}
				</div>
				<div className="toggle-actions" onClick={hanleToggleCalender} title="Date">
					<CalendarIcon />
				</div>
			</div>
		</div>
		{toggleCalendar && <div className="filter-container calender">
			<input type="date"
				onChange={(e) => handleDateChange(e.target.value)}
				defaultValue={moment(dateFilter).format("YYYY-MM-DD")}
				max={moment(current_date).format("YYYY-MM-DD")} />
		</div>
		}
		<div className="container">
			{
				sorted_entries
					.map(([lesson_id, lesson_meta]) => (
						<div className="card" key={lesson_id}>
							<div className="card-row">
								<div className="card-row inner">
									<img src={PlayIcon} alt="play-icon" height="24" width="24" />
									<p className="card-title">{lesson_meta.chapter_name}</p>
								</div>
								<div style={{ marginLeft: "auto" }}>
									<p className="views viewer">{lesson_meta.watch_count} views</p>
								</div>
							</div>
							<div className="card-row">
								<p className="class-title">Class: {lesson_meta.grade}-{lesson_meta.subject}</p>
							</div>
							<div className="card-row">
								<div className="more-detail">
									<p>watch time: {getTimeString(lesson_meta.watch_time)}</p>
									<p className="hidden-views viewer"
										style={{ marginLeft: "auto" }}>
										{lesson_meta.watch_count} views</p>
								</div>
							</div>
						</div>
					))
			}
		</div>
	</div>
}

export default MostWatchedLessons

type ComputedLessonData = {
	[id: string]: {
		grade: string
		chapter_name: string
		subject: string
		watch_time: number
		watch_count: number
	}
}
type ComputeWatchedLessonsData = {

	(events: VideoEvents, date: undefined | number, class_title: string, subject: string): ComputedLessonData
}

const computeWatchedLessonsData: ComputeWatchedLessonsData = (events, date, class_title, subject) => {

	let lessons_data: ComputedLessonData = {}

	for (const [, event] of Object.entries(events)) {

		for (const [timestamp, meta] of Object.entries(event)) {

			const is_same_date = date ? moment(parseInt(timestamp)).isSame(moment(date), "day") : true

			if (is_same_date) {

				const { time, route } = meta

				const [, medium, grade, book, chapter_id, chapter_name] = route

				const lesson_id = [medium, grade, subject, chapter_id, meta.lesson_id].join("-")

				if ((subject ? book === subject : true) && (class_title ? grade === class_title : true)) {

					if (lessons_data[lesson_id]) {

						lessons_data[lesson_id] = {
							...lessons_data[lesson_id],
							watch_count: lessons_data[lesson_id].watch_count + 1,
							watch_time: lessons_data[lesson_id].watch_time + time,
						}
					} else {

						lessons_data[lesson_id] = {
							grade,
							chapter_name,
							subject: book,
							watch_count: 1,
							watch_time: time,
						}
					}
				}
			}
		}
	}

	return lessons_data
}

const getClassesAndSubjects = (lessons: PropsType["lessons"]) => {

	let classes_arr = []
	let subjects_arr = []

	for (const [, lesson_meta] of Object.entries(lessons)) {
		// get all classes for each medium
		classes_arr.push(...Object.keys(lesson_meta))

		for (const [, subjects] of Object.entries(lesson_meta)) {
			// get all subjects for each class
			subjects_arr.push(...Object.keys(subjects))
		}
	}

	// @ts-ignore
	return [[...new Set(classes_arr)], [...new Set(subjects_arr)]]
}

const getSortedEntries = (watched_lessons_data: ComputedLessonData, sortOrder: boolean) => {

	if (sortOrder) {
		return Object.entries(watched_lessons_data)
			.sort(([, a], [, b]) => a.watch_count - b.watch_count)
	}

	return Object.entries(watched_lessons_data)
		.sort(([, a], [, b]) => b.watch_count - a.watch_count)
}
