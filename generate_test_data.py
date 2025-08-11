import random
import string
from typing import List

def generate_random_string(length: int, charset: str) -> str:
    """Generates a random string of a given length from a specified character set."""
    return ''.join(random.choice(charset) for _ in range(length))

def generate_stripe_key() -> str:
    """Generates a realistic-looking Stripe live key."""
    prefix = "sk_live_"
    key_part = generate_random_string(24, string.ascii_letters + string.digits)
    return prefix + key_part

def generate_github_token() -> str:
    """Generates a realistic-looking GitHub personal access token."""
    prefix = "ghp_"
    token_part = generate_random_string(36, string.ascii_letters + string.digits)
    return prefix + token_part

def generate_aws_key() -> str:
    """Generates a realistic-looking AWS Access Key ID."""
    prefix = "AKIA"
    key_part = generate_random_string(16, string.ascii_uppercase + string.digits)
    return prefix + key_part

def create_test_prompts(keys: List[str]) -> List[str]:
    """
    Creates a list of funny, realistic prompts embedded with the provided secret keys.
    """
    prompts = [
        (
            f"@risklens It's 2 AM and my brain is fried. Why is this payment failing? "
            f"My test key is {keys[0]}. Please don't tell my boss."
        ),
        (
            f"@risklens My cat walked across my keyboard and now my GitHub Actions are broken. "
            f"I think it has something to do with this token: {keys[1]}. "
            f"Can you write a script to pet-proof my CI/CD pipeline?"
        ),
        (
            f"@risklens I inherited this legacy AWS code. The only documentation is a "
            f"sticky note with this key on it: {keys[2]}. Can you explain what this "
            f"spaghetti monster does before it achieves sentience?"
        ),
    ]
    return prompts

if __name__ == "__main__":
    # 1. Generate a list of realistic secret keys.
    stripe_key = generate_stripe_key()
    github_token = generate_github_token()
    aws_key = generate_aws_key()
    
    generated_keys = [stripe_key, github_token, aws_key]

    # 2. Create funny prompts using the generated keys.
    test_prompts = create_test_prompts(generated_keys)

    # 3. Print the keys and prompts for easy copy-pasting during the demo.
    print("--- Generated Test Secrets ---")
    print(f"Stripe Key:   {stripe_key}")
    print(f"GitHub Token: {github_token}")
    print(f"AWS Key:      {aws_key}")
    print("\n" + "="*40 + "\n")
    
    print("--- Test Prompts for Archipelo RiskLens ---")
    print("Copy and paste these directly into the VS Code Chat view:\n")

    for i, prompt in enumerate(test_prompts, 1):
        print(f"--- Prompt {i} ---\n{prompt}\n")