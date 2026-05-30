package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type OverallHealth struct {
	health    string
	services  map[string]any
	uptime    string
	lastCheck string
}

type ServiceHealth struct {
	backend             string
	lxd_agent           string
	mysql               string
	redis               string
	event_worker        string
	provisioning_worker string
	lifecycle_worker    string
	sync_worker         string
}

type metrics struct {
	system_overall_health       prometheus.Gauge
	service_backend             prometheus.Gauge
	service_lxd_agent           prometheus.Gauge
	service_mysql               prometheus.Gauge
	service_redis               prometheus.Gauge
	service_event_worker        prometheus.Gauge
	service_provisioning_worker prometheus.Gauge
	service_lifecycle_worker    prometheus.Gauge
	service_sync_worker         prometheus.Gauge
	server_uptime               prometheus.Gauge
	server_lastCheck            prometheus.Gauge
}

func main() {
	reg := prometheus.NewRegistry()
	reg.MustRegister(
		collectors.NewGoCollector(),
		collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}),
	)

	m := newMetrics(reg)

	go func() {
		for true {
			getServiceHealth("http://localhost:3000/api/v1/health/detail", m)
			time.Sleep(15 * time.Second)
		}
	}()

	http.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))

	http.ListenAndServe(":8090", nil)

}

func newMetrics(reg prometheus.Registerer) *metrics {
	m := &metrics{
		system_overall_health: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "system_overall_health",
				Help: "overall system health",
			}),
		server_uptime: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "server_uptime",
				Help: "server uptime",
			}),
		server_lastCheck: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "server_lastCheck",
				Help: "last checked for status",
			}),
		service_backend: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_backend",
				Help: "backend health",
			}),
		service_lxd_agent: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_lxd_agent",
				Help: "lxd_agent health",
			}),
		service_mysql: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_mysql",
				Help: "mysql health",
			}),
		service_redis: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_redis",
				Help: "redis health",
			}),
		service_event_worker: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_event_worker",
				Help: "event-worker health",
			}),
		service_provisioning_worker: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_provisioning_worker",
				Help: "provision-worker health",
			}),
		service_lifecycle_worker: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_lifecycle_worker",
				Help: "lifecycle-worker health",
			}),
		service_sync_worker: promauto.With(reg).NewGauge(
			prometheus.GaugeOpts{
				Name: "service_sync_worker",
				Help: "sync-worker health",
			}),
	}

	return m
}

func getServiceHealth(url string, m *metrics) {
	resp, err := http.Get(url)

	if err != nil {
		// set endpoint status to 0

		m.system_overall_health.Set(0)
		m.server_uptime.Set(-1)
		m.server_lastCheck.Set(float64(-1))
		m.service_backend.Set(0)
		m.service_event_worker.Set(0)
		m.service_lifecycle_worker.Set(0)
		m.service_lxd_agent.Set(0)
		m.service_mysql.Set(0)
		m.service_provisioning_worker.Set(0)
		m.service_redis.Set(0)
		m.service_sync_worker.Set(0)
		return
	}

	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)

	if err != nil {
		// set endpoint status to 0

		m.system_overall_health.Set(0)
		m.server_uptime.Set(-1)
		m.server_lastCheck.Set(float64(-1))
		m.service_backend.Set(0)
		m.service_event_worker.Set(0)
		m.service_lifecycle_worker.Set(0)
		m.service_lxd_agent.Set(0)
		m.service_mysql.Set(0)
		m.service_provisioning_worker.Set(0)
		m.service_redis.Set(0)
		m.service_sync_worker.Set(0)
		return
	}

	var jsonData map[string]any
	// parse to json
	if err := json.Unmarshal(data, &jsonData); err != nil {
		// set endpoin status to 0
		return
	}

	// set metrics
	system_overall_health := jsonData["health"]

	// overall status
	switch system_overall_health {
	case "Stable":
		m.system_overall_health.Set(1) // up and working fine
	case "Critical":
		m.system_overall_health.Set(2) // critical, some services might be down
	default:
		m.system_overall_health.Set(-1) // unknown status
	}

	// uptime
	uptime, ok := jsonData["uptime"].(float64)
	if ok {
		m.server_uptime.Set(uptime)
	} else {
		m.server_uptime.Set(-1)
	}

	// // last check
	lastCheck, ok := jsonData["lastCheck"].(float64)
	if ok {
		m.server_lastCheck.Set(lastCheck)
	} else {
		m.server_lastCheck.Set(float64(-1))
	}

	// services

	services := jsonData["services"].(map[string]any)

	service_backend := services["backend"]
	service_lxd_agent := services["lxd_agent"]
	service_mysql := services["mysql"]
	service_redis := services["redis"]
	service_event_worker := services["event_worker"]
	service_provisioning_worker := services["provisioning_worker"]
	service_lifecycle_worker := services["lifecycle_worker"]
	service_sync_worker := services["sync_worker"]

	// backend
	switch service_backend {
	case "OK":
		m.service_backend.Set(1)
	case "DOWN":
		m.service_backend.Set(0)
	}

	// lxd
	switch service_lxd_agent {
	case "OK":
		m.service_lxd_agent.Set(1)
	case "DOWN":
		m.service_lxd_agent.Set(0)
	}

	// mysql
	switch service_mysql {
	case "OK":
		m.service_mysql.Set(1)
	case "DOWN":
		m.service_mysql.Set(0)
	}

	// redis
	switch service_redis {
	case "OK":
		m.service_redis.Set(1)
	case "DOWN":
		m.service_redis.Set(0)
	}

	// event worker
	switch service_event_worker {
	case "OK":
		m.service_event_worker.Set(1)
	case "DOWN":
		m.service_event_worker.Set(0)
	}

	// provision worker
	switch service_provisioning_worker {
	case "OK":
		m.service_provisioning_worker.Set(1)
	case "DOWN":
		m.service_provisioning_worker.Set(0)
	}

	// lifecycle worker
	switch service_lifecycle_worker {
	case "OK":
		m.service_lifecycle_worker.Set(1)
	case "DOWN":
		m.service_lifecycle_worker.Set(0)
	}

	// sync worker
	switch service_sync_worker {
	case "OK":
		m.service_sync_worker.Set(1)
	case "DOWN":
		m.service_sync_worker.Set(0)
	}

}
