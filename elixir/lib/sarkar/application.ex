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
			{ Registry, keys: :unique, name: EdMarkaz.ConsumerRegistry },
			{ DynamicSupervisor, name: EdMarkaz.SupplierSupervisor, strategy: :one_for_one },
			{ DynamicSupervisor, name: EdMarkaz.ConsumerSupervisor, strategy: :one_for_one },
			EdMarkaz.Store.Supplier,
			{
				Postgrex,
					name: EdMarkaz.DB,
					hostname: System.get_env("POSTGRES_HOST") || "localhost",
					username: "postgres",
					password: System.get_env("POSTGRES_PASS") || "postgres",
					database: "postgres",
					port: System.get_env("POSTGRES_PORT") || "5432",
					types: EdMarkaz.PostgrexTypes,
					pool_size: 10,
					timeout: 60000
			},
			# EdMarkaz.Server
			Plug.Adapters.Cowboy.child_spec(
				scheme: :http,
				plug: EdMarkaz.Router,
				dispatch: dispatch,
				port: 8080)
		]

		# See https://hexdocs.pm/elixir/Supervisor.html
		# for other strategies and supported options
		opts = [strategy: :one_for_one, name: EdMarkaz.Supervisor]
		Supervisor.start_link(children, opts)
	end

	defp dispatch do
		[
			{:_, [
				{"/ws", EdMarkaz.Websocket, []},
				{:_, Plug.Cowboy.Handler, {EdMarkaz.Router, []}}
				# {"/", EdMarkaz.Server.OK, []},
				# {"/analytics/:type", EdMarkaz.Server.Analytics, []},
				# {"/masking", EdMarkaz.Server.Masking, []}
			]}
		]
	end
end
