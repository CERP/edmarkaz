import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Container, Typography, IconButton, Paper, TextField, Input, makeStyles, Theme, createStyles, Snackbar, Card, CardActionArea, CardMedia, CardContent, CardActions, Button } from '@material-ui/core'
import Copy from '@material-ui/icons/FileCopy'
import CloseIcon from '@material-ui/icons/Close';
//@ts-ignore
import mis from '../../../icons/mis.ico'

interface P {
	auth: RootReducerState["auth"]
	client_id: string
	profile: RootReducerState["sync_state"]["profile"]
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			padding: theme.spacing(2),
			margin: theme.spacing(1, 0),
			display: "flex",
			flexDirection: "column",
			justifyContent: "center"
		},
		container: {
			marginTop: theme.spacing(2)
		},
		"card-image": {
			objectFit: "contain"
		}
	})
)

const SchoolDashboard: React.FC<P> = ({ auth, client_id, profile }) => {
	// For snackbar
	const [open, setOpen] = useState(false)
	const { id, token } = auth
	const autoLoginLink = `https://mischool.pk/auto-login?id=${id}&key=${token}&cid=${client_id}&ref=${profile.refcode}`
	const refLink = `https://ilmexchange.com/student?referral=${id}`
	const classes = useStyles()

	const handleCopy = (value: string) => {
		const el = document.createElement("textarea")
		el.value = value
		el.setAttribute('readonly', '')
		document.body.appendChild(el)
		el.select()
		document.execCommand("copy");
		document.body.removeChild(el);
		setOpen(true)
	}

	const handleClose = () => setOpen(false)

	return <>
		<Container className={classes.container} maxWidth="md">
			<Paper elevation={0} className={classes.paper}>
				<Typography
					variant="h4"
					color="primary"
					align="center"
				>
					{`Welcome, ${profile.school_name}`}
				</Typography>
			</Paper>

			<Card>
				<CardActionArea href={autoLoginLink} >
					<CardMedia
						className={classes["card-image"]}
						component="img"
						alt="MiSchool"
						height="100"
						image={mis}
						title="MiSchool"
					/>
					<CardContent>
						<Typography gutterBottom variant="h5" component="h2">
							MiSchool
							</Typography>
						<Typography variant="body2" color="textSecondary" component="p">
							Use Mischool to enter data and keep track of each students progress, including assessments taken, lessons watched and much more.
						</Typography>
					</CardContent>
				</CardActionArea>
				<CardActions>
					<Button size="small" color="primary" href={autoLoginLink}>
						START
					</Button>
				</CardActions>
			</Card>
			<Paper className={classes.paper}>
				<Typography
					variant="h6"
					color="primary"
					align="left"
				>
					Student Link Without Tracking
				</Typography>
				<Input
					type="text"
					value={refLink}
					multiline
					disabled
					fullWidth
					disableUnderline
					endAdornment={
						<IconButton onClick={() => handleCopy(refLink)}>
							<Copy />
						</IconButton>
					}
				/>
			</Paper>
		</Container>
		<Snackbar
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'left',
			}}
			open={open}
			onClose={handleClose}
			autoHideDuration={2000}
			message="Copied"
			action={
				<IconButton size="small" color="inherit" onClick={handleClose}>
					<CloseIcon fontSize="small" />
				</IconButton>
			}
		/>
	</>
}


export default connect((state: RootReducerState) => ({
	auth: state.auth,
	client_id: state.client_id,
	profile: state.sync_state.profile
}))(SchoolDashboard)