import React from 'react'
import Container from '@material-ui/core/Container'
import { Box, Grid, Button } from '@material-ui/core'
import { YouTube, Phone, Facebook } from '@material-ui/icons'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

type PropsType = {
	hlink?: string
}

const useStyles = makeStyles((theme) => ({
	main: {
		padding: "unset"
	},
	heading6: {
		color: "#1bb4bb",
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1)
	},
	footer: {
		left: 0,
		right: 0,
		bottom: 0,
		padding: theme.spacing(1),
		position: "fixed",
		backgroundColor:
			theme.palette.type === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
	},
	helpButton: {
		background: 'white',
		color: 'black',
		fontWeight: 'bold',
		borderRadius: "8px"
	},
	phoneIcon: {
		fill: 'white',
		background: '#4fce5d',
		borderRadius: '50%'
	},
	fbIcon: {
		fill: '#385898'
	}
}));

// const handleFbUrl = () => {
// 	setTimeout(() => {
// 		window.location.href = "https://web.facebook.com/groups/ilmexchangediscussionforum/"
// 	}, 25);
// 	window.location.href = "fb://groups/ilmexchangediscussionforum/";
// }

const HelpFooter: React.FC<PropsType> = ({ hlink }) => {

	const classes = useStyles();
	const fbLink = "https://web.facebook.com/groups/ilmexchangediscussionforum/"

	return (
		<footer className={classes.footer}>
			<Container maxWidth="md" className={classes.main}>
				<div style={{ marginLeft: "1.50rem", marginRight: "1.50rem" }}>
					<Grid container spacing={0} alignItems="center" justify="center">
						<Grid item xs={12} sm={3}>
							<Typography
								className={classes.heading6}
								variant="h6">
								Need help?
							</Typography>
						</Grid>
						<Grid container item xs={12} sm={9} spacing={1} justify="center">
							<Grid item xs={6} sm={3}>
								<Button
									size="medium"
									variant="outlined"
									className={classes.helpButton}
									startIcon={<YouTube style={{ fill: "red" }} />}
								> Tutorial </Button>
							</Grid>
							<Grid item xs={6} sm={3}>
								<Button
									size="medium"
									variant="outlined"
									className={classes.helpButton}
									startIcon={<Phone className={classes.phoneIcon} />}
									href={hlink}
								> Contact Us </Button>
							</Grid>
							<Grid item xs={12} sm={3}>
								<Button
									size="medium"
									variant="outlined"
									className={classes.helpButton}
									startIcon={<Facebook className={classes.fbIcon} />}
									href={fbLink}
								> Discussion </Button>
							</Grid>
						</Grid>
					</Grid>
				</div>
			</Container>
		</footer >
	)
}

export default HelpFooter