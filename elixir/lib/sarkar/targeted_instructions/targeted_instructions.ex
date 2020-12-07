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
				[head | tail ] = slo_mapping
				IO.puts "OK"
				{:ok}
			{:error, err} ->
				[head | tail ] = slo_mapping
				IO.puts "slo_mapping merge failed #{head}"
				IO.inspect err
				{:error, err}
		end
	end

	def get_assessments() do

		query_string = "SELECT value FROM targeted_instruction_assessments"

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])do
			{:ok, resp} ->
				[ assessments | _ ] = resp.rows
					|> Enum.map(fn ([value])->
						value
				end)

				{:ok, assessments}

			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

	end

	def get_curriculum() do

		query_string = "SELECT value FROM targeted_instruction_curriculum"

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, query_string, [])do
			{:ok, resp} ->
				[ curriculum | _ ] = resp.rows
					|> Enum.map(fn ([value])->
						value
				end)

				{:ok, curriculum}

			{:error, err} ->
				IO.inspect err
				{:error, err}
		end

	end

end
