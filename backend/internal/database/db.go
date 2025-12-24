package database

import (
	"fmt"
	"log"

	"github.com/jasxu/fi_system/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Initialize 初始化数据库连接
func Initialize(dbPath string) error {
	var err error

	// 打开数据库连接
	DB, err = gorm.Open(sqlite.Open(dbPath+"?_foreign_keys=on"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		DisableForeignKeyConstraintWhenMigrating: false,
	})
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	// 配置连接池
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxOpenConns(5)
	sqlDB.SetMaxIdleConns(2)

	// 自动迁移
	err = DB.AutoMigrate(
		&models.User{},
		&models.Account{},
		&models.Transaction{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database initialized successfully")
	return nil
}

// Close 关闭数据库连接
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
