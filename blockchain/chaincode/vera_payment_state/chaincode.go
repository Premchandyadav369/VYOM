// Package main implements vera-payment-state chaincode for NPCI Drunix
package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// VeraPaymentContract provides payment governance functions
type VeraPaymentContract struct {
	contractapi.Contract
}

// PaymentRecord describes the on-chain state
type PaymentRecord struct {
	PaymentID      string   `json:"paymentId"`
	SenderRef      string   `json:"senderRef"`
	RecipientRef   string   `json:"recipientRef"`
	Amount         float64  `json:"amount"`
	Currency       string   `json:"currency"`
	IntentHash     string   `json:"intentHash"`
	RiskClass      string   `json:"riskClass"`
	Decision       string   `json:"decision"`
	PolicyVersion  string   `json:"policyVersion"`
	State          string   `json:"state"`
	ReasonCodes    []string `json:"reasonCodes"`
	VeraSignature  string   `json:"veraSignature"`
	CreatedAt      string   `json:"createdAt"`
	UpdatedAt      string   `json:"updatedAt"`
}

// CreatePayment initializes payment on ledger
func (c *VeraPaymentContract) CreatePayment(ctx contractapi.TransactionContextInterface, paymentID string, senderRef string, recipientRef string, amount float64, currency string, intentHash string, policyVersion string) error {
	exists, err := ctx.GetStub().GetState(paymentID)
	if err != nil {
		return fmt.Errorf("failed to read state: %v", err)
	}
	if exists != nil {
		return fmt.Errorf("payment %s already exists", paymentID)
	}

	record := PaymentRecord{
		PaymentID:     paymentID,
		SenderRef:     senderRef,
		RecipientRef:  recipientRef,
		Amount:        amount,
		Currency:      currency,
		IntentHash:    intentHash,
		PolicyVersion: policyVersion,
		State:         "PAYMENT_CREATED",
		CreatedAt:     time.Now().UTC().Format(time.RFC3339),
		UpdatedAt:     time.Now().UTC().Format(time.RFC3339),
	}

	bytes, _ := json.Marshal(record)
	return ctx.GetStub().PutState(paymentID, bytes)
}

// SubmitRiskDecision applies VERA policy decision
func (c *VeraPaymentContract) SubmitRiskDecision(ctx contractapi.TransactionContextInterface, paymentID string, decision string, riskClass string, veraSignature string, reasonsJSON string) error {
	bytes, err := ctx.GetStub().GetState(paymentID)
	if err != nil || bytes == nil {
		return fmt.Errorf("payment %s not found", paymentID)
	}

	var record PaymentRecord
	_ = json.Unmarshal(bytes, &record)

	// Validate state transition
	if record.State != "PAYMENT_CREATED" && record.State != "EVALUATING" {
		return fmt.Errorf("invalid transition from %s", record.State)
	}

	var reasons []string
	_ = json.Unmarshal([]byte(reasonsJSON), &reasons)

	record.Decision = decision
	record.RiskClass = riskClass
	record.VeraSignature = veraSignature
	record.ReasonCodes = reasons
	record.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	if decision == "ALLOW" {
		record.State = "ALLOWED"
	} else if decision == "VERIFY" {
		record.State = "VERIFY_REQUIRED"
	} else {
		record.State = "HOLD"
	}

	updated, _ := json.Marshal(record)
	return ctx.GetStub().PutState(paymentID, updated)
}

// CommitPayment transitions to COMMITTED state
func (c *VeraPaymentContract) CommitPayment(ctx contractapi.TransactionContextInterface, paymentID string) error {
	bytes, err := ctx.GetStub().GetState(paymentID)
	if err != nil || bytes == nil {
		return fmt.Errorf("payment %s not found", paymentID)
	}

	var record PaymentRecord
	_ = json.Unmarshal(bytes, &record)

	if record.State != "ALLOWED" && record.State != "VERIFIED" {
		return fmt.Errorf("cannot commit unverified/held payment in state %s", record.State)
	}

	record.State = "COMMITTED"
	record.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	updated, _ := json.Marshal(record)
	return ctx.GetStub().PutState(paymentID, updated)
}

func main() {
	chaincode, err := contractapi.NewChaincode(&VeraPaymentContract{})
	if err != nil {
		fmt.Printf("Error creating vera-payment-state chaincode: %s", err.Error())
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %s", err.Error())
	}
}
