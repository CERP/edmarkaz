defmodule EdMarkaz.Telenor do
	use Tesla

	plug Tesla.Middleware.BaseUrl, "https://telenorcsms.com.pk:27677/corporate_sms2/api"
	plug Tesla.Middleware.JSON, engine: Poison


	def get_session_id() do

		encoded = %{
			"msisdn" => Syetem.get_env("TELENOR_USER"),
			"passworrd" => Syetem.get_env("TELENOR_PASS")
		}

		case post("auth.jsp", encoded) do
            {:ok, res} -> 
            # parse response
            # return {:ok, %{"session_id" => "Some session id"}} 
			{:error, err} ->
				IO.puts "SEND SMS ERROR to #{number}"
				IO.inspect text
				{:error, err}
		end
	end

	def send_sms("03" <> number, text) do
		send_sms("923" <> number, text)
	end

	def send_sms(session_id, number, text) do

		encoded = %{
			"session_id" => session_id,
			"to" => number,
			"text" => text
		}

		case post("sendsms.jsp", encoded) do
			{:ok, res} -> {:ok, res.body}
			{:error, err} ->
				IO.puts "SEND SMS ERROR to #{number}"
				IO.inspect text
				{:error, err}
		end
	end

end