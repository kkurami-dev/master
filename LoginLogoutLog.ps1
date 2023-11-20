# ログファイル名
$NowDate = Get-Date -Format "yyyyMMdd"
$UserName = (Get-ChildItem Env:\USERNAME).Value
$FileName = "./ExecutLog_$($UserName)_$(Get-Date -Format "yyyyMMdd").txt"
echo $aaa
#exit

# https://blog.serverworks.co.jp/tech/2020/05/22/box-cli-folder-upload/

Get-EventLog -LogName System `
  -After (Get-Date).AddDays(-31) `
  -InstanceId 6001,6002,7001,7002 |`
  Select-Object -Property InstanceId,TimeGenerated,Message |`
  Tee-Object -FilePath $FileName

# ディレクトリを開く
Invoke-Item .

exit
# Web API の URL
# https://infra-memorandum.com/post-via-powershell/
#$url = "ここに発行された URI を書く"

# Invoke-RestMethod に渡す Web API の引数を JSON で作成
# $body = ConvertTo-JSON -Depth 4 @{
#     summary  = 'Microsoft Teams テスト'
#     title    = '画像貼り付け'
#     sections = @(
#         @{
#             activityTitle = '以下に画像が張り付く'
#             activityImage = 'C:\Tmp\aaa.PNG' #画像のパスを設定している（http~でないとメッセージに表示されない)
#         }
#     )
# }
$body = [Text.Encoding]::UTF8.GetBytes($body)

# API を叩く
Invoke-RestMethod -Method Post -Uri $url -Body $body -ContentType 'application/json'
