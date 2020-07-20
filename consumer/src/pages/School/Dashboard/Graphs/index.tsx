import React from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'

import EnrollmentGraph from './enrollmentGraph'
import LoginActivityGraph from './loginActivityGraph'
import LessonActivityGraph from './lessonActivityGraph'
import MostWatchedLessons from '../LessonVideosList'

import {
	RecentVideoActivityIcon,
	RecentLoginActivityIcon,
	StudentEnrollmentIcon,
	TopWatchIcon
} from 'icons/dashboard/icons'

import './style.css'

interface TabPanelProps {
	children?: React.ReactNode
	index: any
	value: any
}

interface PropsType {
	lessons: RootReducerState["lessons"]["db"]
	analytics_events: RootReducerState["analytics_events"]
}

const DashboardGraphs: React.FC<PropsType> = ({ analytics_events, lessons }) => {

	const classes = useStyles()
	const [value, setValue] = React.useState(0)

	const { signup_events, video_events, assessment_events } = analytics_events

	const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setValue(newValue)
	}

	return (<>
		<div className={`${classes.dashboardGraph} dashboard-graphs`}>
			<AppBar color="transparent" elevation={0} position="static">
				<Tabs
					value={value}
					onChange={handleChange}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="dashboard graph tabs"
				>
					<Tab label="Students Enrolled" icon={<StudentEnrollmentIcon />} />
					<Tab label="Recent Logins" icon={<RecentLoginActivityIcon />} />
					<Tab label="Recent Activity" icon={<RecentVideoActivityIcon />} />
					<Tab label="Most viewed" icon={<TopWatchIcon />} />
				</Tabs>
			</AppBar>
			<TabPanel value={value} index={0}>
				<Typography color="textSecondary" variant="h5" className={classes.heading}>No. of Students enrolled</Typography>
				<EnrollmentGraph events={signup_events} />
			</TabPanel>
			<TabPanel value={value} index={1}>
				<Typography color="textSecondary" variant="h5" className={classes.heading} >Recent Logins</Typography>
				<LoginActivityGraph video_events={video_events} assessment_events={assessment_events} />
			</TabPanel>
			<TabPanel value={value} index={2}>
				<Typography color="textSecondary" variant="h5" className={classes.heading} >Last week activity</Typography>
				<LessonActivityGraph video_events={video_events} />
			</TabPanel>
			<TabPanel value={value} index={3}>
				<Typography color="textSecondary" variant="h5" className={classes.heading} >Most viewed Videos</Typography>
				<MostWatchedLessons video_events={video_events} lessons={lessons} />
			</TabPanel>
		</div>
	</>)
}

export default DashboardGraphs

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-force-tabpanel-${index}`}
			aria-labelledby={`scrollable-force-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box mt={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	)
}


const useStyles = makeStyles((theme: Theme) => ({
	dashboardGraph: {
		flexGrow: 1,
		width: '100%',
		backgroundColor: theme.palette.background.paper,
	},
	heading: {
		margin: "0.75rem 0rem"
	}
}))