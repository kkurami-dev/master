
rd /s /q dist
expo export --public-url http://127.0.0.1:8000

turtle setup:android --sdk-version 36.0.0

:HTTP1
    start "python http_server.py"
exit /b

:HTTP2
    cd dist
    start "python ..\http_server.py"
exit /b
