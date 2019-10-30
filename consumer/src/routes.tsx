import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Burger from './pages/accordian'

const Routes = ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route path="/" component={Burger} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

export default Routes;