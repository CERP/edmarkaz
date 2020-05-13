defmodule EdMarkaz.ActionHandler do

	# TODO: save client_type in connection state
	# don't let people login as one type of user, then switch to another and perform action

	def handle_action(%{"client_type" => "portal_call_center"} = action, state) do
		EdMarkaz.ActionHandler.CallCenter.handle_action(action, state)
	end

	def handle_action(%{"client_type" => "bank_portal"} = action, state) do
		EdMarkaz.ActionHandler.Platform.handle_action(action, state)
	end

	def handle_action(%{"client_type" => "consumer"} = action, state) do
		EdMarkaz.ActionHandler.Consumer.handle_action(action, state)
	end

	def handle_action(%{"client_type" => "mis"} = action, state) do
		Sarkar.ActionHandler.Mis.handle_action(action, state)
	end

	def handle_action(%{"client_type" => "dashboard"} = action, state) do
		Sarkar.ActionHandler.Dashboard.handle_action(action, state)
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.inspect state

		IO.puts "uh oh"
	end

end