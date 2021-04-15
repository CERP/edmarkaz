defmodule EdMarkaz.Server.MIS do

	use Plug.Router

	plug :match

	plug Plug.Parsers,	parsers: [:json],
						pass:  ["application/json"],
						json_decoder: Poison

	plug :dispatch


	options _ do
		conn
		|> append_headers
		|> send_resp(200, "ok")
	end

	get "/server-time" do

		time = %{
			"os_time" => :os.system_time(:millisecond)
		}

		body = Poison.encode!(time)

		conn
		|> append_headers
		|> send_resp(200, body)
	end

	get "/contact-us" do

		%{ "name" => name, "phone" => phone, "message" => message } = conn.body_params

		slack_alert = "Contact request for MISchool\n Sender details are: Name: #{name}, Phone: #{phone}, Message: #{message}}"

		{:ok, resp} = EdMarkaz.Slack.send_alert(slack_alert,"#mis")

		msg = "Dear" <> name <> "\nYour request has been received, we will contact you soon!"

		# case EdMarkaz.Telenor.send_sms(phone, msg)
		# 	{:ok, resp} ->
		# 		IO.puts "Message has been sent to " <> phone
		# 	{:error, error} ->
		# 		IO.puts "There's problem encountered while sending message to " <> phone
		# end

		resp = %{
			"message" => msg
		}

		body = Poison.encode!(resp)

		conn
		|> append_headers
		|> send_resp(200, body)
	end

	match _ do
		body = Poison.encode!(%{message: "Not Found"})
		conn
		|> append_headers
		|> send_resp(404, body)
	end

	defp append_headers(conn) do
		conn
		|> put_resp_header("content-type", "application/json")
		|> put_resp_header("cache-control", "no-cache")
		|> put_resp_header("access-control-allow-methods", "GET, OPTIONS")
		|> put_resp_header("access-control-allow-origin", "*")
		|> put_resp_header("access-control-allow-headers", "*")
	end

end
