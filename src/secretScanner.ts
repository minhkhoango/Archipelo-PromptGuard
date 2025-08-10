interface SecretPattern {
  name: string;
  pattern: RegExp;
  description: string;
}

interface SecretMatch {
  type: string;
  value: string;
  start: number;
  end: number;
}

class SecretScanner {
  private patterns: SecretPattern[] = [
    {
      name: 'AWS Access Key',
      description: 'AWS Access Key ID',
      // FIX: Changed {16} to {16,17} to allow for common variations.
      pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16,17}\b/g,
    },
    {
      name: 'AWS Secret Key',
      description: 'AWS Secret Access Key',
      pattern: /(?<![A-Za-z0-9/+_=])[A-Za-z0-9/+]{40,64}={0,2}(?![A-Za-z0-9/+_=])/g,
    },
    {
      name: 'GitHub Token',
      description: 'GitHub Personal Access Token',
      // FIX: Changed {36} to {36,} to match tokens of 36 or more characters.
      pattern: /\bghp_[A-Za-z0-9]{36,}\b/g,
    },
    {
      name: 'Stripe Secret Key',
      description: 'Stripe Secret Key',
      pattern: /\bsk_(?:live|test)_[0-9A-Za-z]{24,64}\b/g,
    },
    {
      name: 'Database URL',
      description: 'Database Connection String',
      pattern: /\b(?:mongodb(?:\+srv)?|postgresql|postgres|mysql|mssql|redis|rediss):\/\/[^\s'"]+\b/gi,
    },
    {
      name: 'JWT Token',
      description: 'JSON Web Token',
      // NOTE: This pattern requires the JWT to be on a single line to work with the current line-by-line scanner.
      pattern: /\beyJ[A-Za-z0-9_-]{9,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    },
    {
      name: 'Generic API Key (Key-Value Pair)',
      description: 'Generic API Key (e.g., key = "value")',
      // This is the original pattern for key-value pairs. It's still valuable.
      pattern: /(?:api_key|apikey|secret|token)\s*[:=]\s*['"]?[A-Za-z0-9_-]{20,}/gi,
    },
    // NEW: Added a pattern for standalone keys without a "key =" part.
    // This is less precise, so we keep it near the end.
    {
      name: 'Generic API Key (Standalone)',
      description: 'Generic API Key (e.g., api_key_... value)',
      pattern: /\b(?:api_key|apikey)_[A-Za-z0-9_.-]{20,}\b/gi,
    }
  ];

  scanForSecrets(text: string): SecretMatch[] {
    const matches: SecretMatch[] = [];
    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      for (const pattern of this.patterns) {
        pattern.pattern.lastIndex = 0;
        let match;
        
        while ((match = pattern.pattern.exec(line)) !== null) {
          const value = match[0];
          const start = match.index;
          const end = start + value.length;

          matches.push({
            type: pattern.name,
            value,
            start,
            end,
          });
          
          if (match.index === pattern.pattern.lastIndex) {
            pattern.pattern.lastIndex++;
          }
        }
      }
    }

    return matches;
  }
}

export { SecretScanner, SecretMatch, SecretPattern };
