import { createPortal } from 'react-dom'
import { useEffect } from 'react'

export default ({ children }: any) => {
	useEffect(() => {
		//@ts-ignore
		const el: HTMLElement = document.getElementById('modal')
		el.setAttribute("class", "modal-active")

		return () => {
			el.removeAttribute("class")
		}
	})
	return createPortal(children, document.getElementById('modal') as Element)
}
