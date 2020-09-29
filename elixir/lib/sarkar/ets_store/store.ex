defmodule EdMarkaz.EtsStore do

	def insert(data) do
		:ets.insert_new(:telenor_ets, data)
	end

	def get(key) do
		:ets.lookup(:telenor_ets, key)
	end

end
