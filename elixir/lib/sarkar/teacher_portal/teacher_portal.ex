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
			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

	end

	def save_profile({id, profile}) do

		# Here need to write logic to flattened the profile
		# create comma separated path, time: server time and value
		# create logic to insert into teachers table

		query_string = ""

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [id]) do
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

	# videos: [id, assessment_id, meta]

	def insert_videos(videos) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO tp_videos (
				id,
				assessment_id,
				meta
			) VALUES ($1,$2,$3)
			ON CONFLICT (id) DO
			UPDATE SET
				assessment_id=$2,
				meta=$3,
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

end