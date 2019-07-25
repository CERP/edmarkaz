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