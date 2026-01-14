# KeyClick Codebase Guide for AI Agents

## Project Overview

KeyClick is a **browser game automation bot written in PowerShell** that simulates keyboard/mouse input and performs image recognition to automate battle sequences. The bot captures screen regions, compares images via MD5 hashing, and executes game actions autonomously.

## Architecture

### Core Components

**Main Entry Point:** [KeyClickStart.ps1](../KeyClickStart.ps1)
- Loads function libraries and runs main loop (up to 2000 iterations)
- Each iteration calls [KeyClick.ps1](../KeyClick.ps1) with a counter

**Central Dispatcher:** [KeyClick.ps1](../KeyClick.ps1)
- Reads action commands from `data/stop.txt`
- Routes to battle simulation or capture/OCR operations based on action code
- Action codes: `< 10` = battle, `11-14` = capture/screenshot/OCR operations

**Function Libraries:**
- [KeyFunctions.ps1](../KeyFunctions.ps1): P/Invoke wrappers for Windows API (keyboard, mouse, screen capture), image processing (grayscale, contrast tables)
- [KeyFunctions2.ps1](../KeyFunctions2.ps1): Battle logic (attack selection, HP checks, MP management, TAB UI detection)
- [KeyFunctions3.ps1](../KeyFunctions3.ps1): High-performance C# screen capture with contrast/grayscale conversion

### Data Flow

```
data/setting.json (configuration) 
    ↓
KeyClick.ps1 (action dispatcher)
    ↓
Battle logic (KeyFunctions2.ps1) OR Capture/OCR (KeyFunctions.ps1)
    ↓
Screen region comparison via MD5 hash
    ↓
Mouse/keyboard actions via Windows API
    ↓
data/stop.txt (updated with next action code)
```

### Critical Files & Conventions

| File | Purpose | Key Pattern |
|------|---------|------------|
| [data/setting.json](../data/setting.json) | Game state config (action mode, loop count, MP threshold) | JSON keys: `Action`, `LoopNum`, `EnemyDistance` |
| [data/stop.txt](../data/stop.txt) | Action command (next operation) | Single integer per line |
| [data/log.txt](../data/log.txt) | Execution log with numeric codes | Append-only, used for debugging |
| `data/*.png` | Reference screenshots named as `<key>_<x>x<y>x<w>x<h>x<mode>.png` | Coordinate format critical for `check-Clip()` |

## Key Patterns & Workflows

### Screen Capture & Recognition

**Image Filename Format:** `<identifier>_<x>x<y>x<w>x<h>x<mode>.png`
- Coordinates relative to screen (0,0 = top-left)
- Mode: 0 (normal), 2 (B&W threshold), 3 (high DPI 300), 4 (strict B&W)
- Example: `TAB1_2284x353x8x15x2.png` captures at (2284, 353), size 8×15, B&W mode

**MD5-Based Image Comparison:** [get-ScreenClip](../KeyFunctions.ps1#L264) captures screen region, applies contrast/grayscale transform, saves PNG. [check-Clip](../KeyFunctions.ps1#L434) compares MD5 hashes of reference vs current capture. Falls back to variant filenames (`*s1_`, `*s2_`, `*s3_`) for animation frames.

**Contrast/Grayscale Processing:**
- Pre-computed lookup tables: `$rTable`, `$gTable`, `$bTable` (RGB-to-grayscale coefficients)
- `$contrastTable` (adjustable via `$contrast = 1.85`) for visual enhancement
- Applied in parallel via C# `ImgParallel.GrayContrastParallel()` for speed

### Battle State Machine

**TAB1-ON / TAB1-OFF:** Polling functions detect UI tab visibility using image comparison
**War-StartConfirmation():** Checks if battle can start (screenshot existence, action codes from `stop.txt`)
**Confirm-Vitality():** Loops checking HP/MP status, sends recovery keys if needed
**War-ActSelection():** Sends attack action (key "1" or "2") based on `$JSON.Action` mode and MP availability
**Get-EnemyDistance():** Uses OCR (Tesseract) to read enemy distance, aborts if > threshold

### Input Simulation

- **Keyboard:** `send-KeyCode` uses `[Keyboard]::keybd_event()` P/Invoke for low-level key events
- **Mouse:** `send-MouseLeft` uses `[MouseInput]::ClickAt()` for precise clicks; `Set-MousePos` for cursor movement
- **Note:** Cursor movement avoids capturing area before screenshot (lines ~312-319 in KeyFunctions.ps1)

### Parallel Execution (Runspace Pool)

[KeyFunctions2.ps1](../KeyFunctions2.ps1#L254-L305) uses runspace pool (16 threads) to parallelize battle checks:
```powershell
$pool = [RunspaceFactory]::CreateRunspacePool(1, 16)
# Concurrent: Confirm-Vitality, Get-EnemyDistance, Check-MP
```

## Action Codes Reference

From [KeyClick.ps1](../KeyClick.ps1):
- `< 0`: Idle (no log update)
- `0`: Idle (log update every 500ms)
- `1-9`: Battle mode (calls `Start-Battle01` or `Start-Battle02`)
- `11`: Full-screen capture (2732×1824)
- `12`: Partial capture from config (`TargetOutput1`)
- `13`: Verify capture matches (check-Clip)
- `14`: OCR text extraction via Tesseract

## Developer Workflow

### Adding/Debugging Battle Logic

1. Create reference screenshot via action code `11` or `12`
2. Update `data/setting.json` with `Action` and `LoopNum`
3. Run [KeyClickStart.ps1](../KeyClickStart.ps1)—monitor [data/log.txt](../data/log.txt) for numeric return codes
4. Adjust contrast via `$contrast` variable (line ~191 in KeyFunctions.ps1) if images don't match

### Screen Coordinates

Test coordinates by:
1. Running action `11` (full capture) to identify area
2. Computing bounding box, creating reference with `get-ScreenClip` call
3. Verify MD5 hash persists via repeated `check-Clip` calls

### Modifying Image Processing

Edit lookup tables in [KeyFunctions.ps1](../KeyFunctions.ps1#L191-L224):
- `$contrast` (1.0 = normal; > 1.0 = sharper; < 1.0 = softer)
- RGB coefficients in `$rTable`, `$gTable`, `$bTable` for grayscale sensitivity

## Common Functions Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `get-ScreenClip -x 100 -y 100 -width 200 -height 150 -name "KEY1"` | Capture region, apply contrast, save PNG | Returns filename |
| `check-Clip "TAB1"` | Compare reference screenshot vs current screen | Returns 1 (match) or 0 (no match) |
| `send-KeyCode -name "TAB" -wait 300` | Send keyboard key via keybd_event | -name maps to $KEY_CODE hash |
| `send-MouseLeft -posx 1740 -posy 800` | Click at coordinates | Moves cursor before click if in capture area |
| `Get-OCRText "MOBDIS"` | Extract text from reference image via Tesseract | Returns string or 0 on failure |
| `Read-SettingJSON` | Load JSON config | Returns $JSON object |
| `write-Log "message"` | Append log with timestamp | -init 1 initializes log |

## External Dependencies

- **Tesseract OCR:** Must be in PATH; called via `tesseract.exe` command
- **.NET Framework:** Windows Forms, System.Drawing, System.Threading.Tasks (for C# P/Invoke & parallel processing)
- **Windows 10/11:** DPI scaling assumed at 0.66× (line ~316 in KeyFunctions.ps1); adjust `$LOGPIXELSX` if needed

## Notes for AI Agents

- **Encoding:** Source files use Shift-JIS (Japanese comments visible as garbled if opened as UTF-8)
- **Async Pattern:** No await/async keywords; uses explicit `Start-Sleep` for timing and `[RunspaceFactory]` for concurrency
- **Error Handling:** Minimal; relies on file existence checks (Test-Path) and hash mismatches to detect failures
- **State Persistence:** All state via filesystem (`stop.txt`, `log.txt`, `setting.json`) and global variables
