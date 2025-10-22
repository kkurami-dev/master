$rand = Get-Random -Minimum 1 -Maximum 20

# $sw = [System.Diagnostics.Stopwatch]::StartNew()
# $let = getScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL$rand"
# $sw.Stop()
# Write-Host ("{0}" -f $sw.ElapsedMilliseconds)

# WAIT
# sendKeyStr -Arg1 "f"
# Start-Sleep -Milliseconds 80
# sendKeyStr -Arg1 "f" -nowait 1
# Start-Sleep -Milliseconds 200
# return

# $key = "HPNG"
# if ((checkClip -key $key) -ne 1) {
#     $ret = checkClip -key $key -tmpDel 1
# }

# $sw.Stop()
# Write-Host ("{0}" -f $sw.ElapsedMilliseconds)

#return

# Write-Host "." -NoNewline

# Start-Sleep -Milliseconds 500
# return

###
# sendKeyStr -Arg1 "f"
# sendKeyStr -Arg1 "f" -nowait 1
# $rand = Get-Random -Minimum 1 -Maximum 20
# if ($rand -ge 15) {
#     sendKeyCode -name "VK_A" -wait 400
# } else {
#     Start-Sleep -Milliseconds 200
# }
# return

# Full
# $rand = Get-Random -Minimum 1 -Maximum 20
# getScreenClip -x 0 -y 0 -width 2732 -height 1824 -name "FULL$rand"
# getScreenClip -x 1312 -y 1440 -width 10 -height 15 -name "TMP-SUB$rand"
# if ((checkClip -key "MP5") -eq 1){
#     sendKeyCode -name "TAB" -wait 300
# }
#Remove-Item data\FULL*1824.png
# Remove-Item data\SUB{*.png
# Remove-Item data\TMP_*.png

StartCheck

#Start-Sleep -Milliseconds 300
#return

sendKeyStr -Arg1 "f"
Start-Sleep -Milliseconds 50
sendKeyStr -Arg1 "f" -nowait 1
Start-Sleep -Milliseconds 50
return

$ontab = TAB1ON( 200 )

if ($ontab -ne 1) {
    return
} elseif ((checkClip -key "MP5") -eq 1) {
    sendKeyStr -Arg1 "1"
    $ontab = TAB1ON( 2000 )
} else {
    # MP回復
    sendKeyStr -Arg1 "e"
    Start-Sleep -Milliseconds 2200
    sendMouseLeft -posname "tab-1"
}
