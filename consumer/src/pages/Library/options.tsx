import React, { useEffect } from 'react';
import { getLessons } from '../../actions';
import { connect } from "react-redux";
import { Link, RouteComponentProps } from 'react-router-dom';
import LoadingIcon from '../../icons/load.svg';
import { getIconsFromSubject } from '../../utils/getIconsFromSubject';
import { Container, Avatar, Divider, Typography } from '@material-ui/core';
import KAcad from '../../icons/KAcad.png';
import KAcad_kids from '../../icons/KAcad_kids.png';
import TAbad from '../../icons/TAbad.png';
import { getDeviceOS } from '../../utils/getDeviceOS';

interface P {
	lessons: RootReducerState["lessons"]["db"];
	lesson_loading: RootReducerState["lessons"]["loading"];
	getLessons: () => void;
}

interface Routeinfo {
	medium: string;
	grade: string;
}

type Props = P & RouteComponentProps<Routeinfo>
const getFeaturedApps = () => [
	{
		title: "Sabaq Muse",
		link_play: "http://bit.ly/muselessons",
		link_app: "http://bit.ly/muselessons",
		logo: "https://storage.googleapis.com/ilmx-product-images/Sabaq%20logo.png"
	},
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
		link_play:
			"https://play.google.com/store/apps/details?id=org.khanacademy.android",
		link_app: "https://apps.apple.com/us/app/khan-academy/id469863705",
		logo: KAcad
	},
	{
		title: "Khan Academy Kids",
		link_play:
			"https://play.google.com/store/apps/details?id=org.khankids.android&hl=en",
		link_app: "https://apps.apple.com/us/app/khan-academy-kids/id1378467217",
		logo: KAcad_kids
	},
];

const StudentPortalOptions: React.FC<Props> = ({ getLessons, lessons, lesson_loading, match }) => {

	useEffect(() => {
		getLessons()
	}, [getLessons])

	const subjectSortArray = [
		"English",
		"Math",
		"Urdu",
		"Science and Technology",
		"The World Around Us",
		"Hamari Dunya",
		"Art & Music",
		"Ethics & Islam",
		"Islamiat",
		"Me & My Health",
		"Physics",
		"Biology",
		"Chemistry"
	]

	const medium = match.params.medium;
	const grade = match.params.grade ? match.params.grade : "";

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} alt="loading-icon" />
		<div className="text">Fetching Lessons</div>
	</div> : <div className="student-portal-op">


			{lessons[medium] ? <Container maxWidth="md">
				<div className="row">
					{grade === "" && <div className="title">Select Class</div>}
					{
						grade === "" ? <div className="content">
							{lessons[medium]["Preschool"] && <Link to={`/library/${medium}/${`Preschool`}`}>
								<div className="oval">Preschool</div>
							</Link>
							}
							{lessons[medium]["KG"] && <Link to={`/library/${medium}/${`KG`}`}>
								<div className="oval">KG</div>
							</Link>
							}
							{Object.keys(lessons[medium])
								.filter((g) => g !== "Preschool" && g !== "KG")
								.sort((a, b) => parseFloat(a) - parseFloat(b))
								.map((g) => {
									return (
										<Link to={`/library/${medium}/${g}`}>
											<div
												className={grade === g ? "bg-blue oval " : "oval"}
												key={g}
											>{`Class ${g}`}</div>
										</Link>
									);
								})}
						</div> : <div className="content selected">
								<div className="bg-blue oval">
									{grade !== "Preschool" && grade !== "KG"
										? `Class ${grade}`
										: grade}
								</div>
							</div>
					}
				</div>
				{grade && <div className="row">
					<div className="title">Select Subject</div>
					<div className="content">
						{Object.keys(lessons[medium][grade])
							.sort((a, b) => subjectSortArray.indexOf(a) < subjectSortArray.indexOf(b) ? -1 : 1)
							.map((s) => {
								return (
									<Link to={`/library/${medium}/${grade}/${s}`} className="square subject" style={{
										backgroundImage: `url(${getIconsFromSubject(s)})`,
									}} key={s}>
										{s}
									</Link>
								);
							})}
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
				style={{ margin: "20px 5px 0px" }}
				color="textSecondary"
				align="center"
				variant="h5">Featured Apps</Typography>
			<Container maxWidth="sm" style={{
				display: "flex",
				justifyContent: "center",
				flexWrap: "wrap",
			}}>
				{
					getFeaturedApps()
						.map((p) => {
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
								}}
							>
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