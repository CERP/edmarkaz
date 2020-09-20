defmodule EdMarkaz.Auth.BranchManager do

	def login({username, client_id, password}) do

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"SELECT * from branch_manager where username=$1 AND password=$2",
			[username, hash(password, 52)]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "username or password is incorrect"}
				{:ok, rows} -> gen_token(username, client_id)
				{:error, err} ->
					IO.inspect err
					{:error, "unknown error has happened"}
		end
	end

	def verify({id, client_id, token}) do

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
		"SELECT * FROM tokens WHERE id=$1 AND token=$2 AND client_id=$3",
		[id, hash(token, 12), client_id]) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "authentication failed"}
			{:ok, res} -> {:ok, "success"}
			{:error, err} ->
				IO.inspect err
				{:error, "authentication failed"}
		end
	end

	def gen_token(id, client_id) do

		token = :crypto.strong_rand_bytes(12)
			|> Base.url_encode64
			|> binary_part(0, 12)

		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB, "INSERT INTO tokens (id, token, client_id) values ($1, $2, $3)", [id, hash(token, 12), client_id]) do
			{:ok, res} -> {:ok, token}
			{:error, err} ->
				IO.inspect err
				{:error, "Unable to generate token!"}
		end
	end

	defp hash(text, length) do
		:crypto.hash(:sha512, text)
		|> Base.url_encode64
		|> binary_part(0, length)
	end

end