defmodule Mix.Tasks.Platform do
	use Mix.Task

	def run (["scholar-school"]) do
		Application.ensure_all_started(:edmarkaz)

		# 07-08-2020
		august_seventh = 1596758400

		IO.puts "Records fetching"


		{:ok, res} = EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT time, type, path, value, client_id
			FROM writes
			WHERE school_id='scholarschoolshk'
			order by time desc", []
		)

		# mapped_writes = res.rows
		# |> Enum.map(fn ([time, type, path, value, client_id]) ->
		# 	%{"date" => time, "type" => type, "path" => path, "value" => value, "client_id" => client_id}
		# end)

		# Sarkar.Store.School.save("tempscholarschool", mapped_writes)

		# take an example student and have an idea of what their payments
		# table should look like

		# IO.inspect "NEW STATE"
		
		new_state = res.rows
		|> Enum.reduce(%{}, fn([time, type, path, value, client_id], agg) ->

			# if(Enum.member?(path, "0bccee08-f020-40fd-bc80-a5c81129facd")) do
			# 	IO.inspect %{"date" => time, "type" => type, "path" => path, "value" => value}
			# end

			case type do
				"MERGE" -> Dynamic.put(agg, path, value)
				"DELETE" -> Dynamic.delete(agg, path)
				other ->
					IO.inspect other
					agg
			end

		end)

		# IO.inspect new_state
		IO.inspect Dynamic.get(new_state, ["db", "students", "0bccee08-f020-40fd-bc80-a5c81129facd", "payments"])

		all_students = Dynamic.get(new_state, ["db", "students"])
		all_classes = Dynamic.get(new_state, ["db", "classes"])

		IO.inspect all_classes |> Map.keys() |> length
		IO.puts "SETTINGS"
		IO.inspect Dynamic.get(new_state, ["db", "settings"])
		IO.puts "TEACHERS"
		faculty = Dynamic.get(new_state, ["db", "faculty"]) |> Map.keys() |> length

		IO.puts faculty

		# find the total students
		total_students = length(Enum.uniq(Map.keys(all_students)))
		# IO.inspect total_students
		IO.puts "total students are: #{total_students}"

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

end