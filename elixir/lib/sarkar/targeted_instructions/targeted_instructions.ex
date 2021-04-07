defmodule EdMarkaz.TargetedInstructions do

	def insert_targeted_instruction_assessments([id, assessments]) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_assessments (
				id,
				value,
				date
			) VALUES ($1,$2,current_timestamp)
			on Conflict(id) do update set value = $2",
			[id, assessments]
		) do
			{:ok, resp} ->
				{:ok, resp}
			{:error, err} ->
				IO.puts "assessments merge failed"
				IO.inspect err
				{:error, err}
		end
	end

	def insert_targeted_instruction_quizzes([id, quizzes]) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_quizzes (
				id,
				value,
				date
			) VALUES ($1,$2,current_timestamp)
			on Conflict(id) do update set value = $2",
			[id, quizzes]
		) do
			{:ok, resp} ->
				IO.puts "OK"
				{:ok}
			{:error, err} ->
				IO.puts "quizzes merge failed"
				IO.inspect err
				{:error, err}
		end
	end

	def insert_targeted_instruction_curriculum([id, curriculum]) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_curriculum (
				id,
				value,
				date
			) VALUES ($1,$2,current_timestamp)
			on Conflict(id) do update set value = $2",
			[id, curriculum]
		) do
			{:ok, resp} ->
				{:ok, resp}
			{:error, err} ->
				IO.puts "curriculum merge failed"
				IO.inspect err
				{:error, err}
		end
	end

	def insert_targeted_instruction_slo_mapping([id, slo_mapping]) do

		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_slo_mapping (
				id,
				value,
				date
			) VALUES ($1,$2,current_timestamp)
			on Conflict(id) do update set value = $2",
			[id, slo_mapping]
		) do
			{:ok, resp} ->
				IO.puts "OK"
				{:ok}
			{:error, err} ->
				IO.puts "slo_mapping merge failed"
				IO.inspect err
				{:error, err}
		end
	end

	def get_assessments() do
		query_string = "SELECT value FROM targeted_instruction_assessments"

		{:ok, assessments} = execute_query(query_string)
	end

	def get_slo_mapping() do
		query_string = "SELECT value FROM targeted_instruction_slo_mapping"

		{:ok, slo_mapping } = execute_query(query_string)
	end


	def get_curriculum() do
		query_string = "SELECT value FROM targeted_instruction_curriculum"

		{:ok, curriculum } = execute_query(query_string)
	end

	defp execute_query(query_string) do
		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])

		result = resp.rows |> Enum.map(fn[value] -> value end)

		case result do
			[] ->
				{:ok, %{}}
			_ ->
				[head | _] = result
				{:ok, head}
		end
	end

	def get_quizzes() do

		query_string = "SELECT value FROM targeted_instruction_quizzes"

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])
		[quizzes |_] = resp.rows |> Enum.map(fn[value] -> value end)
		{:ok, quizzes}

	end

end
