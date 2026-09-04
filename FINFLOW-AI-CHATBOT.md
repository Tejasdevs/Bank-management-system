# 🤖 FinFlow AI Banking Support Assistant

AI-powered customer support chatbot built for **FinFlow – Your Digital Banking Partner** and integrated into the Bank Management System (BMS).

The assistant provides friendly, professional, secure, and Knowledge Base-driven support for BMS users.

---

## 🚀 Built With

* Botpress Studio
* Botpress Knowledge Base
* Botpress Webchat
* Existing BMS / FinFlow Website

---

## 📅 Development History

### September 2, 2026 — Initial Chatbot

* Created the **BMS AI Banking Support Assistant** using Botpress Studio.
* Configured the chatbot as a friendly, professional and secure banking support assistant.
* Added support for:

  * Account management
  * Balance-related guidance
  * Deposits
  * Withdrawals
  * Fund transfers
  * Transaction history
  * Login and authentication
  * Troubleshooting
  * Human support escalation
* Added strict **anti-hallucination rules**.
* Prevented the bot from inventing balances, transactions, fees, limits or account information.
* Added financial security rules preventing the chatbot from requesting:

  * Passwords
  * PINs
  * OTPs
  * CVVs
  * Full card numbers
  * Other sensitive financial credentials
* Added transaction-safety rules.
* Added out-of-scope handling for unrelated questions.
* Added context-aware conversation and clarification behavior.
* Added fallback and human-escalation behavior.
* Integrated Botpress Webchat into the FinFlow website.
* Published and verified the chatbot integration.

### September 3, 2026 — Knowledge Base Expansion

* Expanded the BMS Knowledge Base with additional banking support information.
* Improved coverage for account, transaction and troubleshooting questions.
* Added clearer handling for unsupported and unavailable information.
* Improved Knowledge Base-driven responses.
* Strengthened the distinction between verified information and unsupported assumptions.

### September 4, 2026 — Language & Tone Matching

Added automatic language and tone matching.

* English input → English response
* Hinglish input → Hinglish response
* Hindi input → Hindi response
* Mixed Hindi + English → Natural Hinglish response
* Banking and technical terms remain in English when appropriate.
* Response tone matches the user's communication style.
* Banking conversations maintain a professional and secure tone regardless of language.

---

## 🧠 Current Bot Behavior

The assistant is designed to:

> **Help users solve BMS-related problems quickly, clearly, safely and accurately while never inventing information or requesting sensitive financial credentials.**

The chatbot currently provides **support and guidance** rather than performing financial actions directly.

### Core Principles

* Knowledge Base-driven responses
* Verified information only
* No hallucinated financial information
* Secure handling of banking-related questions
* No requests for sensitive credentials
* Clear clarification when information is incomplete
* Human escalation when required
* Language and tone matching
* Professional banking communication

---

## 🌐 Language & Tone Support

The chatbot automatically adapts to the user's language.

| User Language   | Response         |
| --------------- | ---------------- |
| English         | English          |
| Hinglish        | Hinglish         |
| Hindi           | Hindi            |
| Hindi + English | Natural Hinglish |

The chatbot does not unnecessarily switch languages and keeps commonly used banking and technical terms in English when appropriate.

---

## 🔐 Security & Privacy

The chatbot must never request or ask users to share:

* Passwords
* PINs
* OTPs
* CVVs
* Full card numbers
* Banking credentials
* Other sensitive authentication information

The chatbot also must not:

* Invent account balances
* Invent transaction details
* Claim a transaction was completed without verification
* Invent fees, limits or banking policies
* Provide unsupported financial information

For sensitive or unresolved issues, the chatbot directs users toward appropriate official/human support.

---

## 🔄 Update Workflow

Whenever the chatbot is improved:

**1. Update Botpress**
**2. Publish the bot**
**3. Test it on the BMS website**
**4. Update this README with the changes**
**5. Commit & push to GitHub**

> Botpress changes do not automatically create GitHub commits. GitHub is used to maintain the project's development and documentation history.

---

## 📌 Future Improvements

* Expand the Knowledge Base with detailed BMS FAQs
* Add more feature-specific documentation
* Improve troubleshooting workflows
* Add secure backend/API integration
* Support authenticated user-specific information
* Add more advanced customer-support workflows
* Improve escalation and support-ticket handling
* Expand multilingual support

---

## 📊 Project Status

**Current Phase:** AI Banking Support Assistant

**Status:** 🟢 Active Development

The chatbot is currently deployed through Botpress Webchat and provides secure, Knowledge Base-driven support for the FinFlow/BMS website.

---

## 📅 Version History

| Version | Date              | Description                                                                                            | Status |
| ------- | ----------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| v0.1    | September 2, 2026 | Initial BMS AI Banking Support Assistant, security rules, Knowledge Base setup and Webchat integration | ✅      |
| v0.2    | September 3, 2026 | Expanded Knowledge Base, banking support coverage and troubleshooting guidance                         | ✅      |
| v0.3    | September 4, 2026 | Added automatic language and tone matching for English, Hindi and Hinglish                             | ✅      |
