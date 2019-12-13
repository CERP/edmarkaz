import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Burger from './pages/accordian'
import TabsBar from './pages/TabsBar'
import TokenAuth from './pages/TokenAuth'
import TrackedRoute from './components/TrackedRoute'

const Routes = ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				{/* <TrackedRoute path="/" component={Burger} /> */}
				<TrackedRoute path="/auth/:token" component={TokenAuth} />
				<TrackedRoute path="/" component={TabsBar} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

export default Routes;