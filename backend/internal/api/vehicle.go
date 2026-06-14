package api

type Position struct {
	Lat  float64 `json:"lat"`
	Lon  float64 `json:"lon"`
	AltMSL float64 `json:"altMSL"`
}

type Vehicle struct {
	ID         uint8     `json:"id"`
	Armed      bool    `json:"armed"`
	FlightMode string    `json:"flightMode"`
	Position    Position  `json:"position"`
	Connected  bool    `json:"connected"`
}
