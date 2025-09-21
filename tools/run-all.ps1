# Compatible with PowerShell 5.1+

<#
.SYNOPSIS
    Production-grade service orchestrator for POS system
.DESCRIPTION
    Coordinates Backend, Frontend, and Electron services with auto-kill ports,
    comprehensive logging, health checks, and graceful shutdown.
.PARAMETER BackendOnly
    Run only the backend service
.PARAMETER FrontendOnly
    Run only the frontend service
.PARAMETER ElectronOnly
    Run only the electron service
.PARAMETER CleanPorts
    Force kill processes using required ports before starting
.PARAMETER NoColor
    Disable colored output
.PARAMETER LogDaysToKeep
    Number of days to keep log files (default: 7)
#>

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$ElectronOnly,
    [switch]$CleanPorts,
    [switch]$NoColor,
    [int]$LogDaysToKeep = 7
)

# Configuration
$Config = @{
    Backend = @{
        Name = "Backend"
        Path = ".\packages\backend"
        Command = "npm"
        Args = @("run", "dev")
        Port = 3000
        HealthUrl = "http://localhost:3000/health"
        Color = "Cyan"
    }
    Frontend = @{
        Name = "Frontend"
        Path = ".\packages\frontend"
        Command = "npm"
        Args = @("run", "dev")
        Port = 3002
        HealthUrl = "http://localhost:3002/"
        Color = "Green"
    }
    Electron = @{
        Name = "Electron"
        Path = ".\apps\desktop"
        Command = "npm"
        Args = @("run", "electron:dev")
        Port = $null
        HealthUrl = $null
        Color = "Yellow"
    }
}

# Global variables
$Script:RunningProcesses = @{}
$Script:LogDirectories = @{}
$Script:StartTime = Get-Date

# Utility Functions
function Write-Color {
    param([string]$Text, [string]$Color = "White")

    if ($NoColor) {
        Write-Host $Text
        return
    }

    $ColorMap = @{
        "Red" = [System.ConsoleColor]::Red
        "Green" = [System.ConsoleColor]::Green
        "Yellow" = [System.ConsoleColor]::Yellow
        "Cyan" = [System.ConsoleColor]::Cyan
        "Magenta" = [System.ConsoleColor]::Magenta
        "White" = [System.ConsoleColor]::White
        "Gray" = [System.ConsoleColor]::Gray
    }

    Write-Host $Text -ForegroundColor $ColorMap[$Color]
}

function Write-Banner {
    $banner = @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                          POS SYSTEM ORCHESTRATOR                            ║
║                         Production Service Manager                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@
    Write-Color $banner "Magenta"
    Write-Color ""
    Write-Color "Configuration:" "White"
    Write-Color "  Backend:    $($Config.Backend.Path) -> http://localhost:$($Config.Backend.Port)" "Cyan"
    Write-Color "  Frontend:   $($Config.Frontend.Path) -> http://localhost:$($Config.Frontend.Port)" "Green"
    Write-Color "  Electron:   $($Config.Electron.Path) -> Desktop App" "Yellow"
    Write-Color "  Log Retention: $LogDaysToKeep days" "Gray"
    Write-Color ""
}

function Test-Prerequisites {
    Write-Color "[VALIDATION] Checking prerequisites..." "White"

    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Color "[ERROR] PowerShell 5.1+ required. Current: $($PSVersionTable.PSVersion)" "Red"
        exit 1
    }

    # Check Node.js
    try {
        $nodeVersion = & node --version 2>$null
        Write-Color "[OK] Node.js: $nodeVersion" "Green"
    } catch {
        Write-Color "[ERROR] Node.js not found. Please install Node.js." "Red"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = & npm --version 2>$null
        Write-Color "[OK] npm: $npmVersion" "Green"
    } catch {
        Write-Color "[ERROR] npm not found." "Red"
        exit 1
    }

    # Check directories
    $servicesToCheck = @()
    if ($BackendOnly -or (!$FrontendOnly -and !$ElectronOnly)) { $servicesToCheck += "Backend" }
    if ($FrontendOnly -or (!$BackendOnly -and !$ElectronOnly)) { $servicesToCheck += "Frontend" }
    if ($ElectronOnly -or (!$BackendOnly -and !$FrontendOnly)) { $servicesToCheck += "Electron" }

    foreach ($service in $servicesToCheck) {
        $path = $Config[$service].Path
        if (-not (Test-Path $path)) {
            Write-Color "[ERROR] Directory not found: $path" "Red"
            exit 1
        }
        Write-Color "[OK] Directory exists: $path" "Green"
    }

    Write-Color "[VALIDATION] All prerequisites satisfied" "Green"
    Write-Color ""
}

function Initialize-LogDirectories {
    $baseLogDir = "logs"
    if (-not (Test-Path $baseLogDir)) {
        New-Item -ItemType Directory -Path $baseLogDir -Force | Out-Null
    }

    foreach ($serviceName in $Config.Keys) {
        $logDir = Join-Path $baseLogDir $serviceName.ToLower()
        if (-not (Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        $Script:LogDirectories[$serviceName] = $logDir
    }

    # Clean old logs
    Clean-OldLogs
}

function Clean-OldLogs {
    $cutoffDate = (Get-Date).AddDays(-$LogDaysToKeep)

    foreach ($logDir in $Script:LogDirectories.Values) {
        $oldLogs = Get-ChildItem -Path $logDir -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        foreach ($log in $oldLogs) {
            Remove-Item $log.FullName -Force
            Write-Color "[CLEANUP] Removed old log: $($log.Name)" "Gray"
        }
    }
}

function Get-ProcessUsingPort {
    param([int]$Port)

    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            $processes = @()
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $processes += @{
                        PID = $process.Id
                        Name = $process.ProcessName
                        Path = try { $process.Path } catch { "N/A" }
                    }
                }
            }
            return $processes
        }
    } catch {
        # Port might not be in use
    }
    return @()
}

function Ensure-Port-Free {
    param([int]$Port, [switch]$Force)

    $processes = Get-ProcessUsingPort -Port $Port
    if ($processes.Count -eq 0) {
        return $true
    }

    if ($Force -or $CleanPorts) {
        Write-Color "[PORT-KILL] Port $Port is in use. Terminating processes..." "Red"
        foreach ($proc in $processes) {
            Write-Color "  Killing PID $($proc.PID): $($proc.Name) ($($proc.Path))" "Red"
            try {
                Stop-Process -Id $proc.PID -Force
                Start-Sleep -Milliseconds 500
            } catch {
                Write-Color "  Failed to kill PID $($proc.PID): $($_.Exception.Message)" "Red"
            }
        }

        # Verify port is free
        Start-Sleep -Seconds 2
        $remainingProcesses = Get-ProcessUsingPort -Port $Port
        if ($remainingProcesses.Count -gt 0) {
            Write-Color "[ERROR] Failed to free port $Port" "Red"
            return $false
        }
        Write-Color "[PORT-KILL] Port $Port is now free" "Green"
        return $true
    } else {
        Write-Color "[ERROR] Port $Port is in use. Use -CleanPorts to automatically kill processes." "Red"
        foreach ($proc in $processes) {
            Write-Color "  PID $($proc.PID): $($proc.Name) ($($proc.Path))" "Yellow"
        }
        return $false
    }
}

function Start-ServiceWithLogging {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command,
        [string[]]$Arguments,
        [string]$LogDirectory,
        [string]$Color
    )

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $logFile = Join-Path $LogDirectory "$($ServiceName.ToLower())-$timestamp.log"

    Write-Color "[START] Starting $ServiceName..." $Color
    Write-Color "  Command: $Command $($Arguments -join ' ')" "Gray"
    Write-Color "  Working Dir: $WorkingDirectory" "Gray"
    Write-Color "  Log File: $logFile" "Gray"

    try {
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = $Command
        $processInfo.Arguments = $Arguments -join ' '
        $processInfo.WorkingDirectory = $WorkingDirectory
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.CreateNoWindow = $true
        # UTF8 encoding (PowerShell 5.1 compatible)
        if ($PSVersionTable.PSVersion.Major -ge 6) {
            $processInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8
            $processInfo.StandardErrorEncoding = [System.Text.Encoding]::UTF8
        }

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo

        # Create log file
        New-Item -Path $logFile -ItemType File -Force | Out-Null

        # Event handlers for output
        $outputAction = {
            param($sender, $e)
            if (-not [string]::IsNullOrEmpty($e.Data)) {
                $timestamp = Get-Date -Format "HH:mm:ss.fff"
                $logLine = "[$timestamp] $($e.Data)"
                Add-Content -Path $using:logFile -Value $logLine
                Write-Color "[$using:ServiceName] $($e.Data)" $using:Color
            }
        }

        $errorAction = {
            param($sender, $e)
            if (-not [string]::IsNullOrEmpty($e.Data)) {
                $timestamp = Get-Date -Format "HH:mm:ss.fff"
                $logLine = "[$timestamp] ERROR: $($e.Data)"
                Add-Content -Path $using:logFile -Value $logLine
                Write-Color "[$using:ServiceName] ERROR: $($e.Data)" "Red"
            }
        }

        Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputAction | Out-Null
        Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $errorAction | Out-Null

        $process.Start() | Out-Null
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()

        $Script:RunningProcesses[$ServiceName] = @{
            Process = $process
            LogFile = $logFile
        }

        Write-Color "[START] $ServiceName started with PID $($process.Id)" $Color
        return $process
    } catch {
        Write-Color "[ERROR] Failed to start $ServiceName`: $($_.Exception.Message)" "Red"
        Write-Color "  Log file: $logFile" "Gray"
        return $null
    }
}

function Wait-ServiceReady {
    param([string]$Url, [int]$TimeoutSeconds = 60)

    Write-Color "[HEALTH] Waiting for service at $Url (timeout: ${TimeoutSeconds}s)..." "White"

    $startTime = Get-Date
    $attempts = 0

    while (((Get-Date) - $startTime).TotalSeconds -lt $TimeoutSeconds) {
        $attempts++
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Color "[HEALTH] Service ready at $Url (attempt $attempts)" "Green"
                return $true
            }
        } catch {
            # Service not ready yet
        }

        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
    }

    Write-Color ""
    Write-Color "[ERROR] Service at $Url failed to become ready within ${TimeoutSeconds}s" "Red"
    return $false
}

function Stop-AllServices {
    Write-Color ""
    Write-Color "[SHUTDOWN] Initiating graceful shutdown..." "Yellow"

    # Stop in reverse order: Electron -> Frontend -> Backend
    $shutdownOrder = @("Electron", "Frontend", "Backend")

    foreach ($serviceName in $shutdownOrder) {
        if ($Script:RunningProcesses.ContainsKey($serviceName)) {
            $serviceInfo = $Script:RunningProcesses[$serviceName]
            $process = $serviceInfo.Process

            if (-not $process.HasExited) {
                Write-Color "[SHUTDOWN] Stopping $serviceName (PID $($process.Id))..." "Yellow"
                try {
                    $process.Kill()
                    $process.WaitForExit(5000)
                } catch {
                    Write-Color "[SHUTDOWN] Force killing $serviceName" "Red"
                }
            }

            # Clean up event handlers
            Get-EventSubscriber | Where-Object { $_.SourceObject -eq $process } | Unregister-Event

            Write-Color "[SHUTDOWN] $serviceName stopped. Log: $($serviceInfo.LogFile)" "Gray"
        }
    }

    Write-Color "[SHUTDOWN] Shutdown complete" "Green"

    # Show final summary
    $duration = (Get-Date) - $Script:StartTime
    Write-Color ""
    Write-Color "Session Summary:" "White"
    Write-Color "  Duration: $($duration.ToString('hh\:mm\:ss'))" "Gray"
    Write-Color "  Log Directory: $(Get-Item 'logs' | Select-Object -ExpandProperty FullName)" "Gray"
}

function Start-ServiceOrchestration {
    Initialize-LogDirectories

    # Register cleanup handler
    Register-EngineEvent -SourceIdentifier "PowerShell.Exiting" -Action {
        Stop-AllServices
    } | Out-Null

    # Handle Ctrl+C
    [Console]::TreatControlCAsInput = $false
    $null = Register-ObjectEvent -InputObject ([Console]) -EventName "CancelKeyPress" -Action {
        Stop-AllServices
        [Environment]::Exit(0)
    }

    try {
        # Start Backend
        if ($BackendOnly -or (!$FrontendOnly -and !$ElectronOnly)) {
            if ($Config.Backend.Port -and -not (Ensure-Port-Free -Port $Config.Backend.Port)) {
                exit 10
            }

            $backendProcess = Start-ServiceWithLogging -ServiceName "Backend" -WorkingDirectory $Config.Backend.Path -Command $Config.Backend.Command -Arguments $Config.Backend.Args -LogDirectory $Script:LogDirectories["Backend"] -Color $Config.Backend.Color

            if (-not $backendProcess) {
                Write-Color "[ERROR] Failed to start Backend" "Red"
                exit 10
            }

            if (-not (Wait-ServiceReady -Url $Config.Backend.HealthUrl)) {
                Write-Color "[ERROR] Backend failed readiness check" "Red"
                exit 10
            }
        }

        # Start Frontend
        if ($FrontendOnly -or (!$BackendOnly -and !$ElectronOnly)) {
            if ($Config.Frontend.Port -and -not (Ensure-Port-Free -Port $Config.Frontend.Port)) {
                exit 11
            }

            $frontendProcess = Start-ServiceWithLogging -ServiceName "Frontend" -WorkingDirectory $Config.Frontend.Path -Command $Config.Frontend.Command -Arguments $Config.Frontend.Args -LogDirectory $Script:LogDirectories["Frontend"] -Color $Config.Frontend.Color

            if (-not $frontendProcess) {
                Write-Color "[ERROR] Failed to start Frontend" "Red"
                exit 11
            }

            if (-not (Wait-ServiceReady -Url $Config.Frontend.HealthUrl)) {
                Write-Color "[ERROR] Frontend failed readiness check" "Red"
                exit 11
            }
        }

        # Start Electron (only if not running individual services)
        if ($ElectronOnly -or (!$BackendOnly -and !$FrontendOnly)) {
            $electronProcess = Start-ServiceWithLogging -ServiceName "Electron" -WorkingDirectory $Config.Electron.Path -Command $Config.Electron.Command -Arguments $Config.Electron.Args -LogDirectory $Script:LogDirectories["Electron"] -Color $Config.Electron.Color

            if (-not $electronProcess) {
                Write-Color "[ERROR] Failed to start Electron" "Red"
                exit 12
            }
        }

        # Show running services summary
        Write-Color ""
        Write-Color "🚀 All services started successfully!" "Green"
        Write-Color ""
        Write-Color "Running Services:" "White"

        foreach ($serviceName in $Script:RunningProcesses.Keys) {
            $serviceInfo = $Script:RunningProcesses[$serviceName]
            $config = $Config[$serviceName]
            if ($config.Port) {
                Write-Color "  $serviceName`: http://localhost:$($config.Port) (PID $($serviceInfo.Process.Id))" $config.Color
            } else {
                Write-Color "  $serviceName`: Desktop App (PID $($serviceInfo.Process.Id))" $config.Color
            }
        }

        Write-Color ""
        Write-Color "Press Ctrl+C to stop all services" "Gray"
        Write-Color ""

        # Keep script running until manually stopped
        while ($true) {
            Start-Sleep -Seconds 1

            # Check if any process has died unexpectedly
            foreach ($serviceName in $Script:RunningProcesses.Keys) {
                $process = $Script:RunningProcesses[$serviceName].Process
                if ($process.HasExited) {
                    Write-Color "[ERROR] $serviceName process died unexpectedly (exit code: $($process.ExitCode))" "Red"
                    Write-Color "  Log file: $($Script:RunningProcesses[$serviceName].LogFile)" "Gray"
                    exit 1
                }
            }
        }

    } catch {
        Write-Color "[ERROR] Orchestration failed: $($_.Exception.Message)" "Red"
        exit 1
    }
}

# Main execution
try {
    Write-Banner
    Test-Prerequisites
    Start-ServiceOrchestration
} catch {
    Write-Color "[FATAL] $($_.Exception.Message)" "Red"
    exit 1
} finally {
    Stop-AllServices
}