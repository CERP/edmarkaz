defmodule EdMarkaz.ActionHandler.Consumer do

	# def handle_action(%{"type" => "LOGIN", "client_id" => client_id, "payload" => %{"id" => id, "password" => password}}, state) do

	# end

	def handle_action(%{ "type" => "SMS_AUTH_CODE",
		"client_id" => client_id,
		"payload" => %{ "phone" => phone }}, state) do

			IO.inspect phone

			case EdMarkaz.School.get_profile(phone) do
				{:ok, school_id, profile} ->
					refcode = Map.get(profile, "refcode")
					{:ok, one_token} = EdMarkaz.Auth.gen_onetime_token(refcode)

					case EdMarkaz.Contegris.send_sms(phone, "Click here to login https://ilmexchange.com/auth/#{one_token} \nOr enter code #{one_token}") do
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

	def handle_action(%{
		"type" => "SIGN_UP",
		"client_id" => client_id,
		"payload" => %{"number" => number, "password" => password, "profile" => profile}}, state) do

		IO.puts "handling sign up for #{number}"

		refcode = Map.get(profile, "refcode")

		# we aren't syncing platform schools
		# if someone saves some bogus value here, we aren't able to undo
		{:ok, res} = Postgrex.query(EdMarkaz.DB, "INSERT INTO platform_schools (id, db)
			VALUES ($1, $2)
			ON CONFLICT (id) DO UPDATE set db=excluded.db", [refcode, profile])

		{:ok, text} = EdMarkaz.Auth.create({number, password})
		{:ok, token} = EdMarkaz.Auth.login({number, client_id, password})

		{:ok, one_token} = EdMarkaz.Auth.gen_onetime_token(refcode)

		spawn fn ->
			res = EdMarkaz.Contegris.send_sms(number, "Welcome to ilmExchange. Please go here to login https://ilmexchange.com/auth/#{one_token}")
			IO.inspect res
		end

		{:reply, succeed(%{token: token}), %{id: number, client_id: client_id}}
	end

	def handle_action(%{"type" => "URL_AUTH", "client_id" => client_id, "payload" => %{"token" => token} }, state) do
		case EdMarkaz.Auth.verifyOneTime(token) do
			{:ok, refcode} ->
				# from the refcode we need to retrieve the phone number
				# and then we can log them in
				{:ok, res} = Postgrex.query(EdMarkaz.DB, "SELECT db, db->>'phone_number' FROM platform_schools WHERE id=$1", [refcode])
				[[ profile, number ]] = res.rows
				{:ok, new_token} = EdMarkaz.Auth.gen_token(number, client_id)

				{:reply, succeed(%{token: new_token, sync_state: %{ "profile" => profile }, id: number }), %{id: number, client_id: client_id}}
			{:error, err} ->
				IO.inspect err
				{:reply, fail(err), %{}}
		end
	end

	def handle_action(%{"type" => "SUBMIT_ERROR", "payload" => %{"error" => error, "errInfo" => errInfo, "date" => date}}, state) do

		%{ "name" => name, "message" => message } = error

		EdMarkaz.Slack.send_alert("#{name}: #{message}\n #{errInfo}", "#platform-dev")

		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "GET_PROFILE", "payload" => %{"number" => number}}, state) do

		case EdMarkaz.School.get_profile(number) do
			{:ok, school_id, db} -> {:reply, succeed(%{"school_id" => school_id, "school" => db}), state}
			{:error, msg} -> {:reply, fail(%{"msg" => msg}), state}
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
		supplier_id = Map.get(product, "supplier_id")

		start_supplier(supplier_id)
		EdMarkaz.Supplier.place_order(supplier_id, product, refcode, client_id)
		EdMarkaz.Slack.send_alert("#{school_name} placed order for #{product_name} by #{supplier_id}. Their number is #{id}", "#platform-orders")
		EdMarkaz.Contegris.send_sms(id, "You have requested information for #{product_name} and will be contacted soon with more information.")

		{:reply, succeed(), state}

	end

	def handle_action(%{"type" => "GET_PRODUCTS", "last_sync" => last_sync}, state) do

		dt = DateTime.from_unix!(last_sync, :millisecond)

		case Postgrex.query(EdMarkaz.DB, "
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
	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do

	# this goes through our normal sync flow, though we need to figure out how to kill the server at a certain point

	{:reply, succeed(%{"type" => "noop"}), state}

	end

	#logged-out sync
	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, state) do
		# how do we make this less intense.
		# what are we even syncing in this case... just analytics
		# so we can parse through the payload for analytics events and write them direct to table
		# instead of spinning up a genserver for a client and eating memory

		# so lets nail down our analytics events client-side first.

		# path: [ "analytics", timestamp], value: { type: "page_view | product_view", time: timestamp, product_id: "" }
		# can i come up with a path that if i get rid of the device_id key, i can rerun them and create a state....
		# path: ["analytics", "product_view", product_id, timestamp] value: { time: timestamp }
		# then this can be forwarded to an analytics genserver which merges and broadcasts to the dashboard
		# we can add a flag on to the value which means that it will get queued, but not applied to local sync_state
		# value: { no_local_apply: true }

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