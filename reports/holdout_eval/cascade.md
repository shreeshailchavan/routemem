# Agreement cascade on held-out questions (live)

n = 240 held-out questions (GSM8K, MMLU, MMLU-Pro, ARC; none used for model selection or router training). Escalated: 17% (the two first-stage answers disagreed).

| System | n | Accuracy | 95% CI | vs gpt-oss:20b alone | p50 latency | p90 latency | arc | gsm8k | mmlu | mmlu_pro |
|---|---|---|---|---|---|---|---|---|---|---|
| Cascade: nemotron-3.5-bolt:e4b + gpt-oss:20b agree, else qwen3.8:27b | 240 | **89.6%** | 85.4–93.3% | +2.1 (-0.8 to +5.4) | 12.6 s | 90.7 s | 100.0% | 96.7% | 83.3% | 78.3% |
| gpt-oss:20b alone | 240 | **87.5%** | 82.9–91.7% | +0.0 (+0.0 to +0.0) | 5.5 s | 36.0 s | 100.0% | 96.7% | 81.7% | 71.7% |
| RouteMem task routing (live gateway) | 240 | **85.4%** | 80.8–89.6% | -2.1 (-5.0 to +0.8) | 6.1 s | 29.1 s | 98.3% | 96.7% | 78.3% | 68.3% |
| nemotron-3.5-bolt:e4b alone | 240 | **82.9%** | 77.9–87.5% | -4.6 (-8.8 to -0.8) ✗ | 11.2 s | 38.2 s | 95.0% | 91.7% | 75.0% | 70.0% |

✓ / ✗: significantly better / worse (paired bootstrap 95% CI excludes 0).
