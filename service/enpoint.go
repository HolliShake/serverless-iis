package main

import (
	"encoding/json"
	"io"

	"github.com/gin-gonic/gin"
)

func GetMachineInfoEndpoint(c *gin.Context) {
	c.JSON(200, GetMachineStateAction())
}

func GetMachineProcessEndpoint(c *gin.Context) {
	c.JSON(200, GetProcessAction())
}


func GetRootEndpoint(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "IIS Server API",
	})
}

func GetWebsitesEndpoint(c *gin.Context) {
	output := IISWebsitesAction()
	websites := getSites(output)
	c.JSON(200, websites)
}

func PostCreateWebsiteEndpoint(c *gin.Context) {
	body := c.Request.Body
	defer body.Close()
	bodyBytes, err := io.ReadAll(body)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	website := WebsiteRequest{}
	err = json.Unmarshal(bodyBytes, &website)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if WebsiteExistsByName(website.Name) {
		c.JSON(400, gin.H{"error": "Website already exists"})
		return
	}
	err = CreateWebsiteAction(website.Name, website.Protocol, website.HostOrDomain, website.Port)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Website created"})
}

func PutUpdateWebsiteEndpoint(c *gin.Context) {
	original := c.Param("original")
	body := c.Request.Body
	defer body.Close()
	bodyBytes, err := io.ReadAll(body)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	website := WebsiteRequest{}
	err = json.Unmarshal(bodyBytes, &website)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if !WebsiteExistsByName(original) {
		c.JSON(404, gin.H{"error": "Website not found"})
		return
	}
	err = UpdateWebsiteAction(original, website.Name, website.Protocol, website.HostOrDomain, website.Port)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Website updated"})
}

func PatchStatusEndpoint(c *gin.Context) {
	site := c.Param("site")
	action := c.Param("action")

	if action != string(ActionStart) && action != string(ActionStop) && action != string(ActionRestart) {
		c.JSON(400, gin.H{"error": "Invalid action, valid actions are: Start, Stop, Restart"})
		return
	}

	if !WebsiteExistsByName(site) {
		c.JSON(404, gin.H{"error": "Website not found"})
		return
	}

	err := ControlWebsiteAction(WebsiteAction(action), site)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
	}
	c.JSON(200, gin.H{"message": "Website status updated"})
}

func DeleteWebsiteEndpoint(c *gin.Context) {
	name := c.Param("name")
	if !WebsiteExistsByName(name) {
		c.JSON(404, gin.H{"error": "Website not found"})
		return
	}
	err := DeleteWebsiteAction(name)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
	}
	c.JSON(200, gin.H{"message": "Website deleted"})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
	}
	c.JSON(200, gin.H{"message": "Website deleted"})
}

func GetLogsEndpoint(c *gin.Context) {
	site := c.Param("site")
	if !WebsiteExistsByName(site) {
		c.JSON(404, gin.H{"error": "Website not found"})
		return
	}
	logs, err := GetLogsAction(site)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"logs": logs})
}
