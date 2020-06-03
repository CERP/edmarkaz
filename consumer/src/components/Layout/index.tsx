import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter, Link } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Button, makeStyles } from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import AccountCircle from '@material-ui/icons/AccountCircle'
import ExitToApp from '@material-ui/icons/ExitToApp'
import { Home } from '@material-ui/icons'

import { getColorsFromChapter } from '../../utils/getColorsFromChapter'

import './style.css'

type P = {
	auth: RootReducerState["auth"]
	children?: React.ReactNode
} & RouteComponentProps

const Layout: React.FC<P> = ({ children, auth, history, location }) => {

	const path = location.pathname.split("/") || []
	const isLessonPage = path.length === 7 && path.some(p => p === "library")
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
	box: {
		flexGrow: 1,
		alignSelf: "flex-end",
		height: "100px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center"
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	profileButton: {
		alignSelf: "flex-end"
	},
	title: {
		flexGrow: 1,
		fontSize: "1rem"
	},
	ExitButton: {
		fill: "white"
	}
}));

const StudentHeader: React.FC<SP> = ({ goBack, push, auth, lesson_meta }) => {

	const classes = useStyles()

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
		localStorage.removeItem("student-welcome")
		window.history.pushState(undefined, '', '/')
		window.location.reload()
	}

	return <>
		<AppBar position="static">
			{
				lesson_meta ?
					<Toolbar style={{ backgroundColor: `${getColorsFromChapter(lesson_meta && lesson_meta.chapter_name)}` }}>
						<IconButton onClick={() => goBack()} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
							<BackIcon />
						</IconButton>
						<Button
							color="inherit"
							variant="text"
							disableRipple
							className={classes.title}
							onClick={() => goBack()}>{`Class ${lesson_meta.grade}-${lesson_meta.subject}`}
						</Button>
						<IconButton onClick={toHome} edge="start" color="inherit" aria-label="menu">
							<Home />
						</IconButton>
						{
							(auth.user === "GUEST_STUDENT" || auth.user === "GUEST_TEACHER") && <IconButton onClick={guestLogout}>
								<ExitToApp className={classes.ExitButton} />
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

						<Button color="inherit" variant="text" disableRipple className={classes.title} component={Link} to="/"> ILMEXCHANGE </Button>

						<IconButton onClick={toHome} edge="start" color="inherit" aria-label="menu">
							<Home />
						</IconButton>
						{
							(auth.user === "GUEST_STUDENT" || auth.user === "GUEST_TEACHER") && <IconButton onClick={guestLogout}>
								<ExitToApp className={classes.ExitButton} />
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