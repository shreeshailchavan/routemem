# Serving: Ollama vs vLLM on the GPU worker (A10G 24 GB, gpt-oss-20b)

`scripts/gpu/run_serving_bench.sh` → `scripts/bench_serving.py`: same 32 gate-eval prompts per level, streaming,
max_tokens 512, temperature 0, token counts reported by each server. Measured 2026-11-07.

| Concurrency | Ollama tok/s | vLLM tok/s | Ollama TTFT p50 | vLLM TTFT p50 | Ollama latency p50 | vLLM latency p50 |
|---|---|---|---|---|---|---|
| 1 | 98.5 | 105.6 | 0.154 s | 0.068 s | 1.86 s | 1.56 s |
| 4 | 171.6 | 237.9 | 0.179 s | 0.096 s | 3.84 s | 2.58 s |
| 16 | 173.5 | **456.6** | 9.61 s | **0.143 s** | 13.99 s | 3.74 s |

0 errors on both. Ollama ran as deployed (`OLLAMA_NUM_PARALLEL=4`, nemotron-3.5-bolt resident too), so beyond 4
concurrent requests it queues. vLLM v0.32.0 (official image, MXFP4 via Marlin) had the GPU to itself.

Caveat: the cascade needs two models resident. vLLM at `--gpu-memory-utilization 0.90` serves one, so a vLLM
deployment must either give each model a share of memory (two servers) or move the second model elsewhere;
that configuration has not been measured.

## Cascade-shaped load: both first-stage models answering at once (2026-11-07)

`scripts/gpu/run_coresident_bench.sh`: gpt-oss-20b and nemotron-3.5-bolt each get the same prompts at the same
concurrency, at the same time, as the cascade sends them.

| Concurrency | gpt-oss tok/s (alone → paired) | gpt-oss TTFT p50 paired | bolt tok/s paired | bolt TTFT p50 paired |
|---|---|---|---|---|
| 1 | 98.5 → 53.1 | 0.23 s | 77.2 | 0.18 s |
| 4 | 171.6 → 112.5 | 0.30 s | 124.8 | 0.37 s |
| 16 | 173.5 → 105.0 | 15.8 s | 184.2 | 23.2 s |

Running both models costs gpt-oss about 40% of its throughput, and at 16 concurrent cascade requests both
queue for 16–23 s before the first token.

**Hybrid (vLLM for gpt-oss, Ollama for bolt) does not fit on one A10G.** Bolt in Ollama holds 8.3 GB; vLLM
then ran out of memory while loading gpt-oss's weights (`vllm_coresident_oom.txt`: 13.1 GB in use, 1.08 GB more
needed, before any KV cache). vLLM's 2.6× gain needs gpt-oss on a GPU of its own: a 48 GB GPU (g6e.xlarge, L40S)
for both models, or a second 24 GB worker for bolt.
