defmodule EdMarkaz.ActionHandler.CallCenter do


	def handle_action(%{"type" => "LOGIN", "client_id" => client_id, "payload" => %{"id" => id, "password" => password}}, state) do
		case EdMarkaz.Auth.login({id, client_id, password}) do
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

	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do
		# res = EdMarkaz.Supplier.sync_changes(id, client_id, payload, last_sync_date)

		{:reply, succeed(), state}
	end

	def handle_action(%{"type" => "GET_SCHOOL_PROFILES", "payload" => payload}, %{id: id, client_id: client_id} = state) do
		
		ids = Map.get(payload, "school_ids", [])

		or_str = Stream.with_index(ids, 1)
			|> Enum.map(fn {_, i} -> 
				"id=$#{i}"
			end)
			|> Enum.join(" OR ")

		case Postgrex.query(EdMarkaz.School.DB, "SELECT id, db FROM platform_schools WHERE #{or_str}", ids) do
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

	def handle_action(%{"type" => "SAVE_SCHOOL", "payload" => %{"school_id" => school_id, "school" => school}, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do

		case Postgrex.query(EdMarkaz.School.DB, "UPDATE platform_schools set db = $1 where id=$2", [school, school_id]) do 
			{:ok, res} -> 
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} -> 
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type" => "FIND_SCHOOL", "payload" => %{"refcode" => refcode}}, %{id: id, client_id: client_id} = state) do

		IO.puts "FIND SCHOOL"
		case Postgrex.query(EdMarkaz.School.DB, "SELECT db FROM platform_schools WHERE id=$1", [refcode]) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "no school found"}
			{:ok, res} ->
				[[ db ]] = res.rows
				{:reply, succeed(db), state}
			{:error, err} -> 
				IO.inspect err
				{:reply, fail("db error"), state}
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