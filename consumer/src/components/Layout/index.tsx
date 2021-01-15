import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter, Link } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Button, makeStyles } from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import AccountCircle from '@material-ui/icons/AccountCircle'
import { Home } from '@material-ui/icons'
import { AppUserRole } from 'constants/app'


//@ts-ignore
import mis from '../../icons/mis.ico'
import { getColorsFromChapter } from '../../utils/getColorsFromChapter'

import './style.css'

type P = {
	auth: RootReducerState["auth"]
	client_id: string
	profile: RootReducerState["sync_state"]["profile"]
	children?: React.ReactNode
} & RouteComponentProps

const Layout: React.FC<P> = ({ children, auth, history, location, client_id, profile }) => {

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
		<StudentHeader
			goBack={history.goBack}
			push={history.push}
			auth={auth}
			lesson_meta={lesson_meta}
			client_id={client_id}
			profile={profile}
		/>
		<div className="body" style={{ width: "100%" }}>
			{children}
		</div>
	</div>
}

export default connect((state: RootReducerState) => ({
	auth: state.auth,
	client_id: state.client_id,
	profile: state.sync_state.profile
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
	profile: RootReducerState["sync_state"]["profile"]
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
	},
	logoutButtonBar: {
		backgroundColor: "white",
	},
	logoutBtn: {
		color: "#1BB4BB",
		fontWeight: 700,
		padding: "11px",
		gridColumnStart: 2,
		'&:hover': {
			backgroundColor: "#1BB4BB",
			color: "white",
		}
	},
	logoutButtonToolbar: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between"
	},
	guestUserHeading: {
		color: "#1BB4BB"
	},

}));

const StudentHeader: React.FC<SP> = ({ goBack, push, auth, lesson_meta, client_id, profile }) => {
	const classes = useStyles();

	const toHome = () => {
		if (auth.user === AppUserRole.SCHOOL) {
			push("/school")
			return
		}
		if (auth.user === AppUserRole.STUDENT || auth.user === AppUserRole.GUEST_STUDENT) {
			push("/student")
			return
		}

		if (auth.user === AppUserRole.TEACHER || auth.user === AppUserRole.GUEST_TEACHER) {
			push("/teacher")
			return
		}

		push("")
	}

	const toAccount = () => {
		if (auth.user === AppUserRole.SCHOOL) {
			push("/profile")
			return
		}

		if (auth.user === AppUserRole.TEACHER) {
			push("/teacher-profile")
			return
		}

		push("/student-profile")
	}

	const guestUserLogout = () => {
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

						{(auth.user === AppUserRole.SCHOOL || auth.user === AppUserRole.STUDENT || auth.user === AppUserRole.TEACHER) && <IconButton onClick={toAccount} edge="start" color="inherit" aria-label="menu">
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
							auth.user === AppUserRole.SCHOOL && <IconButton href={`https://mischool.pk/auto-login?id=${auth.id}&key=${auth.token}&cid=${client_id}&ref=${profile.refcode}`} edge="start" color="inherit" aria-label="menu">
								<img src={mis} style={{ height: "30px" }} alt="mis" />
							</IconButton>}

						<IconButton onClick={toHome} edge="start" color="inherit" aria-label="menu">
							<Home />
						</IconButton>

						{(auth.user === AppUserRole.SCHOOL || auth.user === AppUserRole.TEACHER || auth.user === AppUserRole.STUDENT) && <IconButton onClick={toAccount} edge="start" color="inherit" aria-label="menu">
							<AccountCircle />
						</IconButton>}
					</Toolbar>
			}
		</AppBar>
		{(auth.user === AppUserRole.GUEST_STUDENT || auth.user === AppUserRole.GUEST_TEACHER) && <AppBar className={classes.logoutButtonBar} position="static">
			{
				<Toolbar className={classes.logoutButtonToolbar}>
					<h2 className={classes.guestUserHeading} >Guest User</h2>
					<Button
						variant="text"
						disableRipple
						className={classes.logoutBtn}
						onClick={guestUserLogout}>
						LOGOUT
					</Button>
				</Toolbar>
			}
		</AppBar>}
	</>
}