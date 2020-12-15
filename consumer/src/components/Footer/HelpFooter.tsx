import React, { useState, useEffect } from 'react'
import Container from '@material-ui/core/Container'
import { Grid, Button } from '@material-ui/core'
import { YouTube, Phone, Facebook } from '@material-ui/icons'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '../../components/Modal'
import { getIDFromYoutbeLink } from 'utils/getIdFromYoutubeLink'
import Youtube from 'react-youtube'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
		zIndex: 1,
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
	},
	footerHeadingDiv: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	expandLessIcon: {
		float: 'right',
		color: '#1BB4BB',
		padding: '10px'
	}
}));

// const handleFbUrl = () => {
// 	setTimeout(() => {
// 		window.location.href = "https://web.facebook.com/groups/ilmexchangediscussionforum/"
// 	}, 25);
// 	window.location.href = "fb://groups/ilmexchangediscussionforum/";
// }

// eslint-disable-next-line
const isYoutubeUrl = (link: string) => Boolean(link.match("^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+"))

const HelpFooter: React.FC<PropsType> = ({ hlink }) => {

	const classes = useStyles();
	const fbLink = "https://web.facebook.com/groups/ilmexchangediscussionforum/"
	const [showModal, setShowModal] = useState(false);
	const [toggleFooter, setToggleFooter] = useState(false);
	const [width, setWidth] = useState(window.innerWidth)

	useEffect(() => {
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	})

	const pathname = window.location.pathname;

	const getYoutubeTutorialLink = (pathname: any) => {
		switch (pathname) {
			case "/log-in":
				return "https://www.youtube.com/embed/1EUc5qCODpo"
			default:
				return "https://www.youtube.com/embed/Yr-LY1T32Zo"
		}
	}

	const relevantTutorial = () => {
		setShowModal(true)
	}

	const onBack = () => {
		setShowModal(false)
	}

	const handleResize = () => {
		setWidth(window.innerWidth)
	}

	const expandMore = () => {
		setToggleFooter(!toggleFooter)
	}

	return (
		<>
			{width <= 425 ? <footer className={classes.footer}>
				{showModal ? <Modal >
					<div className="modal-box video-modal">
						{
							isYoutubeUrl(getYoutubeTutorialLink(pathname)) ? <Youtube
								videoId={getIDFromYoutbeLink(getYoutubeTutorialLink(pathname))}
								className={'iframe'}
								opts={{
									width: "100%",
									height: "100%",
									playerVars: {
										rel: 0,
										showinfo: 0,
										autoplay: 1
									}

								}} />
								:
								<video className="iframe" src={getYoutubeTutorialLink(pathname)} controls autoPlay>
									your browser doesnt support html video, please update it and use chrome for best experience.
					</video>
						}
						<div className="button" style={{ marginTop: '5px', backgroundColor: "#f05967" }} onClick={() => onBack()}>Back</div>
					</div>
				</Modal> : null}
				<Container maxWidth="md" className={classes.main}>
					<div style={{ marginLeft: "1.50rem", marginRight: "1.50rem" }}>
						<Grid container spacing={0} alignItems="center" justify="center">
							<Grid item xs={12} sm={3}>
								<div className={classes.footerHeadingDiv}>
									<Typography
										className={classes.heading6}
										variant="h6">
										Need help?
									</Typography>
									{
										toggleFooter ? <ExpandMoreIcon className={classes.expandLessIcon} onClick={expandMore} /> : <ExpandLessIcon className={classes.expandLessIcon} onClick={expandMore} />
									}
								</div>
							</Grid>
							{toggleFooter ? <Grid container item xs={12} sm={9} spacing={1} justify="center">
								<Grid item xs={12} sm={3}>
									<Button
										size="medium"
										variant="outlined"
										className={classes.helpButton}
										startIcon={<YouTube style={{ fill: "red" }} />}
										onClick={relevantTutorial}
									> Tutorial </Button>
								</Grid>
								<Grid item xs={12} sm={3}>
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
								: null}
						</Grid>
					</div>
				</Container>
			</footer > : <footer className={classes.footer}>
					{showModal ? <Modal >
						<div className="modal-box video-modal">
							{
								isYoutubeUrl(getYoutubeTutorialLink(pathname)) ? <Youtube
									videoId={getIDFromYoutbeLink(getYoutubeTutorialLink(pathname))}
									className={'iframe'}
									opts={{
										width: "100%",
										height: "100%",
										playerVars: {
											rel: 0,
											showinfo: 0,
											autoplay: 1
										}

									}} />
									:
									<video className="iframe" src={getYoutubeTutorialLink(pathname)} controls autoPlay>
										your browser doesnt support html video, please update it and use chrome for best experience.
					</video>
							}
							<div className="button" style={{ marginTop: '5px', backgroundColor: "#f05967" }} onClick={() => onBack()}>Back</div>
						</div>
					</Modal> : null}
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
									<Grid item xs={12} sm={3}>
										<Button
											size="medium"
											variant="outlined"
											className={classes.helpButton}
											startIcon={<YouTube style={{ fill: "red" }} />}
											onClick={relevantTutorial}
										> Tutorial </Button>
									</Grid>
									<Grid item xs={12} sm={3}>
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
				</footer >}
		</>
	)
}

export default HelpFooter