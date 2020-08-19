#!/bin/bash

if [ ! -z ${API_HOST} ]; then
    cat <<END
    window.api_url = '${API_HOST}'
	window.version = '${SHA_VERSION}'
	window.ga_id = '${GA_ID}'
END
fi
