import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import InputPage from './pages/input'
import Login from './components/Login'
import AuthedRoute from './components/AuthedRoute'

export default ({ store } : {store: Store}) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<AuthedRoute exact path="/" component={InputPage} />
				<Route path="/login" component={Login}/>
			</Switch>
		</BrowserRouter>
	</Provider>
)