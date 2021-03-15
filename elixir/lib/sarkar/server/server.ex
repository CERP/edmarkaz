defmodule EdMarkaz.Router do
	use Plug.Router

	plug :match
	plug :dispatch

	forward "/mis", to: EdMarkaz.Server.MIS
	forward "/ilmx/analytics", to: EdMarkaz.Server.Analytics
	forward "/masking", to: EdMarkaz.Server.Masking
	forward "/branch-manager/", to: EdMarkaz.Server.BranchManager

	match "/favicon.ico" do
		send_resp(conn, 200, "This resource doesn't exist")
	end

	match "/" do
		send_resp(conn, 200, "hello from plug")
	end

    match _ do 
      send_resp(conn, 404, "page not found")
    end

end
