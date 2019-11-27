import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default ({ children }: any) => {
	const [el, setEl] = useState(document.getElementById('modal') as HTMLElement)

	useEffect(() => {
		el.setAttribute("class", "modal-active")
		return () => {
			el.removeAttribute("class")
		}
	})
	return createPortal(children, document.getElementById('modal') as Element)
}
