

$ccc = @{}

Function Get-name {
    Param([string]$key)

    $ret = Start-ThreadJob -ScriptBlock {
        param($name, $count)

        $msg = "Hello $name ($count)"
        $msg | Out-File -FilePath "./test.txt" -Append
    } -ArgumentList $key, 5
}


$job1 = Get-name -key "abc"
$job2 = Get-name -key "efg"

Start-Sleep -Milliseconds 1000

# Receive-Job $job1 -Wait
# Receive-Job $job2 -Wait
