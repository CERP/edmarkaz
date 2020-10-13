import React from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { CompetitionWinner, Winners } from 'constants/competition_winners'
import Header from '../../components/Header'
import { Button } from '@material-ui/core'

import './style.css'

const useStylesCard = makeStyles({
	root: {
		maxWidth: 420,
		margin: '1rem',
		padding: '0.5rem'
	},
	media: {
		height: 375,
	}
})

const useStylesCardContainer = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			marginTop: '2.5rem',
			display: 'flex',
			flexWrap: 'wrap',
			justifyContent: 'space-around',
			overflow: 'hidden',
			backgroundColor: theme.palette.background.paper,
		}
	})
)

const CompetitionWinners = () => {

	const classes = useStylesCardContainer()

	return (<>
		<Header path={"/"} />
		<div className="competition-winners">
			<Typography className="heading" gutterBottom variant="h3" color={"primary"} component="h2">
				14th August Competition Winners
			</Typography>
			<div className={classes.root}>
				{
					Winners.map((winner, index) => <MediaCard key={index} winner={winner} />)
				}
			</div>
		</div>
	</>)
}

type CardProps = {
	winner: CompetitionWinner
}

const MediaCard: React.FC<CardProps> = ({ winner }) => {

	const classes = useStylesCard()

	return (
		<Card className={classes.root}>
			<CardActionArea>
				<CardMedia
					className={classes.media}
					image={winner.drawing_url}
					title={winner.std_name}
				/>
				<CardContent>
					<Typography className="card-title" gutterBottom variant="h5" component="h2">
						{winner.std_name}
					</Typography>
					<Typography className="card-body" color="textSecondary" component="p">
						{winner.std_name} is student of class {winner.class} and studying at <span style={{ fontWeight: 'bold' }}>{winner.school}</span> which is situated in <span style={{ fontWeight: 'bold' }}>{winner.district}</span>.
					</Typography>
					<Button className="card-category" variant="text" color="primary">
						Category: {winner.category}
					</Button>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}

export { CompetitionWinners }
