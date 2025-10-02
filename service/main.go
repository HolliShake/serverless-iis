package main

import (
	"log"
	"syscall"
	"unsafe"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var (
	modAdvapi32              = syscall.NewLazyDLL("advapi32.dll")
	procCheckTokenMembership = modAdvapi32.NewProc("CheckTokenMembership")
)

func IsAdmin() (bool, error) {
	var sid *syscall.SID
	// BUILTIN\Administrators group
	sid, err := syscall.StringToSid("S-1-5-32-544")
	if err != nil {
		return false, err
	}

	var isAdmin uint32
	ret, _, err := procCheckTokenMembership.Call(
		0,
		uintptr(unsafe.Pointer(sid)),
		uintptr(unsafe.Pointer(&isAdmin)),
	)
	if ret == 0 {
		return false, err
	}
	return isAdmin != 0, nil
}

func main() {
	isAdmin, err := IsAdmin()
	if err != nil {
		log.Fatal(err)
	}
	if !isAdmin {
		log.Fatal("You must be an administrator to run this program")
	}
	r := gin.Default()
	r.Use(cors.Default())
	// Machine state
	r.GET("/api/machine/info", GetMachineInfoEndpoint)
	r.GET("/api/machine/process", GetMachineProcessEndpoint)
	// Server management
	r.GET("/api/", GetRootEndpoint)
	r.GET("/api/website", GetWebsitesEndpoint)
	r.POST("/api/website", PostCreateWebsiteEndpoint)
	r.PUT("/api/website/:original", PutUpdateWebsiteEndpoint)
	r.PATCH("/api/website/:site/:action", PatchStatusEndpoint)
	r.DELETE("/api/website/:name", DeleteWebsiteEndpoint)
	// Logs
	r.GET("/api/log/:site", GetLogsEndpoint)
	// Others
	r.Run(":8080")
}
