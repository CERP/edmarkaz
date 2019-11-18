import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RouteComponentProps, Route } from 'react-router'

import Purpose from './topics/purpose'
import makes_school_great from './topics/makes_school_great'
import prepare_students from './topics/prepare_students'
import leaders_make_great from './topics/leaders_make_great'
import can_we_help_all_children from './topics/can_we_help_all_children'

interface RouteInfo {
	article_id: string;
}

type P = {

} & RouteComponentProps<RouteInfo>

export default (props: P) => {

	const [language, setLanguage] = useState("english")

	return <div className="articles">

		<div className="tabs-banner" />

		<div className="select-row" style={{ display: "flex", justifyContent: "flex-end", padding: "5px 20px" }}>
			<select onChange={(e) => setLanguage(e.target.value)} value={language}>
				<option value="english">English</option>
				<option value="urdu">Urdu</option>
			</select>
		</div>

		<div className="tabs-home">

			<div className="item-row">
				<div className="title">What is our Purpose as Educators?</div>

				<div className="items">
					<Link className="item-card" to={`/articles/purpose-${language}`}>
						<img className="item-image" src="https://lh5.googleusercontent.com/V9qlXsqwKJykzdiUoL3pNgWJNEtb9xEfg8dUFuu7wEQ2ItW1MBh7GgC9QggXzXt6HG2F8xnw_DEq5E9YjrRkiyZpBbaTv3UbtiExXUxBVGcvmjsndr1WLoBgNBHoNzJ5GvXZ7JHG" />
						<div className="subtitle">What is the Purpose of School?</div>
					</Link>
					<Link className="item-card" to={`/articles/makes_school_great-${language}`}>
						<img className="item-image" src="https://lh5.googleusercontent.com/x1oYxe7vOuBregHu7dB-CFqyNiR5iMdYhSBKtfbDZ6pLMs6Nmhv5MkUKgwiu5Mw7iiOfmI8i0bjgzIl51Zzw7j8HXq0ttEydB8CoG4PqhWVRKYR8dhnJXn8fr2ZS806IIiwGgUmp" />
						<div className="subtitle">What Makes a School Great?</div>
					</Link>
					<Link className="item-card" to={`/articles/prepare_students-${language}`}>
						<img className="item-image" src="https://lh5.googleusercontent.com/l3QVeNyXAS6j4t5Z1uAnNlCmqmcv74ZpafoVNqFf8x5L2LEx620QinO6NGcJwe7IiX0M4SPf0ZvqGjKmAXq_ZxZJTp9UlJhusd23AL37Fz7X0_w8Q-lGQBrweIKBy_8EWGWO_YIy" />
						<div className="subtitle">How Can we Prepare Students for the Future</div>
					</Link>
				</div>
			</div>
			<div className="item-row">
				<div className="title">Tools for School Leaders</div>

				<div className="items">
					<Link className="item-card" to={`/articles/leaders_make_great-${language}`}>
						<img className="item-image" src="https://lh6.googleusercontent.com/YxeFoAXAWXGmDb6Sl20CcC-b2YXAVLNHQt4p5M6hp9OVNn-TIcbAF9ztTnkD8u4KMtBU13NWTZNvgp9dwZgF4ecVfwhrEX0ruHGFrpUtuUN_duCRsDccT0fCeK4n5mSILESHjzf5" />
						<div className="subtitle">Strong Leaders Make Great Schools</div>
					</Link>
					<Link className="item-card" to={`/articles/can_we_help_all_children-${language}`}>
						<img className="item-image" src="https://lh6.googleusercontent.com/AWdnF3zDePgYD2K77ct85i-lXasGbztxdoNmU8_6anjtBnN-TTuOmaYmwG3waE3729fzLtqiEshKV61lWu9EBb8pCVT66W8BWhD5E-1on94HWMwLK9XrjpVNEGEU3joyKiCmPcPz" />
						<div className="subtitle">How Can we Help All Children Learn?</div>
					</Link>
				</div>
			</div>
		</div>
	</div>
}

export const ArticleRouter = (props: P) => {

	useEffect(() => {
		try {
			window.scroll({ top: 0, left: 0, behavior: "smooth" })
		}
		catch (e) {
			console.error(e)
		}
	})

	return <div className="article">
		<Route path="/articles/purpose-english" component={Purpose} />
		<Route path="/articles/purpose-urdu" component={Purpose} />
		<Route path="/articles/makes_school_great-english" component={makes_school_great} />
		<Route path="/articles/makes_school_great-urdu" component={makes_school_great} />
		<Route path="/articles/prepare_students-english" component={prepare_students} />
		<Route path="/articles/prepare_students-urdu" component={prepare_students} />
		<Route path="/articles/leaders_make_great-english" component={leaders_make_great} />
		<Route path="/articles/leaders_make_great-urdu" component={leaders_make_great} />
		<Route path="/articles/can_we_help_all_children-english" component={can_we_help_all_children} />
		<Route path="/articles/can_we_help_all_children-urdu" component={can_we_help_all_children} />
	</div>
}