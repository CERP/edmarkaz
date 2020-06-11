defmodule Sarkar.Analytics.Consumer do

	def sync_to_school(client_id, events, ilmx_id, last_sync_date) do

		mapped = events
		|> Enum.filter(
			fn {key,%{"type" => type, "meta" => meta }} ->
				user = Map.get(meta, "user")

				if user !== nil do
					type === "VIDEO" && user === "STUDENT"
				else
					false
				end
			end
		)
		|> Enum.reduce(
			[],
			fn {key,%{"type" => type,"meta" => meta, "time" => time}}, acc ->
				%{
					"chapter_id" => chapter_id,
					"lessons_id" => lesson_id,
					"route" => route,
					"time" => duration,
					"user" => user,
					"student_id" => student_id
				} = meta
				value = %{
					"type" => "MERGE",
					"path" => ["db","ilmx", "events", client_id, "#{time}"],
					"value" => %{
						"lesson_id" => "#{Enum.slice(route,1,4) |> Enum.join("-")}-#{lesson_id}",
						"duration" => duration,
						"student_id" => student_id,
						"type" => type
					}
				}
				acc ++ [value]
			end
		)

		if length(mapped) > 0 do
			changes = Sarkar.School.prepare_changes(mapped)
			case EdMarkaz.DB.Postgres.query(
				EdMarkaz.DB,
				"SELECT mis_id FROM ilmx_to_mis_mapper WHERE phone=$1",
				[ilmx_id]
			) do
				{:ok, %Postgrex.Result{num_rows: 0}} ->
					start_school(ilmx_id)
					register_connection(ilmx_id, client_id)
					Sarkar.School.sync_changes(ilmx_id, client_id ,changes, last_sync_date)
				{:ok, res} ->
					[[ mis_id ]] = res.rows
					start_school(mis_id)
					register_connection(mis_id, client_id)
					Sarkar.School.sync_changes(mis_id, client_id ,changes, last_sync_date)
				{:error, err} ->
					IO.puts "Failed to sync events"
					IO.inspect err
			end
		end
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

	def record(_client_id, events, _last_sync_date) when events == %{} do
		%{"type" => "CONFIRM_ANALYTICS_SYNC", "time" => 0}
	end

	def record( client_id, events, _last_sync_date) do

		latest_time = events
			|> Enum.map(fn ({ _key, %{"time" => time}})-> time end)
			|> Enum.max()

		chunk_size = 100

		args = events
			|> Enum.map(
				fn({id, %{"time" => time, "meta" => meta, "type" => type}}) ->
					[id, client_id, time, type, meta]
				end
			)

			case Postgrex.transaction(
			EdMarkaz.DB,
			fn (conn)->

				args
					|> Enum.chunk_every(chunk_size)
					|> Enum.each(
						fn(arg_chunk) ->

							value_string = 1..length(arg_chunk)
								|> Enum.map(
									fn (i) ->
										x = (i - 1) * 5 + 1
										"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3}, $#{x + 4})"
									end
								)
								|> Enum.join(",")

							arguments = arg_chunk
								|> Enum.reduce(
									[],
									fn (curr, acc) ->
										Enum.concat(acc, curr)
									end
								)

							query_string = "INSERT INTO consumer_analytics ( id, client_id, time, type, meta) VALUES #{value_string} ON CONFLICT DO NOTHING"

							{:ok, _resp} = EdMarkaz.DB.Postgres.query(
								conn,
								query_string,
								arguments
							)
						end
					)
			end,
			pool: DBConnection.Poolboy
		) do
			{:ok,resp} ->
				%{"type" => "CONFIRM_ANALYTICS_SYNC", "time" => latest_time}
			{:error, err} ->
				IO.puts "ANALYTICS -> ERROR PUTTING IN DB"
				IO.inspect err
				%{ "type" => "ANALYTICS_SYNC_FAILED" }
		end
	end
end