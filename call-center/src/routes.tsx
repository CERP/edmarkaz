/* eslint-disable react/display-name */
import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Login from './components/Login'
import AuthedRoute from './components/AuthedRoute'
import Accordian from './components/Accordian'

export default ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/login" component={Login} />
				<AuthedRoute path="/" component={Accordian} />
			</Switch>
		</BrowserRouter>
	</Provider>
)