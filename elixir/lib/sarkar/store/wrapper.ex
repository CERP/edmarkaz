defmodule EdMarkaz.DB.Postgres do
	def query(db, querystring, params, opts \\ []) do
		Postgrex.query(db, querystring, params, pool: DBConnection.Poolboy, timeout: 60000)
	end
end