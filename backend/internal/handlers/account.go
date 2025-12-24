package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jasxu/fi_system/internal/database"
	"github.com/jasxu/fi_system/internal/models"
)

type AccountHandler struct{}

func NewAccountHandler() *AccountHandler {
	return &AccountHandler{}
}

type CreateAccountRequest struct {
	Name           string                 `json:"name" binding:"required"`
	Type           models.AccountType     `json:"type" binding:"required"`
	Currency       string                 `json:"currency"`
	LiquidityLevel models.LiquidityLevel  `json:"liquidity_level"`
}

type UpdateAccountRequest struct {
	Name           string                 `json:"name"`
	Type           models.AccountType     `json:"type"`
	Currency       string                 `json:"currency"`
	LiquidityLevel models.LiquidityLevel  `json:"liquidity_level"`
}

type AccountWithBalance struct {
	models.Account
	Balance float64 `json:"balance"`
}

// GetAccounts 获取账户列表
func (h *AccountHandler) GetAccounts(c *gin.Context) {
	userID := c.GetUint("user_id")

	var accounts []models.Account
	if err := database.DB.Where("user_id = ?", userID).Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch accounts"})
		return
	}

	// 计算每个账户的余额
	accountsWithBalance := make([]AccountWithBalance, len(accounts))
	for i, acc := range accounts {
		balance := calculateAccountBalance(acc.ID)
		accountsWithBalance[i] = AccountWithBalance{
			Account: acc,
			Balance: balance,
		}
	}

	c.JSON(http.StatusOK, accountsWithBalance)
}

// GetAccount 获取单个账户
func (h *AccountHandler) GetAccount(c *gin.Context) {
	userID := c.GetUint("user_id")
	accountID := c.Param("id")

	var account models.Account
	if err := database.DB.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}

	balance := calculateAccountBalance(account.ID)
	c.JSON(http.StatusOK, AccountWithBalance{
		Account: account,
		Balance: balance,
	})
}

// CreateAccount 创建账户
func (h *AccountHandler) CreateAccount(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account := models.Account{
		UserID:         userID,
		Name:           req.Name,
		Type:           req.Type,
		Currency:       req.Currency,
		LiquidityLevel: req.LiquidityLevel,
	}

	// 设置默认值
	if account.Currency == "" {
		account.Currency = "CNY"
	}
	if account.LiquidityLevel == "" {
		account.LiquidityLevel = models.LiquidityLow
	}

	if err := database.DB.Create(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create account"})
		return
	}

	c.JSON(http.StatusCreated, AccountWithBalance{
		Account: account,
		Balance: 0,
	})
}

// UpdateAccount 更新账户
func (h *AccountHandler) UpdateAccount(c *gin.Context) {
	userID := c.GetUint("user_id")
	accountID := c.Param("id")

	var account models.Account
	if err := database.DB.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}

	var req UpdateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 更新字段
	if req.Name != "" {
		account.Name = req.Name
	}
	if req.Type != "" {
		account.Type = req.Type
	}
	if req.Currency != "" {
		account.Currency = req.Currency
	}
	if req.LiquidityLevel != "" {
		account.LiquidityLevel = req.LiquidityLevel
	}

	if err := database.DB.Save(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update account"})
		return
	}

	balance := calculateAccountBalance(account.ID)
	c.JSON(http.StatusOK, AccountWithBalance{
		Account: account,
		Balance: balance,
	})
}

// DeleteAccount 删除账户（软删除）
func (h *AccountHandler) DeleteAccount(c *gin.Context) {
	userID := c.GetUint("user_id")
	accountID := c.Param("id")

	var account models.Account
	if err := database.DB.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}

	if err := database.DB.Delete(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "account deleted successfully"})
}

// calculateAccountBalance 计算账户余额
func calculateAccountBalance(accountID uint) float64 {
	var balance float64

	// 使用修正后的 SQL 查询
	query := `
		SELECT COALESCE(SUM(
			CASE
				WHEN type = 'income' AND account_id = ? THEN amount
				WHEN type = 'expense' AND account_id = ? THEN -amount
				WHEN type = 'transfer' AND account_id = ? THEN -amount
				WHEN type = 'transfer' AND to_account_id = ? THEN amount
				WHEN type = 'investment' AND account_id = ? THEN -amount
				ELSE 0
			END
		), 0) AS balance
		FROM transactions
		WHERE (account_id = ? OR to_account_id = ?)
		  AND deleted_at IS NULL
	`

	database.DB.Raw(query, accountID, accountID, accountID, accountID, accountID, accountID, accountID).Scan(&balance)
	return balance
}
