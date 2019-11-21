import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Burger from './pages/accordian'
import TabsBar from './pages/TabsBar'
import TokenAuth from './pages/TokenAuth'

const Routes = ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route path="/acc" component={Burger} />
				<Route path="/auth/:token" component={TokenAuth} />
				<Route path="/" component={TabsBar} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

export default Routes;