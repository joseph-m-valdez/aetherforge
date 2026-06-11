package mav

const (
	DefaultSystemID byte = 255
)

type Config struct {
	ListenAddr  string
	OutSystemID byte
}

func NewConfig() Config {
	return Config{
		ListenAddr: "0.0.0.0:14550", // Standard GCS listning port
		OutSystemID: DefaultSystemID, // Default to GCS ID
	}
}

