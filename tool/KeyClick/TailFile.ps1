# 監視対象ファイルを指定
[System.String]$currentPath=Split-Path ( & { $myInvocation.ScriptName } ) -parent
$folder = "$currentPath\data"
$fileName = "log.txt"
$file = "$folder\$fileName"

# 初期状態を取得
$lastTime = 0
$lastSize = 0
$LineNum = 0
$sUniTime = [DateTimeOffset]::Now.ToUnixTimeMilliseconds();
while ($true) {
    try {
        $item = Get-Item $file
        $currentTime = $item.LastWriteTime
        $currentSize = $item.Length
        if ($currentTime -eq $lastTime -or $currentSize -eq $lastSize) {
            Start-Sleep -Milliseconds 50
            continue
        }
        # 変更があれば
        $lastTime = $currentTime
        $lastSize = $currentSize

        $NewLineNum = (Get-Content $file).Count
        if ($NewLineNum -lt $LineNum) {
            Write-Host "r"
            $LineNum = 0
        }
        $rl = $NewLineNum - $LineNum

        $lUniTime = [DateTimeOffset]::Now.ToUnixTimeMilliseconds();
        $ru = $lUniTime - $sUniTime
        $timeS = Get-Date -Format "HH:mm:ss.fff"
        Get-Content $file -Tail $rl | ForEach-Object {
            $str = "$timeS({0, 4})" -f $ru;
            Write-Host "$str $_"
            $ru = 0
        }
        $LineNum = $NewLineNum;
        $sUniTime = $lUniTime;
    }
    catch {
        Write-Warning "ファイルにアクセスできません: $_"
        return
    }
    Start-Sleep -Milliseconds 75
}
