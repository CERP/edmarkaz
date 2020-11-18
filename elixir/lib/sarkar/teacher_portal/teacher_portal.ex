defmodule EdMarkaz.TeacherPortal do

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