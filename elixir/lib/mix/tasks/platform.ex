defmodule Mix.Tasks.Platform do
	use Mix.Task

	def run (["mappy", school_id, new_school_id]) do
		Application.ensure_all_started(:edmarkaz)

		IO.puts school_id
		IO.puts new_school_id

		# IO.puts "Fetching from writes for single student"
		# {:ok, res} = EdMarkaz.DB.Postgres.query(
		# 	EdMarkaz.DB,
		# 	"SELECT time, type, path, value, client_id
		# 	FROM writes
		# 	WHERE school_id=$1 AND path[3]='5f6d0983-3a46-4627-8303-82c8c47992f2' order by time asc",
		# 	[school_id]
		# )

		# Fetch writes for school

		{:ok, res} = EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT time, type, path, value, client_id
			FROM writes
            WHERE school_id=$1
            order by time asc",
			[school_id]
		)

      # HERE is where the bad writes are filtered out.
      # note that there may be a student with a blank id that we actually WANT to keep -- 
      # we should copy flattened state for students with "" id, give them a new id, and merge those in. then carefully delete student with blank id
		mapped_writes = res.rows
		|> Enum.map(fn ([time, type, path, value, client_id]) ->
			%{"date" => time, "type" => type, "path" => path, "value" => value, "client_id" => client_id}
		end)
        |> Enum.filter(fn ([_, _, path, _, _]) -> path[2] != '' end)

		# IO.inspect mapped_writes

		new_state = res.rows
		|> Enum.reduce(%{}, fn([time, type, path, value, client_id], agg) ->

		# 	# case path |> Enum.member?("5f6d0983-3a46-4627-8303-82c8c47992f2") do
		# 		# true ->
					case type do
						"MERGE" ->
							# IO.inspect path
							# IO.inspect value
							Dynamic.put(agg, path, value)
						"DELETE" -> Dynamic.delete(agg, path)
						other ->
							# IO.inspect other
							agg
					end
		# 		# false ->
		# 			# agg

			# end
		end)

        # IO.puts "-----NEW STATE------"

		# IO.inspect new_state

		# IO.puts "-----NEW STATE------"

		IO.inspect Dynamic.get(new_state, ["db", "students", "5f6d0983-3a46-4627-8303-82c8c47992f2"])

		# IO.inspect new_state

		# IO.puts "Save into flattened"
		save_school_writes(new_school_id, mapped_writes)

		# IO.inspect "NEW STATE"
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
			case EdMarkaz.Contegris.send_sms(num, message) do
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

	def save(school_id, writes) do

		save_flattened(school_id, writes)
		save_writes(school_id, writes)

	end

	defp save_school_writes(school_id, writes) do

		IO.puts "INSERTING INTO FLATTENED_SCHOOL"

		save_flattened(school_id, writes)

		IO.puts "INSERTED"

		# chunk_size = round(length(writes) / 4)

		# # chunks = Enum.chunk_every(writes, chunk_size)

		# # chunks |> Enum.each( fn x ->
		# # 	save_writes(school_id, x)
		# # 	IO.puts "NEXT CHUNK"
		# # end)
	end

	def save_writes(school_id, writes) do
		flattened_writes = writes
			|> Enum.map(fn %{"date" => date, "value" => value, "path" => path, "type" => type, "client_id" => client_id} ->
				[school_id, path, value, date, type, client_id]
			end)
			|> Enum.reduce([], fn curr, agg -> Enum.concat(agg, curr) end)

		gen_value_strings_writes = Stream.with_index(writes, 1)
			|> Enum.map(fn {w, i} ->
				x = (i - 1) * 6 + 1
				"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3}, $#{x + 4}, $#{x + 5})"
			end)

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"INSERT INTO writes (school_id, path, value, time, type, client_id) VALUES #{Enum.join(gen_value_strings_writes, ",")}",
			flattened_writes) do
				{:ok, resp} -> {:ok}
				{:error, err} ->
					IO.puts "write failed"
					IO.inspect err
					{:ok}
		end

	end

	defp save_flattened(school_id, writes) do
		flattened_db = writes
			|> Enum.reduce([], fn(%{"date" => date, "value" => value, "path" => path, "type" => type, "client_id" => client_id}, agg) ->

				path = Enum.drop(path, 1)
				if is_map(value) do
					flat_write = Dynamic.flatten(value)
						|> Enum.map(fn {k, v} -> {Enum.join(path ++ k, ","), [type, school_id, path ++ k, v, date]} end)

					Enum.concat(agg, flat_write)
				else
					[{Enum.join(path, ","), [type, school_id, path, value, date]} | agg]
					# Enum.concat( agg, [[type, school_id, path, value, date]] )
				end
			end)
			|> Enum.sort( fn({_, [_, _, _, _, d1]}, {_, [_, _, _, _, d2]} ) -> d1 < d2 end)
			|> Enum.into(%{})
			|> Enum.sort(fn ({_, [_, _, _, _, d1]}, {_, [_, _, _, _, d2]} ) -> d1 < d2 end)
			|> Enum.map(fn {_, v} -> v end)


      IO.puts "----step1 flattened----"

      IO.inspect flattened_db, limit: :infinity

      IO.puts "----step1 flattened----"

			# TEST STATE HERE WITH ALL OR SINGLE STUDEN WRITES

				# |> Enum.reduce(%{}, fn({_, [type, school_id, path, value, date]}, agg) ->

				# 	# path = String.split(p, ",")

				# 	case Enum.member?(path, "5f6d0983-3a46-4627-8303-82c8c47992f2") do
				# 		true ->
				# 			case type do
				# 				"MERGE" ->
				# 					# IO.inspect path
				# 					# IO.inspect value
				# 					Dynamic.put(agg, path, value)
				# 				"DELETE" -> Dynamic.delete(agg, path)
				# 				other ->
				# 					# IO.inspect other
				# 					agg
				# 			end
				# 		false ->
				# 			agg
				# 	end
				# end)

				# IO.inspect flattened_db

			# RESULTS ARE GOOD

		# array of map %{ type: "MERGE" | "DELETE", mutations: [ [date, value, path, type, client_id] ] }
		flattened_db_sequence = flattened_db
			|> Enum.reduce([], fn([type, school_id, path, value, date], agg) ->

				prev = Enum.at(agg, -1) || %{}

				case Map.get(prev, "type") do
					^type ->
						Enum.drop(agg, -1) ++ [%{
							"type" => type,
							"mutations" => Map.get(prev, "mutations") ++ [[school_id, Enum.join(path, ","), value, date]]
						}]
					other ->
						agg  ++ [%{
							"type" => type,
							"mutations" => [
								[school_id, Enum.join(path, ","), value, date]
							]
						}]
				end
			end)


 		IO.puts "-----DB SQUENCE------"
 
 		IO.inspect flattened_db_sequence, limit: :infinity
 
 		IO.puts "-----DB SQUENCE------"
 
 		# # now just generate the sql queries for each one of these segments
 
 		chunk_size = 100
 
 		results = Postgrex.transaction(EdMarkaz.DB, fn(conn) ->
 
 			flattened_db_sequence
 			|> Enum.map(fn %{"type" => type, "mutations" => muts} ->
 
 				muts
 				|> Enum.chunk_every(chunk_size)
 				|> Enum.map(fn chunked_muts ->
 
 					case type do
 						"MERGE" ->
 
 							IO.puts "IN MERGE"
 
 							gen_value_strings_db = 1..trunc(Enum.count(chunked_muts))
 								|> Enum.map(fn i ->
 									x = (i - 1) * 4 + 1
 									"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3})"
 								end)
 
 							query_string = "INSERT INTO flattened_schools (school_id, path, value, time)
 								VALUES #{Enum.join(gen_value_strings_db, ",")}
 								ON CONFLICT (school_id, path) DO UPDATE set value=excluded.value, time=excluded.time"
 
 							arguments = chunked_muts |> Enum.reduce([], fn (a, collect) -> collect ++ a end)

                            IO.inspect query_string
                            IO.inspect arguments, limit: :infinity
                            res = EdMarkaz.DB.Postgres.query(conn, query_string, arguments)
                            IO.inspect res
                            {:ok, res2} = res
                            res2
 
 						"DELETE" ->
 
 							IO.puts "IN DELETE"
 
 							{query_section, arguments} = chunked_muts
 								|> Enum.with_index()
 								|> Enum.map(fn {[_, path, _, _], index} ->
 									{ "(path LIKE $#{index + 2})", [path <> "%"] }
 								end)
 								|> Enum.reduce({[], []}, fn {query, arg}, {queries, args} -> {
 									[ query | queries ],
 									args ++ arg
 								} end)
 
 							query_string = "DELETE FROM flattened_schools WHERE school_id = $1 and #{Enum.join(query_section, " OR ")}"
                            IO.inspect query_string
                            IO.inspect [school_id | arguments]
                            # {:ok, res} = 
                            res = EdMarkaz.DB.Postgres.query(conn, query_string, [school_id | arguments])
                            IO.inspect res
                            {:ok, res2} = res
                            res2
 						_ ->
 
 					end
 				end)
 			end)
 		end, pool: DBConnection.Poolboy, timeout: 60_000*20)
 
 		IO.puts "-----QUERY TRANSACTION------"
 
        IO.inspect results, limit: :infinity
 
 		IO.puts "-----QUERY TRANSACTION------"
 

	end

end
