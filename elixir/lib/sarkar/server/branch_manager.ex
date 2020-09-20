defmodule EdMarkaz.Server.BranchManager do

	use Plug.Router

	# plug BasicAuth, use_config: {:edmarkaz, :basic_auth}
	if Mix.env == :dev do
		use Plug.Debugger
	  end

	use Plug.ErrorHandler

	plug :match

	plug Plug.Parsers,	parsers: [:json],
						pass:  ["application/json", "text/plain"],
						json_decoder: Jason

	plug :dispatch

	post "/users/authenticate" do

		IO.inspect conn.body_params

		%{
			"username" => username,
			"password" => password,
			"client_id" => client_id
		} = conn.body_params

		case EdMarkaz.Auth.BranchManager.login({ username, client_id, password }) do
			{:ok, token} ->
				send_resp(conn, 200, token)
			{:error, resp} ->
				send_resp(conn, 200, resp)
		end

	end

	get "/school-branches" do

		# get get token from body
		# verify the token
		# prepare the response
		# return the response

	end

	get "/hello" do
		IO.puts "I'm new to this world"
		send_resp(conn, 200, "hello")

	end


	match _ do
		send_resp(conn, 404, "not found")
	end

	defp handle_errors(conn, %{kind: _kind, reason: _reason, stack: _stack}) do
		send_resp(conn, conn.status, "Something went wrong")
	end

end