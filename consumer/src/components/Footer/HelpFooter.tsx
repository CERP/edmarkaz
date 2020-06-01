import React from 'react'
import Container from '@material-ui/core/Container'
import { Box, Grid, Button } from '@material-ui/core'
import { YouTube, Phone } from '@material-ui/icons'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'

type PropsType = {
	hlink?: string
}

const useStyles = makeStyles((theme) => ({
	main: {
		marginTop: theme.spacing(4),
	},
	heading6: {
		color: "#1bb4bb",
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1)
	},
	footer: {
		marginTop: 'auto',
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
	}
}));

const HelpFooter: React.FC<PropsType> = ({ hlink }) => {

	const classes = useStyles();

	return (
		<footer className={classes.footer}>
			<Container maxWidth="sm" className={classes.main}>
				<div style={{ marginLeft: "1.50rem", marginRight: "1.50rem" }}>
					<Typography
						className={classes.heading6}
						variant="h6">
						Need help?
					</Typography>
					<Grid container spacing={3}>
						<Grid item sm={6}>
							<Box width="1">
								<Button
									size="large"
									variant="outlined"
									className={classes.helpButton}
									startIcon={<YouTube style={{ fill: "red" }} />}>
									Watch Tutorial
						</Button>
							</Box>
						</Grid>
						<Grid item sm={6}>
							<Box width="1">
								<Link href={hlink} underline="none">
									<Button
										size="large"
										variant="outlined"
										className={classes.helpButton}
										startIcon={<Phone className={classes.phoneIcon} />}>
										Contact Us
								</Button>
								</Link>
							</Box>
						</Grid>
					</Grid>
				</div>
			</Container>
		</footer >
	)
}

export default HelpFooter