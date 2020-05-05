
import UrduIcon from '../icons/urdu.png'
import ScienceIcon from '../icons/science.png'
import BioIcon from '../icons/biology.png'
import MathIcon from '../icons/math.png'
import ChemistryIcon from '../icons/chemistry.png'
import EnglishIcon from '../icons/english.png'
import GeneralScience from '../icons/physics.png'
import PhysicsIcon from '../icons/physics2.png'
import MiscIcon from '../icons/misc.png'
import IslamEthicsIcon from "../icons/Islamethics.png";
import artC from '../icons/artC.png'
import ST from '../icons/scienceTech.png'
import WaAUs from '../icons/worldAroundUs.png'
import health from '../icons/health.png'



export const getIconsFromSubject = (subject: string) => {
	switch (subject.trim()) {
		case "Urdu":
			return UrduIcon
		case "English":
			return EnglishIcon
		case "Math":
			return MathIcon
		case "General Science":
			return GeneralScience
		case "General Knowledge":
			return ScienceIcon
		case "Biology":
			return BioIcon
		case "Chemistry":
			return ChemistryIcon
		case "Physics":
			return PhysicsIcon
		case "Ethics & Islam":
			return IslamEthicsIcon
		case "Islamiat":
			return IslamEthicsIcon
		case "Art & Music":
			return artC
		case "Science and Technology":
			return ST
		case "The World Around Us":
			return WaAUs
		case "Hamari Dunya":
			return WaAUs
		case "Me & My Health":
			return health
		default:
			return MiscIcon
	}
}