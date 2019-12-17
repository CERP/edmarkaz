workbox.routing.registerRoute(
	({ url, event }) => {
		const match = url.host === "storage.googleapis.com" || url.host === "fonts.googleapis.com"
		return match
	},
	new workbox.strategies.StaleWhileRevalidate({
		cacheName: 'images'
	})
)