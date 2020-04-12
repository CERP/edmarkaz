
import UrduIcon from '../icons/urdu.png'
import ScienceIcon from '../icons/science.png'
import BioIcon from '../icons/biology.png'
import MathIcon from '../icons/math.png'
import ChemistryIcon from '../icons/chemistry.png'
import EnglishIcon from '../icons/english.png'
import PhysicsIcon from '../icons/physics.png'
import MiscIcon from '../icons/misc.png'

export const getIconsFromSubject = (subject: string) => {
	switch (subject) {
		case "Urdu":
			return UrduIcon
		case "English":
			return EnglishIcon
		case "Math":
			return MathIcon
		case "General Science":
			return PhysicsIcon
		case "General Knowledge":
			return ScienceIcon
		default:
			return MiscIcon
	}
}