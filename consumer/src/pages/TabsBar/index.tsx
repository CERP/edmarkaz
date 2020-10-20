import React, { Component } from "react";
import { RouteComponentProps, Route, Redirect } from "react-router";
import ProductHome from "../Bazaar";
import SupplierHome from "../Bazaar/Supplier";
import ProductPage from "../Bazaar/Product";
import Profile from "../Profile";
import Articles, { ArticleRouter } from "../Articles";
import ErrorComponent from "../../components/Error";
import { submitError } from "../../actions/core";
import { connect } from "react-redux";
import Help from "../Help";
import TrackedRoute from "../../components/TrackedRoute";
import Library from "../Library";
import LessonPage from "../Library/Lesson";
import LibraryInstructionMedium from "../Library/medium";
import StudentPortalOptions from "../Library/options";
import Layout from "../../components/Layout";
import { Paper, Tabs, Tab } from "@material-ui/core";
import StudentProfile from "../StudentPortal/studentProfile";
import HelpFooter from "components/Footer/HelpFooter";

import "./style.css";
import SchoolDashboard from "pages/School/Dashboard";

interface S {
	error: boolean;
	err?: Error;
	errInfo?: React.ErrorInfo;
}

interface P {
	token: RootReducerState["auth"]["token"];
	connected: boolean;
	user: RootReducerState["auth"]["user"];
	sendError: (err: Error, errInfo: React.ErrorInfo) => void;
}

interface RouteInfo { }

type propTypes = RouteComponentProps<RouteInfo> & P;

class TabsBar extends Component<propTypes, S> {
	constructor(props: propTypes) {
		super(props);

		this.state = {
			error: false,
			err: undefined,
			errInfo: undefined,
		};
	}

	getCurrentTab = (path: string) => {
		if (path.split("/").some((i) => i === "dashboard")) {
			return 0
		}
		if (path.split("/").some((i) => i === "bazaar" || i === "supplier")) {
			return 2
		}
		if (path.split("/").some((i) => i === "library")) {
			return 1
		}
		if (path.split("/").some((i) => i === "help")) {
			return 3
		}
		return 4
	}

	componentDidCatch(err: Error, errInfo: React.ErrorInfo) {
		this.props.sendError(err, errInfo);

		this.setState({
			error: true,
			err,
			errInfo
		});
	}

	render() {

		const { location, user, history } = this.props
		const current = location.pathname;

		// const library = location.pathname.split("/").some((i) => i === "library")

		if (this.state.error && this.state.err && this.state.errInfo) {
			return (
				<ErrorComponent error={this.state.err} errInfo={this.state.errInfo} />
			);
		}

		const callLink = this.props.connected ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119";

		return <Layout>
			<div className="tabs-page">
				{user === "SCHOOL" && current !== "/profile" && current !== "/start-mob" && current !== "/log-in" &&
					<Paper style={{ flexGrow: 1 }}>
						<Tabs
							value={this.getCurrentTab(this.props.location.pathname)}
							indicatorColor="primary"
							textColor="primary"
							centered
						>
							<Tab label="Dashboard" onClick={() => history.push("/dashboard")} />
							<Tab label="Library" onClick={() => history.push("/library")} />
							<Tab label="Bazaar" onClick={() => history.push("/bazaar")} />
							<Tab label="Help" onClick={() => history.push("/help")} />
						</Tabs>
					</Paper>
				}
				{
					!user &&
					<Paper style={{ flexGrow: 1 }}>
						<Tabs
							value={this.getCurrentTab(this.props.location.pathname)}
							indicatorColor="primary"
							textColor="primary"
							centered>
							<Tab label="Bazaar" onClick={() => history.push("/bazaar")} />
						</Tabs>
					</Paper>

				}
				<>

					<TrackedRoute exact path="/supplier/:supplier_id/:product_id" component={ProductPage} />
					<TrackedRoute exact path="/supplier/:supplier_id" component={SupplierHome} />
					<TrackedRoute exact path="/bazaar" component={ProductHome} />

					<TrackedRoute path="/profile" component={Profile} />
					<Route path="/articles/:article_id" component={ArticleRouter} />
					<TrackedRoute exact path="/articles" component={Articles} />
					<TrackedRoute path="/help" component={Help} />
					<TrackedRoute exact path="/library" component={LibraryInstructionMedium} />
					<TrackedRoute exact path="/library/:medium/:grade" component={StudentPortalOptions} />
					<TrackedRoute exact path="/library/:medium" component={StudentPortalOptions} />
					<TrackedRoute exact path="/library/:medium/:grade/:subject" component={Library} />
					<TrackedRoute exact path="/library/:medium/:grade/:subject/:chapter/:chapter_name" component={LessonPage} />
					<TrackedRoute exact path="/student-profile" component={StudentProfile} />
					<TrackedRoute exact path="/dashboard" component={SchoolDashboard} />
				</>

				{(current !== "/" && current !== "/bazaar" && current !== "/about-us") && <>
					<HelpFooter hlink={callLink} />
				</>}
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
		sendError: (err: Error, errInfo: React.ErrorInfo) => dispatch(submitError(err, errInfo))
	}))(TabsBar);
