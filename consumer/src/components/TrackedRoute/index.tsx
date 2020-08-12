import React, { useEffect } from 'react'
import { Route, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'
import { trackRoute } from '../../actions'


declare global {
	interface Window {
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
			window.gtag('config', 'UA-174568735-1', { page_path: window.location.pathname })
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