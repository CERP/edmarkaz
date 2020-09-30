import SweetXml
defmodule EdMarkaz.Telenor do
	use Tesla

	plug Tesla.Middleware.BaseUrl, "https://telenorcsms.com.pk:27677/corporate_sms2/api"
	plug Tesla.Middleware.JSON, engine: Poison


	def get_session_id() do

		case get("auth.jsp", query: [msisdn: System.get_env("TELENOR_USER"), password: System.get_env("TELENOR_PASS")]) do
			{:ok, res} ->
				result = res.body |> xpath(~x"data/text()"l)
				[session_id] = result
				EdMarkaz.EtsStore.insert({"session_id", to_string(session_id), :os.system_time(:millisecond)})
				{:ok, to_string(session_id)}

			{:error, err} ->
				{:error, err}
		end
	end

	def send_sms("03" <> number, text) do
		send_sms("923" <> number, text)
	end

	def send_sms(number, text) do

		session_obj = EdMarkaz.EtsStore.get("session_id")

		case Enum.empty?(session_obj) do
			true ->
				case get_session_id() do
				{:ok, res} ->
					case get("sendsms.jsp", query: [session_id: res, to: number, text: text, mask: System.get_env("TELENOR_MASK")]) do
						{:ok, res} ->
							{:ok, res.body}
						{:error, err} ->
							IO.puts "SEND SMS ERROR to #{number}"
							{:error, err}
					end
				{:error, msg} ->
					{:error, msg}
				end
			false ->
				[{_, session_id, timestamp}] = session_obj
				curr_time = :os.system_time(:millisecond)
				half_hr = 30*60*1000

				case timestamp + half_hr > curr_time do
					true ->
						case get("sendsms.jsp", query: [session_id: session_id, to: number, text: text, mask: System.get_env("TELENOR_MASK")]) do
							{:ok, res} ->
								{:ok, res.body}
							{:error, err} ->
								IO.puts "SEND SMS ERROR to #{number}"
								{:error, err}
						end
					false ->
						case get_session_id() do
							{:ok, res} ->
								case get("sendsms.jsp", query: [session_id: res, to: number, text: text, mask: System.get_env("TELENOR_MASK")]) do
									{:ok, res} ->
										{:ok, res.body}
									{:error, err} ->
										IO.puts "SEND SMS ERROR to #{number}"
										{:error, err}
								end
							{:error, msg} ->
								{:error, msg}
						end
				end
		end

	end

end