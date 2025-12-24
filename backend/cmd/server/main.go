package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/jasxu/fi_system/internal/config"
	"github.com/jasxu/fi_system/internal/database"
	"github.com/jasxu/fi_system/internal/handlers"
	"github.com/jasxu/fi_system/internal/middleware"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	if err := database.Initialize(cfg.DBPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// 创建 Gin 路由
	router := gin.Default()

	// 启用 CORS（开发环境）
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 路由组
	v1 := router.Group("/api/v1")

	// 认证路由（无需 JWT）
	authHandler := handlers.NewAuthHandler(cfg)
	v1.POST("/register", authHandler.Register)
	v1.POST("/login", authHandler.Login)

	// 需要认证的路由
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// 账户路由
		accountHandler := handlers.NewAccountHandler()
		protected.GET("/accounts", accountHandler.GetAccounts)
		protected.GET("/accounts/:id", accountHandler.GetAccount)
		protected.POST("/accounts", accountHandler.CreateAccount)
		protected.PUT("/accounts/:id", accountHandler.UpdateAccount)
		protected.DELETE("/accounts/:id", accountHandler.DeleteAccount)

		// 交易路由
		transactionHandler := handlers.NewTransactionHandler()
		protected.GET("/transactions", transactionHandler.GetTransactions)
		protected.GET("/transactions/:id", transactionHandler.GetTransaction)
		protected.POST("/transactions", transactionHandler.CreateTransaction)
		protected.PUT("/transactions/:id", transactionHandler.UpdateTransaction)
		protected.DELETE("/transactions/:id", transactionHandler.DeleteTransaction)
	}

	// 启动服务器
	log.Printf("Server starting on %s", cfg.ServerPort)
	log.Printf("Database: %s", cfg.DBPath)

	// 优雅关闭
	go func() {
		if err := router.Run(cfg.ServerPort); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// 等待中断信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
}
