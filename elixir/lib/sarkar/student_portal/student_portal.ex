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
		case EdMarkaz.DB.Postgres.query(
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

	def merge_assessments(quiz_data) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO assessments (
				id,
				medium,
				class,
				subject,
				chapter_id,
				lesson_id,
				meta,
				questions
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			ON CONFLICT (id) DO
			UPDATE SET
				medium=$2,
				class=$3,
				subject=$4,
				chapter_id=$5,
				lesson_id=$6,
				meta=$7,
				questions=$8,
				date=current_timestamp",
			quiz_data
		) do
			{:ok, resp} ->
				[head | tail ] = quiz_data
				IO.puts "OK #{head}"
				{:ok}
			{:error, err} ->
				[head | tail ] = quiz_data
				IO.puts "assessment merge failed #{head}"
				IO.inspect err
				{:error, err}
		end
	end

	def insert_targeted_instruction_assessments(assessments) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_assessments (
				value,
				date
			) VALUES ($1,current_timestamp)",
			assessments
		) do
			{:ok, resp} ->
				[head | tail ] = assessments
				IO.puts "OK #{head}"
				{:ok}
			{:error, err} ->
				[head | tail ] = assessments
				IO.puts "assessments merge failed #{head}"
				IO.inspect err
				{:error, err}
		end
	end

	def insert_targeted_instruction_curriculum(curriculum) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_curriculum (
				value,
				date
			) VALUES ($1,current_timestamp)",
			curriculum
		) do
			{:ok, resp} ->
				[head | tail ] = curriculum
				IO.puts "OK #{head}"
				{:ok}
			{:error, err} ->
				[head | tail ] = curriculum
				IO.puts "curriculum merge failed #{head}"
				IO.inspect err
				{:error, err}
		end
	end

end