package version

import (
	"fmt"
	"runtime"
)

// Version/build values set at build time
var (
	Commit  = ""
	Version = ""
)

type versionInfo struct {
	NameService string `json:"nameservice"`
	GitCommit   string `json:"commit"`
	GoVersion   string `json:"go"`
}

func newVersionInfo() versionInfo {
	return versionInfo{
		Version,
		Commit,
		fmt.Sprintf("go version %s %s/%s\n", runtime.Version(), runtime.GOOS, runtime.GOARCH),
	}
}

func (v versionInfo) String() string {
	return fmt.Sprintf(`nameservice: %s
git commit: %s
%s`, 
v.NameService, v.GitCommit,  v.GoVersion,
)
}
