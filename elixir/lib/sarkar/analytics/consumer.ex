defmodule Sarkar.Analytics.Consumer do

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