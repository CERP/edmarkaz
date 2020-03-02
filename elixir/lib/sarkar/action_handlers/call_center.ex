defmodule EdMarkaz.ActionHandler.CallCenter do


	def handle_action(%{"type" => "LOGIN", "client_id" => client_id, "payload" => %{"id" => "cerp-callcenter", "password" => password}}, _state) do
		id = "cerp-callcenter"
		case EdMarkaz.Auth.login({ id, client_id, password}) do
			{:ok, token} ->
				register_connection(id, client_id)
				{:reply, succeed(%{token: token, sync_state: %{}}), %{id: id, client_id: client_id}}
			{:error, message} -> {:reply, fail(message), %{}}
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

	def handle_action(%{"type" => "SYNC", "payload" => _payload, "last_snapshot" => _last_sync_date}, state) do
		# res = EdMarkaz.Supplier.sync_changes(id, client_id, payload, last_sync_date)

		{:reply, succeed(), state}
	end

	def handle_action(
		%{
			"type" => "MERGE_PRODUCT",
			"payload" => %{
				"id" => product_id,
				"product" => product,
				"supplier_id" => supplier_id
			}
		},
		%{id: _id, client_id: _client_id} = state
	) do
		EdMarkaz.Product.merge(product_id, product, supplier_id)

		{:reply, succeed(), state}
	end

	def handle_action(
		%{
			"type" => "MERGE_PRODUCT_IMAGE",
			"payload" => %{
				"id" => image_id,
				"product_id" => product_id,
				"data_url" => data_url
				}
			},
			%{id: _id, client_id: _client_id} = state
	) do

		IO.puts "handling merge product image"

		parent = self()

		spawn fn ->
			img_url = Sarkar.Storage.Google.upload_image("ilmx-product-images", image_id, data_url)

			IO.inspect img_url
			EdMarkaz.Product.merge_image(product_id, img_url)

			send(parent, {:broadcast, %{
				"type" => "PRODUCT_IMAGE_ADDED",
				"product_id" => product_id,
				"image_id" => image_id,
				"img_url" => img_url
			}})
		end

		{:reply, succeed(), state}
	end

	def handle_action(
		%{
			"type" => "GET_ORDERS",
			"payload" => %{
				"start_date" => start_date
			}
		},
		%{id: _id, client_id: _client_id} = state
	) do

		case Postgrex.query(EdMarkaz.DB,
			"SELECT orders.supplier_id, orders.school_id, orders.event as order, platform_schools.db as school
			FROM
			(
				SELECT filtered_histories.supplier_id, filtered_histories.school_id, jsonb_extract_path(
					sync_state->'matches',
					filtered_histories.school_id, 'history', filtered_histories.timestamp) as event
				FROM
				(
					SELECT histories.supplier_id, histories.school_id, histories.timestamp
					FROM (
						SELECT suppliers.id as supplier_id, matches.sid as school_id, jsonb_object_keys(
							jsonb_extract_path(sync_state->'matches', matches.sid)->'history'
						) as timestamp
						FROM
							suppliers
							JOIN
							(
								SELECT id, jsonb_object_keys(sync_state->'matches') as sid
								FROM suppliers
							) as matches
							ON suppliers.id=matches.id
					) as histories
					WHERE histories.timestamp::bigint > $1
				) as filtered_histories
				JOIN suppliers
				ON filtered_histories.supplier_id=suppliers.id
				WHERE jsonb_extract_path(
					sync_state->'matches',
					filtered_histories.school_id, 'history', filtered_histories.timestamp)->>'event' = 'ORDER_PLACED'
				ORDER BY filtered_histories.timestamp desc
			) as orders
			JOIN platform_schools ON orders.school_id = platform_schools.id",
			[start_date]
		) do
			{:ok, resp} ->
				mapped = resp.rows
				|> Enum.reduce(
					%{},
					fn ([supplier_id, school_id, order, school], acc) ->
						time = Map.get(order, "time")
						Dynamic.put(acc, [school_id, "#{time}"], %{"order" => order, "school" => school})
					end
				)
				{:reply, succeed(mapped), state}
			{:error, err} ->
				IO.puts "error getting orders"
				IO.inspect err
				{:reply, fail("error getting orders"), state}
		end
	end

	def handle_action(%{"type" => "GET_SCHOOL_PROFILES", "payload" => payload}, %{id: _id, client_id: _client_id} = state) do

		ids = Map.get(payload, "school_ids", [])

		or_str = Stream.with_index(ids, 1)
			|> Enum.map(fn {_, i} ->
				"id=$#{i}"
			end)
			|> Enum.join(" OR ")

		case Postgrex.query(EdMarkaz.DB, "SELECT id, db FROM platform_schools WHERE #{or_str}", ids) do
			{:ok, resp} ->
				dbs = resp.rows
				|> Enum.map(fn [id, db] -> {id, db} end)
				|> Enum.into(%{})

				{:reply, succeed(dbs), state}
			{:error, err} ->
				IO.inspect err
				{:reply, fail("db error"), state}
		end
	end

	def handle_action(%{"type" => "SAVE_SCHOOL", "payload" => %{"school_id" => school_id, "school" => school}, "last_snapshot" => _last_sync_date}, %{id: id, client_id: client_id} = state) do

		case Postgrex.query(EdMarkaz.DB, "UPDATE platform_schools set db = $1 where id=$2", [school, school_id]) do
			{:ok, _res} ->
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} ->
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type" => "FIND_SCHOOL", "payload" => %{"refcode" => refcode}}, %{id: _id, client_id: _client_id} = state) do

		IO.puts "FIND SCHOOL"
		case Postgrex.query(EdMarkaz.DB, "SELECT db FROM platform_schools WHERE id=$1", [refcode]) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "no school found"}
			{:ok, res} ->
				[[ db ]] = res.rows
				{:reply, succeed(db), state}
			{:error, err} ->
				IO.inspect err
				{:reply, fail("db error"), state}
		end
	end

	def handle_action(%{"type" => "GET_SCHOOL_FROM_NUMBER", "payload" => %{"phone_number" => phone_number }}, %{id: _id, client_id: _client_id} = state) do

		case EdMarkaz.School.get_profile(phone_number) do
			{:ok, school_id, profile} ->
				{:reply, succeed(%{ "profile" => profile, "id" => school_id }), state}
			{:error, message} ->
				{:reply, fail(message), state}
		end

	end

	def handle_action(%{"type" => "PLACE_ORDER", "payload" => %{"product" => product, "refcode" => refcode, "school_name" => school_name, "school_number" => school_number }}, %{client_id: client_id, id: id} = state) do

		IO.puts "handling order"
		product_name = Map.get(product, "title")
		product_id = Map.get(product,"id")
		supplier_id = Map.get(product, "supplier_id")

		start_supplier(supplier_id)
		EdMarkaz.Supplier.place_order(supplier_id, product, refcode, client_id)
		spawn fn ->
			EdMarkaz.Slack.send_alert("#{school_name} placed order for #{product_id} by #{supplier_id}. Their number is #{school_number}", "#platform-orders")
		end

		spawn fn ->
			EdMarkaz.Contegris.send_sms(id, "You have requested information for #{product_name} and will be contacted soon with more information.")
		end

		{:reply, succeed(), state}

	end

	def handle_action(
		%{
			"type" => "VERIFY_ORDER",
			"payload" => %{
				"order" => order,
				"product" => product,
				"school_name" => school_name,
				"school_number" => school_number,
			}
		},
		%{client_id: client_id, id: id} = state
	) do

		product_name = Map.get(product, "title")
		supplier_id = Map.get(product, "supplier_id")

		start_supplier(supplier_id)
		{:ok, resp} = EdMarkaz.Supplier.verify_order(order, supplier_id, client_id, product)

		spawn fn ->
			EdMarkaz.Slack.send_alert("Order by #{school_name} for #{product_name} by #{supplier_id} has been verified. Their number is #{school_number}", "#platform-orders")
		end

		{:reply, succeed(resp), state}

	end

	def handle_action(
		%{
			"type" => "REJECT_ORDER",
			"payload" => %{
				"order" => order,
				"product" => product
			}
		},
		%{ client_id: client_id, id: id} = state
	) do
		supplier_id = Map.get(product, "supplier_id")

		start_supplier(supplier_id)
		{:ok, resp} = EdMarkaz.Supplier.reject_order(order, supplier_id, client_id)

		{:reply, succeed(resp), state}
	end

	def handle_action(%{"type" => "GET_PRODUCTS", "last_sync" => last_sync}, %{id: _id, client_id: _client_id} = state) do

		_dt = DateTime.from_unix!(last_sync, :millisecond)

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
					|> Enum.map(fn [id, _supplier_id, product, _sync_time, supplier_profile] -> {id, Map.put(product, "supplier_profile", supplier_profile)} end)
					|> Enum.into(%{})

				{:reply, succeed(%{products: mapped}), state}
			{:error, err} ->
				IO.puts "error getting product"
				IO.inspect err
				{:reply, fail("error getting products"), state}
		end
	end

	def handle_action(
		%{
			"type" => "GET_LOGS",
			"payload" => %{
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		%{id: _id, client_id: _client_id} = state
	) do

		case Postgrex.query(EdMarkaz.DB,
			"SELECT
				id,
				value,
				time
			FROM platform_writes
			WHERE value ->> 'event' IN('CALL_START','CALL_END','CALL_BACK','CALL_BACK_END')
			AND time BETWEEN $1 AND $2
			ORDER BY time DESC",
			[start_date, end_date]
		) do
			{:ok, resp} ->
				mapped = resp.rows |> Enum.reduce(
					%{},
					fn ([id, value, time], acc) ->
						Map.put(acc, "#{id}-#{time}", %{ "id" => id, "value" => value})
					end
				)
				{:reply, succeed(mapped), state}
			{:error, err} ->
				IO.inspect err
				IO.puts "ERROR GETTING LOGS"
		end
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.inspect state
		IO.puts "NOT YET READY"
		{:ok, state}
		# {:reply, fail(), state}
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