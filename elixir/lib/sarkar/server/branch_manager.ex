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

	options _ do
		conn
		|> append_resp_headers()
		|> send_resp(200, "ok")
	end

	post "/users/authenticate" do
		%{
			"username" => username,
			"password" => password,
			"client_id" => client_id
		} = conn.body_params

		conn = append_resp_headers(conn)

		case EdMarkaz.Auth.BranchManager.login({ username, client_id, password }) do
			{:ok, resp} ->

				%{ "schools" => schools, "token" => _ } = resp

				# start all the schools related with branch manager

				schools |> Enum.each(fn sid -> start_school(sid) end)

				# send schools and token

				body = Poison.encode!(%{data: resp})
				send_resp(conn, 200, body)

			{:error, err} ->

				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end
	end

	get "/school-branches" do

		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		conn = append_resp_headers(conn)

		# verify token here and get the school branches
		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, _} ->
				case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
					"SELECT branches FROM branch_manager WHERE username=$1",[username]) do
						{:ok, resp} ->
							# get branches object only
							[ [ head ] | tail] = resp.rows

							body = body = Poison.encode!(%{data: head})
							send_resp(conn, 200, body)

						{:error, err} ->
							body = Poison.encode!(%{message: err})
							send_resp(conn, 400, body)
				end
			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

	end

	get "/daily-stats" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		# set response headers
		conn = append_resp_headers(conn)

		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, _} ->

				# get the student attendance stats
				attendance_stats = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
					"SELECT value->>0 as status
						FROM flattened_schools
						WHERE school_id=$1 AND path like 'students%attendance%status'
						AND to_timestamp(time/1000)::date=now()::date order by time asc",[school_id]) do

						{:ok, resp} ->

							resp.rows |> Enum.reduce(%{ "present" => 0, "absent" => 0, "leave" => 0 }, fn [status], agg ->
								case status do
									"PRESENT" ->
										present = agg["present"] + 1
										Map.put(agg, "present", present)
									"ABSENT" ->
										absent = agg["absent"] + 1
										Map.put(agg, "absent", absent)
									# handle LEAVE, CASUAL_LEAVE, SHORT_LEAVE, SICK_LEAVE
									_ ->
										leave = agg["leave"] + 1
										Map.put(agg, "leave", leave)
								end
							end)

						{:error, err} ->
							# return empty stats list
							[]
					end

				payment_list = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
					"SELECT path[3] as student_id, value
						FROM writes
						WHERE school_id=$1 AND path[2]='students' AND path[4]='payments' AND value->>'type'='SUBMITTED' AND to_timestamp(time/1000)::date=now()::date", [school_id]) do
						{:ok, resp} ->
							resp.rows
								|> Enum.reduce(%{"count" => 0, "amount" => 0}, fn [student_id, value], agg ->
										count = agg["count"] + 1
										amount = agg["amount"] + value["amount"]
										#  return updated values
										%{"count" => count, "amount" => amount}
								end)
						{:error, err} ->
							[]
					end

				body = Poison.encode!(%{data: %{ attendance: attendance_stats, payment: payment_list}})
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

	end

	get "/analytics-fees" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)


		body = Poison.encode!(%{message: "Load db for fees analytics"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/analytics-studennt-attendance" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)


		body = Poison.encode!(%{message: "Load db for student attendance"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/analytics-exams" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)


		body = Poison.encode!(%{message: "Load db for exams"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/analytics-teacher-attendance" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)

		body = Poison.encode!(%{message: "Hello world"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/hello" do
		body = Poison.encode!(%{message: "Hello world"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)
	end

	match _ do
		body = Poison.encode!(%{message: "Not found"})
		conn = append_resp_headers(conn)
		send_resp(conn, 404, body)
	end

	defp handle_errors(conn, %{kind: _kind, reason: _reason, stack: _stack}) do
		body = Poison.encode!(%{message: "Something went wrong"})
		conn = append_resp_headers(conn)
		send_resp(conn, conn.status, body)
	end

	defp append_resp_headers(conn) do
		conn
			|> put_resp_header("content-type", "application/json")
			|> put_resp_header("cache-control", "no-cache")
			|> put_resp_header("access-control-allow-methods", "GET, POST, OPTIONS")
			|> put_resp_header("access-control-allow-origin", "*")
			|> put_resp_header("access-control-allow-headers", "*")

	end

	defp get_auth_from_req_headers(conn) do

		[ username ] = get_req_header(conn, "username")
		[ client_id ] = get_req_header(conn, "client-id")
		[ auth_token ] = get_req_header(conn, "auth-token")

		[username, client_id, auth_token]
	end

	defp start_school(school_id) do
		case Registry.lookup(EdMarkaz.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

end