package models

import (
	"time"
	"gorm.io/gorm"
)

type AccountType string

const (
	AccountTypeBank   AccountType = "bank"
	AccountTypeAlipay AccountType = "alipay"
	AccountTypeWechat AccountType = "wechat"
	AccountTypeCash   AccountType = "cash"
	AccountTypeStock  AccountType = "stock"
	AccountTypeFund   AccountType = "fund"
	AccountTypeCrypto AccountType = "crypto"
)

type LiquidityLevel string

const (
	LiquidityHigh   LiquidityLevel = "high"   // 活钱桶
	LiquidityMedium LiquidityLevel = "medium" // 缓冲桶
	LiquidityLow    LiquidityLevel = "low"    // 长期资产
)

type Account struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	UserID         uint           `gorm:"not null;index" json:"user_id"`
	Name           string         `gorm:"not null;size:200" json:"name"`
	Type           AccountType    `gorm:"not null;size:50" json:"type"`
	Currency       string         `gorm:"not null;size:10;default:CNY" json:"currency"`
	LiquidityLevel LiquidityLevel `gorm:"size:10;default:low" json:"liquidity_level"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User User `gorm:"foreignKey:UserID" json:"-"`
}
