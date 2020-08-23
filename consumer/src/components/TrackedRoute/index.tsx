import React, { useEffect, memo } from 'react'
import { Route, RouteProps, withRouter, RouteComponentProps, matchPath } from 'react-router-dom'
import { connect } from 'react-redux'
import { trackRoute } from '../../actions'
import useReactPath from 'utils/useReactPath'


declare global {
	interface Window {
		ga_id: string,
		gtag?: (
			key: string,
			trackingId: string,
			config: { page_path: string }
		) => void
	}
}

type propsType = {
	trackRoute: (path: string) => any;
} & RouteProps

const TrackedRoute = ({ component, trackRoute, ...rest }: propsType) => {

	const Component = component

	return <Route {...rest} render={(props) => {
		if (window.gtag) {
			window.gtag('config', window.ga_id, { page_path: window.location.pathname })
		}
		trackRoute(window.location.pathname)
		//@ts-ignore
		return <Component {...props} />
	}} />
}

export default connect((state: RootReducerState) => ({
}), (dispatch: Function) => ({
	trackRoute: (path: string) => dispatch(trackRoute(path))
}))(TrackedRoute)