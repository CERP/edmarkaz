import React from 'react'
import { connect } from 'react-redux'
import { AppBar, Toolbar, IconButton, Typography, Button, makeStyles, Box } from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp'
import { Home } from '@material-ui/icons'

//@ts-ignore
import mis from '../../icons/mis.ico'
import './style.css'
import { RouteComponentProps, withRouter, Link } from 'react-router-dom'
import { getColorsFromChapter } from '../../utils/getColorsFromChapter';

type P = {
	auth: RootReducerState["auth"]
	client_id: string
	children?: React.ReactNode
} & RouteComponentProps

const Layout: React.FC<P> = ({ children, auth, history, location, client_id }) => {

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
		<StudentHeader goBack={history.goBack} push={history.push} auth={auth} lesson_meta={lesson_meta} client_id={client_id} />
		<div className="body" style={{ width: "100%" }}>
			{children}
		</div>
	</div>
}

export default connect((state: RootReducerState) => ({
	auth: state.auth,
	client_id: state.client_id
}), () => ({}))(withRouter(Layout))

interface SP {
	lesson_meta?: {
		chapter_name: string | undefined
		chapter_id: string | undefined
		subject: string | undefined
		grade: string | undefined
	}
	auth: RootReducerState["auth"]
	client_id: string
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
}));

const StudentHeader: React.FC<SP> = ({ goBack, push, auth, lesson_meta, client_id }) => {
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
		localStorage.removeItem("student-welcome")
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
							<Typography align="center" variant="subtitle1" className={classes.title}>
								{`Class ${lesson_meta.grade}-${lesson_meta.subject}`}
							</Typography>
							<Typography align="center" variant="h6" className={classes.title}>
								{`Unit ${lesson_meta.chapter_id}`}
							</Typography>
							<Typography align="center" variant="h5" className={classes.title}>
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

						<Button color="inherit" variant="text" disableRipple className={classes.title} component={Link} to="/"> ILMEXCHANGE </Button>

						{
							auth.user === "SCHOOL" && <IconButton href={`https://localhost:3001/auto-login?id=${auth.id}&key=${auth.token}&cid=${client_id}`} edge="start" color="inherit" aria-label="menu">
								<img src={mis} style={{ height: "30px" }} />
							</IconButton>}

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
