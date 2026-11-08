# LLMLingua-2 compression benchmark (HotpotQA distractor)

n = 150 questions, each with 10 passages. Reader: `gpt-oss:20b`. Compressor: `microsoft/llmlingua-2-xlm-roberta-large-meetingbank`. The question is never compressed.

| Setting | Context tokens | Token reduction | EM | F1 | 95% CI | ΔF1 vs full | Compression time (p50) |
|---|---|---|---|---|---|---|---|
| Full context | 1435 | 0% | 59.3% | 77.8% | 72.4–83.0% | – | 0 ms |
| LLMLingua-2, rate 0.5 | 768 | 46% | 58.0% | 74.8% | 68.8–80.3% | -3.0 (-7.7 to +1.3) | 13581 ms |
| LLMLingua-2, rate 0.33 | 491 | 66% | 42.0% | 61.9% | 55.3–68.4% | -15.8 (-21.7 to -9.8) | 12551 ms |
