defmodule EdMarkaz.Server.Analytics do

	use Plug.Router

	# plug BasicAuth, use_config: {:edmarkaz, :basic_auth}

	plug :match
	plug :dispatch

	match "/hi" do
		IO.puts "wowwww"
		send_resp(conn, 200, "hello")

	end

	@doc """
		Endpoint returns a CSV containing faculty member id, and all of their permissions for each school (new way of handling faculty permissions).
	"""

	match "/faculty-permissions.csv" do

		{:ok, resp} = EdMarkaz.DB.Postgres.query(
				EdMarkaz.DB,
				"SELECT
					school_id,
					path,
					value
				FROM
					flattened_schools
				WHERE
					path like 'faculty,%,permissions,%'
				ORDER BY school_id",
				[]
			)


		merge_permissions = resp.rows
			|> Enum.reduce(%{}, fn([school_id, path, value], agg) ->
				# permission: setupPage | fee |family

				[_, teacher_id, _, permission] = String.split(path, ",")

				Dynamic.put(agg, [school_id, teacher_id, permission], value)
			end)


		csv_data = merge_permissions
			|> Enum.reduce([], fn({school_id, faculty_permissions}, agg) ->

				school_faculty = faculty_permissions
					|> Enum.reduce([], fn({teacher_id, permissions}, agg2) ->

						#  make sure permission should be sorted by key alphabetically

						expected_permissions = ["dailyStats", "expense", "family", "fee", "prospective", "setupPage"]

						values = Enum.map(expected_permissions, fn(p) -> Map.get(permissions, p, "FALSE") end)

						single_teacher = [school_id, teacher_id | values]

						# [[], [], [],...] ++ [[]]

						agg2 ++ [single_teacher]

					end)

				# [[],[],..] ++ [[],[],...]

				agg ++ school_faculty

			end)

		csv = [
			[
				"school_id",
				"teacher_id",
				"daily_stats",
				"expense",
				"family",
				"fee",
				"prospective",
				"setup_page"
			] |
			csv_data
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

	end

	@doc """
		Endpoint returns a CSV containing each school id, all of faculty permissions from settings (old way of handling faculty permissions)
	"""

	match "/faculty-permissions-old.csv" do

		{:ok, resp} = EdMarkaz.DB.Postgres.query(
				EdMarkaz.DB,
				"SELECT
					school_id,
					path,
					value
				FROM
					flattened_schools
				WHERE
					path like 'settings,permissions,%,teacher'
				ORDER BY school_id",
				[]
			)


		merge_permissions = resp.rows
			|> Enum.reduce(%{}, fn([school_id, path, value], agg) ->
				# permission: setupPage | fee |family
				[_, _, permission | _] = String.split(path, ",")

				Dynamic.put(agg, [school_id, permission], value)
			end)

		csv_data = merge_permissions
			|> Enum.reduce([], fn({school_id, permissions}, agg) ->

				#  make sure permission should be sorted by key alphabetically

				expected_permissions = ["dailyStats", "expense", "family", "fee", "prospective", "setupPage"]

				values = Enum.map(expected_permissions, fn(p) -> Map.get(permissions, p, "FALSE") end)

				school_permissions = [school_id | values]

				# [[],[],[],...] ++ [[]]

				agg ++ [school_permissions]

			end)

		csv = [
			[
				"school_id",
				"daily_stats",
				"expense",
				"family",
				"fee",
				"prospective",
				"setup_page"
			] |
			csv_data
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

	end

	@doc """
		Endpoint returns a CSV containing teacher phone, name, gender, school_name and number of taken assessments
	"""

	match "/teacher-portal-stats.csv" do

		{:ok, resp} = EdMarkaz.DB.Postgres.query(
				EdMarkaz.DB,
				"SELECT
					id,
					path,
					value
				FROM
					teachers
				ORDER BY id",
				[]
			)


		inflate_teachers = resp.rows
			|> Enum.reduce(%{}, fn([id, path, value], agg) ->

				split_path = String.split(path, ",")

				Dynamic.put(agg, [id] ++ split_path , value)
			end)

		csv_data = inflate_teachers
			|> Enum.reduce([], fn({teacher_id, teacher}, agg) ->

				attempted_assessments = Map.get(teacher, "attempted_assessments", %{}) |> Map.keys |> length

				info_list = [
					teacher["phone"],
					teacher["name"],
					teacher["gender"],
					teacher["school_name"],
					attempted_assessments
				]

				# [[],[],[],...] ++ [[]]
				agg ++ [info_list]

			end)

		csv = [
			[
				"phone",
				"name",
				"gender",
				"school",
				"attempted_assessments"
			] |
			csv_data
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

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

	@doc """
		Endpoint returns CSV containing mis_id, no.of students and teachers for each school and ilmx_id if exists
	"""

	match "/mis-quick-stats.csv" do

		{:ok, csv_data} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				mis.mis_id,
				mis.students,
				mis.faculty,
				mapper.ilmx_id
			FROM (
				SELECT
					school_id as mis_id,
					count(CASE WHEN fs.path LIKE 'students,%,Name' THEN fs.path END) as students,
					count(CASE WHEN fs.path LIKE 'faculty,%,Name' THEN fs.path END) as faculty
				FROM flattened_schools fs
				GROUP BY school_id
			) as mis
			LEFT JOIN ilmx_to_mis_mapper mapper
			ON mis.mis_id = mapper.mis_id",
			[]
		) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> {:error, err}
		end

		csv = [
			[
				"mis_id",
				"students",
				"faculty",
				"ilmx_id"
			] |
			csv_data
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

				[school_id, history, time | _] = rest

				path_for_supplier = [school_id, history, time, "supplier"]

				case type do
					"MERGE" ->
						new_agg = Dynamic.put(agg, rest, value)
						Dynamic.put(new_agg, path_for_supplier, supplier_id)
					"DELETE" -> Dynamic.delete(agg, rest)
					other ->
						agg
				end
		end)

		csv_data = new_state
			|> Enum.reduce([], fn({ school_id, history }, agg)  ->
				row = history["history"]
					#  need only order_placed event orders
					|> Enum.filter(fn({_, order}) -> order["event"] == "ORDER_PLACED" end)
					|> Enum.map(fn({time, order})->

						meta = order["meta"]

						case meta do
							nil -> []
							_ ->

								{_, order_date}  = DateTime.from_unix(String.to_integer(time), :millisecond)

								# put curr timestamp so that from_unix don't throw an error

								{_, actual_dod}  = DateTime.from_unix(Map.get(meta, "actual_date_of_delivery", :os.system_time(:millisecond)), :millisecond)
								{_, expected_cd}  = DateTime.from_unix(Map.get(meta, "expected_completion_date", :os.system_time(:millisecond)), :millisecond)
								{_, expected_dod}  = DateTime.from_unix(Map.get(meta, "expected_date_of_delivery", :os.system_time(:millisecond)), :millisecond)

								[
									time,
									order["supplier"],
									formatted_date(order_date),
									order["event"],
									order["verified"],
									meta["call_one"],
									meta["call_two"],
									meta["cancellation_reason"],
									meta["payment_received"],
									meta["product_id"],
									meta["quantity"],
									meta["sales_rep"],
									meta["school_id"],
									meta["status"],
									meta["strategy"],
									meta["total_amount"],
									meta["actual_product_ordered"],
									formatted_date(actual_dod),
									formatted_date(expected_cd),
									formatted_date(expected_dod),
									meta["notes"],
								]
						end
					end)

				# return aggregatted data

				agg ++ row

			end)

		csv = [[
				"oid",
				"supplier",
				"date",
				"event",
				"verified_status",
				"call_one",
				"call_two",
				"cancellation_reason",
				"payment_received",
				"product_id",
				"quantity",
				"sales_rep",
				"school_id",
				"status",
				"strategy",
				"total_amount",
				"actual_product_ordered",
				"actual_date_of_delivery",
				"expected_completion_date",
				"expected_date_of_delivery",
				"notes"

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

	@doc """
		Endpoint returns a CSV containing school id, student_id, student_name, roll #, class, test_id, total_score, obtained_score
	"""

	match "/TIP-results-data.csv" do

		# Get TIP schools
		{:ok, resp} = EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				school_id
			FROM
				flattened_schools
			WHERE
				path like 'targeted_instruction_access'
				and school_id like 'DIL%'",
			[]
		)

		schools = resp.rows |> Enum.map(fn [id] -> id end)

		# Start and Get the Database

		schools_records = schools |> Enum.reduce([], fn (school_id, agg) ->


			case start_school(school_id) do
				{:ok, pid} ->
					IO.puts "school started now"
				_ ->
					IO.puts	"school started already"
			end

			school_db = Sarkar.School.get_db(school_id)

			# Get sections
			school_sections = Map.get(school_db, "classes") |> sections

			students_records = Map.get(school_db, "students")
				|> Enum.reduce([], fn({std_id, std}, agg2) ->

						results = Dynamic.get(std, ["targeted_instruction", "results"])

						if(results != nil) do
							student_tests = results
							|> Enum.filter(fn x -> x != nil end)
							|> calculate_res
							|> Enum.map(fn (test) ->
								# [] ++ test
								[
									school_id,
									std_id,
									Map.get(std, "Name"),
									Map.get(std, "RollNumber"),
									Map.get(school_sections, Map.get(std, "section_id"))
								] ++ test

							end)

							# [[], [],[],[]] ++ [ student_tests ]

							agg2 ++ student_tests
						else
							agg2
						end
					end)
				#  [[], [], [], []...] ++ [[], [], [],[]...]
				agg ++ students_records

		end)

		csv = [
			[
				"school_id",
				"student_id",
				"student_name",
				"roll #",
				"class",
				"test_id",
				"question_id",
				"answer",
				"slo",
				"slo_category"
			] |
			schools_records
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

	end

	@doc """
		Endpoint returns a CSV containing school id, student_id, student_name, roll #, class, subject, grade
	"""

	match "/TIP-grades-data.csv" do

		# Get TIP schools
		{:ok, resp} = EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				school_id
			FROM
				flattened_schools
			WHERE
				path like 'targeted_instruction_access'
				and school_id like 'PKschool%'",
			[]
		)

		schools = resp.rows |> Enum.map(fn [id] -> id end)

		# Start and Get the Database

		schools_records = schools |> Enum.reduce([], fn (school_id, agg) ->

			case start_school(school_id) do
				{:ok, pid} ->
					IO.puts "school started now"
				_ ->
					IO.puts	"school started already"
			end

			school_db = Sarkar.School.get_db(school_id)

			# Get sections
			school_sections = Map.get(school_db, "classes") |> sections
			# traverse students
			students_records = Map.get(school_db, "students")
				|> Enum.reduce([], fn({std_id, std}, agg2) ->
					# traverse learning levels
						learning_levels = Dynamic.get(std, ["targeted_instruction", "learning_level"])

						if(learning_levels != nil) do
							student_tests = learning_levels
							|> get_grades
							|> Enum.map(fn (test) ->
								[
									school_id,
									std_id,
									Map.get(std, "Name"),
									Map.get(std, "RollNumber"),
									Map.get(school_sections, Map.get(std, "section_id"))
								] ++ test

							end)

							# [[], [],[],[]] ++ [ student_tests ]

							agg2 ++ student_tests
						else
							agg2
						end
					end)
				#  [[], [], [], []...] ++ [[], [], [],[]...]
				agg ++ students_records
		end)

		csv = [
			[
				"school_id",
				"student_id",
				"student_name",
				"roll #",
				"class",
				"subject",
				"grade"
			] |
			schools_records
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

	end

	match "/TIP-schools-data.csv" do
		IO.inspect "Humna"

		# Get TIP schools
		{:ok, resp} = EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				school_id
			FROM
				flattened_schools
			WHERE
				path like 'targeted_instruction_access'
				and school_id = 'PKschool2'",
			[]
		)

		schools = resp.rows |> Enum.map(fn [id] -> id end)
		# Start and Get the Database
		IO.inspect schools

		schools_records = schools |> Enum.reduce([], fn(school_id, agg) ->

			case start_school(school_id) do
				{:ok, pid} ->
					IO.puts "school started now"
				_ ->
					IO.puts	"school started already"
			end

			school_db = Sarkar.School.get_db(school_id)

			# Get sections
			school_sections = Map.get(school_db, "classes") |> sections
			# traverse students
			students_records = Map.get(school_db, "students")
				|> Enum.reduce([], fn({std_id, std}, agg2) ->

							student_tests =
								[
									school_id,
									Map.get(std, "Name"),
									Map.get(std, "RollNumber"),
									Map.get(school_sections, Map.get(std, "section_id")) || "N/A"
								]
								agg2 ++ student_tests

							end)

				agg ++ students_records
		end)
		IO.inspect schools_records

		csv = [
			[
				"school_id",
				"student_name",
				"roll #",
				"class",
			] |
			schools_records
		]
		|> CSV.encode()
		|> Enum.join()

		conn
		|> put_resp_header("content-type", "text/csv")
		|> put_resp_header("cache-control", "no-cache")
		|> send_resp(200, csv)

	end


	match _ do
		send_resp(conn, 404, "not found")
	end

	defp formatted_date (date) do
		[ date | _ ] = date |> DateTime.to_string |> String.split(" ")
		date
	end

	defp sections (classes) do
		classes |> Enum.reduce(%{}, fn ({cid, class_info}, agg) ->
			section = Map.get(class_info, "sections")
				|> Enum.reduce(%{}, fn ({sid, sec_info}, agg2) ->
						Dynamic.put(agg2, [sid], Map.get(class_info, "name"))
					end)
			Map.merge(agg, section)
		end)
	end

	defp calculate_res (results) do

		results
			|> Enum.reduce([], fn({test_id, test}, agg) ->

				questions = Map.get(test, "questions")
				|> Enum.reduce([], fn({question_id, question}, agg2) ->

					test_info = [
						test_id,
						question_id,
						Map.get(question, "is_correct"),
						Map.get(question, "slo"),
						Map.get(question, "slo_category")
					]

				# total_marks = Map.get(test, "questions") |> Map.keys() |> length
				# obtained_marks = Map.get(test, "questions") |> Enum.reduce(0, fn({qid, question}, agg2) ->

					# if Map.get(question, "is_correct"), do: agg2 + 1, else: agg2
				agg2 ++ [test_info]

				# IO.inspect test_info
			end)
				agg ++ questions
				# [[], [], []] ++ [[]]
				# IO.inspect questions
			end)
	end

	defp start_school(school_id) do
		case Registry.lookup(EdMarkaz.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

	defp get_grades(learning_levels) do
		learning_levels |> Enum.reduce([], fn({sub, obj}, agg) ->
			grade = Map.get(obj, "grade")
			grade_info = [
				sub,
				grade
			]
			agg ++ [grade_info]

		end)
	end

end
