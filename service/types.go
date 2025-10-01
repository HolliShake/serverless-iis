package main

import (
	"fmt"
)

type WebsiteAction string

type Website struct {
	Name         string  `json:"name"`
	ID           int     `json:"id"`
	State        string  `json:"state"`
	PhysicalPath string  `json:"physicalPath"`
	Binding      Binding `json:"bindings"`
}

type Binding struct {
	Protocol string `json:"protocol"`
	Port     int    `json:"port"`
	Host     string `json:"host"`
	SSL      bool   `json:"ssl"`
}

type WebsiteRequest struct {
	Name         string `json:"name"`
	Protocol     string `json:"protocol"`
	HostOrDomain string `json:"hostOrDomain"`
	Port         int    `json:"port"`
}

type MachineState struct {
	OS              string  `json:"os"`
	Platform        string  `json:"platform"`
	PlatformFamily  string  `json:"platformFamily"`
	PlatformVersion string  `json:"platformVersion"`
	KernelVersion   string  `json:"kernelVersion"`
	KernelArch      string  `json:"kernelArch"`
	Hostname        string  `json:"hostname"`
	CPUs            int     `json:"cpus"`
	Uptime          string  `json:"uptime"`
	TotalMemory     uint64  `json:"totalMemory"`
	AvailableMemory uint64  `json:"availableMemory"`
	UsedMemory      uint64  `json:"usedMemory"`
	MemoryUsage     float64 `json:"memoryUsage"`
}


func (w Website) String() string {
	return fmt.Sprintf(`{
  "name": "%s",
  "id": %d,
  "state": "%s",
  "physicalPath": "%s",
  "bindings": %s
}`, w.Name, w.ID, w.State, w.PhysicalPath, w.Binding)
}

func (b Binding) String() string {
	return fmt.Sprintf(`{
  "protocol": "%s",
  "port": %d,
  "host": "%s",
  "ssl": %t
}`, b.Protocol, b.Port, b.Host, b.SSL)
}
