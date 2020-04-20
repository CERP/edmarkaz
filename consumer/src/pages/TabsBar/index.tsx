import React, { Component } from "react";
import { RouteComponentProps, Route, Redirect } from "react-router";
import { Link } from "react-router-dom";
import ProductHome from "../Bazaar";
import SupplierHome from "../Bazaar/Supplier";
import ProductPage from "../Bazaar/Product";
import Profile from "../Profile";
import Articles, { ArticleRouter } from "../Articles";
import ErrorComponent from "../../components/Error";
import { submitError } from "../../actions/core";
import { connect } from "react-redux";
import Help from "../Help";
import contactUs from '../../icons/contactUs.svg'
import TrackedRoute from "../../components/TrackedRoute";
import Library from "../Library";
import LessonPage from "../Library/Lesson";
import LibraryInstructionMedium from '../Library/medium'
import StudentPortalOptions from '../Library/options';
import Layout from "../../components/Layout";
import { Paper, Tabs, Tab } from "@material-ui/core";
import StudentProfile from "../StudentPortal/studentProfile";

import "./style.css";

interface S {
	tab: number
	error: boolean;
	err?: Error;
	errInfo?: React.ErrorInfo;
}

interface P {
	token: RootReducerState["auth"]["token"]
	connected: boolean;
	user: RootReducerState["auth"]["user"]
	sendError: (err: Error, errInfo: React.ErrorInfo) => void;
}

interface RouteInfo { }

type propTypes = RouteComponentProps<RouteInfo> & P;

class TabsBar extends Component<propTypes, S> {
	constructor(props: propTypes) {
		super(props);

		this.state = {
			tab: this.getCurrentTab(this.props.location.pathname),
			error: false,
			err: undefined,
			errInfo: undefined
		};
	}

	getCurrentTab = (path: string) => {

		if (path.split("/").some(i => i === "bazaar" || i === "supplier")) {
			return 1
		}
		if (path.split("/").some(i => i === "library")) {
			return 0
		}
		if (path.split("/").some(i => i === "help")) {
			return 2
		}
		return 3
	}

	componentDidUpdate(prevProps: propTypes) {
		if (this.props.location.pathname !== prevProps.location.pathname) {
			this.setState({
				tab: this.getCurrentTab(this.props.location.pathname)
			})
		}
	}


	componentDidCatch(err: Error, errInfo: React.ErrorInfo) {
		this.props.sendError(err, errInfo);

		this.setState({
			error: true,
			err,
			errInfo
		});
	}

	handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {

		this.setState({ tab: newValue })
	};

	render() {

		const { location, token, user, history } = this.props
		const current = location.pathname;
		const search = location.search;

		const library = location.pathname.split("/").some(i => i === "library")

		if (this.state.error && this.state.err && this.state.errInfo) {
			return (
				<ErrorComponent error={this.state.err} errInfo={this.state.errInfo} />
			);
		}

		const callLink = this.props.connected ?
			"https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

		return user === undefined ? <Redirect to="" /> : <Layout>
			<div className="tabs-page">
				{(user === "SCHOOL" && current !== "/profile" && current !== "/start-mob" && current !== "/sign-up" && current !== "/log-in") &&
					<Paper style={{ flexGrow: 1 }}>
						<Tabs
							onChange={this.handleTabChange}
							value={this.state.tab}
							indicatorColor="primary"
							textColor="primary"
							centered
						>
							<Tab label="Library" onClick={() => history.push("/library")} />
							<Tab label="Bazaar" onClick={() => history.push("/bazaar")} />
							<Tab label="Help" onClick={() => history.push("/help")} />
						</Tabs>
					</Paper>}
				<>
					<TrackedRoute exact path="/supplier/:supplier_id/:product_id" component={ProductPage} />
					<TrackedRoute exact path="/supplier/:supplier_id" component={SupplierHome} />
					<TrackedRoute path="/profile" component={Profile} />
					<Route path="/articles/:article_id" component={ArticleRouter} />
					<TrackedRoute exact path="/articles" component={Articles} />
					<TrackedRoute path="/help" component={Help} />
					<TrackedRoute exact path="/library" component={LibraryInstructionMedium} />
					<TrackedRoute exact path="/library/:medium" component={StudentPortalOptions} />
					<TrackedRoute exact path="/library/:medium/:grade/:subject" component={Library} />
					<TrackedRoute exact path="/library/:medium/:grade/:subject/:chapter/:chapter_name" component={LessonPage} />
					<TrackedRoute exact path="/bazaar" component={ProductHome} />
					<TrackedRoute exact path="/student-profile" component={StudentProfile} />
				</>
				{!library && <a className="contact-us" href={callLink}>
					<img src={contactUs} />
					<div>Contact Us</div>
				</a>}

				{(current !== "/" && current !== "/about-us") && <div className="tabs-footer">
					{/* <div className="bttn">Forums</div> */}
					<Link className="bttn" to="/about-us">About Us</Link>
					{/* <Link className="bttn" to="">Forum</Link> */}
					<a className="bttn" href={callLink} style={{ border: "none" }}>Contact Us</a>
				</div>}
			</div>
		</Layout>
	}
}
export default connect(
	(state: RootReducerState) => ({
		connected: state.connected,
		token: state.auth.token,
		user: state.auth.user
	}),
	(dispatch: Function) => ({
		sendError: (err: Error, errInfo: React.ErrorInfo) =>
			dispatch(submitError(err, errInfo))
	})
)(TabsBar);
