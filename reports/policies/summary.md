# Answer-combination policies (replay of real answers)

n = 710 questions answered by all four models ({'arc': 150, 'gsm8k': 149, 'humaneval': 145, 'mmlu': 149, 'mmlu_pro': 117}). Every answer is a real, scored model output; only the combination is computed. Latency assumes parallel first-stage calls on the measured per-answer latencies (which include queueing at 4–8 concurrent requests).

| Policy | Accuracy | 95% CI | vs task routing | Escalated | p50 latency | p90 latency | Calls/query | arc | gsm8k | humaneval | mmlu | mmlu_pro |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `oracle` | **95.5%** | 93.9–96.9% | +8.2 (+6.2 to +10.1) | 0% | 0.0 s | 0.0 s | 0.0 | 100.0% | 98.0% | 100.0% | 93.3% | 83.8% |
| `single:qwen3.8-27b` | **91.7%** | 89.6–93.7% | +4.4 (+2.1 to +6.8) ✓ | 0% | 117.4 s | 286.9 s | 1.0 | 97.3% | 96.0% | 97.9% | 91.3% | 71.8% |
| `agree:nemotron-3.5-bolt-e4b+gpt-oss-20b->qwen3.8-27b` | **91.0%** | 88.9–93.2% | +3.7 (+1.8 to +5.4) ✓ | 13% | 27.7 s | 201.6 s | 1.9 | 96.0% | 96.6% | 96.6% | 91.3% | 70.1% |
| `agree:gemma4-e4b+gpt-oss-20b->qwen3.8-27b` | **90.4%** | 88.2–92.4% | +3.1 (+1.5 to +4.8) ✓ | 12% | 13.6 s | 169.4 s | 1.9 | 95.3% | 97.3% | 96.6% | 91.9% | 65.8% |
| `agree:nemotron-3.5-bolt-e4b+gemma4-e4b->gpt-oss-20b` | **87.6%** | 85.2–89.9% | +0.3 (-1.1 to +1.7) | 11% | 25.7 s | 74.4 s | 1.9 | 94.0% | 96.6% | 96.6% | 88.6% | 55.6% |
| `vote:gpt-oss-20b,nemotron-3.5-bolt-e4b,gemma4-e4b` | **87.6%** | 85.1–89.9% | +0.3 (-1.1 to +1.7) | 0% | 26.4 s | 67.9 s | 2.6 | 94.0% | 96.6% | 96.6% | 88.6% | 55.6% |
| `task` | **87.3%** | 84.8–89.9% | +0.0 (+0.0 to +0.0) | 0% | 9.9 s | 62.3 s | 1.0 | 95.3% | 97.3% | 96.6% | 87.9% | 52.1% |
| `single:gpt-oss-20b` | **87.0%** | 84.4–89.3% | -0.3 (-1.3 to +0.6) | 0% | 9.1 s | 33.5 s | 1.0 | 95.3% | 97.3% | 95.2% | 87.9% | 52.1% |
| `single:nemotron-3.5-bolt-e4b` | **84.8%** | 82.1–87.3% | -2.5 (-4.8 to -0.4) ✗ | 0% | 24.5 s | 64.0 s | 1.0 | 92.0% | 93.3% | 96.6% | 85.2% | 49.6% |
| `single:gemma4-e4b` | **81.8%** | 79.0–84.5% | -5.5 (-7.7 to -3.0) ✗ | 0% | 11.3 s | 25.7 s | 1.0 | 94.0% | 95.3% | 83.4% | 83.2% | 45.3% |

✓ / ✗: significantly better / worse than task routing (paired bootstrap 95% CI excludes 0).
