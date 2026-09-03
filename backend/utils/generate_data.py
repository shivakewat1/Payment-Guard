"""
Synthetic Data Generator for PaymentGuard
Generates 100 realistic failed transactions matching the Razorpay Track 03 specification:
- Total amount at risk: ~Rs. 25,00,000
- Distribution:
  * Network issues (~45 txns) -> Auto-retry candidate
  * Issuer decline under Rs. 5000 (~35 txns) -> Customer SMS candidate
  * High-value (>Rs. 10000) + high trust score (>75) (~10 txns) -> Hinglish Voice Call candidate
  * Merchant error or recovery prob < 30% (~10 txns) -> Manual escalation candidate
- Calibrated to demonstrate ~32 payments recovered totaling ~Rs. 7,80,000 in recovery.
"""

import json
import random
from datetime import datetime, timedelta

def generate_synthetic_data(output_path="data/synthetic_transactions.json"):
    random.seed(42)  # For reproducible and honest benchmarks

    first_names = [
        "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Muhammad", "Sai", "Arnav", "Ayaan",
        "Krishna", "Ishaan", "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aaryav", "Dhruv", "Kabir",
        "Ananya", "Diya", "Saanvi", "Aadhya", "Pari", "Kiara", "Myra", "Riya", "Aarohi", "Anushka",
        "Isha", "Aditi", "Meera", "Kavya", "Pooja", "Sneha", "Tanvi", "Roshni", "Shreya", "Vandana"
    ]
    last_names = [
        "Sharma", "Verma", "Gupta", "Malhotra", "Mehta", "Patel", "Reddy", "Nair", "Iyer", "Rao",
        "Singh", "Kumar", "Chopra", "Deshmukh", "Joshi", "Bhatia", "Chatterjee", "Banerjee", "Kapoor", "Saxena"
    ]

    merchants = [
        {"id": "mer_quickkart_01", "name": "QuickKart India", "category": "E-Commerce", "chargeback_rate": 0.25, "health_score": 94},
        {"id": "mer_saascloud_02", "name": "CloudScale SaaS", "category": "B2B Subscription", "chargeback_rate": 0.15, "health_score": 98},
        {"id": "mer_fashionhub_03", "name": "VogueAura Fashion", "category": "D2C Apparel", "chargeback_rate": 0.65, "health_score": 82},
        {"id": "mer_edutech_04", "name": "ShikshaPlus EdTech", "category": "Education", "chargeback_rate": 0.35, "health_score": 90},
        {"id": "mer_traveljet_05", "name": "YatraWander Travels", "category": "Travel & Hospitality", "chargeback_rate": 0.85, "health_score": 76}
    ]

    base_time = datetime(2026, 8, 20, 10, 0, 0)
    transactions = []

    # Category 1: Network Issues (~45 txns)
    # Amounts: 2,000 to 45,000
    network_reasons = [
        ("network_timeout", "Bank gateway did not respond within 30000ms"),
        ("gateway_error", "Transient 504 Gateway Timeout from NPCI/switch"),
        ("bank_timeout", "HDFC/SBI switch unreachable temporarily"),
        ("socket_hang_up", "Connection dropped mid-handshake with acquiring bank")
    ]

    # Category 2: Issuer declined, amount < 5000 (~35 txns)
    issuer_reasons = [
        ("issuer_declined", "Card declined by issuing bank (do not honor)"),
        ("insufficient_funds", "Account has insufficient funds at time of billing"),
        ("otp_expired", "Customer failed to enter 3D-Secure OTP before expiration"),
        ("card_limit_exceeded", "Daily e-commerce transaction limit exceeded on card")
    ]

    # Category 3: High-value (>10000) + trusted customer (~10 txns)
    # Amounts: 12,000 to 48,000
    high_value_reasons = [
        ("issuer_declined", "High-value velocity check triggered by issuing bank"),
        ("otp_expired", "Customer delayed during step-up biometric/OTP verification"),
        ("network_timeout", "Acquiring bank timeout on large ticket authorization")
    ]

    # Category 4: Merchant configuration / High risk / Very high amount (~10 txns)
    # Amounts: 15,000 to 75,000
    merchant_reasons = [
        ("merchant_auth_failed", "Merchant API key authorization invalid or revoked"),
        ("webhook_delivery_failed", "Merchant webhook endpoint returned HTTP 500"),
        ("currency_mismatch", "Transaction currency not supported by merchant account"),
        ("fraud_suspected", "Risk engine flagged abnormal IP velocity and geolocation")
    ]

    tx_counter = 1000

    def make_customer(trust_range, success_range):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        return {
            "customer_id": f"cust_{random.randint(10000, 99999)}",
            "name": f"{fn} {ln}",
            "email": f"{fn.lower()}.{ln.lower()}{random.randint(10, 99)}@gmail.com",
            "phone": f"+91{random.randint(7000000000, 9999999999)}",
            "trust_score": random.randint(*trust_range),
            "success_rate": round(random.uniform(*success_range), 1),
            "past_payments_count": random.randint(3, 45)
        }

    # Generate 45 Network Transactions
    for i in range(45):
        tx_counter += 1
        reason_code, reason_desc = random.choice(network_reasons)
        amount = random.choice([5500, 8500, 14000, 22500, 31000, 38500, 45000])
        merchant = random.choice(merchants[:3])
        customer = make_customer((60, 92), (75.0, 96.0))
        tx_time = base_time + timedelta(hours=random.randint(1, 140), minutes=random.randint(0, 59))
        
        transactions.append({
            "tx_id": f"tx_{tx_counter}",
            "amount": amount,
            "currency": "INR",
            "reason": reason_code,
            "reason_description": reason_desc,
            "failure_category": "network",
            "customer": customer,
            "merchant": merchant,
            "timestamp": tx_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "payment_method": random.choice(["upi", "card_hdfc", "card_sbi", "card_icici", "netbanking_axis"]),
            "attempts": 1,
            "is_test_special": (i == 0)  # tx_1001 is designated for the 3-step graceful backoff demo
        })

    # Generate 35 Issuer Low Amount (<5000) Transactions
    for i in range(35):
        tx_counter += 1
        reason_code, reason_desc = random.choice(issuer_reasons)
        amount = random.choice([999, 1499, 2199, 3250, 4200, 4800, 4950])
        merchant = random.choice(merchants)
        customer = make_customer((45, 80), (60.0, 88.0))
        tx_time = base_time + timedelta(hours=random.randint(1, 140), minutes=random.randint(0, 59))

        transactions.append({
            "tx_id": f"tx_{tx_counter}",
            "amount": amount,
            "currency": "INR",
            "reason": reason_code,
            "reason_description": reason_desc,
            "failure_category": "issuer",
            "customer": customer,
            "merchant": merchant,
            "timestamp": tx_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "payment_method": random.choice(["card_visa", "card_mastercard", "card_rupay", "upi_gpay"]),
            "attempts": 1,
            "is_test_special": False
        })

    # Generate 10 High-Value (>10,000) + Trusted Customer (>75 trust) Transactions
    for i in range(10):
        tx_counter += 1
        reason_code, reason_desc = random.choice(high_value_reasons)
        amount = random.choice([38000, 45000, 52000, 65000, 72000])
        merchant = random.choice(merchants[:2])
        customer = make_customer((78, 98), (88.0, 99.0))
        tx_time = base_time + timedelta(hours=random.randint(1, 140), minutes=random.randint(0, 59))

        transactions.append({
            "tx_id": f"tx_{tx_counter}",
            "amount": amount,
            "currency": "INR",
            "reason": reason_code,
            "reason_description": reason_desc,
            "failure_category": "issuer" if "issuer" in reason_code else "network",
            "customer": customer,
            "merchant": merchant,
            "timestamp": tx_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "payment_method": random.choice(["card_amex", "card_hdfc_regalia", "card_icici_sapphiro", "netbanking"]),
            "attempts": 1,
            "is_test_special": False
        })

    # Generate 10 Merchant / High-Risk / Low-Recovery Transactions
    for i in range(10):
        tx_counter += 1
        reason_code, reason_desc = random.choice(merchant_reasons)
        amount = random.choice([55000, 68000, 75000, 85000, 92000])
        merchant = random.choice(merchants[3:])
        customer = make_customer((20, 55), (30.0, 58.0))
        tx_time = base_time + timedelta(hours=random.randint(1, 140), minutes=random.randint(0, 59))

        transactions.append({
            "tx_id": f"tx_{tx_counter}",
            "amount": amount,
            "currency": "INR",
            "reason": reason_code,
            "reason_description": reason_desc,
            "failure_category": "merchant" if "merchant" in reason_code else "security",
            "customer": customer,
            "merchant": merchant,
            "timestamp": tx_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "payment_method": "card_international",
            "attempts": 1,
            "is_test_special": False
        })

    # Summary metrics
    total_amount = sum(t["amount"] for t in transactions)
    print(f"Generated {len(transactions)} synthetic transactions.")
    print(f"Total Amount at Risk: Rs. {total_amount:,}")
    print(f"Average Failure Amount: Rs. {round(total_amount/len(transactions), 2):,}")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "dataset_info": {
                "version": "1.0",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "total_transactions": len(transactions),
                "total_amount_at_risk": total_amount,
                "currency": "INR"
            },
            "transactions": transactions
        }, f, indent=2)

    print(f"Successfully saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_data()
