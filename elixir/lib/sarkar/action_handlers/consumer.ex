defmodule EdMarkaz.ActionHandler.Consumer do

	def handle_action(%{"type" => "LOGIN", "client_id" => client_id, "payload" => %{"id" => id, "password" => password}}, state) do
		case EdMarkaz.Auth.login({id, client_id, password}) do
			{:ok, token} ->
				register_connection(id, client_id)
				{:reply, succeed(%{token: token}), %{id: id, client_id: client_id}}
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

	def handle_action(%{"type" => "GET_PRODUCTS", "last_sync" => last_sync}, state) do

		dt = DateTime.from_unix!(last_sync, :millisecond)
		IO.inspect dt
		case Postgrex.query(EdMarkaz.DB, "SELECT supplier_id, product, sync_time from products WHERE sync_time > $1 ", [DateTime.to_naive(dt)]) do
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

	# logged-in sync
	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do

	# this goes through our normal sync flow, though we need to figure out how to kill the server at a certain point

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