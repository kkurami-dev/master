#!/bin/bash

IdToken=eyJraWQiOiJcLzBpYU1kNk5RVFpad3h5bjFGMUMzc0hnRGN1TVdZcHFKcTNZemhaQW1Kcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0ZmRiNzY5Ni0yZTVjLTQ3MTctODQ4Ny00NjYyMWU4YzU2OTAiLCJjb2duaXRvOmdyb3VwcyI6WyJvcGVyYXRvciJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTFfeVhGVDhITk5hIiwiY2xpZW50X2lkIjoiNHFvcGZtNjlydmhjZm12dDVvdTZiZzNncDIiLCJvcmlnaW5fanRpIjoiMjk5YWIwYzctZWYwNi00MjcwLWI1MTItMmRlYzQ3NDcyMGY2IiwiZXZlbnRfaWQiOiJlNWYwZmFjNi1hZDNmLTRkYjgtOWFmZi01OGYzYzFkZjc1MjgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjY1Mzc4ODk5LCJleHAiOjE2NjUzODI0OTksImlhdCI6MTY2NTM3ODg5OSwianRpIjoiN2ZjZmI3Y2YtNzYwMC00Y2Y5LTk4ZDktY2I5OTE2YTNkMmE4IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXIwMSJ9.GtIcfPM8xY9ioCtjieTwQLzNEmRiZU5IwBHEzBAWcKd7nwN3NqHul_JhMA1dPJO-Pbr9xDpFiQuhE_Xw9bsyeOcx2ucbwKufNxF3RMzO8ItlYbxsA67fvJKieuldBLaH9auQks3FnfJQBaaEEmRrS9xalbfVxStjYHhkQVVU1ecvQLCyYQGgAgymnsxk_QXWaU7Q6G1IhqYCcNidIq30xTepJCN3F6AWMg8OhAim0D_TO2eA1lvdhbBmKu8eMWqKsQ2T4NbCq8j49mhIgTy5jewL84il2gbQBfDsghdF8PIhf6BG3P2NJoF8b0fjTmdFKPI3d-cH4_sblZZ5PBzoBQ

curl \
 -H "Authorization: $IdToken" \
 https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/my-api/login


curl \
 -H "Authorization: $IdToken" \
 https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/my-api/v1/ope-resource/myhelloworld2

exit
'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "apigateway:DELETE",
                "apigateway:PUT",
                "apigateway:PATCH",
                "apigateway:POST",
                "apigateway:GET"
            ],
            "Resource": "arn:aws:apigateway:*::/restapis"
        }
    ]
}
'
