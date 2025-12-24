package models

import (
	"time"
	"gorm.io/gorm"
)

type TransactionType string

const (
	TransactionIncome     TransactionType = "income"
	TransactionExpense    TransactionType = "expense"
	TransactionTransfer   TransactionType = "transfer"
	TransactionInvestment TransactionType = "investment"
)

type Transaction struct {
	ID              uint            `gorm:"primarykey" json:"id"`
	UserID          uint            `gorm:"not null;index" json:"user_id"`
	AccountID       uint            `gorm:"not null;index" json:"account_id"`
	ToAccountID     *uint           `gorm:"index" json:"to_account_id,omitempty"` // 仅 transfer 类型使用
	Type            TransactionType `gorm:"not null;size:50" json:"type"`
	Amount          float64         `gorm:"not null;type:decimal(20,2)" json:"amount"`
	Category        string          `gorm:"size:100" json:"category,omitempty"`
	Merchant        string          `gorm:"size:200" json:"merchant,omitempty"`
	Description     string          `gorm:"size:500" json:"description,omitempty"`
	TransactionDate time.Time       `gorm:"not null;index" json:"transaction_date"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `gorm:"index" json:"-"`

	// 关联
	User      User     `gorm:"foreignKey:UserID" json:"-"`
	Account   Account  `gorm:"foreignKey:AccountID" json:"-"`
	ToAccount *Account `gorm:"foreignKey:ToAccountID" json:"-"`
}
