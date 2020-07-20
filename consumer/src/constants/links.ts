type TutorialLink = {
	[pathname: string]: {
		link: string
	}
}

export const ilmxTutorialLinks: TutorialLink = {
	"EXPLORE": {
		link: "https://www.youtube.com/embed/Yr-LY1T32Zo"
	},
	"LOG-IN": {
		link: "https://www.youtube.com/embed/1EUc5qCODpo"
	},

}

export const getTutotrialLink = (pathname: string) => {
	const path = pathname.split("/")[1].toUpperCase()
	const link = ilmxTutorialLinks[path] && ilmxTutorialLinks[path].link ? ilmxTutorialLinks[path].link : ilmxTutorialLinks["EXPLORE"].link
	return { link }
}
