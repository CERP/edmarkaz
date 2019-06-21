defmodule EdMarkaz.Product do

	def init(args) do
		{:ok, args}
	end

	def merge(id, product, supplier_id) do

		case Postgrex.query(
			EdMarkaz.DB,
			"INSERT INTO products (id, supplier_id, product) VALUES ($1, $2, $3)
			ON CONFLICT (id) DO UPDATE SET product=$3, sync_time=current_timestamp",
			[id, supplier_id, product]) do 

				{:ok, resp} -> {:ok}
				{:error, err} -> 
					IO.puts "product merge failed"
					IO.inspect err
					{:error, err}

		end

	end

end