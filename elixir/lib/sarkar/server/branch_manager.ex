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

	match "/users/authenticate" do

		%{
			"username" => username,
			"password" => password,
			"client_id" => client_id
		} = conn.body_params

		conn = append_headers(conn)

		case EdMarkaz.Auth.BranchManager.login({ username, client_id, password }) do
			{:ok, token} ->
				body = Poison.encode!(%{data: %{token: token}})
				send_resp(conn, 200, body)
			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 200, body)
		end
	end

	get "/school-branches" do

		# get username and client_id from query params
		%{
			"username" => username,
			"client_id" => client_id
		} = conn.params

		# get auth token from req header
		[ auth_token | _ ] = get_req_header(conn, "authorization")

		conn = append_headers(conn)

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
		body = Poison.encode!(%{message: "Hello World"})
		conn = append_headers(conn)
		send_resp(conn, 200, body)
	end


	match _ do
		send_resp(conn, 404, "not found")
	end

	defp handle_errors(conn, %{kind: _kind, reason: _reason, stack: _stack}) do
		send_resp(conn, conn.status, "Something went wrong")
	end

	defp append_headers(conn) do
		conn
			|> put_resp_header("content-type", "application/json")
			|> put_resp_header("cache-control", "no-cache")
			|> put_resp_header("access-control-allow-methods", "GET, POST, OPTIONS")
			|> put_resp_header("access-control-allow-origin", "*")
			|> put_resp_header("access-control-allow-headers", "*")
	end
end