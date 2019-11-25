defmodule Sarkar.Storage.Google do
  def upload_image(bucket_id, imageId, dataString) do
    "data:image/png;base64," <> raw = dataString

    file_path = "#{imageId}.png"

    File.write!(file_path, Base.decode64!(raw))

    IO.puts("getting token")
    {:ok, token} = Goth.Token.for_scope("https://www.googleapis.com/auth/cloud-platform")
    IO.puts("got token")
    conn = GoogleApi.Storage.V1.Connection.new(token.token)
    IO.puts("made conn")

    {:ok, object} =
      GoogleApi.Storage.V1.Api.Objects.storage_objects_insert_simple(
        conn,
        bucket_id,
        "multipart",
        %{name: Path.basename(file_path)},
        file_path
      )

    File.rm!(file_path)

    object.mediaLink
  end

  def upload_image_from_url(bucket_id, img_url) do
    case String.contains?(img_url, bucket_id) do
      true ->
        img_url

      false ->
        %HTTPoison.Response{body: body} = HTTPoison.get!(img_url)

        file_path =
          img_url
          |> String.split("/")
          |> List.last()

        File.write!(file_path, body)

        IO.puts("getting token")
        {:ok, token} = Goth.Token.for_scope("https://www.googleapis.com/auth/cloud-platform")
        IO.puts("got token")
        conn = GoogleApi.Storage.V1.Connection.new(token.token)
        IO.puts("made conn")

        {:ok, object} =
          GoogleApi.Storage.V1.Api.Objects.storage_objects_insert_simple(
            conn,
            bucket_id,
            "multipart",
            %{name: Path.basename(file_path)},
            file_path
          )

        File.rm!(file_path)

        object.mediaLink
    end
  end
end
