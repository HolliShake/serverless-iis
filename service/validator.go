package main

func WebsiteExistsByName(name string) bool {
	output := IISWebsitesAction()
	websites := getSites(output)
	for _, website := range websites {
		if website.Name == name {
			return true
		}
	}
	return false
}

func WebsiteExistsById(id int) bool {
	output := IISWebsitesAction()
	websites := getSites(output)
	for _, website := range websites {
		if website.ID == id {
			return true
		}
	}
	return false
}
