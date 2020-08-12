import * as React from "react"
import poster from './poster.jpg'

import './style.css'

function Challenge(props: any) {
	return <div>
		<div className="poster-div" style={{
		}}>
			<h3 className="independence-heading">Happy Independence Day</h3>
			<div className="content-div">
				<div className="quotes-div">
					<div className="quotes">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a ullamcorper risus, at euismod sem. Fusce tincidunt quam purus, in sagittis nisi tristique ut. Duis eget elementum neque. Vivamus posuere bibendum quam in interdum. Cras ac quam quam. Morbi eu enim vestibulum, ultrices metus et, porttitor enim. Sed volutpat mauris vitae ex lobortis, id lobortis felis dictum. Praesent blandit nisi cursus nunc venenatis, sit amet porta mauris semper. Integer pretium dui in rutrum finibus. Quisque vel mi et sem tincidunt mattis. Mauris dapibus, enim sit amet tincidunt volutpat, orci dolor laoreet est, et sagittis ipsum lectus eu nibh. Morbi efficitur est eget elit congue, eu dictum justo semper. Quisque vitae elementum risus. Ut quis diam venenatis, eleifend purus in, pulvinar mauris. Sed vitae arcu nibh. Nulla in maximus metus.</div>
				</div>
				<img className="poster" src={poster} alt="img" />
			</div>
		</div>
	</div >
}

export default Challenge