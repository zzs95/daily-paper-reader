---
title: Entropy-Aware On-Policy Distillation of Language Models
title_zh: 语言模型的熵感知同策略蒸馏
authors: Unknown
date: Unknown
pdf: "https://scholar.google.com/scholar_url?url=https://arxiv.org/pdf/2603.07079&hl=en&sa=X&d=6537923174025208623&ei=HrO-aeigI5GrieoP7rnduQU&scisig=AFtJQixNyKGnkD86NNkvgxCd6AEB&oi=scholaralrt&hist=Sp41LysAAAAJ:7428935191213286109:AFtJQiwzJmvzlWJgngGiB1nbZtiZ&html=&pos=4&folt=rel"
tldr: 本研究针对语言模型中的同策略蒸馏（On-policy Distillation）进行了改进。传统方法通常使用逆KL散度，让学生模型在自身生成的轨迹上学习教师模型的信号。本文提出了一种熵感知（Entropy-Aware）的蒸馏框架，旨在解决传统方法在探索与利用之间的平衡问题，通过引入熵感知机制，显著提升了知识迁移的效率和学生模型的最终性能。
motivation: 传统的同策略蒸馏方法主要依赖逆KL散度，容易导致学生模型在学习过程中出现模式搜索行为或探索不足的问题。
method: 提出了一种熵感知的同策略蒸馏框架，通过在蒸馏过程中动态考虑学生模型的输出熵来优化学习信号。
result: 实验证明，该方法在多个基准测试中显著提高了学生模型的性能，优于现有的同策略蒸馏技术。
conclusion: 熵感知机制是增强语言模型间知识迁移效果的关键，能有效提升同策略蒸馏的稳定性和最终表现。
---

## 摘要
同策略蒸馏是一种在语言模型之间迁移知识的极具前景的方法，学生模型在其自身轨迹上通过密集的词元级信号进行学习。该框架通常采用逆向 KL 散度，鼓励……

## Abstract
On-policy distillation is a promising approach for transferring knowledge betweenlanguage models, where a student learns from dense token-level signals along itsown trajectories. This framework typically uses reverse KL divergence, encouraging …

---

## 论文详细总结（自动生成）

这是一份关于论文《Entropy-Aware On-Policy Distillation of Language Models》（语言模型的熵感知同策略蒸馏）的结构化总结：

### 1. 论文的核心问题与整体含义
*   **研究背景**：同策略蒸馏（On-policy Distillation, OPD）是提升小模型（学生）推理能力的有效手段。它让学生模型在自己生成的轨迹上学习教师模型的信号，解决了离线蒸馏中的分布偏移问题。
*   **核心问题**：现有的 OPD 方法主要依赖**逆 KL 散度（Reverse KL）**。作者发现逆 KL 具有“模式寻求（Mode-seeking）”特性，这会导致两个严重问题：
    1.  **多样性坍塌**：学生模型会忽略教师模型中概率分布较分散的备选路径，导致生成多样性降低。
    2.  **训练不稳定**：当教师模型对某个 token 不确定（高熵）时，逆 KL 提供的梯度信号会剧烈波动，导致模型难以收敛。
*   **研究动机**：在数学推理等任务中，高熵 token 通常代表关键决策点，保留这些多样性对找到正确解至关重要。

### 2. 方法论
*   **核心思想**：提出**熵感知同策略蒸馏（EOPD）**。其核心逻辑是：在教师模型信心十足（低熵）时使用逆 KL 以保证精确模仿；在教师模型不确定（高熵）时，引入**正向 KL 散度（Forward KL）**以覆盖更多模式，保留教师的分布结构。
*   **关键技术细节**：
    *   **动态目标函数**：$L_{EOPD} = L_{OPD} + \mathbb{I}(H^{te}_t > \tau) \cdot L_{FKL}$。其中 $H^{te}_t$ 是教师在位置 $t$ 的熵，$\tau$ 是预设阈值。
    *   **Top-k 截断优化**：为了降低计算开销和内存占用，正向 KL 仅在教师概率最高的 $k$ 个 token（如 $k=16$）上计算，而非全词表。
    *   **算法流程**：学生模型生成 rollout 轨迹，查询教师模型获取 token 概率和熵，根据熵值决定是否在标准 PPO 风格的 OPD 损失基础上增加正向 KL 约束。

### 3. 实验设计
*   **数据集**：
    *   **训练**：MATH 数据集（针对 0.6B/1.7B 模型）、DAPO-Math-14k（针对 4B 模型）。
    *   **评测（Benchmark）**：包含 6 个数学推理榜单（MATH500, AIME24/25, AMC23, Minerva, OlympiadBench）以及 3 个域外/通用能力榜单（GPQA, MMLU-Pro, AlpacaEval 2.0）。
*   **对比方法**：
    1.  **KD**：传统的离线正向 KL 蒸馏。
    2.  **OPD**：标准的基于逆 KL 的同策略蒸馏。
    3.  **GRPO**：基于强化学习的群体相对策略优化。
    4.  **熵驱动基准**：Entropy Bonus（熵奖励）和 Advantage Shaping（优势塑形）。

### 4. 资源与算力
*   **算力说明**：论文未明确给出具体的 GPU 型号和训练总时长。
*   **实现细节**：使用了 `verl` (HybridFlow) 框架进行分布式训练。提到 OPD 类方法比 GRPO 节省约 10 倍算力。在内存优化方面，Top-16 的正向 KL 计算仅需约 144 MiB 额外内存。

### 5. 实验数量与充分性
*   **实验规模**：
    *   涵盖了从 0.6B 到 4B 不同参数规模的学生模型（Qwen3 系列）。
    *   在 Llama-3.2-3B 模型上进行了跨架构验证。
    *   进行了详尽的消融实验，包括熵阈值 $\tau$ 的敏感度、Top-k 的取值、以及正向 KL 放置策略（全量 vs 随机 vs 熵感知）的对比。
*   **充分性评价**：实验设计非常系统且客观。不仅关注最终准确率（Avg@8），还深入分析了 Pass@k（多样性指标）和 token 级别的熵分布直方图，有力支撑了其“保留多样性”的论点。

### 6. 主要结论与发现
*   **性能提升**：EOPD 在所有数学基准上均优于标准 OPD。在 4B 模型上，Pass@8 准确率平均提升了 **+5.05%**。
*   **多样性保留**：分析显示，EOPD 训练出的学生模型在高熵区域的分布与教师模型更接近，而标准 OPD 会丢失约 63% 的高熵 token 特征。
*   **稳定性**：玩具实验和实际训练曲线均证明，引入正向 KL 能显著平滑高熵区域的梯度，使训练更稳定。
*   **泛化性**：即使只在数学数据上训练，EOPD 在通用推理（MMLU-Pro）和指令遵循（AlpacaEval）上也表现出更好的迁移能力。

### 7. 优点
*   **理论与直觉结合**：通过简单的玩具实验揭示了逆 KL 在高熵区域的失效本质，论据充分。
*   **高效性**：通过 Top-k 截断技术，在不显著增加计算成本的前提下，结合了正向和逆向 KL 的优势。
*   **即插即用**：该方法可以轻松集成到现有的 RLHF 或蒸馏流水线中。

### 8. 不足与局限
*   **超参数依赖**：虽然实验证明 $\tau$ 在一定范围内不敏感，但仍需针对不同教师模型进行初步调优。
*   **教师模型依赖**：训练过程中需要频繁调用教师模型获取全分布或 Top-k 概率，这在教师模型极大（如 DeepSeek-V3）时仍存在推理开销。
*   **任务局限**：主要验证集中在数学和逻辑推理，对于创意写作等极度发散的任务，该方法的表现尚未验证。

（完）
