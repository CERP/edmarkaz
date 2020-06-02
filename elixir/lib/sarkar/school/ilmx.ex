defmodule EdMarkaz.School do

	def get_profile(phone_number) do

		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "SELECT id, db->>'school_name', db FROM platform_schools WHERE
			length(id)='36' AND
			concat('0', db->>'phone_number') = $1 OR
			db->>'phone_number'=$1 OR
			db->>'phone_number_1'=$1 OR
			db->>'phone_number_2'=$1 OR
			db->>'phone_number_3'=$1 OR
			db->>'owner_phonenumber'=$1 OR
			db->>'pulled_phonenumber'=$1 OR
			db->>'alt_phone_number'=$1", [phone_number])

		case resp.rows do
			[[ school_id, name, db]] ->
				{:ok, school_id, db }
			[[school_id, name, db] | more ] ->
				IO.puts "MULTIPLE SCHOOLS FOUND"
				{:ok, school_id, db}
			other ->
				IO.puts "no school found"
				{:error, "school not found" }
		end
	end

	def get_profile_by_id(school_id) do

		{:ok, resp} = EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"SELECT
				db->>'phone_number', db
			FROM platform_schools
			WHERE id=$1",
			[school_id]
		)
		case resp.rows do
			[[ phone, db]] ->
				{:ok, phone, db }
			other ->
				IO.puts "no school found"
				{:error, "school not found" }
		end
	end

	def get_number(id) do
		{:ok, resp} = EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "Select db->>'phone_number' FROM platform_schools WHERE id=$1", [id])
		[[ number ]] = resp.rows

		number
	end
end