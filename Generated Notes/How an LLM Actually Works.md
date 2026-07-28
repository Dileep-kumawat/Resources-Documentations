# How an LLM Actually Works — Complete Recall Notes

---

# 1. The Core Truth

An LLM (**Large Language Model**) is fundamentally:

> A giant next-token prediction machine.

It reads text, learns patterns from massive datasets, and predicts what token should come next.

Not magic.
Not consciousness.
Not real understanding like humans.

Just extremely advanced statistical pattern learning.

---

# 2. The Simplest Mental Model

LLM pipeline:

```text
Input Text
   ↓
Tokenization
   ↓
Embeddings
   ↓
Transformer Layers (Attention)
   ↓
Probability Distribution
   ↓
Next Token Prediction
   ↓
Repeat Again & Again
```

That repetition creates paragraphs, code, reasoning, explanations, etc.

---

# 3. Tokens — The Real Input

LLMs do NOT see words directly.

They see **tokens**.

A token is a chunk of text.

Examples:

```text
"ChatGPT is amazing"

→ ["Chat", "G", "PT", " is", " amazing"]
```

Or:

```text
"unbelievable"

→ ["un", "believ", "able"]
```

Different models tokenize differently.

---

# 4. Tokenization

Tokenizer converts text → token IDs.

Example:

```text
"hello"

→ token ID: 15339
```

Common tokenizers:

* BPE (Byte Pair Encoding)
* SentencePiece

Goal:

* Compress language efficiently
* Reuse subwords
* Handle unknown words

---

# 5. Embeddings — Turning Language into Math

Tokens become vectors (lists of numbers).

Example:

```text
"cat" → [0.12, -0.88, 0.45, ...]
```

These vectors are called **embeddings**.

Purpose:

* Encode semantic meaning mathematically.

Nearby meanings get nearby vectors.

Example:

```text
king ≈ queen
Paris ≈ France
Tokyo ≈ Japan
```

---

# 6. Positional Encoding — Adding Order

Transformers process tokens in parallel.

Problem:
Without position info:

```text
dog bites man
man bites dog
```

look identical.

So positional information is added.

This tells the model:

* which token came first
* second
* third
* etc.

---

# 7. The Transformer — The Heart of LLMs

Modern LLMs use the **Transformer architecture**.

Invented in:

Attention Is All You Need

Core breakthrough:

> Attention mechanism.

Transformers replaced older architectures:

* RNNs
* LSTMs

because they scale much better.

---

# 8. Attention — The Most Important Concept

Attention asks:

> "Which other tokens matter for understanding this token?"

Example:

```text
"The animal didn't cross the road because IT was tired."
```

What is "it"?

Attention helps connect:

```text
it → animal
```

instead of:

```text
it → road
```

---

# 9. Q, K, V (Query, Key, Value)

Every token creates:

* Query (Q)
* Key (K)
* Value (V)

Think:

| Part  | Meaning                          |
| ----- | -------------------------------- |
| Query | What am I looking for?           |
| Key   | What information do I contain?   |
| Value | What information should I share? |

Attention score:

```text
similarity(Query, Key)
```

Higher similarity:
→ stronger attention.

---

# 10. Self-Attention

Self-attention means:

Each token looks at OTHER tokens in the SAME sentence.

Example:

```text
"The black cat sat on the mat."
```

"sat" may attend strongly to:

* cat
* mat

because they're relevant.

---

# 11. Multi-Head Attention

Instead of ONE attention system:

Transformers use MANY attention heads.

Each head learns different relationships.

Example:

| Head | Learns               |
| ---- | -------------------- |
| 1    | Grammar              |
| 2    | Long-range meaning   |
| 3    | Code structure       |
| 4    | Entity relationships |

This massively improves understanding.

---

# 12. Feed Forward Network (FFN)

After attention:

Each token passes through a neural network.

Usually:

```text
Linear → Activation → Linear
```

Purpose:

* deeper feature extraction
* nonlinear pattern learning

Attention gathers information.
FFN processes it.

---

# 13. Residual Connections

Deep networks lose information easily.

Residual connections solve this.

Idea:

```text
output = new_information + old_information
```

Benefits:

* stable training
* preserves gradients
* enables very deep models

Without this:
huge models fail.

---

# 14. Layer Normalization

Neural activations can become unstable.

LayerNorm keeps values controlled.

Benefits:

* smoother training
* prevents exploding values
* faster convergence

---

# 15. Transformer Block

One transformer block contains:

```text
Input
 ↓
Attention
 ↓
Add + Normalize
 ↓
Feed Forward
 ↓
Add + Normalize
```

LLMs stack MANY such blocks.

---

# 16. Layers

Models become powerful by stacking layers.

Examples:

| Model Size | Approx Layers |
| ---------- | ------------- |
| Small      | 12            |
| Medium     | 32            |
| Huge       | 80+           |

Lower layers:

* grammar
* syntax

Higher layers:

* abstract concepts
* reasoning patterns

---

# 17. Parameters

Parameters = learned weights.

Examples:

| Model | Parameters |
| ----- | ---------- |
| 7B    | 7 billion  |
| 70B   | 70 billion |
| 1T    | 1 trillion |

More parameters:

* usually more capability
* BUT only if data/training are good

Bigger ≠ automatically smarter.

---

# 18. Pretraining

The massive first training phase.

Model reads:

* books
* websites
* code
* papers
* conversations

Objective:

> Predict next token.

Example:

```text
"The capital of France is ____"
```

Correct answer:

```text
Paris
```

This happens trillions of times.

---

# 19. Loss Function

Model predictions are compared against correct answers.

Difference = LOSS.

Common loss:

```text
Cross Entropy Loss
```

Lower loss:
→ better predictions.

---

# 20. Backpropagation

How the model learns.

Process:

```text
Prediction
→ Error Calculation
→ Compute Gradients
→ Update Weights
```

Repeated across:

* billions of parameters
* trillions of tokens

This is the learning process.

---

# 21. Gradient Descent

Optimization algorithm.

Goal:

> Reduce loss step by step.

Tiny updates improve predictions gradually.

---

# 22. Context Window

LLMs only remember limited recent tokens.

This limit is called:

> Context window

Examples:

* 4K
* 32K
* 128K
* 1M tokens

If text exceeds context:

* older info disappears

---

# 23. Inference — Generation Time

After training:

User prompt enters model.

Process:

```text
Prompt
→ Tokenize
→ Attention Processing
→ Predict Next Token
→ Append Token
→ Repeat
```

This loop creates responses.

---

# 24. Probability Distribution

LLM predicts probabilities.

Example:

```text
"The sky is"

blue → 70%
gray → 15%
falling → 0.01%
```

Then sampling chooses one.

---

# 25. Temperature

Controls randomness.

| Temperature | Behavior        |
| ----------- | --------------- |
| Low         | predictable     |
| Medium      | balanced        |
| High        | creative/random |

Low:

```text
more factual
```

High:

```text
more imaginative
```

---

# 26. Top-K Sampling

Only top K probable tokens are considered.

Example:

```text
Top-5 tokens only
```

Prevents absurd outputs.

---

# 27. Top-P Sampling

Dynamic probability filtering.

Choose smallest token set whose cumulative probability exceeds P.

Example:

```text
P = 0.9
```

Used heavily in modern generation.

---

# 28. Why LLMs Hallucinate

Critical concept.

LLMs optimize:

```text
plausibility
```

NOT:

```text
truth
```

So they can generate:

* fake citations
* fake facts
* fake confidence

because statistically plausible text may still be wrong.

---

# 29. Fine-Tuning

Base models are adapted.

Examples:

* coding assistants
* medical models
* legal models
* chat assistants

Methods:

* supervised fine-tuning
* instruction tuning

---

# 30. RLHF (Reinforcement Learning from Human Feedback)

Humans rank outputs.

Example:

| Response | Better? |
| -------- | ------- |
| A        | ✓       |
| B        | ✗       |

A reward model learns preferences.

Then LLM optimizes toward preferred behavior.

This improves:

* safety
* helpfulness
* conversational quality

---

# 31. RAG (Retrieval-Augmented Generation)

LLM connected to external knowledge.

Pipeline:

```text
Question
→ Retrieve Documents
→ Insert into Context
→ Generate Answer
```

Benefits:

* fresher info
* fewer hallucinations
* better factuality

---

# 32. Quantization

Compresses model weights.

Example:

```text
FP16 → INT8 → 4-bit
```

Benefits:

* less VRAM
* faster inference
* cheaper deployment

Tradeoff:

* some quality loss

---

# 33. Distillation

Small model learns from large model.

Goal:

* cheaper
* faster
* mobile deployment

---

# 34. Mixture of Experts (MoE)

Not all parameters activate every time.

Only relevant "experts" activate.

Benefits:

* efficient scaling
* huge effective model sizes

---

# 35. Attention Complexity Problem

Attention cost grows roughly:

O(n^2)

Longer context:
→ much more expensive.

This is a major research bottleneck.

---

# 36. Multimodal Models

Modern models process:

* text
* images
* audio
* video

Images are converted into embeddings too.

Everything becomes vectors eventually.

---

# 37. What LLMs Are GOOD At

* summarization
* coding
* translation
* pattern recognition
* writing
* brainstorming
* language generation

---

# 38. What LLMs Are BAD At

* perfect truthfulness
* exact arithmetic
* guaranteed logic
* consistent long reasoning
* true understanding of reality

---

# 39. Biggest Misconception

People think:

```text
LLMs store facts like databases
```

Wrong.

They store:

* compressed statistical relationships

Not exact factual memory.

---

# 40. The Real Intuition

An LLM is basically:

> A giant mathematical system that learns relationships between tokens using attention and predicts likely continuations of text.

Everything else emerges from scale.

---

# 41. The Entire Flow in One Shot

```text
Massive Text Data
    ↓
Tokenization
    ↓
Embeddings
    ↓
Transformer Layers
    ↓
Attention
    ↓
Pattern Learning
    ↓
Next-token Prediction
    ↓
Training Repeated Trillions of Times
    ↓
Chatbot Behavior Emerges
```

---

# 42. Fast Recall Cheat Sheet

| Concept        | One-Line Meaning             |
| -------------- | ---------------------------- |
| Token          | piece of text                |
| Embedding      | numerical meaning vector     |
| Attention      | what tokens matter           |
| Transformer    | architecture using attention |
| Parameters     | learned weights              |
| Context Window | temporary memory             |
| Training       | prediction learning          |
| Inference      | generation phase             |
| Temperature    | randomness control           |
| RLHF           | human preference alignment   |
| RAG            | external retrieval system    |
| Quantization   | model compression            |
| Hallucination  | plausible but false output   |

---

# 43. Ultimate One-Sentence Summary

> LLMs are giant transformer-based neural networks trained to predict the next token using attention mechanisms learned from massive text datasets.
