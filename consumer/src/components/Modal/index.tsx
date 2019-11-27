import { createPortal } from 'react-dom'

export default ({ children }: any) => (createPortal(children, document.getElementById('modal') as Element))
