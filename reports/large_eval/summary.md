# Model selection by task

Accuracy is measured on items every compared model answered; 95% CIs from item bootstrap. Latency is per answer on one A10G (local; 4 concurrent requests for the first runs, 8 later, so queueing inflates it) or the provider API (cloud, sequential, including rate-limit waits).

## Math (gsm8k; n = {'gsm8k': 91})

| Model | Tier | Accuracy | 95% CI | gsm8k | p50 latency | Cloud $/1k |
|---|---|---|---|---|---|---|
| `gpt-oss:20b` | gpu | **100.0%** | 100.0–100.0% | 100.0% | 8.0 s | – |
| `openai/gpt-oss-120b` | cloud | **100.0%** | 100.0–100.0% | 100.0% | 1.3 s | $0.054 |
| `nemotron-3.5-lightning:30b-a3b` | gpu | **98.9%** | 96.7–100.0% | 98.9% | 73.3 s | – |
| `gemma4:e4b` | small | **97.8%** | 94.5–100.0% | 97.8% | 8.1 s | – |
| `qwen/qwen3.8-27b` | cloud | **97.8%** | 94.5–100.0% | 97.8% | 20.7 s | n/a |
| `qwen3.8:27b` | gpu | **97.8%** | 94.5–100.0% | 97.8% | 74.2 s | – |
| `gemma-4-31b-it` | cloud | **96.7%** | 92.3–100.0% | 96.7% | 56.6 s | n/a |
| `lfm3:1.7b` | small | **96.7%** | 92.3–100.0% | 96.7% | 9.7 s | – |
| `nemotron-3.5-bolt:e4b` | small | **95.6%** | 91.2–98.9% | 95.6% | 18.9 s | – |
| `phi3.5:latest` | small | **89.0%** | 81.3–95.6% | 89.0% | 3.1 s | – |
| `granite4.2:3b` | small | **86.8%** | 79.1–93.4% | 86.8% | 8.3 s | – |
| `llama3.2:3b` | small | **83.5%** | 75.8–90.1% | 83.5% | 1.6 s | – |
| `deepseek-r1:1.5b` | small | **79.1%** | 70.3–86.8% | 79.1% | 2.8 s | – |
| `qwen2.5-coder:3b` | small | **76.9%** | 69.2–85.7% | 76.9% | 2.6 s | – |
| `routemem-specialist` | small | **73.6%** | 63.7–82.4% | 73.6% | 11.7 s | – |

**Best per tier** (ranked on the tier's own common items, n shown):
- small: `gemma4:e4b` 94.3% (n = 300), 8.1 s median; leads `nemotron-3.5-bolt:e4b` by +1.7 points (95% CI -0.3 to +4.0, not significant)
- gpu: `gpt-oss:20b` 100.0% (n = 132), 8.0 s median; leads `nemotron-3.5-lightning:30b-a3b` by +0.8 points (95% CI +0.0 to +2.3, not significant)
- cloud: `openai/gpt-oss-120b` 98.0% (n = 99), 1.3 s median; leads `qwen/qwen3.8-27b` by +2.0 points (95% CI +0.0 to +5.1, not significant)

## Code (humaneval; n = {'humaneval': 99})

| Model | Tier | Accuracy | 95% CI | humaneval | p50 latency | Cloud $/1k |
|---|---|---|---|---|---|---|
| `qwen3-coder:30b` | gpu | **98.0%** | 94.9–100.0% | 98.0% | 8.8 s | – |
| `qwen3.8:27b` | gpu | **98.0%** | 94.9–100.0% | 98.0% | 127.3 s | – |
| `nemotron-3.5-bolt:e4b` | small | **97.0%** | 92.9–100.0% | 97.0% | 37.1 s | – |
| `gpt-oss:20b` | gpu | **96.0%** | 91.9–99.0% | 96.0% | 14.4 s | – |
| `qwen2.5-coder:3b` | small | **89.9%** | 82.8–94.9% | 89.9% | 1.9 s | – |
| `gemma4:e4b` | small | **85.9%** | 79.8–91.9% | 85.9% | 16.3 s | – |
| `llama3.2:3b` | small | **70.7%** | 61.6–79.8% | 70.7% | 1.8 s | – |
| `lfm3:1.7b` | small | **65.7%** | 55.6–75.8% | 65.7% | 27.9 s | – |
| `phi3.5:latest` | small | **65.7%** | 56.6–74.7% | 65.7% | 8.9 s | – |
| `granite4.2:3b` | small | **56.6%** | 47.5–65.7% | 56.6% | 30.2 s | – |
| `routemem-specialist` | small | **56.6%** | 46.5–66.7% | 56.6% | 2.6 s | – |
| `deepseek-r1:1.5b` | small | **50.5%** | 40.4–60.6% | 50.5% | 32.1 s | – |
| `gemma-4-31b-it` | cloud | **30.3%** | 21.2–39.4% | 30.3% | 53.7 s | n/a |

**Best per tier** (ranked on the tier's own common items, n shown):
- small: `nemotron-3.5-bolt:e4b` 95.1% (n = 164), 37.1 s median; leads `gemma4:e4b` by +12.2 points (95% CI +6.7 to +17.7, significant)
- gpu: `qwen3.8:27b` 97.9% (n = 145), 127.3 s median; leads `qwen3-coder:30b` by +2.8 points (95% CI -1.4 to +6.9, not significant)
- cloud: `gemma-4-31b-it` 30.0% (n = 100), 53.7 s median

## Knowledge (mmlu, mmlu_pro, arc; n = {'mmlu': 92, 'mmlu_pro': 70, 'arc': 99})

| Model | Tier | Accuracy | 95% CI | mmlu | mmlu_pro | arc | p50 latency | Cloud $/1k |
|---|---|---|---|---|---|---|---|---|
| `qwen3.8:27b` | gpu | **86.5%** | 82.5–90.6% | 89.1% | 71.4% | 99.0% | 127.0 s | – |
| `gpt-oss:20b` | gpu | **79.4%** | 74.4–83.8% | 88.0% | 54.3% | 96.0% | 7.1 s | – |
| `gemma-4-31b-it` | cloud | **78.1%** | 73.1–82.7% | 84.8% | 51.4% | 98.0% | 80.8 s | n/a |
| `gemma4:e4b` | small | **77.0%** | 72.0–81.8% | 83.7% | 51.4% | 96.0% | 11.3 s | – |
| `nemotron-3.5-bolt:e4b` | small | **76.9%** | 71.9–81.8% | 82.6% | 54.3% | 93.9% | 23.8 s | – |
| `phi3.5:latest` | small | **66.4%** | 61.2–71.5% | 67.4% | 40.0% | 91.9% | 4.4 s | – |
| `routemem-specialist` | small | **57.0%** | 51.5–62.9% | 51.1% | 37.1% | 82.8% | 141 ms | – |
| `lfm3:1.7b` | small | **56.4%** | 51.1–61.6% | 66.3% | 17.1% | 85.9% | 14.6 s | – |
| `qwen2.5-coder:3b` | small | **55.6%** | 49.9–61.5% | 62.0% | 27.1% | 77.8% | 110 ms | – |
| `llama3.2:3b` | small | **55.1%** | 49.5–60.7% | 60.9% | 28.6% | 75.8% | 261 ms | – |
| `granite4.2:3b` | small | **53.6%** | 49.0–58.4% | 57.6% | 14.3% | 88.9% | 11.3 s | – |
| `deepseek-r1:1.5b` | small | **38.8%** | 33.7–44.5% | 45.7% | 14.3% | 56.6% | 5.3 s | – |

**Best per tier** (ranked on the tier's own common items, n shown):
- small: `nemotron-3.5-bolt:e4b` 75.3% (n = 900), 23.8 s median; leads `gemma4:e4b` by +0.7 points (95% CI -1.6 to +3.0, not significant)
- gpu: `qwen3.8:27b` 86.8% (n = 416), 127.0 s median; leads `gpt-oss:20b` by +8.3 points (95% CI +4.5 to +11.8, significant)
- cloud: `gemma-4-31b-it` 74.7% (n = 289), 80.8 s median

## Skipped (provider quota reached)

- `groq_qwen3.8-27b`: stopped after 15 of 369 items — HTTP 429 after 5 retries: {"error":{"message":"Request too large for model `qwen/qwen3.8-27b` in organization `org_01m1246es2eqyvrmj2gj0v5w8z` service tier `on_
- `gemini-3.8-flash`: stopped after 0 of 500 items — HTTP 429 quota exhausted: [{
  "error": {
    "code": 429,
    "message": "You exceeded your current quota, please check your plan and billing details. For more
- `groq_gpt-oss-120b`: stopped after 10 of 283 items — HTTP 429 quota exhausted: {"error":{"message":"Rate limit reached for model `openai/gpt-oss-120b` in organization `org_01m1246es2eqyvrmj2gj0v5w8z` service tier 

## Current RouteMem routing, replayed

- Accuracy 63.8% on 749 items (21% sent to the strong model); by task: math 74.0%, code 89.3%, knowledge 52.0%
- Routes: {'deepseek-r1_1.5b': 260, 'routemem-specialist': 249, 'gpt-oss_20b': 159, 'qwen2.5-coder_3b': 81}
