defmodule EdMarkaz.Server.Analytics do

	def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
		
	end

	def init(%{bindings: %{type: "platform-writes.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(EdMarkaz.School.DB,
		"SELECT id, to_timestamp(time/1000)::date as date, count(*) 
		FROM platform_writes
		GROUP BY id, date 
		ORDER BY date desc",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> {:error, err}
		end

		formatted = data |> Enum.map(fn [id, d, c] -> [id, Date.to_string(d), c] end)

		csv = [ ["supplier_id", "date", "writes"] | formatted]
		|> CSV.encode
		|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "platform-events.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(EdMarkaz.School.DB,
		"SELECT 
			id, 
			to_timestamp((value->>'time')::bigint/1000)::date as date,
			path[3] as school_id,
			value->>'event' as event,
			value->'meta'->>'call_status' as call_status,
			value->'meta'->>'duration' as duration_seconds
		FROM platform_writes
		WHERE path[4] = 'history'
		ORDER BY date desc
		",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> 
					IO.inspect err
					{:error, err}
		end

		formatted = data |> Enum.map(fn [id, d | rest ] -> [id, Date.to_string(d) | rest] end)
		csv = [ ["supplier_id", "date", "school_id", "event", "call_status", "duration"] | formatted]
		|> CSV.encode
		|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "platform-call-surveys.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(EdMarkaz.School.DB,
		"SELECT 
			id, 
			to_timestamp((value->>'time')::bigint/1000)::date as date,
			value->>'event' as event, 
			path[3] as school_id,
			value->'meta'->>'customer_interest' as customer_interest,
			value->'meta'->>'reason_rejected' as reason_rejected,
			value->'meta'->>'other_reason_rejected' as other_reason_rejected,
			value->'meta'->>'customer_likelihood' as customer_likelihood,
			value->'meta'->>'follow_up_meeting' as follow_up_meeting,
			value->'meta'->>'other_notes' as other_notes
		FROM platform_writes
		WHERE path[4] = 'history' AND value->>'event' = 'CALL_END_SURVEY'
		ORDER BY date desc
		",
		[]) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> 
				IO.inspect err
				{:error, err}
		end

		formatted = data |> 
			Enum.map(fn [sid, d | rest] -> [sid, Date.to_string(d) | rest] end)

		csv = [[
			"supplier_id",
			"date",
			"event",
			"school_id",
			"customer_interest",
			"reason_rejected",
			"other_reason_rejected",
			"customer_likelihood",
			"follow_up_meeting",
			"other_notes"] | formatted]
		|> CSV.encode
		|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "platform-completed-survey.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(EdMarkaz.School.DB,
		"SELECT
			id, to_timestamp((value->>'time')::bigint/1000)::date as date,
			value->>'event' as event,
			path[3] as school_id,
			value->'meta'->>'reason_completed' as reason_completed
		FROM platform_writes
		WHERE path[4] = 'history' AND value->>'event' = 'MARK_COMPLETE_SURVEY'
		ORDER BY date desc", []) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> 
				IO.inspect err
				{:error, err}
		end

		formatted = data |> Enum.map(fn [id, d | rest] -> [id, Date.to_string(d) | rest] end)
		csv = [[
			"supplier_id",
			"date",
			"event",
			"school_id",
			"reason_completed"
		] | formatted]
		|> CSV.encode
		|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(req, state) do 
		req = :cowboy_req.reply(200, req)
		IO.inspect req
		{:ok, req, state}
	end

end