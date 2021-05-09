#!/bin/bash

set -ue

#jq 'reduce inputs.data as $s (.; .data += $s)' YamelBase.json SwaggerAndAPIGateway.json
#jq 'reduce inputs.data as $s (.; .data = $s)' YamelBase.json SwaggerAndAPIGateway.json
#jq 'reduce inputs.paths as $s (.; .CCC.user_data.paths = $s)' YamelBase.json SwaggerAndAPIGateway.json
sed -e '2,12d' SwaggerAndAPIGateway.json > b.json
jq 'reduce inputs as $s (.; .CCC.user_data |= .+$s)' YamelBase.json b.json > c.json


# pip install yq
#yq 'reduce inputs.paths as $s (.; .CCC.user_data.paths = $s)' YamelBase.yaml SwaggerAndAPIGateway.yaml

memo='
https://docs.aws.amazon.com/cli/latest/index.html

https://docs.aws.amazon.com/cli/latest/reference/apigatewayv2/index.html
 aws apigatewayv2 --region us-east-1 create-deployment --api-id aabbccddee
  
 aws apigatewayv2 get-stage \
     --api-id a1b2c3d4 \
     --stage-name prod

https://docs.aws.amazon.com/cli/latest/reference/lambda/index.html
aws lambda list-layers \
    --compatible-runtime nodejs
';

