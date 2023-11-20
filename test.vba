'変数の宣言を必須
Option Explicit

'Excelファイルの拡張子を指定
Const FILE_TYPE_XLSX As String = "xlsx"
Const FILE_TYPE_XLSM As String = "xlsm"

'**********************************************************
'メイン処理
'**********************************************************
Sub main()
    
    Dim inputFolder As String
    Dim fso As FileSystemObject
    Dim sheet1 As Worksheet
    
    '
    Set sheet1 = ActiveSheet
    sheet1.Range("A3").Select

    'イベント抑止
    Application.EnableEvents = False
    
    '対象フォルダの指定
    inputFolder = "F:\work\KAZU1の共有\週報"
    
    Set fso = New Scripting.FileSystemObject

    '指定フォルダ配下（サブフォルダ含む）の全ファイルに対する処理(再帰処理)
    Call roopAllFiles(inputFolder, fso)

    '後片付け
    Set fso = Nothing

    'イベント抑止を解除
    Application.EnableEvents = True

End Sub

'**********************************************************
'指定フォルダ配下（サブフォルダ含む）の全ファイルに対する処理(再帰処理)
'**********************************************************
Private Function roopAllFiles(ByVal inputFolder As String, ByVal fso As FileSystemObject)
    'サブフォルダの数だけ再帰
    Dim folder As folder
    For Each folder In fso.getFolder(inputFolder).SubFolders
        Call roopAllFiles(folder.Path, fso)
    Next
    Set folder = Nothing

    'ファイル数分繰り返し
    Dim file As file
    For Each file In fso.getFolder(inputFolder).Files
        'Excelファイルの場合のみ処理を行う
        If LCase(fso.GetExtensionName(file.Name)) = FILE_TYPE_XLSX Or _
           LCase(fso.GetExtensionName(file.Name)) = FILE_TYPE_XLSM Then
            'Excelファイルに対する処理
            Call execForExcelFile(file)
        End If
    Next
    Set file = Nothing

End Function

'**********************************************************
'Excelファイルに対する処理
'**********************************************************
Private Function execForExcelFile(ByVal file As file)
    
    Dim wk As Workbook
    Dim fname As String
    Dim val As String
        
    'Excelファイルを以下で開く
    '┗「リンクの更新する/しない」のメッセージを非表示
    '┗「読み取り専用を推奨する/しない」のメッセージを非表示
    '┗「読み取り専用」で開く
    Set wk = Workbooks.Open(Filename:=file.Path, UpdateLinks:=0, IgnoreReadOnlyRecommended:=True, ReadOnly:=True)

    '!!!!!!Excelファイルに対する処理を記載する!!!!!!
    'ここでは例としてイミディエイトウィンドウへ出力する
    Debug.Print "「" + wk.Name & "」を開きました"
    fname = wk.Name
    val = Sheets(1).Range("BP6").Value
    
    'Excelファイルを保存せずに閉じる
    wk.Close SaveChanges:=False
    
    ' 取得した内容を元のシートに反映
    With ActiveCell
        .Value = fname
        .Offset(0, 1).Value = val
        .Offset(1, 0).Activate
    End With
    
End Function


