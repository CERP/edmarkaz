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

	get "/students-payment" do

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


				p_map =  %{
					"OWED" => 0,
					"SUBMITTED" => 0,
					"FORGIVEN" => 0,
					"SCHOLARSHIP" => 0
				}

				students = db["students"] |> Enum.reduce(%{}, fn({sid, student}, agg) ->

					# IMPORTANT:
					# filter the student: params (not nil, not have payments, not section id)

					monthvise_payments = student["payments"]
					|> Enum.reduce(%{}, fn ({pid, payment}, agg2) ->

						%{
							"type" => p_type,
							"amount" => p_amount,
							"date" => p_date
						} = payment

						{:ok, payment_date } = DateTime.from_unix(p_date, :millisecond)
						[year, month, _] = payment_date |> formatted_iso_date |> String.split("-")

						period_key = month <> "-" <> year

						# somehow from the front-end, in some case payment amount is string
						amount =  if is_number(p_amount), do: p_amount, else: String.to_integer(p_amount)

						# already exist for the month
						if Map.has_key?(agg2, period_key) do

							prev_amount = Dynamic.get(agg2, [period_key, p_type], 0)

							if amount < 0 do

								Dynamic.put(agg2, [period_key, "SCHOLARSHIP"], abs(amount) + prev_amount)

							else

								Dynamic.put(agg2, [period_key, p_type], amount + prev_amount)

							end

						else

							# negative amount is also scholarship of payment type owed
							if amount < 0 do

								updated_debt = Dynamic.put(p_map, ["SCHOLARSHIP"], abs(amount))

								Dynamic.put(agg2, [period_key], updated_debt)

							else

								updated_debt = Dynamic.put(p_map, [p_type], amount)

								Dynamic.put(agg2, [period_key], updated_debt)

							end

						end

					end)

					agg_payments = monthvise_payments |> Enum.reduce(p_map, fn({_, v}, agg_payment) ->
						%{
							"OWED" => agg_payment["OWED"] + v["OWED"],
							"SUBMITTED" => agg_payment["SUBMITTED"] + v["SUBMITTED"],
							"FORGIVEN" => agg_payment["FORGIVEN"] + v["FORGIVEN"],
							"SCHOLARSHIP" => agg_payment["SCHOLARSHIP"] + v["SCHOLARSHIP"]
						}
					end)

					debt = abs(agg_payments["FORGIVEN"] + agg_payments["SCHOLARSHIP"] + agg_payments["SUBMITTED"] - agg_payments["OWED"])

					sub_part = %{
						"name" => student["Name"],
						"fname" => student["ManName"],
						"phone" => student["Phone"],
						"section_id" => student["section_id"],
						"payments" => %{
							"monthvise" => monthvise_payments,
							"aggregated" => agg_payments,
							"debt" => debt
						}
					}

					Dynamic.put(agg, [sid], sub_part)

				end)

				body = Poison.encode!(students)
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

							[year, month, _] = String.split(key, "-")

							new_key = month <> "-" <> year

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


	get "/school-expense" do

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

				p_map =  %{
					"OWED" => 0,
					"SUBMITTED" => 0,
					"FORGIVEN" => 0,
					"SCHOLARSHIP" => 0
				}

				# this should return %{ [date: string]: typeof p_map }

				school_income = db["students"] |> Enum.reduce(%{}, fn({_, student}, agg) ->

					# IMPORTANT:
					# filter the student: params (not nil, not have payments, not section id)

					monthvise_payments = student["payments"]
					|> Enum.reduce(%{}, fn ({pid, payment}, agg2) ->

						%{
							"type" => p_type,
							"amount" => p_amount,
							"date" => p_date
						} = payment

						{:ok, payment_date } = DateTime.from_unix(p_date, :millisecond)

						[year, month, _] = payment_date |> formatted_iso_date |> String.split("-")

						period_key = month <> "-" <> year

						# somehow from the front-end, in some case payment amount is string
						amount =  if is_number(p_amount), do: p_amount, else: String.to_integer(p_amount)

						# already exist for the month
						if Map.has_key?(agg2, period_key) do

							prev_amount = Dynamic.get(agg2, [period_key, p_type], 0)

							if amount < 0 do

								Dynamic.put(agg2, [period_key, "SCHOLARSHIP"], abs(amount) + prev_amount)

							else
								Dynamic.put(agg2, [period_key, p_type], amount + prev_amount)
							end

						else

							# negative amount is also scholarship of payment type owed
							if amount < 0 do

								updated_debt = Dynamic.put(p_map, ["SCHOLARSHIP"], abs(amount))

								Dynamic.put(agg2, [period_key], updated_debt)

							else

								updated_debt = Dynamic.put(p_map, [p_type], amount)

								Dynamic.put(agg2, [period_key], updated_debt)

							end

						end

					end)

					# merge curr student payment stats with existing map

					updated_agg = monthvise_payments |> Enum.reduce(agg, fn({k, v}, agg_payment) ->

						if Map.has_key?(agg_payment, k) do

							existing_item = Dynamic.get(agg_payment, [k])

							updated_map =%{
								"OWED" => existing_item["OWED"] + v["OWED"],
								"SUBMITTED" => existing_item["SUBMITTED"] + v["SUBMITTED"],
								"FORGIVEN" => existing_item["FORGIVEN"] + v["FORGIVEN"],
								"SCHOLARSHIP" => existing_item["SCHOLARSHIP"] + v["SCHOLARSHIP"]
							}

							Dynamic.put(agg_payment, [k], updated_map)

						else

							Dynamic.put(agg_payment, [k], v)

						end

					end)

					# return updated agg
					updated_agg

				end)

				expense_stats = %{
					"income" => 0,
					"expense" => 0
				}

				# here we get %{ [date: string]: %{expense: number}}

				school_expense = db["expenses"] |> Enum.reduce(%{}, fn({_, expense}, agg) ->

					exp_category = Dynamic.get(expense, ["category"], "")
					exp_amount = Dynamic.get(expense, ["amount"], 0)
					exp_deduction = Dynamic.get(expense, ["deduction"], 0)
					exp_type = Dynamic.get(expense, ["type"], "")
					exp_expense = Dynamic.get(expense, ["expense"], "")
					exp_date = Dynamic.get(expense, ["date"], "")



					{:ok, expense_date } = DateTime.from_unix(exp_date, :millisecond)

					[year, month, _] = expense_date |> formatted_iso_date |> String.split("-")

					period_key = month <> "-" <> year

					parsed_amount = if is_number(exp_amount), do: exp_amount, else: String.to_integer(exp_amount)
					parsed_deduction = if is_number(exp_deduction), do: exp_deduction, else: String.to_integer(exp_deduction)

					if exp_type == "PAYMENT_GIVEN" do

						if Map.has_key?(agg, period_key) do

							prev_amount = Dynamic.get(agg, [period_key, "expense"], 0)

							amount = if exp_expense == "SALARY_EXPENSE", do: parsed_amount - parsed_deduction, else: parsed_amount

							Dynamic.put(agg, [period_key, "expense"], amount + prev_amount)

						else

							amount = if exp_expense == "SALARY_EXPENSE", do: parsed_amount - parsed_deduction, else: parsed_amount

							Dynamic.put(agg, [period_key, "expense"], amount)
						end

					else
						agg
					end

				end)

				response = school_expense |> Enum.reduce(%{}, fn ({k, v}, agg) ->

					submitted = Dynamic.get(school_income, [k, "SUBMITTED"], 0)

					merged = %{
						"income" => submitted,
						"expense" => v["expense"]
					}

					Dynamic.put(agg, [k], merged)

				end)


				body = Poison.encode!(response)
				conn = append_resp_headers(conn)
				send_resp(conn, 200, body)

			{:error, err} ->
				body = Poison.encode!(%{message: err})
				send_resp(conn, 400, body)
		end

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