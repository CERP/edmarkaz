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

	# this is going to need to handle merges and syncing
	# because call center and consumer can both modify this, which then has to be sent to the 
	# supplier site.

	# now working in an application that requires that a client subscribe to multiple sync_states / paths

	# for now actually its ok to just have a last_updated flag and send the entire new school up / down between these sites
	# we don't expect this to be updated often so it won't bite into the consumers data cap
	# and we don't care about that as much for call center & supplier

end