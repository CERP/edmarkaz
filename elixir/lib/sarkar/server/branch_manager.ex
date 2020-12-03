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

	post "/user/authenticate" do

		[client_id] = get_req_header(conn, "client-id")

		%{ "username" => username, "password" => password } = conn.body_params

		conn = append_resp_headers(conn)

		case EdMarkaz.Auth.BranchManager.login({ username, client_id, password }) do
			{:ok, resp} ->


				%{ "schools" => schools, "token" => token } = resp

				# start all the schools related with branch manager

				schools_with_classes = schools
				|> Enum.reduce(%{}, fn (sid, agg) ->

					case start_school(sid) do
						{:ok} ->
							db = Sarkar.School.get_db(sid)
							Dynamic.put(agg, [sid, "classes"], db["classes"])
						_ ->
							db = Sarkar.School.get_db(sid)
							Dynamic.put(agg, [sid, "classes"], db["classes"])
					end

				end)

				# send schools with classes and token

				response = %{ "schools" => schools_with_classes, "token" => token }

				IO.inspect response

				body = Poison.encode!(response)
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

				daily_stats= %{
					"attendance" =>  %{
						"present" => 0,
						"absent" => 0,
						"leave" => 0
					},
					"payment" => %{
						"count" => 0,
						"amount" => 0
					}
				}

				# get the current date in ISO (YYYY-MM-DD) format
				current_date = DateTime.utc_now |> formatted_iso_date

				daily_students_stats = db["students"] |> Enum.reduce(daily_stats, fn {id, student}, agg ->

					# get the student attendance

					student_attendance = student["attendance"] |> Enum.reduce(daily_stats["attendance"], fn {date, value}, inner_agg ->

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

					# get the submitted payment

					fee_collection = student["payments"] |> Enum.reduce(0, fn {id, value}, inner_agg ->

						{:ok, payment_date } = DateTime.from_unix(value["date"], :millisecond)

						submitted_date = payment_date |> formatted_iso_date

						case current_date == submitted_date do

							true ->
								inner_agg + value["amount"]
							false ->
								inner_agg
						end

					end)

					# merge attedance and payment stats into agg

					%{ "present" => present, "absent" => absent, "leave" => leave } = agg["attendance"]
					%{ "amount" => amount, "count" => count } = agg["payment"]

					attendance = %{
						"present" => present + student_attendance["present"],
						"absent" => absent + student_attendance["absent"],
						"leave" =>  leave + student_attendance["leave"]
					}

					payment = case fee_collection > 0 do
						true ->
							%{ "amount" => amount + fee_collection, "count" => count + 1 }
						false ->
							agg["payment"]
					end

					# return to agg
					%{ "attendance" => attendance, "payment" => payment }

				end)

				# get the teacher attendance stats for the current day

				teacher_attendance = db["faculty"] |> Enum.reduce(daily_stats["attendance"], fn {fid, teacher}, agg ->


					# get the current attendance

					curr_attendance = Dynamic.get(teacher, ["attendance", current_date])

					if blank?(curr_attendance) do
						agg
					else

						[ item | _] =  curr_attendance |> Map.keys()

						status = if item == "check_in" or item == "checkout", do: "present", else: item

						Dynamic.put(agg, [status], agg[status] + 1)

					end

				end)

				# merge the students and teachers stats

				response = Dynamic.put(daily_students_stats, ["teacher_attendance"], teacher_attendance)

				# send back the response

				body = Poison.encode!(response)
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

	get "/students-attendance" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)
		# get the school id param from body
		school_id = conn.params["school_id"]

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

				attendance_list = db["students"] |> Enum.reduce(%{}, fn {id, student}, agg ->

					monthvise = student["attendance"] |> Enum.reduce(%{}, fn {key, value}, inner_agg ->

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

					sub_student = %{
						"attendance" => monthvise,
						"name" => student["Name"],
						"fname" => student["ManName"],
						"phone" => student["Phone"],
						"section_id" => student["section_id"]
					}

					Dynamic.put(agg, [id], sub_student)

				end)

				body = Poison.encode!(attendance_list)
				conn = append_resp_headers(conn)
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

	end

	get "/fee-analytics" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)


		body = Poison.encode!(%{message: "Load db for exams"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/expense-analytics" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)


		body = Poison.encode!(%{message: "Load db for exams"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/exams-analytics" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		db = Sarkar.School.get_db(school_id)


		body = Poison.encode!(%{message: "Load db for exams"})
		conn = append_resp_headers(conn)
		send_resp(conn, 200, body)

	end

	get "/teachers-attendance" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		conn = append_resp_headers(conn)

		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, _} ->

				# start the school
				start_school(school_id)

				db = Sarkar.School.get_db(school_id)

				teacher_attendance = db["faculty"] |> Enum.reduce(%{}, fn {fid, teacher}, agg ->

					attendance = teacher["attendance"] |> Enum.reduce(%{}, fn {date, value}, inner_agg ->

						# value -> check_in, check_out, absent, leave
						[ item | _] = Map.keys(value)

						status = if item == "check_in" or item == "checkout", do: "present", else: item

						Map.put(inner_agg, date, status)

					end)

					value = %{ "name" => teacher["Name"], "phone" => teacher["Phone"], "attendance" => attendance }

					Map.put(agg, fid, value)

				end)


				body = Poison.encode!(teacher_attendance)
				conn = append_resp_headers(conn)
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

	end

	get "/school-enrollment" do

		# get the auth from req_headers
		[ username, client_id, auth_token ] = get_auth_from_req_headers(conn)

		# get the school id param from body
		school_id = conn.params["school_id"]

		conn = append_resp_headers(conn)

		case EdMarkaz.Auth.BranchManager.verify({ username, client_id, auth_token }) do
			{:ok, _} ->

				# start the school
				start_school(school_id)

				db = Sarkar.School.get_db(school_id)

				school_students = db["students"] |> Enum.reduce(%{}, fn ({k, v}, agg) ->

					if blank?(v), do: agg

					# get filter variables

					section_id = Dynamic.get(v, ["section_id"], nil)
					name = Dynamic.get(v, ["Name"], nil)

					if blank?(section_id) && blank?(name) do
						agg
					else

						sub_student = %{
							"name" => v["Name"],
							"fname" => v["ManName"],
							"phone" => v["Phone"],
							"dob" => v["Birthdate"],
							"start_date" => v["StartDate"],
							"section_id" => v["section_id"],
							"gender" => v["Gender"],
							"active" => v["Active"]
						}

						Dynamic.put(agg, [k], sub_student)

					end
				end)


				body = Poison.encode!(school_students)
				conn = append_resp_headers(conn)
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

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

	def blank?(str_or_nil), do: str_or_nil == "" or str_or_nil == nil

end