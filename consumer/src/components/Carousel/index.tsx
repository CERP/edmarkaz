import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Carousel } from 'react-bootstrap'
import './style.css'


interface P {
	items: {
		title: string
		caption: string
		url: string
	}[]
}
type propTypes = RouteComponentProps & P

const CarouselComponent: React.FC<propTypes> = ({ items }) => {

	return <div className="carousel-comp">
		<Carousel>
			{
				items.map(item => {
					return <Carousel.Item>
						<img
							crossOrigin="anonymous"
							className="d-block w-100"
							src={item.url}
							alt="img"
						/>
						<Carousel.Caption>
							<h3>{item.title}</h3>
							<p>{item.caption}</p>
						</Carousel.Caption>
					</Carousel.Item>
				})
			}
		</Carousel>
	</div>
}
export default withRouter(CarouselComponent)