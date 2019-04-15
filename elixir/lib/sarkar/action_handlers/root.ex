defmodule EdMarkaz.ActionHandler do

	def handle_action(%{"client_type" => "mis"} = action, state) do
		EdMarkaz.ActionHandler.Mis.handle_action(action, state)
	end

	def handle_action(%{"client_type" => "bank_portal"} = action, state) do
		EdMarkaz.ActionHandler.Platform.handle_action(action, state)
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.inspect state

		IO.puts "uh oh"
	end

end