defmodule EdMarkaz.Customer do
	use GenServer

	def save_customer_experience (customer_experience) do
		# IO.inspect "aya"
		# IO.inspect customer_experience
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.DB,
			"INSERT INTO customer_experience (
				phone,
				feedback,
				date
			) VALUES ($1,$2,current_timestamp)
			",
			customer_experience
		) do
			{:ok, resp} ->
				IO.puts "Customer experience saved"
				{:ok}
			{:error, err} ->
				IO.puts "insertion failed"
				IO.inspect err
				{:error, err}
		end
	end

end