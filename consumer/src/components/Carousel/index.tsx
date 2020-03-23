import React from 'react';
import { Carousel } from 'react-bootstrap'
import './style.css'


interface P {
	items: {
		title: string
		caption: string
		url: string
	}[]
}

const CarouselComponent: React.FC<P> = ({ items }) => {

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
export default CarouselComponent