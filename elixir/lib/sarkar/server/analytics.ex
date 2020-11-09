defmodule EdMarkaz.Server.Analytics do

	use Plug.Router

	plug BasicAuth, use_config: {:edmarkaz, :basic_auth}

	plug :match
	plug :dispatch

	match "/hi" do
		IO.puts "wowwww"
		send_resp(conn, 200, "hello")

	end

	match "/mis-usage.csv" do

		{:ok, data} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				ilmx_id,
				mis_id,
				students,
				faculty,
				sms_sent,
				student_link_clicked,
				signup_time,
				signup_date,
				phone
			FROM (
				SELECT
					ps.id ilmx_id,
					mis_id,
					students,
					faculty,
					sms sms_sent,
					ps.time::time signup_time,
					ps.time::date signup_date,
					ps.db ->> 'phone_number' as phone
				FROM platform_schools ps
				LEFT JOIN (
						SELECT
							ilmx_id,
							mis_id,
							students,
							faculty,
							sms
						FROM ( SELECT mis_id, ilmx_id FROM ilmx_to_mis_mapper ) map
						LEFT JOIN (
								SELECT
									a.school_id,
									students,
									faculty,
									sms
								FROM (
										SELECT
											school_id,
											count(CASE WHEN fs.path LIKE 'students,%,Name' THEN fs.path END) as students,
											count(CASE WHEN fs.path LIKE 'faculty,%,Name' THEN fs.path END) as faculty
										FROM flattened_schools fs
										GROUP BY school_id
									) as a
								LEFT JOIN (
										SELECT
											school_id,
											SUM((value->> 'count'):: INTEGER) sms
										FROM writes
										WHERE path[2]='analytics' AND path[3]='sms_history'
										GROUP BY school_id
									) as b
								ON a.school_id = b.school_id
							) as val
						ON map.mis_id = val.school_id
					) fd
				ON ps.id = fd.ilmx_id
				WHERE length(ps.id)='36'
			) as p
			LEFT JOIN (
				SELECT
					meta ->> 'ref_code' id,
					COUNT(*) student_link_clicked
				FROM consumer_analytics
				WHERE type='STUDENT_LINK_SIGNUP'
				GROUP BY meta ->> 'ref_code'
			) q
			ON p.ilmx_id=q.id
			ORDER BY signup_date",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		csv = [
			[
				"ilmx_id",
				"mis_id",
				"students",
				"faculty",
				"sms_sent",
				"student_link_clicked",
				"signup_time",
				"signup_date",
				"phone"
			] |
			data
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

	end

	match "/consumer-signups-verified.csv" do

		{:ok, data} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				C.time,
				date,
				phone,
				school_id,
				client_id,
				type,
				P.db -> 'school_name' as name,
				P.db -> 'school_district' as district,
				P.db -> 'school_tehsil' as tehsil
			FROM (
				SELECT
					to_timestamp(time/1000)::time as time,
					to_timestamp(time/1000)::date as date,
					meta -> 'number' as phone,
					meta ->> 'ref_code' as school_id,
					client_id,
					type
				FROM consumer_analytics
				WHERE type!='ROUTE'
					AND type!='VIDEO'
					AND type!='LOGIN'
				) as C
			JOIN platform_schools as P ON school_id = P.id
			ORDER BY date DESC",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		csv = [
			[
				"time",
				"date",
				"phone",
				"school_id",
				"client_id",
				"type"
			] |
			data
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)
	end

	match "/unique-students.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				device_id,
				school_id,
				time::time as time,
				time::date as date
			FROM device_to_school_mapper
			ORDER BY time DESC",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		csv = [ ["device_id", "school_id", "time", "date"] | data]
		|> CSV.encode
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)
	end

	match "/consumer-signups.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				id,
				db->>'school_name',
				db->>'school_address',
				db->>'school_district',
				db->>'school_tehsil',
				db->>'total_enrolment',
				db->>'lowest_fee',
				db->>'highest_fee',
				db->>'respondent_owner',
				db->>'phone_number',
				time:: time,
				time::date as date
			FROM platform_schools
			WHERE length(id) = 36",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		csv = [
			[
				"refcode",
				"school_name",
				"school_address",
				"school_district",
				"school_tehsil",
				"total_enrolment",
				"lowest_fee",
				"highest_fee",
				"respondent_owner",
				"phone_number",
				"time"
			] |
			data
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)
	end

	match "/consumer-analytics.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				client_id,
				meta -> 'refcode' as refcode,
				meta -> 'route' as route,
				to_timestamp(time/1000)::date as d,
				count(*) as cnt
			FROM consumer_analytics
			WHERE type='ROUTE'
			GROUP BY client_id, refcode, d, route",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		formatted = data
			|> Enum.map(
				fn [id, refcode, path, date, count] ->

					path = case List.first(path) === "" do
						true -> path |> List.replace_at(0,"landing")
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

					[date, refcode, id, path, count]
				end
			)

		csv = [ ["date", "refcode", "client_id", "url", "count"] | formatted]
		|> CSV.encode
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)
	end

	match "/platform-writes.csv" do

		{:ok, data} = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
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

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)

	end

	match "/platform-orders-new.csv" do

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"SELECT
				id, type, path, value, time
				FROM platform_writes
				WHERE path[4]='history' order by time asc", [])

		new_state = resp.rows
			|> Enum.reduce(%{}, fn([supplier_id, type, path, value, time], agg) ->

				[_, _ | rest] = path

				[sid, history, time | _] = rest

				path_for_supplier = [sid, history, time, "supplier"]

				case type do
					"MERGE" ->
						new_agg = Dynamic.put(agg, rest, value)
						Dynamic.put(new_agg, path_for_supplier, supplier_id)
					"DELETE" -> Dynamic.delete(agg, rest)
					other ->
						agg
				end
		end)
		csv_data = new_state |> Enum.reduce([], fn({ sid, history }, agg)  ->
			row = history["history"] |> Enum.map(fn({time, order})->

				{:ok, order_date}  = DateTime.from_unix(String.to_integer(time), :millisecond)

				iso_order_date = formatted_date(order_date)

				meta_val_list = Map.values(order["meta"]) |> Enum.map( fn v ->

					# a bad way to guess and convert unix to iso_date
					if is_integer(v) and v > 1_500_000_000_000 do

						{:ok, meta_date}  = DateTime.from_unix(v, :millisecond)

						iso_meta_date = formatted_date(order_date)

						else
							v
					end
				end)

				[time ,order["supplier"], iso_order_date, order["event"], order["verified"] ] ++ meta_val_list

			end)

			agg ++ row

		end)

		csv = [[
				"oid",
				"supplier",
				"date",
				"event",
				"verified_status",
				"actual_date_of_delivery",
				"actual_product_ordered",
				"call_one",
				"call_two",
				"cancellation_reason",
				"expected_completion_date",
				"expected_date_of_delivery",
				"notes",
				"payment_received",
				"product_id",
				"quantity",
				"sales_rep",
				"school_id",
				"status",
				"strategy",
				"total_amount"
				] | csv_data]
		|> CSV.encode
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)

	end

	match "/platform-orders.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
		"SELECT
			a.id,
			to_timestamp((a.value->>'time')::bigint/1000)::date as date,
			a.path[3] as school_id,
			a.value->>'event' as event,
			a.value->'meta'->>'product_id' as product_id,
			a.value->'meta'->>'status' as status,
			a.value->'meta'->>'call_one' as call_1,
			a.value->'meta'->>'call_two' as call_2,
			a.value->'meta'->>'quantity' as quantity,
			a.value->'meta'->>'sales_rep' as sales_rep,
			a.value->'meta'->>'total_amount' as total_amount,
			a.value->'meta'->>'payment_received' as payment_received,
			a.value->'meta'->>'cancellation_reason' as cancellation_reason,
			to_timestamp((a.value->'meta'->>'actual_date_of_delivery')::bigint/1000)::date as actual_date_of_delivery,
			to_timestamp((a.value->'meta'->>'expected_date_of_delivery')::bigint/1000)::date as expected_date_of_delivery,
			to_timestamp((a.value->'meta'->>'expected_completion_date')::bigint/1000)::date as expected_completion_date,
			a.value->'meta'->>'notes' as notes,
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

		csv = [[
				"supplier_id",
				"date",
				"school_id",
				"event",
				"product_id",
				"status",
				"call_1",
				"call_2",
				"quantity",
				"sales_rep",
				"total_amount",
				"payment_received",
				"cancellation_reason",
				"actual_date_of_delivery",
				"expected_date_of_delivery",
				"expected_completion_date",
				"notes",
				"number"
				] | formatted]
		|> CSV.encode
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)

	end

	match "/platform-events.csv" do

		{:ok, data} = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
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

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)
	end

	match "/platform-call-surveys.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
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

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)
	end


	match "/platform-call-survey-followup.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
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

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)
	end

	match "/platform-completed-survey.csv" do
		{:ok, data} = case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
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

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp( 200, csv)
	end

	match _ do
		send_resp(conn, 404, "not found")
	end

	defp formatted_date (date) do
		[ date | _ ] = date |> DateTime.to_string |> String.split(" ")
		date
	end

end