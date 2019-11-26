defmodule EdMarkaz.Contegris do
	use Tesla

	plug Tesla.Middleware.BaseUrl, "http://c5.contegris.com:4000/api"
	plug Tesla.Middleware.JSON, engine: Poison

	def send_sms("03" <> number, text) do
		send_sms("923" <> number, text)
	end

	def send_sms(number, text) do

		encoded = %{
			"username" => System.get_env("CONTEGRIS_USER"),
			"password" => System.get_env("CONTEGRIS_PASS"),
			"sender" => "ilmExchange",
			"receiver" => number,
			"message" => text
		}

		case post("sendSMS", encoded) do
			{:ok, res} -> res.body
			{:error, err} ->
				IO.puts "SEND SMS ERROR to #{number}"
				IO.inspect text
				err
		end
	end

end