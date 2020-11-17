defmodule EdMarkaz.TeacherPortal do

	def merge_assessments(assessments) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO teacher_assessments (
				id,
				meta,
				questions
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			ON CONFLICT (id) DO
			UPDATE SET
				meta=$7,
				questions=$8,
				date=current_timestamp",
			assessments
		) do
			{:ok, resp} ->
				[head | _] = assessments
				IO.puts "OK #{head}"
				{:ok}
			{:error, err} ->
				[head | _] = assessments
				IO.puts "Assessments merge failed #{head}"
				IO.inspect err
				{:error, err}
		end
	end

end