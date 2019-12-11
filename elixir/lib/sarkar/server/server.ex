defmodule EdMarkaz.Server do

	def start_link(_opts) do

		IO.puts "starting server"

		{:ok, _} = :cowboy.start_clear(
			:http,
			[{ :port, 8080 }],
			%{
				:env => %{ :dispatch => config() }
			}
		)
	end

	def config do
		:cowboy_router.compile([
			{:_, [
				{"/ws", EdMarkaz.Websocket, []},
				{"/", EdMarkaz.Server.OK, []},
				{"/analytics/:type", EdMarkaz.Server.Analytics, []},
				{"/masking", EdMarkaz.Server.Masking, []}
			]}
		])
	end

	def child_spec(_opts) do
		import Supervisor.Spec
		worker(__MODULE__, [12_000])
	end
end

defmodule EdMarkaz.Server.OK do
	def init(req, state) do
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
	end
end