defmodule Mix.Tasks.Platform do
	use Mix.Task

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