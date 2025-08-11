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
            f"@risklens It's 2 AM and my brain is tapioca. My payment test keeps failing, "
            f"and the sandbox ID is '{keys[0]}'. Can you walk me through a fix "
            f"before I start debugging my coffee mug instead?"
        ),
        (
            f"@risklens My cat just staged a hostile takeover of my keyboard and now "
            f"my GitHub Actions have unionized. The workflow badge ID is '{keys[1]}'. "
            f"Any advice before I have to offer them tuna as severance?"
        ),
        (
            f"@risklens I inherited an ancient AWS project. The only 'documentation' "
            f"is a sticky note saying: '{keys[2]}'. Please translate this relic into "
            f"human-readable code before it declares itself ruler of the dev environment."
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