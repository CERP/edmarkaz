defmodule Sarkar.Auth.Dashboard do

	def login({id, client_id, password}) do
		# first check if password is correct.
		# if correct, generate a new token, put in db
		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"SELECT * from mis_dashboard_auth where id=$1 AND password=$2",
			[id, hash(password, 52)]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid login"}
				{:ok, res} ->
					{:ok, token} = Sarkar.Auth.gen_token(id, client_id)

					[_name, _password, permissions] = List.first(res.rows)

					{:ok, token, permissions}
				{:error, err} ->
					IO.inspect err
					{:error, "database error while attempting login"}
		end
	end

	def create({id, password, permissions }) do
		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"INSERT INTO mis_dashboard_auth (id, password, permissions) values ($1, $2, $3)",
			[id, hash(password, 52), permissions]) do
				{:ok, _res} ->
					{:ok, "created #{id} with password #{password}"}
				{:error, err} ->
					IO.inspect err
					{:error, err.postgres.detail}
		end
	end

	def updateUser({ id, permissions }) do
		case EdMarkaz.DB.Postgres.query(EdMarkaz.DB,
			"UPDATE TABLE mis_dashboard_auth
			SET permissions=$2
			WHERE id=$1",
			[id, permissions]
		) do
			{:ok, _res} ->
				{:ok, "Successfully Updated #{id}"}
			{:error, err} ->
				IO.inspect err
				{:error, "User Update Failed"}
		end
	end

	def updateSchoolId({old_id, new_id}) do
		case EdMarkaz.DB.Postgres.query(
			EdMarkaz.School.DB,
			"UPDATE auth SET id=$2 WHERE id=$1",
			[old_id, new_id]
			) do
				{:ok, _res} ->
					case EdMarkaz.DB.Postgres.query(EdMarkaz.School.DB,
					"UPDATE flattened_schools SET school_id=$2 WHERE school_id=$1",
					[old_id, new_id]
					) do
						{:ok, _res} ->
							{:ok, "updated #{old_id} with #{new_id}"}
					end
				{:error, err} ->
					IO.inspect err
					{:error, "unable to update"}
		end
	end

	def hash(text, length) do
		:crypto.hash(:sha512, text)
		|> Base.url_encode64
		|> binary_part(0, length)
	end

end