defmodule Mix.Tasks.Platform do
	use Mix.Task

	def run(["ingest_TI_tests", fname, fname2, fname3]) do
		Application.ensure_all_started(:edmarkaz)

		test_csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		slo_mapping_csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname2}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname2}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname2}.csv") |> CSV.decode!
		end

		curriculum_csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname3}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname3}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname3}.csv") |> CSV.decode!
		end

		[ _ | tests] = test_csv
		|> Enum.map(fn row -> row end)

		[ _ | slo_mapping] = slo_mapping_csv
		|> Enum.map(fn row -> row end)

		[ _ | curriculum] = curriculum_csv
		|> Enum.map(fn row -> row end)

		tests_obj = tests
		|> Enum.reduce(%{}, fn([test_id, label, subject, grade, type, pdf_url]), agg ->
			test = %{
				"label" => label,
				"subject" => subject,
				"grade" => grade,
				"type" => type,
				"pdf_url" => pdf_url
			}
			Dynamic.put(agg, ["tests", test_id], test)
		end)

		slo_mapping_obj = slo_mapping
		|> Enum.reduce(%{}, fn([slo_id, description, category, link]), agg ->
			sloMapping = %{
				"description" => description,
				"category" => category,
				"link" => link
			}
			Dynamic.put(agg, [slo_id], sloMapping)
		end)

		curriculum_obj = curriculum
		|> Enum.reduce(%{}, fn([learning_level_id, lesson_number, lesson_name, lesson_description, subject, video_links, pdf_link]), agg ->
			learning_levels = %{
				"leasson_number" => lesson_number,
				"lesson_name" => lesson_name,
				"lesson_description" => lesson_description,
				"subject" => subject,
				"video_links" => video_links,
				"pdf_link" => pdf_link
			}
			Dynamic.put(agg, [learning_level_id], learning_levels)
		end)

		targeted_instruction = %{"tests": tests_obj, "slo_mapping": slo_mapping_obj, "curriculum": curriculum_obj}

		path = ["db", "targeted_instruction"]
		targeted_inst = [%{ "type" => "MERGE", "path" => path, "value" => targeted_instruction}]

		res = start_school("cerp")
		IO.inspect res
		changes = Sarkar.School.prepare_changes(targeted_inst)
		Sarkar.School.sync_changes("cerp", "backend", changes, :os.system_time(:millisecond))
	end

	def run(["ingest_diagnostic_result", fname]) do
		Application.ensure_all_started(:edmarkaz)

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		[ _ | diagnostic_result] = csv
		|> Enum.map(fn row -> row end)

		diagnostic_result_obj = diagnostic_result
		|> Enum.reduce(%{}, fn([test_id, question_id, answer, isCorrect, slo]), agg ->
			result = %{
				"answer" => answer,
				"isCorrect" => true,
				"slo" => slo
			}
			Dynamic.put(agg, [test_id, question_id], result)
		end)

		{:ok, res} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"SELECT DISTINCT path[3] as school_id
			FROM writes
			WHERE path[2] ='students'
			",
			[])
			state = res.rows
			|> Enum.reduce([], fn([school_id], agg) ->
				path = ["db", "students", school_id, "diagnostic_result"]
				mappy = %{ "type" => "MERGE", "path" => path, "value" => diagnostic_result_obj}
				agg = agg ++ [mappy]
			end)
			res = start_school("cerp")
			changes = Sarkar.School.prepare_changes(state)
			Sarkar.School.sync_changes("cerp", "backend", changes, :os.system_time(:millisecond))
	end

	def run(["add_targeted_instruction"]) do
		Application.ensure_all_started(:edmarkaz)
		targeted_instruction = %{
									"visible" => true,
									"tests" => %{ "English" => %{ "name" => "English", "subject" => "English",
															  "class" => "Grade 3", "type" => "Diagnostic",
															  "label" => "Grade 3 Diagnostic Test! For English",
															  "pdf_url" => "https://storage.googleapis.com/targeted-instructions/TI%20V0%20Test_English.pdf"},
												"Mathematics" => %{  "name" => "Mathematics", "subject" => "Mathematics",
																"class" => "Grade 3", "type" => "Diagnostic",
																"label" => "Grade 3 Diagnostic Test! For Mathematics",
																"pdf_url" => "https://storage.googleapis.com/targeted-instructions/TI%20V0%20Test_Math.pdf"},
												"Urdu" => %{  "name" => "Urdu", "subject" => "Urdu",
																"class" => "Grade 3", "type" => "Diagnostic",
																"label" => "Grade 3 Diagnostic Test! For Urdu",
																"pdf_url" => "https://storage.googleapis.com/targeted-instructions/TI%20V0%20Test_Urdu.pdf"}},
									"slo_mapping" => %{
										"Add" => %{ "description" => "Add", "category" => "Addition", "link" => "https://ilmexchange.com/library/Urdu/3/Math/2/Addition"},
										"Subtract" => %{ "description" => "Subtract", "category" => "Subtraction", "link" => "https://ilmexchange.com/library/Urdu/3/Math/3/Subtration"},
										"Count" => %{ "description" => "Count and write number", "category" => "Counting", "link" => "https://ilmexchange.com/library/Urdu/3/Math/1/Numbers"},
										"Multiply" => %{ "description" => "Multiply", "category" => "Multiplication", "link" => "https://ilmexchange.com/library/Urdu/3/Math/4/Repeated%20Addition%20and%20Multiplication"},
										"Divide" => %{ "description" => "Divide", "category" => "Division", "link" => "https://ilmexchange.com/library/Urdu/3/Math/5/Repeated%20Subtration%20and%20Division"},
										"Fractions" => %{ "description" => "Convert fractions and percentages", "category" => "Fractions", "link" => "https://ilmexchange.com/library/Urdu/3/Math/7/Fraction"},
										"Word Recognition" => %{ "description" => "Match picture with word", "category" => "Word Recognition", "link" => "https://ilmexchange.com/library/Urdu/3/English/1/Amazing%20Alphabet"},
										"Alphabet and Word Construction" => %{ "description" => "Combine letters into joined word", "category" => "Alphabet and Word Construction", "link" => "https://ilmexchange.com/library/Urdu/3/English/1/Amazing%20Alphabet"},
										"Grammar" => %{ "description" => "Complete passage for grammar", "category" => "Grammar", "link" => "https://ilmexchange.com/library/Urdu/3/English/7/Verbs"},
										"Sentence Construction" => %{ "description" => "Construct a sentence with a given word", "category" => "Sentence Construction", "link" => "https://ilmexchange.com/library/Urdu/3/English/11/Sentences"},
										"Write Alphabet/Word" => %{ "description" => "Fill in blank letters of word (w/ pictures)", "category" => "Write Alphabet/Word", "link" => "https://ilmexchange.com/library/Urdu/3/English/1/Amazing%20Alphabet"},
									}
								}
		path = ["db", "targeted_instruction"]
		targeted_inst = [%{ "type" => "MERGE", "path" => path, "value" => targeted_instruction}]

		res = start_school("cerp")
		IO.inspect res
		changes = Sarkar.School.prepare_changes(targeted_inst)
		Sarkar.School.sync_changes("cerp", "backend", changes, :os.system_time(:millisecond))
	end

def run(["platform-orders"]) do

	Application.ensure_all_started(:edmarkaz)

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

				[time, order["supplier"], iso_order_date, order["event"], order["verified"] ] ++ meta_val_list

			end)

			agg ++ row

		end)


		IO.inspect csv_data

	end

	def run(["send_sms_messages", fname]) do

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		# Application.ensure_all_started(:edmarkaz)
		[_ | phone_numbers] = csv
		|> Enum.map(fn [ num ]-> "0#{num}" end)

		message = "کیا آپ کا اسکول کورونا وائرس کے سبب بند ہے؟ www.ilmexchange.com آپ کو اپنے اسکول اور طلبۂ کی تعلیم کا سلسلہ جاری رکھنے میں بھرپور مدد کرے گا۔ مزید معلومات کیلیۓ 03481119119 پر رابطہ کریں۔ شکریہ"

		failed = phone_numbers
		|> Enum.map(fn num ->
			case EdMarkaz.Telenor.send_sms(num, message) do
				{:ok, _} ->
					IO.puts "sent message"
					nil
				{:error, err} ->
					IO.inspect err
					num
			end
		end)

		failed
		|> Enum.filter(fn num -> num != nil end)
		|> Enum.map(fn num -> IO.inspect num end)

	end

	def run(["ingest_student_portal_bulk", fname ]) do
		# Can make bulk transactions
		# Csv-Schema: medium, grade, subject, chapter no, chapter Name,lesson no, lesson name, module no, module name-(video title), leson_type, video_link
		Application.ensure_all_started(:edmarkaz)

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		[ _ | lectures] = csv
		|> Enum.map(fn row -> row end)

		IO.puts "INGESTING STUDENT PORTAL DATA"
		chunk_size = 100

		tasks = lectures
		|> Enum.chunk_every(chunk_size)
		|> Enum.each(
			fn chunk ->
				place_holders = 1..length(chunk)
					|> Enum.map(
						fn num ->
							x = (num - 1) * 7 + 1
							"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3}, $#{x + 4}, $#{x + 5}, $#{x + 6})"
						end
					)
					|> Enum.join(",")

				values = chunk
					|> Enum.reduce(
						[],
						fn [medium, grade, subject, chapter_id, lesson_id, video_type, chapter, lesson, lesson_type, video_link, source, source_id ], acc ->

							id = "#{String.trim(medium)}-#{String.trim(grade)}-#{String.trim(subject)}-#{String.trim(chapter_id)}-#{String.trim(lesson_id)}"
							lesson_map = %{
								"name" => String.trim(lesson),
								"type" => String.trim(lesson_type),
								"link" => video_link,
								"chapter_name" => String.trim(chapter),
								"video_type" => String.trim(video_type),
								"source" => String.trim(source),
								"source_id" => source_id
							}
							curr = [id, String.trim(medium), String.trim(grade), String.trim(subject), String.trim(chapter_id), String.trim(lesson_id), lesson_map]
							Enum.concat(acc, curr)

						end
					)
				EdMarkaz.StudentPortal.bulk_merge(place_holders, values)
			end
		)

		IO.inspect tasks
	end

	def run(["ingest_student_portal", fname ]) do
		Application.ensure_all_started(:edmarkaz)

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		# Csv-Schema: medium, grade, subject, chapter no, chapter Name,lesson no, lesson name, module no, module name-(video title), leson_type, video_link

		[ _ | lectures] = csv
		|> Enum.map(fn row -> row end)

		IO.puts "INGESTING STUDENT PORTAL DATA"

		tasks = lectures
			|> Enum.map(
				fn [medium, grade, subject, chapter_id, lesson_id, video_type, chapter, lesson, lesson_type, video_link, source, source_id] ->

					id = "#{String.trim(medium)}-#{String.trim(grade)}-#{String.trim(subject)}-#{String.trim(chapter_id)}-#{String.trim(lesson_id)}"
					lesson_map = %{
						"name" => String.trim(lesson),
						"type" => String.trim(lesson_type),
						"link" => video_link,
						"chapter_name" => String.trim(chapter),
						"video_type" => String.trim(video_type),
						"source" => String.trim(source),
						"source_id" => source_id
					}

					EdMarkaz.StudentPortal.merge(id, String.trim(medium), String.trim(grade), String.trim(subject), String.trim(chapter_id), String.trim(lesson_id), lesson_map)
				end
			)
		IO.inspect tasks
	end

	def run(["ingest_assessments", fname ]) do
		Application.ensure_all_started(:edmarkaz)

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		[ _ | assessments] = csv
		|> Enum.map(fn row -> row end)

		mapped_assessments = assessments
			|> Enum.reduce(%{}, fn([medium, grade, subject, chapter_id, lesson_id, quiz_id, quiz_name, question_no, question_statement, opt_a, opt_b, opt_c, opt_d, correct_answer]), agg ->

					id = "#{String.trim(medium)}-#{String.trim(grade)}-#{String.trim(subject)}-#{String.trim(chapter_id)}-#{String.trim(lesson_id)}-#{String.trim(quiz_id)}"

					ans_map = %{ 1 => "A", 2 => "B", 3 => "C", 4 => "D" }
					options = %{ 1 => opt_a, 2 => opt_b, 3 => opt_c, 4 => opt_d }

					answers = Enum.reduce(1..4, %{}, fn x, acc ->
						is_correct = Map.get(ans_map, x) == correct_answer
						answer = %{
							"answer" => String.trim(Map.get(options, x)),
							"correct_answer" =>  is_correct,
							"urdu_answer" => "",
							"id" => Integer.to_string(x),
							"active" => true,
							"image" => "",
							"audio" => ""
						}
						Map.put(acc, Integer.to_string(x), answer)
						end)

					if Map.has_key?(agg, id) do
						question = %{
							"order" => String.trim(question_no),
							"id" =>  String.trim(question_no),
							"title" => String.trim(question_statement),
							"title_urdu" => "",
							"response_limit" => 0,
							"multi_response" => false,
							"image" => "",
							"urdu_image" => "",
							"audio" => "",
							"active" => true,
							"answers" => answers
						}
						Dynamic.put(agg, [id, "questions", question_no], question)
					else
						assessment = %{
							"quiz_info" => [id, medium, grade, subject, chapter_id, lesson_id],
							"meta" => %{
								"medium" => String.trim(medium),
								"grade" => String.trim(grade),
								"subject" => String.trim(subject),
								"chapter_id" => chapter_id,
								"lesson_id" => lesson_id,
								"type" => "MCQs",
								"title" => String.trim(quiz_name),
								"id" => String.trim(quiz_id),
								"order" => String.trim(quiz_id),
								"time" => 0,
								"total_marks" => 0,
								"active" => true,
								"source" => "Ilmx" # will change based on the source
							},
							"questions" => %{
								question_no => %{
									"order" => String.trim(question_no),
									"id" =>  String.trim(question_no),
									"title" => String.trim(question_statement),
									"title_urdu" => "",
									"response_limit" => 0,
									"multi_response" => false,
									"image" => "",
									"urdu_image" => "",
									"audio" => "",
									"active" => true,
									"answers" => answers
								}
							}
						}
						Map.put(agg, id, assessment)
					end
				end)

		mapped_assessments
			|> Enum.each(fn({id, value}) ->
				quiz_info = value["quiz_info"]
				quiz_meta = value["meta"]
				quiz_questions = value["questions"]

				insert_row = Enum.concat([quiz_info, [quiz_meta], [quiz_questions]])

				EdMarkaz.StudentPortal.merge_assessments(insert_row)
			end)
	end

	def run(["update_verified_bool_to_string"]) do
		Application.ensure_all_started(:edmarkaz)

		{:ok, writes} = case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				value ->> 'time' as time,
				id,
				value,
				client_id
			FROM platform_writes
			WHERE path[4]='history' AND
				value ->> 'event' ='ORDER_PLACED' AND
				value ->> 'verified' = 'true'",[]
		)do
			{:ok, resp} ->
				writes = resp.rows
				|> Enum.reduce(
					%{},
					fn([time, sup_id, order, client_id], agg) ->
						order_time = Map.get(order, "time")
						school_code = get_in(order, ["meta", "school_id"])
						path = ["sync_state", "matches", school_code, "history", "#{order_time}", "verified"]

						write = %{
							"action" => %{
								"path" => path,
								"value" => "VERIFIED",
								"type" => "MERGE"
							},
							"date" => :os.system_time(:millisecond)
						}
						case Map.get(agg, sup_id) do
							nil ->
								Map.put(agg, sup_id, %{ "#{Enum.join(path, ",")}" => write })
							val ->
								Map.put(agg, sup_id, Map.put(val, "#{Enum.join(path, ",")}", write))
						end
					end
				)
				{:ok, writes}
			{:error, err} ->
				IO.puts "ERROR"
				IO.inspect err
				{:ok, %{}}
		end

		writes
		|> Enum.each(
			fn ({ sid, writes}) ->
				start_supplier(sid)
				EdMarkaz.Supplier.sync_changes(
					sid,
					"backend-task",
					writes,
					:os.system_time(:millisecond)
				)
			end
		)
	end

	def run(["regenerate_supplier_from_writes", supplier_id]) do

		Application.ensure_all_started(:edmarkaz)
		IO.puts "querying out writes"
		{:ok, res} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"SELECT client_id, type, path, value, time
			FROM platform_writes
			WHERE id=$1
			order by time asc
			",
			[supplier_id]
		)

		state = res.rows
		|> Enum.reduce(%{}, fn [client_id, type, [_ | path], value, time], agg ->
			case type do
				"MERGE" -> Dynamic.put(agg, path, value)
				"DELETE" -> Dynamic.delete(agg, path)
			end

		end)

		IO.inspect state

		{:ok, res} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "
			INSERT INTO suppliers(id, sync_state)
			VALUES ($1, $2)
			ON CONFLICT(id) DO UPDATE SET sync_state=$2", [supplier_id, state])
		IO.puts "inserted"

		case Registry.lookup(EdMarkaz.SupplierRegistry, supplier_id) do
			[{_, _}] ->
				IO.puts "reloading supplier..."
				EdMarkaz.Supplier.reload(supplier_id)
				IO.puts "supplier reloaded"
			[] -> IO.puts "supplier not started."
		end

	end

	def run(["ingest_data"]) do
		Application.ensure_all_started(:edmarkaz)

		{:ok, body} = case File.exists?(Application.app_dir(:edmarkaz, "priv/data.json")) do
			true -> File.read(Application.app_dir(:edmarkaz, "priv/data.json"))
			false -> File.read("priv/sample.json")
		end
		{:ok, json} = Poison.decode(body)

		Enum.each(json, fn school_profile ->
			id = Map.get(school_profile, "refcode")

			case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "
				INSERT INTO platform_schools(id, db)
				VALUES ($1, $2)
				ON CONFLICT(id) DO UPDATE SET db=$2 ", [id, school_profile]) do
				{:ok, _} -> IO.puts "updated #{id}"
				{:error, err} ->
					IO.puts "error on school #{id}"
					IO.inspect err
			end
		end)
	end

	def run(["ingest_data", fname]) do
		Application.ensure_all_started(:edmarkaz)

		IO.puts "adding schools from priv/#{fname}"

		{:ok, body} = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}")) do
			true -> File.read(Application.app_dir(:edmarkaz, "priv/#{fname}"))
		end
		{:ok, json} = Poison.decode(body)

		Enum.each(json, fn school_profile ->
			id = Map.get(school_profile, "refcode")

			case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "
				INSERT INTO platform_schools(id, db)
				VALUES ($1, $2)
				ON CONFLICT(id) DO UPDATE SET db=$2 ", [id, school_profile]) do
				{:ok, _} -> IO.puts "updated #{id}"
				{:error, err} ->
					IO.puts "error on school #{id}"
					IO.inspect err
			end
		end)

	end

	def run(["add_matches", id, fname, offset, limit]) do
		Application.ensure_all_started(:edmarkaz)
		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		[_ | refcodes] = csv
		|> Enum.map(fn [refcode | _ ] -> refcode end)
		|> Enum.slice(String.to_integer(offset), String.to_integer(limit))

		changes = refcodes
		|> Enum.reduce(%{}, fn(school_id, agg) ->
			path = ["sync_state", "matches", school_id]
			write = %{
				"action" => %{
					"path" => path,
					"value" => %{ "status" => "NEW" },
					"type" => "MERGE"
				},
				"date" => :os.system_time(:millisecond)
			}

			Map.put(agg, Enum.join(path, ","), write)
		end)

		IO.inspect changes
		IO.inspect start_supplier(id)
		IO.inspect EdMarkaz.Supplier.sync_changes(id, "backend-task", changes, :os.system_time(:millisecond))

	end

	def run(["add_matches", id, fname]) do
		run(["add_matches", id, fname, "0", "1000"])
	end

	def run(["add_matches", id]) do
		run(["add_matches", id, id, "0", "1000"]) # 1000 is the max!
	end

	def run(["set_suppliers", fname]) do
		Application.ensure_all_started(:edmarkaz)

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		# supplier_login, supplier_name, description, logo_url, banner_url
		[_ | suppliers] = csv
		|> Enum.map(fn row -> row end)

		# create login if doesnt exist (silent error)
		suppliers
		|> Enum.each(fn [id, _name, _description, _logo_url, _banner_url, password | _rest] ->
			if password != "" do
				EdMarkaz.Auth.create({ id, password })
			end
		end)

		tasks = suppliers
		|> Enum.map(fn [id, name, description, logo_url, banner_url, password, order] ->

			order = if order == "" do
				nil
			else
				order
			end

			Task.async fn ->
				res = start_supplier(id)
				IO.inspect res
				case logo_url do
					"" ->
						EdMarkaz.Supplier.save_profile(id, %{
							"description" => description,
							"name" => name,
							"order" => order
						})

					has_url ->
						new_logo_url = EdMarkaz.Storage.Google.upload_image_from_url("ilmx-product-images", logo_url)

						if banner_url != "" do
							new_banner_url = EdMarkaz.Storage.Google.upload_image_from_url("ilmx-product-images", banner_url)
							EdMarkaz.Supplier.save_profile(id, %{
								"description" => description,
								"name" => name,
								"logo" => %{
									"id" => logo_url,
									"url" => new_logo_url
								},
								"banner" => %{
									"id" => banner_url,
									"url" => new_banner_url
								},
								"order" => order
							})
						else
							EdMarkaz.Supplier.save_profile(id, %{
								"description" => description,
								"name" => name,
								"logo" => %{
									"id" => logo_url,
									"url" => new_logo_url
								},
								"order" => order
							})
						end
				end
			end
		end)

		results = Enum.map(tasks, fn task -> Task.await(task, 45000) end)

		IO.inspect results

	end

	def run(["add_products", fname]) do
		Application.ensure_all_started(:edmarkaz)

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/#{fname}.csv")) |> CSV.decode!
			false -> File.stream!("priv/#{fname}.csv") |> CSV.decode!
		end

		# loop through the csv, add products to table
		# we don't have ID's for the product...
		# loop through the csv
		# schema: supplier_id, product_id, product_name, price, description, category, picture_url, order


		[_ | products] = csv
		|> Enum.map(fn row -> row end)

		# first mark as deleted all products that no longer exist (use sid, pid combo)
		pids = products
			|> Enum.map(fn [_, pid | _rest] -> "'#{pid}'" end)
			|> Enum.join(",")

		res = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "
			UPDATE products
			SET product=jsonb_set(product, '{deleted}'::text[], to_jsonb(true), true)
			WHERE id not in (#{pids}) and length(id) != 36
			RETURNING id
			", [])

		IO.inspect res

		tasks = products
		|> Enum.map(fn [sid, pid, name, price, old_price, desc, category, picture_url, order | _] ->
			# Task.async fn ->

				case picture_url do
					"" ->
						IO.puts "no url"
						IO.inspect picture_url

						product = %{
							"id" => pid,
							"supplier_id" => sid,
							"title" => name,
							"description" => desc,
							"phone_number" => "",
							"price" => price,
							"old_price" => old_price,
							"categories" => %{
								category => true
							},
							"order" => order
						}

						EdMarkaz.Product.merge(pid, product, sid)
					has_url ->
						img_url = try do
							EdMarkaz.Storage.Google.upload_image_from_url("ilmx-product-images", picture_url)
						rescue
							error ->
								IO.puts "error uploading img"
								IO.inspect error
								nil
						end

						product = %{
							"id" => pid,
							"supplier_id" => sid,
							"title" => name,
							"description" => desc,
							"phone_number" => "",
							"price" => price,
							"categories" => %{ category => true },
							"image" => %{
								"id" => picture_url,
								"url" => img_url
							},
							"order" => order
						}

						EdMarkaz.Product.merge(pid, product, sid)
				end
			# end
		end)

		# results = Enum.map(tasks, fn task -> Task.await(task, 45000) end)

		IO.inspect tasks

	end

	def run(args) do
		Application.ensure_all_started(:edmarkaz)
		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "SELECT id, sync_state from suppliers", []) do
			{:ok, res} ->
				res.rows
				|> Enum.each(fn ([id, sync_state]) ->

					{:ok, _} = case args do
						["add_matches"] -> {:ok, add_matches(id, sync_state)}
						["gen_matches"] -> {:ok, gen_matches(id, sync_state)}
						other ->
							IO.inspect other
							IO.puts "ERROR: supply a recognized task to run"
							{:error, "no task"}
					end

				end)

			{:err, msg} ->
				IO.puts "ERROR"
				IO.inspect msg
		end
	end

	defp gen_matches(id, sync_state) do
		matches = Map.get(sync_state, "matches", %{})

		# put the first 100 things into here
		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "SELECT id, db from platform_schools limit 10", [])

		next_matches = resp.rows
		|> Enum.reduce(%{}, fn([school_id, db], agg) ->
			Map.put(agg, school_id, %{
				"status" => "NEW"
			})
		end)

		Map.put(sync_state, "matches", next_matches)
	end

	defp add_matches("mischool2", sync_state) do

		csv = case File.exists?(Application.app_dir(:edmarkaz, "priv/mischool.csv")) do
			true -> File.stream!(Application.app_dir(:edmarkaz, "priv/mischool.csv")) |> CSV.decode!
			false -> File.stream!("priv/mischool.csv") |> CSV.decode!
		end

		[_ | refcodes] = csv
		|> Enum.map(fn [refcode | _ ] -> refcode end)

		# instead of directly manipulating the matches dir, should be creating writes
		# and writing the writes to the supplier.

		changes = refcodes
		|> Enum.reduce(%{}, fn(school_id, agg) ->
			path = ["sync_state", "matches", school_id]
			write = %{
				"action" => %{
					"path" => path,
					"value" => %{ "status" => "NEW" },
					"type" => "MERGE"
				},
				"date" => :os.system_time(:millisecond)
			}

			Map.put(agg, Enum.join(path, ","), write)
		end)

		start_supplier("mischool2")
		EdMarkaz.Supplier.sync_changes("mischool2", "backend-task", changes, :os.system_time(:millisecond))

		sync_state
	end

	defp add_matches(id, sync_state) do
		# this needs to read from csv file and load into the school ids

		sync_state
	end

	defp start_supplier(id) do
		case Registry.lookup(EdMarkaz.SupplierRegistry, id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SupplierSupervisor, {EdMarkaz.Supplier, {id}})
		end
	end

	defp formatted_date (date) do
		[ date | _ ] = date |> DateTime.to_string |> String.split(" ")
		date
	end

	defp start_school(school_id) do
		case Registry.lookup(EdMarkaz.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(EdMarkaz.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

end