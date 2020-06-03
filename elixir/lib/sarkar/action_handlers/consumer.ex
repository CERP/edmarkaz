defmodule EdMarkaz.ActionHandler.Consumer do

# 	pswrd 2019244053

# phhone 03324198186


# events: {
# 	[device_id]: {
# 		[timestamp]: {
# 			lesson_id: 1,
# 			duration: 5,
# 		}
# 	}
# },
# lessons: {
# 	[lesson_id]: {
# 		title: L,M,N,
# 		type: "VIDEO",
# 		url: yt_ling,
# 		chapter_name: ABC,
# 	}
# }

	def handle_action(
		%{
			"type" => "AUTO_LOGIN",
			"payload" => %{
				"user" => user,
				"mis_token" => mis_token,
				"school_id" => school_id,
				"client_id" => client_id,
				"mis_client_id" => mis_client_id,
				"phone" => phone
			}
		},
		state
	) do
		IO.puts "Auto login ilmx"

		# will make it one transaction ------------------
		case EdMarkaz.Auth.verify({school_id, mis_client_id, mis_token}) do
			{:ok, message} ->
				case EdMarkaz.DB.Postgres.query(
					EdMarkaz.DB,
					"SELECT phone, mis_id, ilmx_id FROM ilmx_to_mis_mapper WHERE mis_id=$1",
					[school_id]
				) do
					{:ok, %Postgrex.Result{num_rows: 0}} ->
						IO.puts "Not found in ILMX/MIS"
						IO.puts "Checking if in auth"
						case EdMarkaz.DB.Postgres.query(
							EdMarkaz.DB,
							"SELECT id FROM auth WHERE id=$1",
							[phone]
						) do
							{:ok, %Postgrex.Result{num_rows: 0}} ->
								IO.puts "NOT FOUND AUTH CREATING A NEW PROFILE"
								ilmx_id = "#{UUID.uuid4}"
								profile = %{
									"refcode" => ilmx_id,
									"lowest_fee" => "",
									"highest_fee" => "",
									"school_name" => "",
									"phone_number" => phone,
									"school_tehsil" => "",
									"school_address" => "",
									"school_district" => "",
									"total_enrolment" => "",
									"respondent_owner" => ""
								}
								case EdMarkaz.Auth.create({ phone, phone }) do
									{:ok, text} ->
										IO.puts "SAVING SCHOOL"
										{:ok, res} = EdMarkaz.DB.Postgres.query(
											EdMarkaz.DB,
											"INSERT INTO platform_schools (id, db)
											VALUES ($1, $2)
											ON CONFLICT (id) DO UPDATE set db=excluded.db",
											[ilmx_id, profile]
										)
										IO.puts "ADDING TO ILM/MIS mapper"
										{:ok, resp} = EdMarkaz.DB.Postgres.query(
											EdMarkaz.DB,
											"INSERT INTO ilmx_to_mis_mapper (phone, mis_id, ilmx_id) VALUES ($1,$2,$3)",
											[phone, school_id, ilmx_id]
										)
										IO.puts "GENERATING TOKEN"
										{:ok, token} = EdMarkaz.Auth.login({phone, client_id, phone})
										IO.puts "SUCCESS"
										{:reply, succeed(%{token: token, sync_state: %{ "profile" => profile }, id: phone, user: "SCHOOL" }), %{id: phone, client_id: client_id}}
									{:error, msg} ->
										{:reply, fail(msg), state}
								end
							{:ok, resp} ->
								[[ id ]] = resp.rows
								IO.puts "Found in auth"
								IO.puts "Getting profile"
								case EdMarkaz.School.get_profile(phone) do
									{:ok, ilmx_school_id, profile} ->
										IO.puts "FOUND PROFILE"
										IO.puts "ADDING TO ILM/MIS mapper"
										{:ok, resp} = EdMarkaz.DB.Postgres.query(
											EdMarkaz.DB,
											"INSERT INTO ilmx_to_mis_mapper (phone, mis_id, ilmx_id) VALUES ($1,$2,$3)",
											[phone, school_id, ilmx_school_id]
										)
										IO.puts "GENERATING TOKEN"
										case EdMarkaz.Auth.gen_token(phone, client_id) do
											{:ok, token} ->
												IO.puts "SUCCESS"
												{:reply, succeed(%{token: token, sync_state: %{ "profile" => profile }, id: phone, user: "SCHOOL" }), %{id: phone, client_id: client_id}}
											{:error, msg} ->
												IO.puts "Erorr while generating token in auto login"
												{:reply, fail(msg), %{}}
										end
									{:error, msg} ->
										IO.puts "NO PROFILE FOUND"
										IO.puts "CREATING NEW PROFILE"
										# if no profile exisits in platform schools
										ilmx_id = "#{UUID.uuid4}"
										profile = %{
											"refcode" => ilmx_id,
											"lowest_fee" => "",
											"highest_fee" => "",
											"school_name" => "",
											"phone_number" => phone,
											"school_tehsil" => "",
											"school_address" => "",
											"school_district" => "",
											"total_enrolment" => "",
											"respondent_owner" => ""
										}
										IO.puts "SAVING PROFILE"
										{:ok, res} = EdMarkaz.DB.Postgres.query(
											EdMarkaz.DB,
											"INSERT INTO platform_schools (id, db)
											VALUES ($1, $2)
											ON CONFLICT (id) DO UPDATE set db=excluded.db",
											[ilmx_id, profile]
										)
										IO.puts "ADDING TO ILM/MIS mapper"
										{:ok, resp} = EdMarkaz.DB.Postgres.query(
											EdMarkaz.DB,
											"INSERT INTO ilmx_to_mis_mapper (phone, mis_id, ilmx_id) VALUES ($1,$2,$3)",
											[phone, school_id, ilmx_id]
										)
										IO.puts "GENERATING TOKEN"
										case EdMarkaz.Auth.gen_token(phone, client_id) do
											{:ok, token} ->
												IO.puts "SUCCESS"
												{:reply, succeed(%{token: token, sync_state: %{ "profile" => profile }, id: phone, user: "SCHOOL" }), %{id: phone, client_id: client_id}}
											{:error, msg} ->
												IO.puts "Erorr while generating token in auto login"
												{:reply, fail(msg), %{}}
										end
								end
							{:error, err} ->
								IO.inspect err
								{:reply, fail(err), %{}}
						end
			{:ok, resp} ->
				IO.puts "Found in ILMX/MIS Mapper"
				[[phone_two, mis_id, ilmx_id ]] = resp.rows
				# have an ilmx account already
				IO.puts "GETTING PROFILE"
				case EdMarkaz.School.get_profile_by_id(ilmx_id) do
					{:ok, number, profile} ->
						IO.puts "GENERATING TOKEN"
						case EdMarkaz.Auth.gen_token(phone_two, client_id) do
							{:ok, token} ->
								IO.puts "SUCCESS"
								{:reply, succeed(%{token: token, sync_state: %{ "profile" => profile }, id: phone_two, user: "SCHOOL" }), %{id: phone_two, client_id: client_id}}
							{:error, msg} ->
								IO.puts "Erorr while generating token in auto login"
								{:reply, fail(msg), %{}}
						end
					{:error, msg} ->
						{:reply, fail(msg), state}
				end
			{:error, err} ->
				IO.puts "ERROR CHECKING ILMX?MIS Mapper"
				IO.inspect err
				{:reply, fail(err), %{}}
		end
	end

		# --------------- END -------------------------
	end

	defp start_school(school_id) do
		case Registry.lookup(EdMarkaz.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

	defp register_connection(school_id, client_id) do
		{:ok, _} = Registry.register(EdMarkaz.ConnectionRegistry, school_id, client_id)
	end

	def handle_action(
		%{
			"type" => "GET_ALL_COURSES",
			"payload" => payload
		},
		state
	) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT * FROM student_portal",
		[]
		) do
			{:ok, resp} ->
				mapped = resp.rows
				|> Enum.reduce(
					%{},
					fn ([_id, medium, class, subject, chapter_id, lesson_id, lesson, _date], acc) ->
						val = %{
							"medium" => medium,
							"class" => class,
							"subject" => subject,
							"chapter_id" => chapter_id,
							"lesson_id" => lesson_id,
							"meta" => lesson,
						}
						Dynamic.put(acc,[medium, class, subject, chapter_id, lesson_id], val)
					end
				)
				{:reply, succeed(mapped), state}
			{:error, msg} ->
				IO.inspect msg
				{:reply, fail(msg), state}

		end
	end
	def handle_action(%{ "type" => "SMS_AUTH_CODE",
		"client_id" => client_id,
		"payload" => %{ "phone" => phone }}, state) do

			IO.inspect phone

			case EdMarkaz.School.get_profile(phone) do
				{:ok, school_id, profile} ->
					refcode = Map.get(profile, "refcode")
					{:ok, one_token} = EdMarkaz.Auth.gen_onetime_token(refcode)

					case EdMarkaz.Contegris.send_sms(phone, "Click here to login https://ilmexchange.com/auth/#{one_token} ,Or enter code #{one_token}") do
						{:ok, res} ->
							{:reply, succeed(res), state}
						{:error, msg} ->
							IO.inspect msg
							{:reply, fail(msg), state}
					end

				{:error, msg} ->
					{:reply, fail(msg), state}
				end
	end

	def login_analytics(phone, refcode, client_id) do
		time = :os.system_time(:millisecond)
		case Sarkar.Analytics.Consumer.record(
			client_id,
			%{ "#{UUID.uuid4}" => %{
					"type" => "LOGIN",
					"meta" => %{
						"number" => phone,
						"ref_code" => refcode
					},
					"time" => time
				}
			},
			time
		) do
			%{"type" => "CONFIRM_ANALYTICS_SYNC", "time" => _} -> {:ok}
			%{"type" => "ANALYTICS_SYNC_FAILED"} ->
				IO.puts "LOGIN ANALYTICS FAILED"
		end
	end

	def handle_action(
		%{
			"type" => "SIGN_UP",
			"client_id" => client_id,
			"payload" => %{
				"number" => number,
				"password" => password,
				"profile" => profile
			}
		}, state
	) do

		IO.puts "handling sign up for #{number}"
		refcode = Map.get(profile, "refcode")

		# we aren't syncing platform schools
		# if someone saves some bogus value here, we aren't able to undo

		case EdMarkaz.Auth.create({ number, password }) do
			{:ok, text} ->
				{:ok, res} = EdMarkaz.DB.Postgres.query(
					EdMarkaz.DB,
					"INSERT INTO platform_schools (id, db)
					VALUES ($1, $2)
					ON CONFLICT (id) DO UPDATE set db=excluded.db",
					[refcode, profile]
				)
				{:ok, token} = EdMarkaz.Auth.login({number, client_id, password})
				{:ok, one_token} = EdMarkaz.Auth.gen_onetime_token(refcode)

				student_token = case String.slice(number, 0..0) === "0" do
					true ->
						number |> String.slice(1..-1) |> String.reverse
					false ->
						number |> String.reverse
				end

				spawn fn ->
					res = EdMarkaz.Contegris.send_sms(
						number,
						"Welcome to ilmExchange. Please go here to login https://ilmexchange.com/auth/#{one_token} \nYour Student Referral Link is https://ilmexchange.com/student?referral=#{student_token}"
					)
					IO.inspect res
				end

				spawn fn ->
					time = :os.system_time(:millisecond)
					case Sarkar.Analytics.Consumer.record(
						client_id,
						%{ "#{UUID.uuid4}" => %{
								"type" => "SIGNUP",
								"meta" => %{
									"number" => number,
									"ref_code" => refcode
								},
								"time" => time
							}
						},
						time
					) do
						%{"type" => "CONFIRM_ANALYTICS_SYNC", "time" => _} ->
							IO.puts "SIGNUP ANALYTICS SUCCESS"
						%{"type" => "ANALYTICS_SYNC_FAILED"} ->
							IO.puts "SIGNUP ANALYTICS FAILED"
					end
				end

				{:reply, succeed(%{token: token, user: "SCHOOL"}), %{id: number, client_id: client_id}}
			{:error, msg} ->
				{:reply, fail(msg), state}
		end
	end

	def handle_action(%{"type" => "URL_AUTH", "client_id" => client_id, "payload" => %{"token" => token} }, state) do
		case EdMarkaz.Auth.verifyOneTime(token) do
			{:ok, refcode} ->
				# from the refcode we need to retrieve the phone number
				# and then we can log them in
				{:ok, res} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "SELECT db, db->>'phone_number' FROM platform_schools WHERE id=$1", [refcode])
				[[ profile, number ]] = res.rows
				spawn fn ->
					login_analytics(number, refcode, client_id)
				end
				{:ok, new_token} = EdMarkaz.Auth.gen_token(number, client_id)

				{:reply, succeed(%{token: new_token, sync_state: %{ "profile" => profile }, id: number, user: "SCHOOL" }), %{id: number, client_id: client_id}}
			{:error, err} ->
				IO.inspect err
				{:reply, fail(err), %{}}
		end
	end

	def handle_action(%{"type" => "SUBMIT_ERROR", "payload" => %{"error" => error, "errInfo" => errInfo, "date" => date}}, state) do

		%{ "name" => name, "message" => message } = error

		EdMarkaz.Slack.send_alert("#{name}: #{message}\n #{errInfo}", "#ilmx-errors")

		{:reply, succeed(), state}
	end

	def handle_action(%{
		"type" => "SUBMIT_ERROR",
		"payload" => %{
			"error" => error,
			"date" => date
		}
		}, state
	) do

		EdMarkaz.Slack.send_alert("Error: #{error}", "#ilmx-errors")

		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "GET_PROFILE", "payload" => %{"number" => number}}, state) do

		case EdMarkaz.School.get_profile(number) do
			{:ok, school_id, db} -> {:reply, succeed(%{"school_id" => school_id, "school" => db}), state}
			{:error, msg} -> {:reply, fail(%{"msg" => msg}), state}
		end

	end

	def handle_action(
		%{
			"type" => "VERIFY_STUDENT_TOKEN",
			"client_id" => client_id,
			"payload" => %{
				"token" => token
			}
		},
		state
	) do
		number = token |> String.reverse

		case EdMarkaz.School.get_profile("0#{number}") do
			{:ok, school_id, db} ->
				{:ok, res} = EdMarkaz.DB.Postgres.query(
					EdMarkaz.DB,
					"INSERT INTO device_to_school_mapper VALUES($1, $2, $3)",
					[school_id, client_id, %{}]
				)

				spawn fn ->
					time = :os.system_time(:millisecond)
					case Sarkar.Analytics.Consumer.record(
						client_id,
						%{ "#{UUID.uuid4}" => %{
								"type" => "STUDENT_LINK_SIGNUP",
								"meta" => %{
									"number" => "0#{number}",
									"ref_code" => school_id
								},
								"time" => time
							}
						},
						time
					) do
						%{"type" => "CONFIRM_ANALYTICS_SYNC", "time" => _} ->
							IO.puts "STUDENT_LINK_SIGNUP ANALYTICS SUCCESS"
						%{"type" => "ANALYTICS_SYNC_FAILED"} ->
							IO.puts "STUDENT_LINK_SIGNUP ANALYTICS FAILED"
					end
				end

				{:reply, succeed(%{"school_id" => school_id, "school" => db}), state}
			{:error, msg} ->
				{:reply, fail(%{"msg" => msg}), state}
		end
	end

	def handle_action(
		%{
			"type" => "SAVE_STUDENT_INFORMATION",
			"client_id" => client_id,
			"payload" => %{
				"profile" => profile,
				"school_id" => school_id
			}
		},
		state
	)do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO device_to_school_mapper VALUES($1, $2, $3)",
			[school_id, client_id, profile]
		) do
			{:ok, res } ->
				{:reply, succeed(), state}
			{:error, err} ->
				IO.inspect err
				{:reply, fail(err), state}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"id" => id, "token" => token, "client_id" => client_id}}, state) do
		case EdMarkaz.Auth.verify({id, client_id, token}) do
			{:ok, _} ->
				register_connection(id, client_id)
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} ->
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type" => "PLACE_ORDER", "payload" => %{"product" => product, "refcode" => refcode, "school_name" => school_name }}, %{client_id: client_id, id: id} = state) do

		product_name = Map.get(product, "title")
		product_id = Map.get(product,"id")
		supplier_id = Map.get(product, "supplier_id")

		start_supplier(supplier_id)
		EdMarkaz.Supplier.place_order(supplier_id, product, refcode, client_id)
		spawn fn ->
			EdMarkaz.Slack.send_alert("#{school_name} placed order for #{product_id} by #{supplier_id}. Their number is #{id}", "#platform-orders")
		end

		spawn fn ->
			EdMarkaz.Contegris.send_sms(id, "You have requested information for #{product_name} and will be contacted soon with more information.")
		end

		{:reply, succeed(), state}

	end

	def handle_action(%{"type" => "GET_PRODUCTS", "last_sync" => last_sync}, state) do

		dt = DateTime.from_unix!(last_sync, :millisecond)

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "
			SELECT
				p.id,
				p.supplier_id,
				p.product,
				p.sync_time,
				s.sync_state->'profile'
			FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id
			WHERE extract(epoch from sync_time) > $1 ", [0]) do
			{:ok, resp} ->
				mapped = resp.rows
					|> Enum.map(fn [id, supplier_id, product, sync_time, supplier_profile] -> {id, Map.put(product, "supplier_profile", supplier_profile)} end)
					|> Enum.into(%{})

				{:reply, succeed(%{products: mapped}), state}
			{:error, err} ->
				IO.puts "error getting product"
				IO.inspect err
				{:reply, fail("error getting products"), state}
		end
	end

	# logged-in sync
	def handle_action(
		%{
			"type" => "SYNC",
			"payload" => %{
				"analytics" => analytics,
				"mutations" => mutations
			},
			"last_snapshot" => last_sync_date
		},
		%{ id: id, client_id: client_id } = state
	) do

		mutations_res = if map_size(mutations) > 0 do
			EdMarkaz.Consumer.sync_changes(id, client_id, mutations, last_sync_date)
		else
			%{ "type" => "CONFIRM_SYNC_DIFF", "date" => 0, "new_writes" => %{}}
		end

		analytics_res = Sarkar.Analytics.Consumer.record(client_id, analytics, last_sync_date)

		res = %{
			"mutations" => mutations_res,
			"analytics" => analytics_res
		}

		{:reply, succeed(res), state}
	end

	def handle_action(
		%{
			"type" => "SYNC",
			"payload" => %{
				"analytics" => analytics,
			},
			"last_snapshot" => last_sync_date
		} = action,
		%{ id: id, client_id: client_id } = state
	) do
		action = Map.put(action, "payload", %{
			"analytics" => analytics,
			"mutations" => %{}
		})

		handle_action(action, state)

	end

	#logged-out sync
	def handle_action(
		%{
			"type" => "SYNC",
			"payload" => %{
				"analytics" => analytics,
				"mutations" => mutations
			},
			"last_snapshot" => last_sync_date,
			"client_id" => client_id
		},
		state
	) do

		mutations_res = %{"type" => "noop"}
		analytics_res = Sarkar.Analytics.Consumer.record(client_id, analytics, last_sync_date)

		res = %{
			"mutations" => mutations_res,
			"analytics" => analytics_res
		}

		{:reply, succeed(res), state}
	end

	def handle_action(
		%{
			"type" => "SYNC",
			"payload" => %{
				"analytics" => analytics,
			},
			"last_snapshot" => last_sync_date
		} = action,
		state
	) do
		action = Map.put(action, "payload", %{
			"analytics" => analytics,
			"mutations" => %{}
		})

		handle_action(action, state)

	end



	#old sync
	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do
		IO.puts "OLD SYNC"

		{:reply, succeed(%{"type" => "noop"}), state}
	end

	def handle_action(msg, state) do
		IO.puts "no handler for msg"
		IO.inspect msg
		IO.inspect state

		{:reply, fail(), state}
	end

	defp start_supplier(id) do
		case Registry.lookup(EdMarkaz.SupplierRegistry, id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SupplierSupervisor, {EdMarkaz.Supplier, {id}})
		end
	end

	defp register_connection(id, client_id) do
		{:ok, _} = Registry.register(EdMarkaz.ConnectionRegistry, id, client_id)
	end

	defp fail(message) do
		%{type: "failure", payload: message}
	end

	defp fail() do
		%{type: "failure"}
	end

	defp succeed(payload) do
		%{type: "succeess", payload: payload}
	end

	defp succeed() do
		%{type: "success"}
	end

end