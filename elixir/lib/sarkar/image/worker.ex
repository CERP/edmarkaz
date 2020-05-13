defmodule EdMarkaz.Image.Worker do
	use GenServer

	def start_link(_) do
		GenServer.start_link(__MODULE__, nil, [])
	end

	def init(_) do
		{:ok, nil}
	end

	def handle_call({:upload_image, %{"id" => id, "image_string" => image_string, "path" => path} = merge}, _from, state) do

		IO.puts "uploading image in worker"

		url = EdMarkaz.Storage.Google.upload_image("ilmx-product-images", id, image_string)

		{:reply, url, state}
	end
end