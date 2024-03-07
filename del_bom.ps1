## BOM を取り除く
## フォルダする、
$path = "g:\osero\src"
$itemList = Get-ChildItem -File $path -include *.js -Recurse

foreach($item in $itemList)
{
	  #$file = [System.IO.File]::ReadAllText($item.FullName, [Text.Encoding]::GetEncoding( 932 ))
    $file = [System.IO.File]::ReadAllText($item.FullName)
    echo $item.FullName
	  [System.IO.File]::WriteAllText($item.FullName, $file)
}
