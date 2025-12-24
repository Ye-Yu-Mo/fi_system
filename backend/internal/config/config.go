package config

import (
	"os"
)

type Config struct {
	DBPath     string
	JWTSecret  string
	ServerPort string
}

func Load() *Config {
	cfg := &Config{
		DBPath:     getEnv("DB_PATH", "../data/finance.db"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		ServerPort: getEnv("SERVER_PORT", ":8080"),
	}
	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
