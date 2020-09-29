import SweetXml
defmodule EdMarkaz.Telenor do
	use Tesla

	plug Tesla.Middleware.BaseUrl, "https://telenorcsms.com.pk:27677/corporate_sms2/api"
	plug Tesla.Middleware.JSON, engine: Poison


	def get_session_id() do

		case get("auth.jsp?msisdn=#{System.get_env("TELENOR_USER")}&password=#{System.get_env("TELENOR_PASS")}") do
			{:ok, res} ->
				result = res.body |> xpath(~x"data/text()"l)
				[session_id] = result
				EdMarkaz.EtsStore.insert({"session_id", session_id, :os.system_time(:millisecond)})
				{:ok, session_id}

			{:error, err} ->
				{:error, err}
		end
	end

	def send_sms("03" <> number, text) do
		send_sms("923" <> number, text)
	end

	def send_sms(session_id, number, text) do

		case get("sendsms.jsp?session_id=#{session_id}&to=#{number}&text=#{text}&mask=#{System.get_env("TELENOR_MASK")}") do
			{:ok, res} ->
				{:ok, res.body}
			{:error, err} ->
				IO.puts "SEND SMS ERROR to #{number}"
				{:error, err}
		end
	end

end