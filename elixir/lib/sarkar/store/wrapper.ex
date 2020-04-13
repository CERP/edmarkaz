defmodule EdMarkaz.DB.Postgres do
	def query(db, querystring, params, opts \\ []) do
		EdMarkaz.DB.Postgres.query(db, querystring, params, pool: DBConnection.Poolboy)
	end
end