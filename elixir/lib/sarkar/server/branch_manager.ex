defmodule EdMarkaz.Server.BranchManager do

	use Plug.Router

	if Mix.env == :dev do
		use Plug.Debugger
	  end

	use Plug.ErrorHandler

	plug :match

	plug Plug.Parsers,	parsers: [:json],
						pass:  ["application/json"],
						json_decoder: Poison

	plug :dispatch

	post "/users/authenticate" do

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

		# get username and client_id from query params
		%{
			"username" => username,
			"client_id" => client_id
		} = conn.params

		# get auth token from header
		[ auth_token | _ ] = get_resp_header(conn, "authorization")

		# verify token here and get the school branches
		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, resp} ->
				case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
					"SELECT branches FROM branch_manager WHERE username=$1",[username]) do
						{:ok, resp} ->
							# get branches object only
							[ [ head ] | tail] = resp.rows

							body = body = Poison.encode!(%{data: head})
							send_resp(conn, 200, body)

						{:error, err} ->
							body = Poison.encode!(%{message: err})
							send_resp(conn, 200, body)
				end
			{:error, resp} ->
				body = Poison.encode!(%{message: resp})
				send_resp(conn, 200, body)
		end

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