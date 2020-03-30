import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Store } from 'redux'

import Burger from './pages/accordian'
import TabsBar from './pages/TabsBar'
import TokenAuth from './pages/TokenAuth'
import TrackedRoute from './components/TrackedRoute'
import FrontPage from './pages/Front'

const Routes = ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				{/* <TrackedRoute path="/" component={Burger} /> */}
				<TrackedRoute path="/auth/:token" component={TokenAuth} />
				<Route exact path="/" component={TabsBar} />
				<Route path="/landing" component={FrontPage} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

export default Routes;