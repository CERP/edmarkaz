import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Store } from 'redux'

import Burger from './pages/accordian'
import TabsBar from './pages/TabsBar'
import TokenAuth from './pages/TokenAuth'
import TrackedRoute from './components/TrackedRoute'
import FrontPage from './pages/Front'
import AboutUs from './pages/Front/aboutUs'
import StudentPortal from './pages/StudentPortal'

const Routes = ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				{/* <TrackedRoute path="/" component={Burger} /> */}
				<TrackedRoute exact path="/" component={FrontPage} />
				<TrackedRoute exact path="/about-us" component={AboutUs} />
				<TrackedRoute path="/auth/:token" component={TokenAuth} />
				<Route path="/" component={TabsBar} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

export default Routes;