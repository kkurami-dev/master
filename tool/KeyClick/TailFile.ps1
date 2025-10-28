# 監視対象ファイルを指定
[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
$file = "$currentPath\data\log.txt"
Write-Host $file

# 初期状態を取得
$item = Get-Item $file
$lastTime = $item.LastWriteTime
$lastSize = $item.Length

Write-Host "監視開始: $file (Ctrl+Cで停止) $lastSize, $lastTime"

while ($true) {
    #Start-Sleep -Seconds 2
    Start-Sleep -Milliseconds 200
    try {
        $item = Get-Item $file
        $currentTime = $item.LastWriteTime
        $currentSize = $item.Length

        if ($currentSize -lt $lastSize) {
            Write-Host "r"
        }

        # 変更があれば
        if ($currentTime -ne $lastTime -or $currentSize -ne $lastSize) {
            $lastTime = $currentTime
            $lastSize = $currentSize

            $lastLine = Get-Content $file -Tail 1
            Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $lastLine)
        }
    }
    catch {
        Write-Warning "ファイルにアクセスできません: $_"
    }
}
