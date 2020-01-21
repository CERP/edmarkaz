defmodule Mix.Tasks.Platform do
	use Mix.Task

	def run(["regenerate_supplier_from_writes", supplier_id]) do

		Application.ensure_all_started(:edmarkaz)
		IO.puts "querying out writes"
		{:ok, res} = Postgrex.query(EdMarkaz.DB,
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

		{:ok, res} = Postgrex.query(EdMarkaz.DB, "
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

			case Postgrex.query(EdMarkaz.DB, "
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

			case Postgrex.query(EdMarkaz.DB, "
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
						new_logo_url = Sarkar.Storage.Google.upload_image_from_url("ilmx-product-images", logo_url)

						if banner_url != "" do
							new_banner_url = Sarkar.Storage.Google.upload_image_from_url("ilmx-product-images", banner_url)
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

		res = Postgrex.query(EdMarkaz.DB, "
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
							Sarkar.Storage.Google.upload_image_from_url("ilmx-product-images", picture_url)
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
		case Postgrex.query(EdMarkaz.DB, "SELECT id, sync_state from suppliers", []) do
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
		{:ok, resp} = Postgrex.query(EdMarkaz.DB, "SELECT id, db from platform_schools limit 10", [])

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