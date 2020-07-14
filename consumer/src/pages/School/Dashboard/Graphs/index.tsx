import React from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import { Card } from '@material-ui/core'

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
			<AppBar position="static" color="default">
				<Tabs
					value={value}
					onChange={handleChange}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="dashboard graph tabs"
				>
					<Tab label="Students Enrolled" icon={<StudentEnrollmentIcon />}  {...a11yProps(0)} />
					<Tab label="Recent Logins" icon={<RecentLoginActivityIcon />}  {...a11yProps(1)} />
					<Tab label="Recent Activity" icon={<RecentVideoActivityIcon />} {...a11yProps(2)} />
					<Tab label="Most viewed" icon={<TopWatchIcon />} {...a11yProps(3)} />
				</Tabs>
			</AppBar>
			<TabPanel value={value} index={0}>
				<Typography variant="h5" className={classes.heading}>No. of Students enrolled</Typography>
				<Card style={{ padding: "1.5rem" }}>
					<EnrollmentGraph events={signup_events} />
				</Card>
			</TabPanel>
			<TabPanel value={value} index={1}>
				<Typography variant="h5" className={classes.heading} >Recent Logins</Typography>
				<Card style={{ padding: "1.5rem" }}>
					<LoginActivityGraph video_events={video_events} assessment_events={assessment_events} />
				</Card>
			</TabPanel>
			<TabPanel value={value} index={2}>
				<Typography variant="h5" className={classes.heading} >Last week activity</Typography>
				<Card style={{ padding: "1.5rem" }}>
					<LessonActivityGraph video_events={video_events} />
				</Card>
			</TabPanel>
			<TabPanel value={value} index={3}>
				<Typography variant="h5" className={classes.heading} >Most viewed Videos</Typography>
				<Card style={{ padding: "1.5rem" }}>
					<MostWatchedLessons video_events={video_events} lessons={lessons} />
				</Card>
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

function a11yProps(index: any) {
	return {
		id: `scrollable-force-tab-${index}`,
		'aria-controls': `scrollable-force-tabpanel-${index}`,
	}
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