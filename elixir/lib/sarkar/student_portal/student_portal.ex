defmodule EdMarkaz.StudentPortal do

	def init(args) do
		{:ok, args}
	end

	def merge(id, medium, class, subject, chapter_id, lesson_id, lesson) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO student_portal (
				id,
				medium,
				class,
				subject,
				chapter_id,
				lesson_id,
				lesson
			) VALUES ($1,$2,$3,$4,$5,$6,$7)
			ON CONFLICT (id) DO
			UPDATE SET
				medium=$2,
				class=$3,
				subject=$4,
				chapter_id=$5,
				lesson_id=$6,
				lesson=$7,
				date=current_timestamp",
			[id, medium, class, subject, chapter_id, lesson_id, lesson]
		) do
			{:ok, resp} ->
				IO.puts "OK #{id}"
				{:ok}
			{:error, err} ->
				IO.puts "lesson merge failed #{id}"
				IO.inspect err
				{:error, err}
		end
	end

	def bulk_merge(place_holders, values) do

		query_string = "INSERT INTO student_portal (id, medium, class, subject, chapter_id, lesson_id, lesson) VALUES #{place_holders} ON CONFLICT (id) DO UPDATE SET lesson=excluded.lesson, date=current_timestamp"
		case Postgrex.query(
			EdMarkaz.DB,
			query_string,
			values
		) do
			{:ok, resp} ->
				IO.puts "OK"
				{:ok}
			{:error, err} ->
				IO.puts "Bulk Transaction failed"
				IO.inspect err
				IO.puts "===========FAILED VALUES============="
				IO.inspect values
				IO.puts "=============END====================="
				{:error, err}
		end
	end

end