import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Store } from 'redux'
import TabsBar from './pages/TabsBar'
import TokenAuth from './pages/TokenAuth'
import TrackedRoute from './components/TrackedRoute'
import FrontPage from './pages/Front'
import AboutUs from './pages/Front/aboutUs'
import StudentPortal from './pages/StudentPortal'
import login from './pages/SignUp/login'
import OptionsMobile from './pages/Front/front_mob'
import School from './pages/School'
import AutoLogin from './pages/SignUp/auto_login'
import AppPrivacy from 'pages/Privacy'
import Campaign from 'pages/Front/campaign'

const Routes = ({ store }: { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<TrackedRoute exact path="/" component={FrontPage} />
				<TrackedRoute path="/privacy" component={AppPrivacy} />
				<TrackedRoute exact path="/about-us" component={AboutUs} />
				<TrackedRoute exact path="/sms" component={Campaign} />
				<TrackedRoute exact path="/start-mob" component={OptionsMobile} />
				<TrackedRoute path="/auth/:token" component={TokenAuth} />
				<TrackedRoute path="/auto-login" component={AutoLogin} />
				<TrackedRoute exact path="/log-in" component={login} />
				<TrackedRoute exact path="/school" component={School} />
				<TrackedRoute exact path="/student" component={StudentPortal} />
				<Route path="/" component={TabsBar} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

export default Routes;