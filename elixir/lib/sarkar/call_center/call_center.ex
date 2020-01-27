defmodule EdMarkaz.CallCenter do
	#Here we can do pattern matchin for different broadcasts

	def broadcast("CALL", key, value) do

		Registry.lookup(EdMarkaz.ConnectionRegistry, "cerp-callcenter")
			|> Enum.map(
				fn {pid, _} ->
					send(pid,{:broadcast,%{
						type: "ADD_LOGS",
						logs: %{"#{key}" => value }
					}})
				end
			)
	end
end