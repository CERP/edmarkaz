defmodule EdMarkaz.Server.Analytics do

	def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}

	end

	def init(%{ bindings: %{ type: "consumer-analytics.csv"}} = req, state ) do
		{:ok, data} = case Postgrex.query(
			EdMarkaz.DB,
			"SELECT
				client_id,
				meta -> 'route' as p,
				meta -> 'refcode' as refcode,
				to_timestamp(time/1000)::time + interval '5 hour' as t,
				to_timestamp(time/1000)::date as d
			FROM consumer_analytics
			WHERE type='ROUTE'",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		formatted = data
			|> Enum.map(
				fn [id, path, refcode, time, date] ->

					path = case List.first(path) === "" do
						true -> path |> List.replace_at(0,"bazaar")
						false -> path
					end

					path = case length(path) > 1 do
						true -> path |> Enum.join("/")
						false -> path
					end

					refcode = case refcode === nil do
						true -> "LOGGED_OUT"
						false -> refcode
					end

					[id, path, refcode, time, date]
				end
			)

		csv = [ ["client_id", "path", "refcode", "time", "date"] | formatted]
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

	def init(%{bindings: %{type: "platform-writes.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(EdMarkaz.DB,
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

	def init(%{bindings: %{type: "platform-orders.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(EdMarkaz.DB,
		"SELECT
			a.id,
			to_timestamp((a.value->>'time')::bigint/1000)::date as date,
			a.path[3] as school_id,
			a.value->>'event' as event,
			a.value->'meta'->>'product_id' as product_id,
			b.db->>'phone_number' as number
		FROM platform_writes a JOIN platform_schools b ON a.path[3]=b.id
		WHERE path[4] = 'history' and value->>'event' = 'ORDER_PLACED'
		ORDER BY date desc
		", []) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

		formatted = data |> Enum.map(fn [id, d | rest ] -> [id, Date.to_string(d) | rest] end)

		csv = [ ["supplier_id", "date", "school_id", "event", "product_id", "number"] | formatted]
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

		{:ok, data} = case Postgrex.query(EdMarkaz.DB,
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
		{:ok, data} = case Postgrex.query(EdMarkaz.DB,
		"SELECT
			id,
			to_timestamp((value->>'time')::bigint/1000)::date as date,
			value->>'event' as event,
			path[3] as school_id,
			value->'meta'->>'answer_phone' as answer_phone,
			value->'meta'->>'customer_interest' as customer_interest,
			value->'meta'->>'reason_rejected' as reason_rejected,
			value->'meta'->>'other_reason_rejected' as other_reason_rejected,
			value->'meta'->>'customer_likelihood' as customer_likelihood,
			value->'meta'->>'follow_up_meeting' as follow_up_meeting,
			value->'meta'->>'other_notes' as other_notes,
			value->'meta'->>'reason_rejected_finance' as reason_rejected_finance
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

		formatted = data
			|> Enum.map(fn [sid, d | rest] -> [sid, Date.to_string(d) | rest] end)

		csv = [[
			"supplier_id",
			"date",
			"event",
			"school_id",
			"answer_phone",
			"customer_interest",
			"reason_rejected",
			"other_reason_rejected",
			"customer_likelihood",
			"follow_up_meeting",
			"other_notes",
			"reason_rejected_finance"] | formatted]
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


	def init(%{bindings: %{type: "platform-call-survey-followup.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(EdMarkaz.DB,
		"SELECT
			id,
			to_timestamp((value->>'time')::bigint/1000)::date as date,
			value->>'event' as event,
			path[3] as school_id,
			value->'meta'->>'follow_up_meeting_ocurred' as follow_up_meeting_ocurred,
			value->'meta'->>'follow_up_meeting_no_reason' as follow_up_meeting_no_reason,
			value->'meta'->>'follow_up_meeting_no_other' as follow_up_meeting_no_other,
			value->'meta'->>'call_in_person_meeting_scheduled' as call_in_person_meeting_scheduled,
			value->'meta'->>'call_in_person_meeting_no_reason' as call_in_person_meeting_no_reason,
			value->'meta'->>'call_in_person_meeting_no_call_scheduled_time' as call_in_person_meeting_no_call_scheduled_time,
			value->'meta'->>'call_in_person_meeting_no_other' as call_in_person_meeting_no_other,
			value->'meta'->>'call_in_person_meeting_yes_time' as call_in_person_meeting_yes_time,
			value->'meta'->>'call_not_interested_reason_ess' as call_not_interested_reason_ess,
			value->'meta'->>'call_not_interested_reason_finance' as call_not_interested_reason_finance,
			value->'meta'->>'call_not_interested_reason_other' as call_not_interested_reason_other,
			value->'meta'->>'call_not_interested_needs_time_followup' as call_not_interested_needs_time_followup,
			value->'meta'->>'call_not_interested_follow_up_time' as call_not_interested_follow_up_time,
			value->'meta'->>'meeting_ess_purpose' as meeting_ess_purpose,
			value->'meta'->>'meeting_ess_demo_followup' as meeting_ess_demo_followup,
			value->'meta'->>'meeting_ess_followup_date' as meeting_ess_followup_date,
			value->'meta'->>'meeting_ess_transaction_sold' as meeting_ess_transaction_sold,
			value->'meta'->>'meeting_finance_transaction_loan' as meeting_finance_transaction_loan,
			value->'meta'->>'meeting_ess_transaction_fail_reason' as meeting_ess_transaction_fail_reason,
			value->'meta'->>'meeting_finance_transaction_fail_reason' as meeting_finance_transaction_fail_reason,
			value->'meta'->>'meeting_transaction_fail_reason_other' as meeting_transaction_fail_reason_other,
			value->'meta'->>'call_number' as call_number
		FROM platform_writes
		WHERE path[4] = 'history' AND value->>'event' = 'CALL_END_SURVEY_FOLLOWUP'
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
			"follow_up_meeting_ocurred",
			"follow_up_meeting_no_reason",
			"follow_up_meeting_no_other",
			"call_in_person_meeting_scheduled",
			"call_in_person_meeting_no_reason",
			"call_in_person_meeting_no_call_scheduled_time",
			"call_in_person_meeting_no_other",
			"call_in_person_meeting_yes_time",
			"call_not_interested_reason_ess",
			"call_not_interested_reason_finance",
			"call_not_interested_reason_other",
			"call_not_interested_needs_time_followup",
			"call_not_interested_follow_up_time",
			"meeting_ess_purpose",
			"meeting_ess_demo_followup",
			"meeting_ess_followup_date",
			"meeting_ess_transaction_sold",
			"meeting_finance_transaction_loan",
			"meeting_ess_transaction_fail_reason",
			"meeting_finance_transaction_fail_reason",
			"meeting_transaction_fail_reason_other",
			"call_number",
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

	def init(%{bindings: %{type: "platform-completed-survey.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(EdMarkaz.DB,
		"SELECT
			id, to_timestamp((value->>'time')::bigint/1000)::date as date,
			value->>'event' as event,
			path[3] as school_id,
			value->'meta'->'mark_complete_survey'->>'reason_completed' as reason_completed
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
		req = :cowboy_req.reply(404, req)
		IO.puts "route not found"
		IO.inspect req
		{:ok, req, state}
	end

end