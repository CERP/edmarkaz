defmodule EdMarkaz.ActionHandler.Platform do

	def handle_action(%{"type" => "SET_FILTER"} = action, state) do
		IO.inspect action
		{:reply, succeed(%{"type" => "nonsense"}), state}
	end

	def handle_action(%{"type" => "LOGIN", "client_id" => client_id, "payload" => %{"id" => id, "password" => password}}, state) do
		case EdMarkaz.Auth.login({id, client_id, password}) do
			{:ok, token} ->
				start_supplier(id)
				register_connection(id, client_id)
				sync_state = EdMarkaz.Supplier.get_sync_state(id)
				{:reply, succeed(%{token: token, sync_state: sync_state}), %{id: id, client_id: client_id}}
			{:error, message} -> {:reply, fail(message), %{}}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"id" => id, "token" => token, "client_id" => client_id}}, state) do
		case EdMarkaz.Auth.verify({id, client_id, token}) do
			{:ok, _} ->
				start_supplier(id)
				register_connection(id, client_id)
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} ->
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(
		%{
			"type" => "SLACK_ALERT",
			"payload" => %{
				"message" => message,
				"channel" => channel
			}
		},
		%{id: supplier_id, client_id: client_id} = state
	) do

		spawn fn ->
			EdMarkaz.Slack.send_alert(message, channel)
		end

		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "MERGE_PRODUCT", "payload" => %{"id" => id, "product" => product}}, %{id: supplier_id, client_id: client_id} = state) do

		EdMarkaz.Product.merge(id, product, supplier_id)

		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "MERGE_PRODUCT_IMAGE", "payload" => %{"id" => id, "product_id" => product_id, "data_url" => data_url}}, %{id: supplier_id, client_id: client_id} = state) do

		IO.puts "handling merge product image"

		parent = self()

		spawn fn ->
			img_url = Sarkar.Storage.Google.upload_image("ilmx-product-images", id, data_url)

			IO.inspect img_url
			EdMarkaz.Product.merge_image(product_id, img_url)

			send(parent, {:broadcast, %{
				"type" => "PRODUCT_IMAGE_ADDED",
				"product_id" => product_id,
				"image_id" => id,
				"img_url" => img_url
			}})
		end


		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "GET_OWN_PRODUCTS", "payload" => payload}, %{id: supplier_id, client_id: client_id} = state) do
		# currently no filters...
		# except by supplier

		case Postgrex.query(EdMarkaz.DB, "SELECT id, product, sync_time FROM products WHERE supplier_id=$1", [supplier_id]) do
			{:ok, resp} ->
				mapped = resp.rows
					|> Enum.map(fn [id, product, sync_time] -> {id, product} end)
					|> Enum.into(%{})
				{:reply, succeed(%{products: mapped}), state}
			{:error, err} ->
				IO.puts "error getting product"
				IO.inspect err
				{:reply, fail("error getting products"), state}
		end
	end

	def handle_action(%{"type" => "GET_PRODUCTS", "payload" => payload}, state) do
		# currently no filters...
		# except by supplier

		case Postgrex.query(EdMarkaz.DB, "SELECT id, product, sync_time FROM products", []) do
			{:ok, resp} ->
				mapped = resp.rows
					|> Enum.map(fn [id, product, sync_time] -> {id, product} end)
					|> Enum.into(%{})
				{:reply, succeed(%{products: mapped}), state}
			{:error, err} ->
				IO.puts "error getting product"
				IO.inspect err
				{:reply, fail("error getting products"), state}
		end

	end

	def handle_action(%{"type" => "GET_PRODUCTS", "last_sync" => last_sync}, state) do
		case Postgrex.query(EdMarkaz.DB, "SELECT supplier_id, product, sync_time from products WHERE sync_time > last_sync", []) do
			{:ok, resp} -> {:reply, succeed(resp.rows), state}
			{:error, err} ->
				IO.puts "error getting product"
				IO.inspect err
				{:reply, fail("error getting products"), state}
		end
	end

	def handle_action(%{"type" => "PRODUCT_ANALYTICS", "payload" => payload}, state) do

		# lets focus for now on just the "reveal number" metrics
		# these should queue up on the client before they are dispatched
		# I expect an array of objects with {product_id, type: "click", time, supplier_id} {product_id, type: "reveal_number", time}
		# then this will update what, a product-analytics table?
		# we want to be able to show trends which means we have to track this over time.
		# we can keep aggregate state inside the product but keep track of each incident in an analytics table
		# other information would be nice to track with this. if they were logged in we could - which area etc

		# each individual tick update should be broadcast out to the appropriate supplier
		# so it can be seen on their realtime analytics dashboard!

		{:reply, succeed("u did it"), state}
	end

	def handle_action(%{"type" => "RESERVE_NUMBER", "payload" => %{"school_id" => school_id, "user" => user}, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do

		res = EdMarkaz.Supplier.reserve_masked_number(id, school_id, user, client_id, last_sync_date)

		case res do
			{:ok, content} -> {:reply, succeed(content), state}
			{:error, message} -> {:reply, fail(message), state}
		end
	end

	def handle_action(%{"type" => "RELEASE_NUMBER", "payload" => %{"school_id" => school_id, "user" => user}, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do

		res = EdMarkaz.Supplier.release_masked_number(id, school_id, user, client_id, last_sync_date)

		case res do
			{:ok, content} -> {:reply, succeed(content), state}
			{:error, message} -> {:reply, fail(message), state}
		end
	end

	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do

		# TODO: here, pull out the merge/delete/image merges and send them to different places.

		{ write_map, image_map } = Enum.reduce(payload, {%{}, %{}}, fn {pkey, entry}, {w_map, img_map} ->
			case entry["action"]["type"] do
				"IMAGE_MERGE" -> { w_map, Map.put(img_map, pkey, entry)}
				"MERGE" -> { Map.put(w_map, pkey, entry), img_map}
				"DELETE" -> { Map.put(w_map, pkey, entry), img_map}
				other ->
					IO.puts "ERROR SPLITTING WRITES"
					IO.inspect payload
					IO.inspect other
					IO.inspect pkey
					IO.inspect entry
					{w_map, img_map}
			end
		end)

		spawn fn ->

			image_map
			|> Enum.each(fn {pkey, entry} ->

				%{
					"action" => %{
						"path" => path,
						"value" => %{
							"id" => image_id,
							"image_string" => image_string
						}
					},
					"date" => date
				} = entry

				image_url = Sarkar.Storage.Google.upload_image("ilmx-product-images", image_id, image_string)
				merges = %{
					pkey => %{
						"action" => %{
							"type" => "MERGE",
							"path" => path,
							"value" => %{
								"id" => image_id,
								"url" => image_url
							}
						},
						"date" => date
					}
				}

				EdMarkaz.Supplier.sync_changes(id, "backend-task", merges, :os.system_time(:millisecond))

			end)
		end

		res = EdMarkaz.Supplier.sync_changes(id, client_id, write_map, last_sync_date)

		{:reply, succeed(res), state}
	end

	def handle_action(%{"type" => "GET_SCHOOL_PROFILES", "payload" => payload}, %{id: id, client_id: client_id} = state) do

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

	def handle_action(action, state) do
		IO.puts "===================="
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