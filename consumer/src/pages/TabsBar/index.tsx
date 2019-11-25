import React, { Component } from "react";
import { RouteComponentProps, Route } from "react-router";
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

import "./style.css";

interface S {
  error: boolean;
  err?: Error;
  errInfo?: React.ErrorInfo;
}

interface P {
  sendError: (err: Error, errInfo: React.ErrorInfo) => void;
}

interface RouteInfo {}

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

    return (
      <div className="tabs-page">
        <Header path={current} />

        {current !== "sign-up" && (
          <div className="tabs-bar subtitle">
            <Link
              to="/articles"
              className={current === "/articles" ? "cell active" : "cell"}
            >
              Library
            </Link>
            <Link
              to={{ pathname: "/", search }}
              className={current === "/" ? "cell active" : "cell"}
            >
              Bazaar
            </Link>
            <Link
              to="/help"
              className={current === "/help" ? "cell active" : "cell"}
            >
              FAQs
            </Link>
          </div>
        )}

        <div className="">
          <Route exact path="/" component={ProductHome} />
          <Route
            exact
            path="/supplier/:supplier_id/:product_id"
            component={ProductPage}
          />
          <Route exact path="/supplier/:supplier_id" component={SupplierHome} />
          <Route path="/sign-up" component={SignUp} />
          <Route path="/profile" component={Profile} />
          <Route path="/articles/:article_id" component={ArticleRouter} />
          <Route exact path="/articles" component={Articles} />
          <Route path="/help" component={Help} />
        </div>
      </div>
    );
  }
}
export default connect(
  (state: RootReducerState) => ({}),
  (dispatch: Function) => ({
    sendError: (err: Error, errInfo: React.ErrorInfo) =>
      dispatch(submitError(err, errInfo))
  })
)(TabsBar);
