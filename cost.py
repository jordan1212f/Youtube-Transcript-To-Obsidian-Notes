import json
from pathlib import Path

USAGE_PATH = Path.home() / '.yt_notes_usage.json'


#Reference to https://claude.com/pricing (APR 2026)
#Pricing is for Sonnet 4.6
INPUT_PRICE_PER_M = 3.00
OUTPUT_PRICE_PER_M = 15.00

#Cost for an average call in USD
def calculate_cost(input_tokens, output_tokens):
    input_cost = input_tokens * (INPUT_PRICE_PER_M / 1_000_000)
    output_cost = output_tokens * (OUTPUT_PRICE_PER_M / 1_000_000)
    return input_cost + output_cost

"""
Formula:
input_cost  = input_tokens  × (price_per_million / 1,000,000)
output_cost = output_tokens × (price_per_million / 1,000,000)

Args:
input tokens (sent to Claude)
output tokens (returned from Claude)
"""

def load_usage():

    if not USAGE_PATH.exists():
        return {
            'total_input_tokens' : 0,
            'total_output_tokens' : 0,
            'total_cost_usd' : 0.0,
            'calls' : 0
        }
    return json.loads(USAGE_PATH.read_text())

def save_usage(usage):
    USAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
    USAGE_PATH.write_text(json.dumps(usage, indent=2))

def record_usage(input_tokens, output_tokens):
    """
    Method to record a single API calsl token usage + cost.
    Loads current cost, adds new usage and then saves it back
    Returns a dict with both the per-call and cumulative usage stats
    Caller can display these to the user

    Args:
    input_tokens : tokens sentt in current call
    output_tokens : tokens receivied in currenl call
    """
    call_cost = calculate_cost(input_tokens, output_tokens)

    usage = load_usage()
    usage['total_input_tokens'] += input_tokens
    usage['total_output_tokens'] += output_tokens

    usage['total_cost_usd'] += call_cost
    usage['total_cost_usd'] = round(usage['total_cost_usd'], 6)
    usage['calls'] += 1
    save_usage(usage)

    return {
        'call_cost' : call_cost,
        'call_input' : input_tokens,
        'call_output' : output_tokens,
        'total_cost' : usage['total_cost_usd'],
        'total_calls' : usage['calls']
    }

def estimate_cost(transcript_text):
    """
    Method to estimate the cost of processing a transcript before sending to Claude.
    Useful for info for users who are nearing the end of their budget
    !!! Rough estimate !!! --> based on 1 token = 4 chars

    Input: Trascript + system prompt (500 tokens) + metadata (50 tokens)
    Output: JSON note is usually around 500-1500 tokens (depends on video length)

    Args: 
    Full transcript text as a string
    """
    transcript_tokens = len(transcript_text) // 4
    system_and_metadata = 550
    estimated_input = transcript_tokens + system_and_metadata

    estimated_output = 1000

    cost = calculate_cost(estimated_input, estimated_output)

    return {
        'estimated_input' : estimated_input,
        'estimated_output' : estimated_output,
        'estimated_cost' : cost
    }

def format_cost_report(stats):
    """
    Example output:
        💰 This note: $0.0234 (3,420 in / 890 out)
        📊 All time: $1.24 across 15 notes
 
    The :.4f format specifier means "show 4 decimal places"
    so $0.02 displays as $0.0200 — useful for small amounts.
    """
    lines = [
        f'💰 This note: ${stats["call_cost"]:.4f}'
        f'({stats["call_input"]:,} in / {stats["call_output"]:,} out)',
        f'📊 All time: ${stats["total_cost"]:.4f} across {stats["total_calls"]} notes'
    ]
    return '\n'.join(lines)