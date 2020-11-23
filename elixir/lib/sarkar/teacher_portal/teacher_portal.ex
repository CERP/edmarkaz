defmodule EdMarkaz.TeacherPortal do


	def get_profile(id)do

		query_string = "SELECT path, value FROM teachers WHERE id=$1 ORDER BY time asc"

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [id]) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:ok, %{}}
			{:ok, resp} ->
				inflated = resp.rows
				|> Enum.reduce(%{}, fn([p, v], agg) ->
					path = String.split(p, ",")
					Dynamic.put(agg, path, v)
				end)
				{:ok, inflated}
			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

	end

	def save_profile({id, profile}) do

		date = :os.system_time(:millisecond)

		flattened_db_sequence = Dynamic.flatten(profile) |> Enum.map(fn {p, v} -> [id, Enum.join(p, ","), v, date] end)

		gen_value_strings_db = 1..length(flattened_db_sequence)
		|> Enum.map(fn num ->
				x = (num - 1) * 4 + 1
				"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3})"
			end
		)
		|> Enum.join(",")

		query_string = "INSERT INTO teachers (id, path, value, time)
		VALUES #{gen_value_strings_db}
		ON CONFLICT (id, path) DO UPDATE set value=excluded.value, time=excluded.time"

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, flattened_db_sequence) do
			{:ok, resp} ->
				IO.inspect resp
				{:ok, resp}
			{:error, err} ->
				IO.inspect err
				{:error, err}
		end
	end

	# assessments: [id, meta, questions]

	def insert_assessments(assessments) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO teacher_assessments (
				id,
				meta,
				questions
			) VALUES ($1,$2,$3)
			ON CONFLICT (id) DO
			UPDATE SET
				meta=$2,
				questions=$3,
				date=current_timestamp",
			assessments
		) do
			{:ok, resp} ->
				IO.puts "Ingested success"
				{:ok}
			{:error, err} ->
				IO.puts "Ingested failure"
				IO.inspect err
				{:error, err}
		end
	end

	# videos: [id, meta]

	def insert_videos(videos) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO tp_videos (
				id,
				meta
			) VALUES ($1,$2)
			ON CONFLICT (id) DO
			UPDATE SET
				meta=$2,
				date=current_timestamp",
			videos
		) do
			{:ok, resp} ->
				IO.puts "Ingested success"
				{:ok}
			{:error, err} ->
				IO.puts "Ingested failure"
				IO.inspect err
				{:error, err}
		end
	end

	def get_assessments( ) do

		query_string = "SELECT id, meta, questions FROM teacher_assessments"

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])do
			{:ok, resp} ->
				inflated = resp.rows
				|> Enum.reduce(%{}, fn([id, meta, questions], agg) ->

					value = %{
						"meta" => meta,
						"questions" => questions
					}

					Dynamic.put(agg, [id], value)
				end)

				IO.inspect inflated

				{:ok, inflated}

			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

	end


	def get_videos( ) do

		query_string = "SELECT id, meta FROM tp_videos"

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])do
			{:ok, resp} ->
				inflated = resp.rows
				|> Enum.reduce(%{}, fn([id, meta], agg) ->
					Dynamic.put(agg, [id], meta)
				end)

				IO.inspect inflated

				{:ok, inflated}

			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

	end

end