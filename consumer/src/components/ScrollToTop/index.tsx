import React, { useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'

const ScrollTop: React.FC<RouteComponentProps> = ({ history, children }) => {
	useEffect(() => {
		const unlisten = history.listen(() => {
			window.scrollTo(0, 0)
		})
		return () => {
			unlisten()
		}
	}, [history])

	return <>{children}</>
}

const ScrollToTop = withRouter(ScrollTop)

export { ScrollToTop }