defmodule EdMarkaz.Slack do
	use Tesla

	def send_alert(alert_message) do
		EdMarkaz.Slack.send_alert(alert_message, "#platform")
	end

	def send_alert(text, channel) do
		url = "https://hooks.slack.com/services/" <> System.get_env("SLACK_TOKEN")

		encoded = Poison.encode!(%{
			"text" => text,
			"channel" => channel,
			"username" => "platform-bot",
			"icon_emoji" => ":robot_face:"
		})

		{:ok, _response } = Tesla.post(url, encoded)
	end

end