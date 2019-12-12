import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import Header from "../../components/Header";
import ProductHome from "../ProductHome";
import SupplierHome from "../Supplier";
import ProductPage from "../accordian/Product";
import SignUp from "../SignUp";
import Profile from "../Profile";
import Articles, { ArticleRouter } from "../Articles";
import ErrorComponent from "../../components/Error";
import { submitError } from "../../actions/core";
import { connect } from "react-redux";
import Help from "../Help";
import contactUs from '../../icons/contactUs.svg'
import "./style.css";
import login from "../SignUp/login";
import TrackedRoute from "../../components/TrackedRoute";

interface S {
	error: boolean;
	err?: Error;
	errInfo?: React.ErrorInfo;
}

interface P {
	connected: boolean;
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
			errInfo: undefined
		};
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
		const current = this.props.location.pathname;
		const search = this.props.location.search;

		if (this.state.error && this.state.err && this.state.errInfo) {
			return (
				<ErrorComponent error={this.state.err} errInfo={this.state.errInfo} />
			);
		}

		const callLink = this.props.connected ?
			"https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

		return (
			<div className="tabs-page">
				<Header path={current} />

				{current !== "sign-up" && (
					<div className="tabs-bar subtitle">
						<Link to="/articles" className={current === "/articles" ? "cell active" : "cell"}>
							Library
						</Link>
						<Link to={{ pathname: "/", search }} className={current === "/" ? "cell active" : "cell"}>
							Bazaar
						</Link>
						<Link to="/help" className={current === "/help" ? "cell active" : "cell"}>
							Help
						</Link>
					</div>
				)}

				<>
					<TrackedRoute exact path="/" component={ProductHome} />
					<TrackedRoute exact path="/supplier/:supplier_id/:product_id" component={ProductPage} />
					<TrackedRoute exact path="/supplier/:supplier_id" component={SupplierHome} />
					<TrackedRoute exact path="/log-in" component={login} />
					<TrackedRoute path="/sign-up" component={SignUp} />
					<TrackedRoute path="/profile" component={Profile} />
					<TrackedRoute path="/articles/:article_id" component={ArticleRouter} />
					<TrackedRoute exact path="/articles" component={Articles} />
					<TrackedRoute path="/help" component={Help} />
				</>
				<a className="contact-us" href={callLink}>
					<img src={contactUs} />
					<div className="title">Contact-Us</div>
				</a>
			</div>
		);
	}
}
export default connect(
	(state: RootReducerState) => ({
		connected: state.connected
	}),
	(dispatch: Function) => ({
		sendError: (err: Error, errInfo: React.ErrorInfo) =>
			dispatch(submitError(err, errInfo))
	})
)(TabsBar);
