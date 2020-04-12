import React from 'react'
import { connect } from 'react-redux'
import { AppBar, Toolbar, IconButton, Typography, Button, makeStyles, Box } from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp'
import { Home } from '@material-ui/icons'

import './style.css'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { getColorsFromChapter } from '../../utils/getColorsFromChapter';

type P = {
	auth: RootReducerState["auth"]
	children?: React.ReactNode
} & RouteComponentProps

const Layout: React.FC<P> = ({ children, auth, history, match }) => {

	const path = history.location.pathname.split("/")
	const isLessonPage = path.length === 7 && path.find(p => p === "library")
	let lesson_meta = undefined

	if (isLessonPage) {
		lesson_meta = {
			chapter_name: path.pop(),
			chapter_id: path.pop(),
			subject: path.pop(),
			grade: path.pop()
		}
	}

	return <div className="layout-new">
		<StudentHeader goBack={history.goBack} push={history.push} auth={auth} lesson_meta={lesson_meta} />
		<div className="body" style={{ width: "100%" }}>
			{children}
		</div>
	</div>
}

export default connect((state: RootReducerState) => ({
	auth: state.auth
}), () => ({}))(withRouter(Layout))

interface SP {
	lesson_meta?: {
		chapter_name: string | undefined
		chapter_id: string | undefined
		subject: string | undefined
		grade: string | undefined
	}
	auth: RootReducerState["auth"]
	goBack: () => any
	push: (path: string, state?: any) => void
}

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	toolbar: {
		minHeight: 128,
		alignItems: 'flex-start',
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(2),
	},
	box: {
		flexGrow: 1,
		alignSelf: "flex-end",
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	profileButton: {
		alignSelf: "flex-end"
	},
	title: {
		flexGrow: 1,
	},
}));

const StudentHeader: React.FC<SP> = ({ goBack, push, auth, lesson_meta }) => {
	const classes = useStyles();

	const toHome = () => {
		if (auth.user === "SCHOOL") {
			push("/school")
			return
		}
		if (auth.user === "STUDENT" || auth.user === "GUEST_STUDENT") {
			push("/student")
			return
		}
		push("")
	}

	const toAccount = () => {
		if (auth.user === "SCHOOL") {
			push("/profile")
			return
		}

		push("/student-profile")
	}

	const guestLogout = () => {
		localStorage.removeItem("auth")
		window.history.pushState(undefined, '', '/')
		window.location.reload()
	}

	return <>
		<AppBar position="static">

			{
				lesson_meta ?
					<Toolbar className={classes.toolbar} style={{ backgroundColor: `${getColorsFromChapter(lesson_meta && lesson_meta.chapter_name)}` }}>
						<IconButton onClick={() => goBack()} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
							<BackIcon />
						</IconButton>

						<Box className={classes.box}>
							<Typography variant="subtitle1" className={classes.title}>
								{`Class ${lesson_meta.grade}-${lesson_meta.subject}`}
							</Typography>
							<Typography variant="h6" className={classes.title}>
								{`Unit ${lesson_meta.chapter_id}`}
							</Typography>
							<Typography variant="h5" className={classes.title}>
								{`${lesson_meta.chapter_name}`}
							</Typography>
						</Box>

						<IconButton onClick={toHome} edge="start" color="inherit" aria-label="menu">
							<Home />
						</IconButton>
						{
							(auth.user === "GUEST_STUDENT" || auth.user === "GUEST_TEACHER") && <IconButton onClick={guestLogout}>
								<ExitToApp />
							</IconButton>
						}

						{(auth.user === "SCHOOL" || auth.user === "STUDENT") && <IconButton onClick={toAccount} edge="start" color="inherit" aria-label="menu">
							<AccountCircle />
						</IconButton>}
					</Toolbar>
					:
					<Toolbar>
						<IconButton onClick={() => goBack()} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
							<BackIcon />
						</IconButton>

						<Typography variant="h6" className={classes.title}> ILMEXCHANGE </Typography>

						<IconButton onClick={toHome} edge="start" color="inherit" aria-label="menu">
							<Home />
						</IconButton>
						{
							(auth.user === "GUEST_STUDENT" || auth.user === "GUEST_TEACHER") && <IconButton onClick={guestLogout}>
								<ExitToApp />
							</IconButton>
						}

						{(auth.user === "SCHOOL" || auth.user === "STUDENT") && <IconButton onClick={toAccount} edge="start" color="inherit" aria-label="menu">
							<AccountCircle />
						</IconButton>}
					</Toolbar>
			}
		</AppBar>
	</>
}
// const TeacherHeader = () => {
// 	return <div className="teacher-header">

// 	</div>
// }
// const SchoolHeader = () => {
// 	return <div className="school-header">

// 	</div>
// }
