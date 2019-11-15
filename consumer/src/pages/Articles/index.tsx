import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { RouteComponentProps, Route } from 'react-router'

import Purpose from './purpose'

interface RouteInfo {
	article_id: string
}

type P = {

} & RouteComponentProps<RouteInfo>

export default (props: P) => {

	const [language, setLanguage] = useState("english")

	return <div className="articles">

		<div className="tabs-banner" />

		<select onChange={(e) => setLanguage(e.target.value)} value={language}>
			<option value="english">English</option>
			<option value="urdu">Urdu</option>
		</select>

		<div className="tabs-home">

			<div className="item-row">
				<div className="title">What is our Purpose as Educators?</div>

				<div className="items">
					<Link className="item-card" to={`/articles/purpose-${language}`}>
						<img className="item-image" src="https://lh5.googleusercontent.com/V9qlXsqwKJykzdiUoL3pNgWJNEtb9xEfg8dUFuu7wEQ2ItW1MBh7GgC9QggXzXt6HG2F8xnw_DEq5E9YjrRkiyZpBbaTv3UbtiExXUxBVGcvmjsndr1WLoBgNBHoNzJ5GvXZ7JHG" />
						<div className="subtitle">What is the Purpose of School?</div>
					</Link>
				</div>
			</div>
		</div>
	</div>
}

export const ArticleRouter = (props: P) => {

	return <div className="article">
		<Route path="/articles/purpose-english" component={Purpose} />
		<Route path="/articles/purpose-urdu" component={Purpose} />
	</div>
}