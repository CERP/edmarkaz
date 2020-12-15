defmodule EdMarkaz.Application do
	# See https://hexdocs.pm/elixir/Application.html
	# for more information on OTP Applications
	@moduledoc false

	use Application

	def start(_type, _args) do
		# List all child processes to be supervised

		:ets.new(:telenor_ets, [:set, :public, :named_table])

		children = [
			{ Registry, keys: :duplicate, name: EdMarkaz.ConnectionRegistry },
			{ Registry, keys: :unique, name: EdMarkaz.SupplierRegistry },
			{ Registry, keys: :unique, name: EdMarkaz.ConsumerRegistry },
			{ Registry, keys: :unique, name: EdMarkaz.SchoolRegistry },
			{ DynamicSupervisor, name: EdMarkaz.SupplierSupervisor, strategy: :one_for_one },
			{ DynamicSupervisor, name: EdMarkaz.ConsumerSupervisor, strategy: :one_for_one },
			{ DynamicSupervisor, name: EdMarkaz.SchoolSupervisor, strategy: :one_for_one },
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
					pool: DBConnection.Poolboy,
					pool_size: 10,
					timeout: 60000
			},
			:poolboy.child_spec(:image_worker, [
				{:name, {:local, :image_worker}},
				{:worker_module, EdMarkaz.Image.Worker},
				{:size, 5},
				{:max_overflow, 5}
			]),
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
				{"/utils/:method", Sarkar.Server.Utils, []},
				{"/mis/analytics/:type", Sarkar.Server.Analytics, []},
				{"/dashboard/:type", Sarkar.Server.Dashboard, []},
				{"/upload/:type", Sarkar.Server.Upload, []},
				{:_, Plug.Cowboy.Handler, {EdMarkaz.Router, []}}
			]}
		]
	end
end

defmodule Sarkar.Server.Utils do
	def init(%{bindings: %{method: "clear"}} = req, state) do
		req = :cowboy_req.reply(
			200,
			%{"Clear-Site-Data" => "cache"},
			"ok",
			req
		)

		{:ok, req, state}
	end
end