"""
VERA x DRUNIX Storage & Ledger State Database
Supports SQLite (local dev & tests) and PostgreSQL (production).
Provides connection management and ORM models for payments, Drunix ledger state,
tokenized assets, and audit logs.
"""

import os
import json
from datetime import datetime
from typing import Generator
from sqlalchemy import (
    create_engine, Column, String, Float, Integer, DateTime, Text, Boolean, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vera_storage.db")

# For SQLite, enable check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DBPayment(Base):
    __tablename__ = "payments"

    payment_id = Column(String(64), primary_key=True, index=True)
    sender_id = Column(String(64), index=True)
    recipient_id = Column(String(64), index=True)
    merchant_id = Column(String(64), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    stated_intent = Column(Text, nullable=True)
    intent_hash = Column(String(64), nullable=True)
    status = Column(String(32), default="PAYMENT_CREATED", index=True)
    decision = Column(String(16), nullable=True)
    risk_class = Column(String(16), nullable=True)
    risk_score = Column(Float, nullable=True)
    intent_consistency = Column(Float, nullable=True)
    recipient_trust = Column(Float, nullable=True)
    behavior_deviation = Column(Float, nullable=True)
    network_risk = Column(Float, nullable=True)
    context_risk = Column(Float, nullable=True)
    reason_codes = Column(JSON, default=list)
    risk_details = Column(JSON, nullable=True)
    drunix_tx_id = Column(String(64), nullable=True, index=True)
    drunix_block_number = Column(Integer, nullable=True)
    state_history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBDrunixTransaction(Base):
    __tablename__ = "drunix_transactions"

    tx_id = Column(String(64), primary_key=True, index=True)
    block_number = Column(Integer, index=True)
    channel_id = Column(String(64), default="payments-channel")
    chaincode_name = Column(String(64), default="vera-payment-state")
    function_name = Column(String(64))
    args = Column(JSON, default=dict)
    initiator_msp = Column(String(64))
    proposal_hash = Column(String(64))
    rw_set = Column(JSON, default=dict)
    endorsements = Column(JSON, default=list)
    stateless_validation_status = Column(String(32), default="VALID")
    mvcc_validation_status = Column(String(32), default="VALID")
    commit_status = Column(String(32), default="COMMITTED")
    transient_keydb_hash = Column(String(64), nullable=True)
    drunix_mode = Column(String(16), default="SIMULATOR")
    created_at = Column(DateTime, default=datetime.utcnow)


class DBDrunixBlock(Base):
    __tablename__ = "drunix_blocks"

    block_number = Column(Integer, primary_key=True)
    current_block_hash = Column(String(64), unique=True, index=True)
    previous_block_hash = Column(String(64))
    channel_id = Column(String(64), default="payments-channel")
    tx_count = Column(Integer, default=0)
    merkle_root = Column(String(64))
    orderer_identity = Column(String(64), default="OrdererMSP.orderer.example.com")
    timestamp = Column(DateTime, default=datetime.utcnow)


class DBTokenizedAsset(Base):
    __tablename__ = "tokenized_assets"

    asset_id = Column(String(64), primary_key=True, index=True)
    invoice_number = Column(String(64), unique=True)
    face_value_inr = Column(Float, nullable=False)
    discounted_value_inr = Column(Float, nullable=False)
    original_owner_id = Column(String(64))
    current_owner_id = Column(String(64))
    debtor_id = Column(String(64))
    due_date = Column(String(32))
    verification_status = Column(String(32), default="VERIFIED")
    drunix_tx_id = Column(String(64))
    collateral_status = Column(String(32), default="UNENCUMBERED")
    transfer_history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class DBRemittance(Base):
    __tablename__ = "remittances"

    remittance_id = Column(String(64), primary_key=True, index=True)
    payment_id = Column(String(64), index=True)
    corridor = Column(String(16))  # e.g., IN-SG, IN-UAE, IN-UK, IN-US
    sender_country = Column(String(4), default="IN")
    receiver_country = Column(String(4))
    source_amount = Column(Float)
    source_currency = Column(String(8), default="INR")
    fx_rate = Column(Float)
    dest_amount = Column(Float)
    dest_currency = Column(String(8))
    route_risk_score = Column(Float)
    compliance_status = Column(String(32))
    drunix_tx_id = Column(String(64), nullable=True)
    settlement_state = Column(String(32), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)


class DBAuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(64), index=True)
    actor_id = Column(String(64))
    ip_address = Column(String(64), nullable=True)
    resource_id = Column(String(64), index=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)


class DBExperimentRun(Base):
    __tablename__ = "experiment_runs"

    experiment_id = Column(String(64), primary_key=True)
    experiment_type = Column(String(64))  # BENCHMARK, ABLATION, SFE_CURVE
    model_name = Column(String(64))
    pr_auc = Column(Float)
    roc_auc = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1 = Column(Float)
    fpr = Column(Float)
    fnr = Column(Float)
    scam_recall = Column(Float)
    intent_mismatch_recall = Column(Float)
    latency_ms = Column(Float)
    sfe_score = Column(Float)
    metrics_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Initializes tables in database."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
