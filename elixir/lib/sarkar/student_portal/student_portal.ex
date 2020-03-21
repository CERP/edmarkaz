defmodule EdMarkaz.StudentPortal do

	def init(args) do
		{:ok, args}
	end

	def merge(medium, class, subject, chapter_id, chapter, lesson_id, lesson) do

		case Postgrex.query(
			EdMarkaz.DB,
			"INSERT INTO student_portal (
				medium,
				class,
				subject,
				chapter_id,
				chapter,
				lesson_id,
				lesson
			) VALUES ($1,$2,$3,$4,$5,$6,$7)",
			[medium, class, subject, chapter_id, chapter, lesson_id, lesson]
		) do
			{:ok, resp} -> {:ok}
			{:error, err} ->
				IO.puts "lesson merge failed"
				IO.inspect err
				{:error, err}
		end
	end

end