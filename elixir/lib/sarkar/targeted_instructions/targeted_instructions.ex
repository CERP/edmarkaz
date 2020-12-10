defmodule EdMarkaz.TargetedInstructions do

	def insert_targeted_instruction_assessments([id, assessments]) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO targeted_instruction_assessments (
				id,
				value,
				date
			) VALUES ($1,$2,current_timestamp)",
			[id, assessments]
		) do
			{:ok, resp} ->
				IO.puts "OK"
				{:ok}
			{:error, err} ->
				IO.puts "assessments merge failed"
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
			) VALUES ($1,$2,current_timestamp)",
			[id, curriculum]
		) do
			{:ok, resp} ->
				IO.puts "OK"
				{:ok}
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
			) VALUES ($1,$2,current_timestamp)",
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

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])
		[assessments |_] = resp.rows |> Enum.map(fn[value] -> value end)
		{:ok, assessments}
	end

	def get_slo_mapping() do

		query_string = "SELECT value FROM targeted_instruction_slo_mapping"

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])
		[slo_mapping |_] = resp.rows |> Enum.map(fn[value] -> value end)
		{:ok, slo_mapping}

	end


	def get_curriculum() do

		query_string = "SELECT value FROM targeted_instruction_curriculum"

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])
		[curriculum |_] = resp.rows |> Enum.map(fn[value] -> value end)
		{:ok, curriculum}

	end

end
