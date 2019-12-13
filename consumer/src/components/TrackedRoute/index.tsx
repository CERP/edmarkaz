import React from 'react'
import { Route, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'
import { trackRoute } from '../../actions'

type propsType = {
	trackRoute: (path: string) => any;
} & RouteProps

const TrackedRoute = ({ component, trackRoute, ...rest }: propsType) => {

	const Component = component

	return <Route {...rest} render={(props) => {
		trackRoute(window.location.pathname)
		//@ts-ignore
		return <Component {...props} />
	}} />
}

export default connect((state: RootReducerState) => ({
}), (dispatch: Function) => ({
	trackRoute: (path: string) => dispatch(trackRoute(path))
}))(TrackedRoute)