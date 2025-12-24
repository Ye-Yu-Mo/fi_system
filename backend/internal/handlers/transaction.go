package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jasxu/fi_system/internal/database"
	"github.com/jasxu/fi_system/internal/models"
)

type TransactionHandler struct{}

func NewTransactionHandler() *TransactionHandler {
	return &TransactionHandler{}
}

type CreateTransactionRequest struct {
	AccountID       uint                    `json:"account_id" binding:"required"`
	ToAccountID     *uint                   `json:"to_account_id,omitempty"`
	Type            models.TransactionType  `json:"type" binding:"required"`
	Amount          float64                 `json:"amount" binding:"required,gt=0"`
	Category        string                  `json:"category,omitempty"`
	Merchant        string                  `json:"merchant,omitempty"`
	Description     string                  `json:"description,omitempty"`
	TransactionDate string                  `json:"transaction_date" binding:"required"` // YYYY-MM-DD
}

type UpdateTransactionRequest struct {
	AccountID       uint                    `json:"account_id"`
	ToAccountID     *uint                   `json:"to_account_id,omitempty"`
	Type            models.TransactionType  `json:"type"`
	Amount          float64                 `json:"amount" binding:"omitempty,gt=0"`
	Category        string                  `json:"category"`
	Merchant        string                  `json:"merchant"`
	Description     string                  `json:"description"`
	TransactionDate string                  `json:"transaction_date"` // YYYY-MM-DD
}

// GetTransactions 获取交易列表（支持筛选）
func (h *TransactionHandler) GetTransactions(c *gin.Context) {
	userID := c.GetUint("user_id")

	query := database.DB.Where("user_id = ?", userID)

	// 筛选：账户
	if accountID := c.Query("account_id"); accountID != "" {
		query = query.Where("account_id = ? OR to_account_id = ?", accountID, accountID)
	}

	// 筛选：类型
	if txType := c.Query("type"); txType != "" {
		query = query.Where("type = ?", txType)
	}

	// 筛选：日期范围
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("transaction_date >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("transaction_date <= ?", endDate)
	}

	var transactions []models.Transaction
	if err := query.Order("transaction_date DESC, created_at DESC").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

// GetTransaction 获取单个交易
func (h *TransactionHandler) GetTransaction(c *gin.Context) {
	userID := c.GetUint("user_id")
	transactionID := c.Param("id")

	var transaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", transactionID, userID).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}

// CreateTransaction 创建交易
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证账户是否属于当前用户
	var account models.Account
	if err := database.DB.Where("id = ? AND user_id = ?", req.AccountID, userID).First(&account).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account_id"})
		return
	}

	// 如果是转账，验证目标账户
	if req.Type == models.TransactionTransfer {
		if req.ToAccountID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "to_account_id is required for transfer"})
			return
		}
		var toAccount models.Account
		if err := database.DB.Where("id = ? AND user_id = ?", *req.ToAccountID, userID).First(&toAccount).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to_account_id"})
			return
		}
	}

	// 解析日期
	transactionDate, err := time.Parse("2006-01-02", req.TransactionDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction_date format, use YYYY-MM-DD"})
		return
	}

	transaction := models.Transaction{
		UserID:          userID,
		AccountID:       req.AccountID,
		ToAccountID:     req.ToAccountID,
		Type:            req.Type,
		Amount:          req.Amount,
		Category:        req.Category,
		Merchant:        req.Merchant,
		Description:     req.Description,
		TransactionDate: transactionDate,
	}

	if err := database.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create transaction"})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

// UpdateTransaction 更新交易
func (h *TransactionHandler) UpdateTransaction(c *gin.Context) {
	userID := c.GetUint("user_id")
	transactionID := c.Param("id")

	var transaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", transactionID, userID).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	var req UpdateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 更新字段
	if req.AccountID != 0 {
		// 验证账户
		var account models.Account
		if err := database.DB.Where("id = ? AND user_id = ?", req.AccountID, userID).First(&account).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account_id"})
			return
		}
		transaction.AccountID = req.AccountID
	}

	if req.ToAccountID != nil {
		var toAccount models.Account
		if err := database.DB.Where("id = ? AND user_id = ?", *req.ToAccountID, userID).First(&toAccount).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to_account_id"})
			return
		}
		transaction.ToAccountID = req.ToAccountID
	}

	if req.Type != "" {
		transaction.Type = req.Type

		// 【修复】校验 transfer 类型必须有 to_account_id
		if req.Type == models.TransactionTransfer {
			// 如果改成 transfer，必须提供 to_account_id
			if req.ToAccountID == nil && transaction.ToAccountID == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "to_account_id is required when type is transfer"})
				return
			}
			// 如果请求中提供了新的 to_account_id，已在上面验证过了
		} else {
			// 【修复】如果改成非 transfer 类型，清空 to_account_id
			transaction.ToAccountID = nil
		}
	}
	if req.Amount > 0 {
		transaction.Amount = req.Amount
	}
	if req.Category != "" {
		transaction.Category = req.Category
	}
	if req.Merchant != "" {
		transaction.Merchant = req.Merchant
	}
	if req.Description != "" {
		transaction.Description = req.Description
	}
	if req.TransactionDate != "" {
		transactionDate, err := time.Parse("2006-01-02", req.TransactionDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction_date format"})
			return
		}
		transaction.TransactionDate = transactionDate
	}

	if err := database.DB.Save(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update transaction"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}

// DeleteTransaction 删除交易（软删除）
func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID := c.GetUint("user_id")
	transactionID := c.Param("id")

	var transaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", transactionID, userID).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	if err := database.DB.Delete(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "transaction deleted successfully"})
}
