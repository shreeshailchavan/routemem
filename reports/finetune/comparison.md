# Base model vs. fine-tuned specialists

Each fine-tune is compared with its base, Llama 3.2 3B Instruct, at the same quantization (v1 vs the 4-bit base, v2 vs the 8-bit base), on the same test questions. Δ is fine-tuned minus base with a 95% paired-bootstrap CI; "significant" means the CI excludes 0. Discordant pairs: questions only one of the two models got right.

## `routemem-specialist` vs `llama3.2_3b`

| Dataset | n | Base | Fine-tuned | Δ (points) | 95% CI | Significant | Only base right | Only fine-tune right | Median latency base → tuned | Answer tokens base → tuned |
|---|---|---|---|---|---|---|---|---|---|---|
| GSM8K (math) | 300 | 77.7% | 62.7% | **-15.0** | -21.3 to -9.0 | yes | 69 | 24 | 1.6 s → 12.6 s | 163 → 1044 |
| MMLU | 300 | 61.3% | 59.0% | **-2.3** | -7.3 to +2.7 | no | 34 | 27 | 0.3 s → 0.1 s | 75 → 227 |
| MMLU-Pro | 300 | 28.0% | 26.0% | **-2.0** | -6.7 to +3.0 | no | 32 | 26 | 0.2 s → 0.2 s | 196 → 515 |
| ARC-Challenge | 300 | 73.7% | 77.7% | **+4.0** | -0.3 to +8.7 | no | 20 | 32 | 0.3 s → 0.1 s | 53 → 51 |
| HumanEval (code) | 164 | 57.9% | 50.6% | **-7.3** | -13.4 to -1.2 | yes | 21 | 9 | 2.0 s → 3.2 s | 199 → 223 |
| **Overall** | 1364 | 59.9% | 55.6% | **-4.3** | -6.7 to -1.8 | yes | 176 | 118 | 0.9 s → 0.2 s | 131 → 431 |

## `routemem-specialist-v2` vs `llama3.2_3b-q8_0`

| Dataset | n | Base | Fine-tuned | Δ (points) | 95% CI | Significant | Only base right | Only fine-tune right | Median latency base → tuned | Answer tokens base → tuned |
|---|---|---|---|---|---|---|---|---|---|---|
| GSM8K (math) | 300 | 78.0% | 67.7% | **-10.3** | -15.7 to -5.0 | yes | 50 | 19 | 4.4 s → 2.6 s | 160 → 84 |
| MMLU | 300 | 62.3% | 63.0% | **+0.7** | -4.7 to +6.0 | no | 33 | 35 | 1.7 s → 0.4 s | 81 → 6 |
| MMLU-Pro | 300 | 30.0% | 26.7% | **-3.3** | -7.7 to +1.0 | no | 27 | 17 | 2.2 s → 0.6 s | 209 → 23 |
| ARC-Challenge | 300 | 76.3% | 78.0% | **+1.7** | -2.7 to +6.0 | no | 20 | 25 | 1.2 s → 0.4 s | 50 → 3 |
| HumanEval (code) | 164 | 57.9% | 53.0% | **-4.9** | -11.6 to +1.8 | no | 20 | 12 | 4.7 s → 4.1 s | 199 → 154 |
| **Overall** | 1364 | 61.2% | 58.1% | **-3.1** | -5.4 to -0.8 | yes | 150 | 108 | 2.6 s → 0.5 s | 134 → 44 |
