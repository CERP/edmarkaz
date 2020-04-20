import React, { useEffect, useState } from 'react'
import { getLessons } from '../../actions';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import LoadingIcon from '../../icons/load.svg'
import { getIconsFromSubject } from '../../utils/getIconsFromSubject';
import { Container, Avatar, Divider, Typography, Paper } from '@material-ui/core';
import KAcad from '../../icons/KAcad.png'
import TAbad from '../../icons/TAbad.png'

interface P {
	lessons: RootReducerState["lessons"]["db"]
	lesson_loading: RootReducerState["lessons"]["loading"]
	getLessons: () => void
}

interface Routeinfo {
	medium: string
}

type Props = P & RouteComponentProps<Routeinfo>
const StudentPortalOptions: React.FC<Props> = ({ getLessons, lessons, lesson_loading, match }) => {

	useEffect(() => {
		getLessons()
	}, [])

	const getDeviceOS = () => {
		if (navigator.platform.indexOf("iPhone") != -1) {
			return "iOS"
		}
		if (navigator.platform.indexOf("Android") != -1) {
			return "Android"
		}
		return "Unknown"
	}

	const partners = [
		{
			title: "Knowledge Platform",
			link_play: "https://play.google.com/store/apps/details?id=com.knowledgeplatform.lsp&hl=en",
			link_app: "https://play.google.com/store/apps/details?id=com.knowledgeplatform.lsp&hl=en",
			logo: "https://storage.googleapis.com/ilmx-product-images/kp%20logo%20new.png"
		},
		{
			title: "Taleemabad Primary",
			link_play: "http://bit.ly/taleemabad",
			link_app: "http://bit.ly/taleemabad",
			logo: TAbad
		},
		{
			title: "Taleemabad Secondary",
			link_play: "http://bit.ly/taleemabad",
			link_app: "http://bit.ly/taleemabad",
			logo: TAbad
		},
		{
			title: "Khan Academy",
			link_play: "https://play.google.com/store/apps/details?id=org.khanacademy.android",
			link_app: "https://apps.apple.com/us/app/khan-academy/id469863705",
			logo: KAcad
		},
		{
			title: "Sabaq Muse",
			link_play: "http://bit.ly/muselessons",
			link_app: "http://bit.ly/muselessons",
			logo: "https://storage.googleapis.com/ilmx-product-images/Sabaq%20logo.png"
		},
		{
			title: "Radec",
			link_play: "",
			link_app: "",
			logo: "https://storage.googleapis.com/ilmx-product-images/Radec.png"
		}
	]

	const medium = match.params.medium
	const [grade, setGrade] = useState("");

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} />
		<div className="text">Fetching Lessons</div>
	</div> : <div className="student-portal-op">


			{lessons[medium] ? <Container maxWidth="md">
				<div className="row">
					{grade === "" && <div className="title">Select Class</div>}
					{
						grade === "" ? <div className="content">
							{lessons[medium]["Preschool"] && <div className="oval" onClick={(e) => setGrade("Preschool")}>Preschool</div>}
							{lessons[medium]["KG"] && <div className="oval" onClick={(e) => setGrade("KG")}>KG</div>}
							{
								Object.keys(lessons[medium])
									.filter(g => g !== "Preschool" && g !== "KG")
									.sort((a, b) => parseFloat(a) - parseFloat(b))
									.map(g => {
										return <div className={grade === g ? "bg-blue oval " : "oval"} key={g} onClick={(e) => setGrade(g)}>{`Class ${g}`}</div>
									})
							}
						</div> : <div className="content selected">
								<div className="bg-blue oval">{grade !== "Preschool" && grade !== "KG" ? `Class ${grade}` : grade}</div>
								<div style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }} onClick={(e) => setGrade("")}>Change Class</div>
							</div>
					}
				</div>
				{grade && <div className="row">
					<div className="title">Select Subject</div>
					<div className="content">
						{
							Object.keys(lessons[medium][grade])
								.map(s => {
									return <Link
										to={`/library/${medium}/${grade}/${s}`}
										className="square subject"
										style={{
											backgroundImage: `url(${getIconsFromSubject(s)})`
										}}
										key={s}>{s}</Link>
								})
						}
					</div>

				</div>}
				<Divider />
			</Container> : <Container maxWidth="sm">
					<Typography
						variant="h5"
						color="textSecondary"
						align="center"
						gutterBottom
					>
						We couldn't find anything.
						Please write to us via <a href="tel:0348-1119-119">Sms</a>
						<br />or <a href="https://api.whatsapp.com/send?phone=923481119119">Whatsapp</a>,
						and help us make Ilmexchange better for you.
					</Typography>
					<Divider />
				</Container>
			}
			<Typography
				style={{ margin: "20px 5px 0px", }}
				color="textSecondary"
				align="center"
				variant="h5">Featured Apps</Typography>
			<Container maxWidth="sm" style={{
				display: "flex",
				justifyContent: "center",
				flexWrap: "wrap"
			}}>
				{
					partners
						.map(p => {
							return <a
								href={getDeviceOS() === "Android" ? p.link_play : p.link_app}
								target="__blank"
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									textDecoration: "none",
									margin: "5px",
									padding: "5px",
									color: "#474747",
								}}>
								<Avatar style={{ margin: "5px", objectFit: "contain" }} variant="rounded">
									<img className="partner-avatar" alt="" src={p.logo} />
								</Avatar>
								<Typography variant="subtitle2">{p.title}</Typography>
							</a>
						})
				}
			</Container>
		</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	lesson_loading: state.lessons.loading
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons())
}))(StudentPortalOptions)