Param ($count)

# return

$action = Get-Content "data\stop.txt" -Tail 1

if ($action -lt 0){
    # 何もしない
    Start-Sleep -Milliseconds 1000

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
    get-ScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL-${rand}"
    0 | Out-File -FilePath "data\stop.txt"
    Start-Sleep -Milliseconds 1000

} elseif ($action -eq 12) {
    # 画像確認
    $res = check-Clip -key "TAB1"
    if ($res -ne 1) {
        #send-MouseLeft -posname "tab-update"
        send-MouseLeft -posname "tab-1"
        send-MouseLeft -posname "tab-1"
    }

    write-Log $res
    Start-Sleep -Milliseconds 10000

} elseif ($action -eq 13) {
    $file = "MP2_1262x1435x7x17x2.png"
    if (1) {
        send-MouseLeft -posname "tab-update"
        send-MouseLeft -posname "tab-1"
        send-MouseLeft -posname "tab-1"
        Start-Sleep -Milliseconds 100
    }

    # 部分キャプチャ
    if ($file -cmatch "x2.png") {
        $file -match "(.+?)_(\d+)x(\d+)x(\d+)x(\d+)x(\d+)" | Out-Null
    } else {
        $file -match "(.+?)_(\d+)x(\d+)x(\d+)x(\d+)" | Out-Null
    }
    $filename = $matches[1]
    $x = $matches[2]
    $y = $matches[3]
    $w = $matches[4]
    $h = $matches[5]
    $mode = $matches[6]

    $ret = Check-CAP -c_x $x -c_y $y -c_w $w -c_h $h -capkey $filename -mode $mode
    #$ret = Get-CAP -c_x $x -c_y $y -c_w $w -c_h $h -capkey $filename -mode $mode

} else {
    # 何もしない
    Start-Sleep -Milliseconds 5000
}

# 最低停止時間( これ以下は操作不能になる )
Start-Sleep -Milliseconds 50
