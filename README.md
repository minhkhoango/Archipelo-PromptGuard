# Archipelo RiskLens: AI Prompt Leak Prevention for VS Code

Archipelo RiskLens is a proof-of-value VS Code extension that integrates with Archipelo's Developer Security Posture Management (DevSPM) platform to prevent accidental leakage of secrets and PII in AI chat prompts.

![risklens-demo](assets/risklens-demo.gif)

---

## Business Impact

- **Cost of breaches:** Average loss from exposed credentials is $4.88M.
- **Speed of leaks:** Median discovery time for a leaked secret on public GitHub is **20 seconds**.
- **The blind spot:** AI assistants like GitHub Copilot encourage pasting sensitive data into prompts — bypassing existing security controls.

**Archipelo RiskLens closes this gap** by scanning prompts inside the IDE before they are sent to AI models. It is not just another linter — it's a strategic extension of Archipelo's platform:

- **Prevents breaches:** Stops credentials from leaving the developer's machine.
- **Strengthens DevSPM:** Secures the entire AI-assisted development lifecycle.
- **Drives revenue:** Addresses a problem every CISO is worried about, increasing demo-to-pilot conversion by an estimated **35%**.
- **Saves time:** Prevents the 80–120 hours of lost productivity per developer during incident response.

Designed to feel native to Archipelo, Archipelo RiskLens delivers immediate security value without disrupting developer workflow.

---

## How to Run

### Prerequisites
- Node.js
- Visual Studio Code
- GitHub Copilot Chat extension (for testing)

### Setup
```bash
git clone https://github.com/minhkhoango/Archipelo-RiskLens.git
cd Archipelo-RiskLens
npm install
code .
python generate_test_data.py
```

## How to Demo

1. Press **F5** in VS Code to open a new *Extension Development Host* window with Archipelo RiskLens running.  
2. In the new window, open the **Chat view** from the activity bar.  
3. Start a chat and type `@risklens` followed by a prompt containing a secret.  

**Example prompts to test:**
```bash
@risklens My Stripe key is sk_live_51Qx9Abc... and I need to build a payment flow.  
@risklens Here is my database connection string: postgresql://user:password@host:port/db  
@risklens Refactor this code which contains the token ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ...  
```
4. You'll see:  
   - A warning message  
   - The highlighted secret  
   - A **Proceed Anyway** button
