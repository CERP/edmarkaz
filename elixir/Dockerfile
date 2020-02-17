FROM elixir:1.8-alpine

RUN apk add --no-cache alpine-sdk
RUN apk add --no-cache bash

ENV MIX_ENV=prod
ENV REPLACE_OS_VARS
RUN mix local.hex --force
RUN mix local.rebar

WORKDIR /app

ADD mix.exs .
ADD mix.lock .

RUN mix deps.clean --all
RUN mix deps.get
RUN mix deps.compile

ADD . .

RUN mix release
RUN chmod +x "_build/prod/rel/edmarkaz/bin/edmarkaz"

EXPOSE 8080
CMD _build/prod/rel/edmarkaz/bin/edmarkaz foreground
