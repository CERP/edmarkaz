defmodule Sarkar.ActionHandler.Mis do


	def handle_action(
		%{
			"type" => "AUTO_LOGIN",
			"payload" => %{
				"token" => token,
				"school_id" => school_id,
				"client_id" => client_id,
				"ilmx_school_id" => ilmx_school_id,
				"ilmx_client_id" => ilmx_client_id
			}
		},
		state
	) do

		IO.puts ilmx_school_id
		IO.puts school_id
		#verifying the ilmx info
		case Sarkar.Auth.verify({school_id, ilmx_client_id, token}) do
			{:ok, message} ->
				IO.puts "HELLO"
				case EdMarkaz.DB.Postgres.query(
					EdMarkaz.DB,
					"SELECT phone, mis_id, ilmx_id FROM ilmx_to_mis_mapper WHERE ilmx_id=$1",
					[ilmx_school_id]
				) do
					{:ok, %Postgrex.Result{num_rows: 0}} ->
						IO.puts "NOT IN ILMX/MIS MAPPER"
						IO.puts "Putting in table"
						{:ok, resp} = EdMarkaz.DB.Postgres.query(
							EdMarkaz.DB,
							"INSERT INTO ilmx_to_mis_mapper (phone, mis_id, ilmx_id) VALUES ($1,$2,$3)",
							[school_id, school_id, ilmx_school_id]
						)
						IO.puts "Generating Token"
						case Sarkar.Auth.gen_token(school_id, client_id) do
							{:ok, new_token} ->
								IO.puts "Logging IN"
								IO.puts "Creating new school with ilmx creds"
								parent = self()

								start_school(school_id)
								register_connection(school_id, client_id)

								spawn fn ->
									db = Sarkar.School.get_db(school_id)

									send(parent, {:broadcast, %{
										"type" => "LOGIN_SUCCEED",
										"db" => db,
										"token" => new_token,
										"school_id" => school_id
									}})
								end

								{:reply, succeed(%{status: "SUCCESS"}), %{school_id: school_id, client_id: client_id}}
							{:error, err} ->
								IO.puts "Erorr while generating token in auto login"
								{:reply, fail(err), %{}}
						end
					{:ok, resp} ->
						IO.puts "Found in ILMX/MIS Mapper"
						[[phone, mis_id, ilmx_id ]] = resp.rows
						IO.puts "Generating token"
						case Sarkar.Auth.gen_token(mis_id, client_id) do
							{:ok, new_token} ->
								parent = self()

								start_school(mis_id)
								register_connection(mis_id, client_id)

								spawn fn ->
									db = Sarkar.School.get_db(mis_id)

									send(parent, {:broadcast, %{
										"type" => "LOGIN_SUCCEED",
										"db" => db,
										"token" => new_token,
										"school_id" => mis_id
									}})
								end

								{:reply, succeed(%{status: "SUCCESS"}), %{school_id: mis_id, client_id: client_id}}
							{:error, err} ->
								IO.puts "Erorr while generating token in auto login"
								{:reply, fail(err), %{}}
						end
					{:error, err} ->
						IO.puts "Error Occurred"
						IO.inspect err
				end
	end
end

	def handle_action(%{ "type" => "LOGIN",  "payload" => %{"school_id" => school_id, "client_id" => client_id, "password" => password }}, state) do
		case Sarkar.Auth.login({school_id, client_id, password}) do
			{:ok, token} ->

				parent = self()

				start_school(school_id)
				register_connection(school_id, client_id)

				spawn fn ->
					db = Sarkar.School.get_db(school_id)

					send(parent, {:broadcast, %{
						"type" => "LOGIN_SUCCEED",
						"db" => db,
						"token" => token,
						"school_id" => school_id
					}})
				end

				{:reply, succeed(%{status: "SUCCESS"}), %{school_id: school_id, client_id: client_id}}

			{:error, message} ->
				{:reply, fail(message), %{}}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"school_id" => school_id, "token" => token, "client_id" => client_id}}, state) do
		case Sarkar.Auth.verify({school_id, client_id, token}) do
			{:ok, _} ->
				start_school(school_id)
				register_connection(school_id, client_id)
				{:reply, succeed(), %{school_id: school_id, client_id: client_id}}
			{:error, msg} ->
				IO.puts "#{school_id} has error #{msg}"
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type"=> "SIGN_UP", "sign_up_id" => sign_up_id, "payload" => %{"city" => city, "name" => name, "packageName" => packageName, "phone" => phone, "schoolName" => schoolName }}, state) do
		payload = %{"city" => city, "name" => name, "packageName" => packageName, "phone" => phone, "schoolName" => schoolName }

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
		"INSERT INTO mischool_sign_ups (id,form) VALUES ($1, $2)",
		[sign_up_id, payload])

		alert_message = Poison.encode!(%{"text" => "New Sign-Up\nSchool Name: #{schoolName},\nPhone: #{phone},\nPackage: #{packageName},\nName: #{name},\nCity: #{city}"})

		{:ok, resp} = Sarkar.Slack.send_alert(alert_message)

		{:reply, succeed(), state}
	end

	def handle_action(%{ "type" => "SYNC", "payload" => %{"analytics" => analytics, "mutations" => mutations} = payload, "lastSnapshot" => last_sync_date }, %{ school_id: school_id, client_id: client_id } = state) do

		# handle image uploads
		# actually images may need to be handled differently
		# we need to add a "processing" state in the image queue.
		# because we really don't want to upload an image twice under any circumstance
		# and currently we'll upload it per navigation event because of our queueing

		# best is to take images out of the queue entirely and handle separately.

		image_merges = Map.get(payload, "images")

		mutation_res = Sarkar.School.sync_changes(school_id, client_id, mutations, last_sync_date)
		analytics_res = Sarkar.Analytics.Mis.record(school_id, client_id, analytics, last_sync_date)
		# images_res = Sarkar.School.upload_images(school_id, client_id, image_merges, last_sync_date)
		# this will instantly return an "ok" if everything is in the right shape, and then spawn a process which actually uploads

		res = %{
			"mutations" => mutation_res,
			"analytics" => analytics_res,
		}

		{:reply, succeed(res), state}
	end

	def handle_action(%{"type" => "SYNC", "payload" => payload, "lastSnapshot" => last_sync_date}, %{school_id: school_id, client_id: client_id} = state) do
		IO.puts "OLD SYNC FROM #{school_id}!"
		res = Sarkar.School.sync_changes(school_id, client_id, payload, last_sync_date)

		{:reply, succeed(res), state}

	end

	def handle_action(%{"type" => "SMS", "payload" => payload}, %{school_id: school_id, client_id: client_id} = state) do

		IO.puts "HANDLING SMS FROM #{school_id}"
		IO.inspect payload
		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "SYNC", "payload" => payload, "school_id" => school_id}, state) do

		changes = payload |> Map.keys |> Enum.count
		IO.puts "school #{school_id} has not authenticated the connection, and is trying to make #{changes} changes."
		IO.inspect state

		{:reply, fail("Please update your mischool app to the latest version."), state}
	end

	def handle_action(%{"type" => type, "payload" => payload} = msg, state) do
		IO.puts "it is likely you have not authenticated. no handler exists for this combination of state and message"
		IO.inspect type
		IO.inspect msg
		IO.inspect state
		{:reply, fail("Please update your mischool app to the latest version."), state}
	end

	# def handle_action(%{type: "CREATE_SCHOOL", payload: %{school_id: school_id, password: password}}, state) do
	# 	case Sarkar.Auth.create({school_id, password}) do
	# 		{:ok} -> {:reply, succeed(), state}
	# 		{:error, message} -> {:reply, fail(message), state}
	# 	end
	# end

	defp start_school(school_id) do
		case Registry.lookup(EdMarkaz.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

	defp register_connection(school_id, client_id) do
		{:ok, _} = Registry.register(EdMarkaz.ConnectionRegistry, school_id, client_id)
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