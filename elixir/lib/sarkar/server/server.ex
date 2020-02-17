defmodule EdMarkaz.Router do
	use Plug.Router

	plug :match
	plug :dispatch

	forward "/analytics", to: EdMarkaz.Server.Analytics
	forward "/masking", to: EdMarkaz.Server.Masking

	match "/" do
		send_resp(conn, 200, "hello from plug")
	end

end