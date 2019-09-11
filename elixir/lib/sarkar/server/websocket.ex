defmodule EdMarkaz.Websocket do
	@behaviour :cowboy_websocket

	def init(req, state) do
		{:cowboy_websocket, req, %{}}
	end

	def websocket_init(state) do
		:timer.send_interval(:timer.seconds(30), :gc)
		{:ok, state}
	end

	def websocket_handle({:text, "ping"}, state) do
		{:ok, state}
	end

	def websocket_handle({:text, content}, state) do
		json = Poison.decode!(content)

		handle_json(json, state)
	end

	def handle_json(%{"key" => message_key, "payload" => %{"type" => type, "payload" => payload} = action}, state) do
		case EdMarkaz.ActionHandler.handle_action(action, state) do
			{:reply, %{type: resp_type, payload: msg}, new_state} -> {:reply, {:text, Poison.encode!(%{key: message_key, type: resp_type, payload: msg})}, new_state}
			{:reply, %{type: resp_type}, new_state} -> {:reply, {:text, Poison.encode!(%{key: message_key, type: resp_type, payload: %{}})}, new_state}
			other -> 
				IO.puts "unexpected return from handle_action"
				IO.inspect other
				{:ok, state}
		end
	end

	def handle_json(json, state) do
		IO.puts "unexpected json format"
		IO.inspect json

		{:ok, state}
	end

	def websocket_info({:broadcast, json}, state) do
		{:reply, {:text, Poison.encode!(json)}, state}
	end

	def websocket_info(:gc, state) do
		:erlang.garbage_collect(self())
		{:ok, state}
	end

	def websocket_info(msg, state) do
		IO.inspect msg
		{:ok, state}
	end

	def terminate(_reason, _req, _state) do
		:ok
	end

end