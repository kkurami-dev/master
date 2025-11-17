Param ($count)

# return

$action = Get-Content "data\stop.txt" -Tail 1
$file = "TAB1_2284x353x8x15x2.png"
#$ret = Check-CAP $file

if ($action -lt 0){
    # 何もしない
    Start-Sleep -Milliseconds 100

} elseif ($action -eq 0) {
    # 何もしない(ログ更新あり)
    write-Log "$count wait"
    Start-Sleep -Milliseconds 500

} elseif ($action -lt 10){
    # 運用
    $ret = Start-Battle01 $action

} elseif ($action -eq 11) {
    # 全画面キャプチャ
    $rand = Get-Random -Minimum 1 -Maximum 90
    get-ScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL-${rand}" -mode 4
    0 | Out-File -FilePath "data\stop.txt"
    Start-Sleep -Milliseconds 1000

} elseif ($action -eq 12) {
    # 新規部分キャプチャ
    $ret = Get-CAP $file
    Start-Sleep -Milliseconds 3000

} elseif ($action -eq 13) {
    # キャプチャ画像の比較確認
    $ret = Check-CAP $file
    Start-Sleep -Milliseconds 3000

} elseif ($action -eq 14) {
    # キャプチャ画像の比較確認
    $ret = Get-OCRText "MOBDIS"
    Write-Host $ret
    St-Sleep 10000 $ret

} else {
    # 何もしない
    Start-Sleep -Milliseconds 5000
}

# 最低停止時間( これ以下は操作不能になる )
Start-Sleep -Milliseconds 50
