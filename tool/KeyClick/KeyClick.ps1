Param ($count)

# return
$action = [int](Get-Content "data\stop.txt" -Tail 1)

if ($action -lt 0){
    # 何もしない
    Start-Sleep -Milliseconds 100

} elseif ($action -eq 0) {
    # 何もしない(ログ更新あり)
    write-Log "$count wait"
    Start-Sleep -Milliseconds 500

} elseif ($action -lt 10){
    # 運用
    $ret = Start-Battle01
    #$ret = Start-Battle02
    return

} elseif ($action -eq 11) {
    # 全画面キャプチャ
    $rand = Get-Random -Minimum 1 -Maximum 90
    get-ScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL-${rand}" -mode 2
    0 | Out-File -FilePath "data\stop.txt"
    Start-Sleep -Milliseconds 1000

} elseif ($action -eq 12) {
    # 新規部分キャプチャ
    $json = Read-SettingJSON
    $file = $json.TargetOutput1
    $ret = Get-CAP $file
    Start-Sleep -Milliseconds 3000

} elseif ($action -eq 13) {
    # キャプチャ画像の比較確認
    $json = Read-SettingJSON
    $file = $json.TargetOutput1
    $ret = Check-CAP $file
    Start-Sleep -Milliseconds 3000

} elseif ($action -eq 14) {
    # OCRの実行
    $file = $json.TargetOutput2
    $ret = Get-OCRText $file
    Write-Host $ret
    St-Sleep 10000 $ret

} else {
    # 何もしない
    write-Log "2 $count wait"
    Start-Sleep -Milliseconds 5000
}

# 最低停止時間( これ以下は操作不能になる )
Start-Sleep -Milliseconds 50
