import React from 'react'
import { Container, Avatar } from '@material-ui/core'

import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'


type P = {

}

const TeacherProfile: React.FC<P> = () => {

	const callLink = false ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

	return (
		<Layout>
			<div className="login-page">
				<Container maxWidth="sm">
					<div
						className="section"
						style={{
							border: "none",
							display: "flex",
							flexDirection: "column",
						}}>
						<Avatar variant="square" style={{
							height: "100%",
							width: "70%",
							margin: "auto"
						}} src={ilmxLogo} alt="ilmx-logo" />
					</div>
				</Container>
				<HelpFooter hlink={callLink} />
			</div>
		</Layout>
	)
}

export { TeacherProfile }