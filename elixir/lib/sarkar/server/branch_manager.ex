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
							[ [ head ] | _] = resp.rows

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

				case start_school(school_id) do
					{:ok, pid} ->
						IO.puts "school start now"
					_ ->
						IO.puts	"school already started"
				end

				db = Sarkar.School.get_db(school_id)

				daily_stats = db["students"] |> Enum.reduce(%{"attendance" =>  %{ "present" => 0, "absent" => 0, "leave" => 0 } , "payment" => %{"count" => 0, "amount" => 0 } }, fn {id, student}, agg ->

					single_attendance = student["attendance"] |> Enum.reduce(%{ "present" => 0, "absent" => 0, "leave" => 0 }, fn {date, value}, inner_agg ->

						current_date = DateTime.utc_now |> formatted_iso_date

						case current_date == date do

							true ->

								case value["status"] do
									"PRESENT" ->
										Map.put(inner_agg, "present", 1)
									"ABSENT" ->
										Map.put(inner_agg, "absent", 1)
									_ ->
										Map.put(inner_agg, "leave", 1)
								end

							false ->

								inner_agg
						end

					end)

					student_payment_sum = student["payments"] |> Enum.reduce(0, fn {id, value}, inner_agg ->

						current_date = DateTime.utc_now |> formatted_iso_date

						{:ok, payment_date } = DateTime.from_unix(value["date"], :millisecond)

						submitted_date = payment_date |> formatted_iso_date

						case current_date == submitted_date do

							true ->
								inner_agg + value["amount"]
							false ->
								inner_agg
						end

					end)

					%{ "present" => present, "absent" => absent, "leave" => leave } = agg["attendance"]
					%{ "amount" => amount, "count" => count } = agg["payment"]

					attendance = %{
						"present" => present + single_attendance["present"],
						"absent" => absent + single_attendance["absent"],
						"leave" =>  leave + single_attendance["leave"]
					}

					payment = case student_payment_sum > 0 do
						true ->
							%{ "amount" => amount + student_payment_sum, "count" => count + 1 }
						false ->
							agg["payment"]
					end

					# return to agg
					%{ "attendance" => attendance, "payment" => payment }

				end)


				body = Poison.encode!(%{data: daily_stats})
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

		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, _} ->

				case start_school(school_id) do
					{:ok, pid} ->
						IO.puts "school start now"
					_ ->
						IO.puts	"school already started"
				end

				body = Poison.encode!(%{message: "fees endpoint"})
				conn = append_resp_headers(conn)
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

	end

	get "/analytics-students-attendance" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)
		# get the school id param from body
		school_id = conn.params["school_id"]

		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, _} ->

				case start_school(school_id) do
					{:ok, pid} ->
						IO.puts "school start now"
					_ ->
						IO.puts	"school already started"
				end

				db = Sarkar.School.get_db(school_id)

				students = db["students"]

				attendance_list = students |> Enum.reduce(%{}, fn {id, student}, agg ->

					attendance = student["attendance"]

					monthvise = attendance |> Enum.reduce(%{}, fn {key, value}, inner_agg ->

							[ year, month, day ] = String.split(key, "-")

							new_key = year <> "-" <> month

							case Map.has_key?(inner_agg, new_key) do

								true ->

									%{ "present" => present, "absent" => absent, "leave" => leave } = Map.get(inner_agg, new_key)

									case value["status"] do
										"PRESENT" ->
											Dynamic.put(inner_agg, [new_key, "present"], present + 1)
										"ABSENT" ->
											Dynamic.put(inner_agg, [new_key, "absent"], absent + 1)
										_ ->
											Dynamic.put(inner_agg, [new_key, "leave"], leave + 1)
									end

								false ->

									 new_entry = case value["status"] do
										"PRESENT" ->
											%{ "present" => 1, "absent" => 0, "leave" => 0 }
										"ABSENT" ->
											%{ "present" => 0, "absent" => 1, "leave" => 0 }
										_ ->
											%{ "present" => 0, "absent" => 0, "leave" => 1 }
									end

									Dynamic.put(inner_agg, [new_key], new_entry)
							end

						end)

					Dynamic.put(agg, [id], monthvise)

				end)

				conn = append_resp_headers(conn)

				body = Poison.encode!(%{data: attendance_list})
				conn = append_resp_headers(conn)
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

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

	defp formatted_iso_date (date) do
		[ date | _ ] = date |> DateTime.to_string |> String.split(" ")
		# YYYY-MM-DD
		date
	end

end