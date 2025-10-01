package main

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

func getLines(data string) []string {
	lines := strings.Split(data, "\n")
	// Trim empty
	newLines := []string{}
	for _, line := range lines {
		if strings.TrimSpace(line) != "" {
			newLines = append(newLines, line)
		}
	}
	return newLines
}

func getColumn(line string) []int {
	parts := []int{}
	inDashSequence := false
	for i := 0; i < len(line); i++ {
		if line[i] == '-' && !inDashSequence {
			inDashSequence = true
			parts = append(parts, i)
		} else if line[i] != '-' {
			inDashSequence = false
		}
	}
	return parts
}

func extractColumn(line string, colIndexes []int) []string {
	parts := []string{}
	for i, colIndex := range colIndexes {
		var part string
		if i < len(colIndexes)-1 {
			// Extract substring from current column to next column
			part = strings.TrimSpace(line[colIndex:colIndexes[i+1]])
		} else {
			// Extract substring from current column to end of line
			part = strings.TrimSpace(line[colIndex:])
		}
		parts = append(parts, part)
	}
	return parts
}

func getSites(rawData string) []Website {
	websites := []Website{}
	lines := getLines(rawData)
	// Trim empty

	colIndex := 0
	sepIndex := 1

	colIndexes := getColumn(lines[sepIndex])

	for i, line := range lines {
		if strings.TrimSpace(line) == "" || i == colIndex || i == sepIndex {
			continue
		}
		parts := extractColumn(line, colIndexes)

		name := parts[0]
		id, _ := strconv.Atoi(parts[1])
		state := parts[2]
		physicalPath := parts[3]
		bindings, err := parseBinding(parts[4])
		if err != nil {
			fmt.Println(err)
			continue
		}

		websites = append(websites, Website{
			Name:         name,
			ID:           id,
			State:        state,
			PhysicalPath: physicalPath,
			Binding:      bindings,
		})
	}
	return websites
}

func parseBinding(line string) (Binding, error) {
	// host is now allowed to be empty
	re := regexp.MustCompile(`^(https?|tcp|udp)\s+\*:(\d+)(?::([\w\.-]*))?(?:\s+sslFlags=(\d+))?$`)
	m := re.FindStringSubmatch(line)

	if len(m) == 0 {
		return Binding{}, fmt.Errorf("invalid binding: %s", line)
	}

	port, _ := strconv.Atoi(m[2])
	ssl := m[4] == "1"

	host := m[3]
	if host == "" {
		host = "localhost"
	}

	return Binding{
		Protocol: m[1],
		Port:     port,
		Host:     host, // will be "localhost" if none
		SSL:      ssl,
	}, nil
}
