defmodule EdMarkaz.Application do
	# See https://hexdocs.pm/elixir/Application.html
	# for more information on OTP Applications
	@moduledoc false

	use Application

	def start(_type, _args) do
		# List all child processes to be supervised
		children = [
			{ Registry, keys: :duplicate, name: EdMarkaz.ConnectionRegistry },
			{ Registry, keys: :unique, name: EdMarkaz.SupplierRegistry },
			{ DynamicSupervisor, name: EdMarkaz.SupplierSupervisor, strategy: :one_for_one },
			EdMarkaz.Store.Supplier,
			{
				Postgrex,
					name: EdMarkaz.DB,
					hostname: System.get_env("POSTGRES_HOST") || "localhost",
					username: "postgres",
					password: System.get_env("POSTGRES_PASS") || "postgres",
					database: "postgres",
					port: System.get_env("POSTGRES_PORT") || "5432",
					types: EdMarkaz.PostgrexTypes
			},
			EdMarkaz.Server
		]

		# See https://hexdocs.pm/elixir/Supervisor.html
		# for other strategies and supported options
		opts = [strategy: :one_for_one, name: EdMarkaz.Supervisor]
		Supervisor.start_link(children, opts)
	end
end
