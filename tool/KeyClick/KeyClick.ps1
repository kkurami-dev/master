# ACTOK or "data/stop.txt" に 1 が書かれていると何もしない

# Write-Host "x" -NoNewline
# $rand = Get-Random -Minimum 1 -Maximum 20

# Start-Sleep -Milliseconds 3000
# return

# $capkey = "HPNG-${rand}"
#$capkey = "HPNG"
#Remove-Item "data\HPNG-*.png"
# Remove-Item "data\${capkey}*.png"
# $let = get-ScreenClip -x 1520 -y 1380 -width 10 -height 20 -name $capkey
# if ((check-Clip -key $capkey) -ne 1) {
#    $ret = check-Clip -key $capkey -tmpDel 1
# }
# return

$ss = Start-Check
if ($ss -lt 0){
    write-Log "$ss"
    return
}

if ($ss -eq 3) {
    $ss = $ss + 0.1
    send-KeyStr -Arg1 "f"
}

if ((check-Clip -key "MP2") -eq 1) {
    $ss = $ss + 0.01
    send-KeyStr -Arg1 "1"
}
write-Log "$ss"
return

$ontab = TAB1-ON( 200 )
if ($ontab -ne 1) {
    return
} elseif ((check-Clip -key "MP5") -eq 1) {
    send-KeyStr -Arg1 "1"
    $ontab = TAB1ON( 2000 )
} else {
    send-KeyStr -Arg1 "e"
    Start-Sleep -Milliseconds 2200
    send-MouseLeft -posname "tab-1"
}
return

# $rand = Get-Random -Minimum 1 -Maximum 20
# $sw = [System.Diagnostics.Stopwatch]::StartNew()
# $let = get-ScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL$rand"
# $sw.Stop()
# write-Log ("{0}" -f $sw.ElapsedMilliseconds)

# write-Log "."
# Remove-Item data\FULL*1824.png
