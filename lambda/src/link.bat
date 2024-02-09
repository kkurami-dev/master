

cd npc

del /s selectPosition.*
mklink selectPosition.mjs  ..\..\..\src\utils\selectPosition.mjs

del /s utilsData.*
mklink utilsData.mjs  ..\..\..\src\utils\utilsData.mjs
