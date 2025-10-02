package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"path"
	"runtime"
	"strings"
	"time"

	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/process"
	"github.com/shirou/gopsutil/v4/mem"
)

const (
	ActionStart   WebsiteAction = "Start"
	ActionStop    WebsiteAction = "Stop"
	ActionRestart WebsiteAction = "Restart"
)

func GetMachineStateAction() MachineState {
	// Get host info using psutil
	hostInfo, _ := host.Info()

	// CPU count
	cpuCount := runtime.NumCPU()

	// Uptime
	uptime := time.Duration(hostInfo.Uptime) * time.Second

	// Memory information
	memInfo, _ := mem.VirtualMemory()

	return MachineState{
		OS:              hostInfo.OS,
		Platform:        hostInfo.Platform,
		PlatformFamily:  hostInfo.PlatformFamily,
		PlatformVersion: hostInfo.PlatformVersion,
		KernelVersion:   hostInfo.KernelVersion,
		KernelArch:      hostInfo.KernelArch,
		Hostname:        hostInfo.Hostname,
		CPUs:            cpuCount,
		Uptime:          uptime.String(),
		TotalMemory:     memInfo.Total,
		AvailableMemory: memInfo.Available,
		UsedMemory:      memInfo.Used,
		MemoryUsage:     memInfo.UsedPercent,
	}
}

func GetProcessAction() []string {
	procs, err := process.Processes()
	if err != nil {
		log.Fatal(err)
	}

	proccess := []string{}

	for _, p := range procs {
		name, _ := p.Name()
		cpuPercent, _ := p.CPUPercent()
		memInfo, _ := p.MemoryInfo()

		// Check if memInfo is nil to avoid panic
		var rssKB uint64
		if memInfo != nil {
			rssKB = memInfo.RSS / 1024
		}

		proccess = append(proccess, fmt.Sprintf("PID: %d | Name: %s | CPU: %.2f%% | RSS: %d KB\n",
			p.Pid,
			name,
			cpuPercent,
			rssKB,
		))
	}
	return proccess
}

func IISWebsitesAction() string {
	powershell := exec.Command("powershell", "-Command", "Import-Module WebAdministration; Get-Website")
	output, err := powershell.Output()
	if err != nil {
		return ""
	}
	return string(output)
}

func GetByNameAction(name string) (Website, error) {
	output := IISWebsitesAction()
	websites := getSites(output)
	for _, website := range websites {
		if website.Name == name {
			return website, nil
		}
	}
	return Website{}, fmt.Errorf("website not found")
}

func ControlWebsiteAction(action WebsiteAction, site string) error {
	var ps string
	switch action {
	case "Start":
		ps = fmt.Sprintf(`Import-Module WebAdministration; Start-Website -Name "%s"`, site)
	case "Stop":
		ps = fmt.Sprintf(`Import-Module WebAdministration; Stop-Website -Name "%s"`, site)
	case "Restart":
		ps = fmt.Sprintf(`Import-Module WebAdministration; Stop-Website -Name "%s"; Start-Website -Name "%s"`, site, site)
	default:
		return fmt.Errorf("unsupported action: %s", action)
	}
	
	cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to %s site %s: %v\nOutput: %s", action, site, err, string(out))
	}
	return nil
}

func CreateWebsiteAction(name string, protocol string, hostOrDomain string, port int) error {
	// Remove spaces from website name to ensure compatibility
	name = strings.ReplaceAll(name, " ", "")
	
	// Check if a binding with the same protocol, host, and port already exists
	checkBindingPS := fmt.Sprintf(`Import-Module WebAdministration; Get-WebBinding | Where-Object { $_.protocol -eq "%s" -and $_.bindingInformation -like "*:%d:%s" }`, protocol, port, hostOrDomain)
	checkCmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", checkBindingPS)
	checkOut, err := checkCmd.CombinedOutput()
	if err == nil && len(strings.TrimSpace(string(checkOut))) > 0 {
		return fmt.Errorf("binding already exists for %s://%s:%d", protocol, hostOrDomain, port)
	}
	
	path := path.Join("C:", "inetpub", "wwwroot", name)

	ps := fmt.Sprintf(`Import-Module WebAdministration; if (-Not (Test-Path "%s")) { New-Item -Path "%s" -ItemType Directory | Out-Null }; New-Website -Name "%s" -Port %d -PhysicalPath "%s" -ApplicationPool "DefaultAppPool"`, path, path, name, port, path)
	cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to create website %s: %v\nOutput: %s", name, err, string(out))
	}
	return nil
}

func UpdateWebsiteAction(original string, name string, protocol string, hostOrDomain string, port int) error {
	// Remove spaces from website name to ensure compatibility
	name = strings.ReplaceAll(name, " ", "")
	
	// Get current website to find existing binding and physical path
	website, err := GetByNameAction(original)
	if err != nil {
		return fmt.Errorf("failed to get website %s: %v", original, err)
	}

	currentProtocol := website.Binding.Protocol
	currentPort := website.Binding.Port
	currentHost := website.Binding.Host
	physicalPath := website.PhysicalPath

	// If name changed OR protocol/port mismatch, delete and recreate
	if original != name || currentProtocol != protocol || currentPort != port {
		// Delete the original website (but preserve physical path)
		ps := fmt.Sprintf(`Import-Module WebAdministration; Remove-Website -Name "%s"`, original)
		cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
		out, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("failed to delete original website %s: %v\nOutput: %s", original, err, string(out))
		}
		
		// Create the new website with the new name, protocol, and port, retaining physical path
		ps = fmt.Sprintf(`Import-Module WebAdministration; New-Website -Name "%s" -Port %d -PhysicalPath "%s" -ApplicationPool "DefaultAppPool"`, name, port, physicalPath)
		cmd = exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
		out, err = cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("failed to create new website %s: %v\nOutput: %s", name, err, string(out))
		}
		return nil
	}
	
	// Only host changed - update binding
	if currentHost != hostOrDomain {
		// Remove existing binding and add new one
		ps := fmt.Sprintf(`Import-Module WebAdministration; 
			try { Remove-WebBinding -Name "%s" -Protocol "%s" -Port %d -HostHeader "%s" -ErrorAction SilentlyContinue } catch {}; 
			New-WebBinding -Name "%s" -Protocol "%s" -Port %d -IPAddress * -HostHeader "%s"`,
			original, currentProtocol, currentPort, currentHost, name, protocol, port, hostOrDomain)
		cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
		out, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("failed to update website %s: %v\nOutput: %s", name, err, string(out))
		}
	}
	
	return nil
}

func DeleteWebsiteAction(name string) error {
	// Delete the website and its physical path
	ps := fmt.Sprintf(`Import-Module WebAdministration; 
		$site = Get-Website -Name "%s";
		$path = $site.physicalPath;
		Remove-Website -Name "%s";
		if (Test-Path $path) { Remove-Item -Path $path -Recurse -Force }`, name, name)
	cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to delete website %s: %v\nOutput: %s", name, err, string(out))
	}
	return nil
}

func GetLogsAction(site string) (string, error) {
	// Get IIS logs from the default log directory
	website, err := GetByNameAction(site)
	if err != nil {
		return "", fmt.Errorf("failed to get website %s: %v", site, err)
	}

	// PowerShell command to get recent log entries for the specific site
	ps := fmt.Sprintf(`$logPath = "C:\inetpub\logs\LogFiles\W3SVC%d"; Get-Content (Get-ChildItem $logPath -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName -Tail 50`, website.ID)
	cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to get logs for website %s: %v\nOutput: %s", site, err, string(out))
	}

	return string(out), nil
}

func GetDirectoryContentAction(name string) []DirFile {
	website, err := GetByNameAction(name)
	if err != nil {
		return []DirFile{}
	}

	// PowerShell command to get directory contents
	ps := fmt.Sprintf(`Get-ChildItem -Path "%s" | ForEach-Object {
		$item = $_
		$modTime = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
		$permission = (Get-Acl $item.FullName).Access | Select-Object -First 1 | ForEach-Object { $_.FileSystemRights.ToString() }
		[PSCustomObject]@{
			Name = $item.Name
			Size = if ($item.PSIsContainer) { 0 } else { $item.Length }
			IsDir = $item.PSIsContainer
			ModTime = $modTime
			Permission = if ($permission) { $permission } else { "Unknown" }
		}
	} | ConvertTo-Json -Depth 2`, website.PhysicalPath)

	cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return []DirFile{}
	}

	var files []DirFile
	if err := json.Unmarshal(out, &files); err != nil {
		// Try parsing as single object in case there's only one item
		var singleFile DirFile
		if err := json.Unmarshal(out, &singleFile); err == nil {
			return []DirFile{singleFile}
		}
		return []DirFile{}
	}

	return files
}

func GetDirectoryTreeAction(name string, dirTree string) []DirFile {
	website, err := GetByNameAction(name)
	if err != nil {
		return []DirFile{}
	}

	// PowerShell command to get directory contents
	ps := fmt.Sprintf(`Get-ChildItem -Path "%s" | ForEach-Object {
		$item = $_
		$modTime = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
		$permission = (Get-Acl $item.FullName).Access | Select-Object -First 1 | ForEach-Object { $_.FileSystemRights.ToString() }
		[PSCustomObject]@{
			Name = $item.Name
			Size = if ($item.PSIsContainer) { 0 } else { $item.Length }
			IsDir = $item.PSIsContainer
			ModTime = $modTime
			Permission = if ($permission) { $permission } else { "Unknown" }
		}
	} | ConvertTo-Json -Depth 2`, path.Join(website.PhysicalPath, dirTree))

	cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", ps)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return []DirFile{}
	}

	var files []DirFile
	if err := json.Unmarshal(out, &files); err != nil {
		// Try parsing as single object in case there's only one item
		var singleFile DirFile
		if err := json.Unmarshal(out, &singleFile); err == nil {
			return []DirFile{singleFile}
		}
		return []DirFile{}
	}

	return files
}