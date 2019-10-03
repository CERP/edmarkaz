defmodule EdMarkaz.Slack do
	use Tesla

	def send_alert(alert_message) do

		url = "https://hooks.slack.com/services/" <> System.get_env("SLACK_TOKEN")

		encoded = Poison.encode!(%{"text" => alert_message})
		{:ok, _response } = Tesla.post(url, encoded)
	end

end