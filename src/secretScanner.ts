// src/secretScanner.ts

// Defines the structure for a secret pattern
interface SecretPattern {
  name: string;
  pattern: RegExp;
}

// Our library of secrets to detect. We can easily add more here.
const secretPatterns: SecretPattern[] = [
  {
    name: 'Stripe API Key',
    pattern: /sk_(live|test)_[0-9a-zA-Z]{24}/g,
  },
  {
    name: 'AWS Access Key ID',
    pattern: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /ghp_[0-9a-zA-Z]{36}/g,
  },
  {
    name: 'Generic Private Key',
    pattern: /-----BEGIN ((RSA|OPENSSH) )?PRIVATE KEY-----/g,
  },
];

// The result structure for our scan
export interface Finding {
  name: string;
  // You could even add the matched text or index later, but for now, name is fine.
}

export interface ScanResult {
  isSecret: boolean;
  findings: Finding[]; // This must be an array.
}

/**
 * Scans a given string of text for known secret patterns.
 * @param text The text to scan.
 * @returns A ScanResult object indicating if a secret was found and what was found.
 */

export function checkForSecrets(text: string): ScanResult {
  const findings: Finding[] = []; // 1. Start with an empty collection.

  for (const secret of secretPatterns) {
    // 2. Create a fresh, stateless RegExp object for every test.
    // This ignores the global flag for the .test() method's statefulness,
    // giving you a clean result every time.
    const freshPattern = new RegExp(secret.pattern);

    // 3. Test the entire string.
    if (freshPattern.test(text)) {
      // 4. If it matches, add it to our findings. Do NOT return.
      findings.push({ name: secret.name });
    }
  }

  // 5. After checking ALL patterns, build the final result.
  return {
    isSecret: findings.length > 0,
    findings: findings,
  };
}