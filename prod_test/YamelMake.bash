#!/bin/bash

set -ue

#jq 'reduce inputs.data as $s (.; .data += $s)' YamelBase.json SwaggerAndAPIGateway.json
#jq 'reduce inputs.data as $s (.; .data = $s)' YamelBase.json SwaggerAndAPIGateway.json
#jq 'reduce inputs.paths as $s (.; .CCC.user_data.paths = $s)' YamelBase.json SwaggerAndAPIGateway.json

# pip install yq
yq -y 'reduce inputs.paths as $s (.; .CCC.user_data.paths = $s)' YamelBase.yaml SwaggerAndAPIGateway.yaml
