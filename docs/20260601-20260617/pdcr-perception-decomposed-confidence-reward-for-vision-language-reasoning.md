---
title: "PDCR: Perception-Decomposed Confidence Reward for Vision-Language Reasoning"
title_zh: PDCR：面向视觉-语言推理的感知分解置信度奖励
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026/papers/Yoon_PDCR_Perception-Decomposed_Confidence_Reward_for_Vision-Language_Reasoning_CVPR_2026_paper.pdf"
tldr: 本研究针对视觉语言推理中强化学习验证奖励（RLVR）过于稀疏的问题，提出了感知分解置信度奖励（PDCR）。传统方法通常依赖结果反馈或整体置信度，而 PDCR 通过将置信度奖励分解至感知层面，为模型提供更细粒度的内在反馈信号。该方法有效缓解了奖励稀疏性，引导模型在推理过程中更精准地处理视觉信息，显著提升了视觉语言任务的推理性能和训练效率。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 传统的强化学习验证奖励依赖稀疏的结果信号，难以在复杂的视觉语言推理任务中提供有效的细粒度指导。
method: 提出 PDCR 框架，通过将模型对正确答案的置信度增长分解为与感知相关的细粒度奖励信号来优化推理过程。
result: 实验结果表明，PDCR 在视觉语言推理任务中优于传统的稀疏奖励和简单的置信度奖励方法。
conclusion: 该研究证明了通过感知分解提供细粒度内在奖励是提升多模态模型推理能力的有效途径。
---

## 摘要
具有可验证奖励的强化学习（RLVR）传统上依赖于稀疏的、基于结果的信号。最近的研究表明，提供一种细粒度的、模型内在的信号——即奖励对真实值（ground-truth）置信度的增长……

## Abstract
Abstract Reinforcement Learning with Verifiable Rewards (RLVR) traditionally relieson a sparse, outcome-based signal. Recent work shows that providing a fine-grained, model-intrinsic signal--rewarding the confidence growth in the ground-truth …

---

## 论文详细总结（自动生成）

这是一份关于论文《PDCR: Perception-Decomposed Confidence Reward for Vision-Language Reasoning》的结构化深入总结：

### 1. 核心问题与研究动机
*   **核心问题**：在视觉-语言（V-L）推理任务中，传统的强化学习（RLVR）依赖于稀疏的终端奖励（如答案对错），导致“信度分配”困难。虽然近期有研究通过奖励模型对正确答案的“置信度增长”来提供细粒度指导，但在多模态场景下，这种全局统一的奖励信号会失效。
*   **研究背景**：V-L 推理是**视觉感知**（稀疏但关键）与**文本推理**（密集且占主导）的异构混合。
*   **动机**：作者发现，直接应用全局归一化的奖励会导致“混合诱导信号退化”——即占多数的文本推理步骤在统计上掩盖了关键的视觉感知步骤，使得视觉步骤的奖励信号被扭曲或压缩。

### 2. 核心方法论
PDCR 框架通过将奖励结构与任务的异构性质对齐来解决上述问题，主要包含两个阶段：
*   **无监督技能分解（Unsupervised Skill Decomposition）**：
    *   **视觉依赖得分 ($V_k$)**：引入一个模型内部信号，通过对比模型在“真实图像”和“空白（纯白）图像”输入下生成该推理步骤的对数概率差值，量化该步骤对视觉信息的依赖程度。
    *   **动态聚类（Otsu's Method）**：利用图像处理中的大津算法（Otsu's method）对 $V_k$ 进行自动阈值分割，无需外部标签即可将推理步骤划分为“视觉感知”和“文本推理”两类。
*   **感知分解优势计算（Perception-Decomposed Advantage）**：
    *   **内部分组归一化**：不再进行全局 Min-Max 归一化，而是在各自的技能簇（感知簇或推理簇）内独立计算置信度增益的优势值（Advantage）。
    *   **最终奖励函数**：将分解后的过程奖励（Process Reward）与稀疏的结果奖励（Outcome Reward）加权结合，为每个 Token 提供更稳定、比例正确的训练信号。

### 3. 实验设计
*   **基座模型**：Qwen2.5-VL-3B-Instruct 和 Qwen2.5-VL-7B-Instruct。
*   **训练数据集**：Vision-SR1（约 4.7万条包含可验证答案的数据，涵盖数学、常识和通用视觉理解）。
*   **评估基准（Benchmarks）**：
    *   **通用视觉理解**：MMMU, MMMU-Pro, RealWorldQA, VisNumBench。
    *   **多模态数学推理**：MathVerse, MATH-Vision。
    *   **幻觉诊断**：HallusionBench。
*   **对比方法**：
    *   **GRPO**：标准的稀疏奖励强化学习。
    *   **DAPO**：解决 GRPO 优势消失问题的改进版。
    *   **PACR**：朴素的、全局归一化的置信度增长奖励方法。

### 4. 资源与算力
*   **算力说明**：论文正文未详细列出具体的 GPU 型号和数量（通常在附录 16 中，但提取文本未包含该部分）。
*   **训练效率**：文中提到 PDCR 相比 GRPO 增加了约 1.5 倍的计算开销（因为需要额外的推理步来计算置信度和视觉依赖得分），但这种开销被推理时的效率提升所抵消，因为模型学会了生成更简洁的推理链。

### 5. 实验数量与充分性
*   **实验规模**：在两个不同规模（3B 和 7B）的模型上进行了验证，涵盖了 7 个主流 Benchmark。
*   **消融实验**：
    *   验证了**动态阈值（Otsu）**优于固定比例（Top-K）的划分方法。
    *   对比了**随机分解（Random Decomposition）**，证明了基于视觉依赖的分解是性能提升的关键，而非简单的分组。
*   **客观性**：实验采用了相同的系统提示词和超参数，确保了对比的公平性。

### 6. 主要结论与发现
*   **性能领先**：PDCR 在所有基准测试中均优于 GRPO、DAPO 和 PACR。在 7B 模型上，平均得分从 GRPO 的 51.5 提升至 52.9。
*   **解决信号退化**：通过内部分组归一化，视觉感知步骤获得了更稳定、更具代表性的奖励信号。
*   **推理效率提升**：经过 PDCR 训练的模型倾向于生成更短、更高效的推理轨迹（CoT），减少了冗余。
*   **收敛速度**：PDCR 在训练初期表现出更快的收敛速度和更高的最终准确率。

### 7. 优点与亮点
*   **无需人工标注**：通过模型内部概率实现无监督的技能分解，具有极高的可扩展性。
*   **理论支撑扎实**：识别并定义了“混合诱导信号退化”问题，并借鉴成熟的图像分割算法（Otsu）解决 NLP/V-L 问题。
*   **自包含性**：不需要额外的外部过程奖励模型（PRM），降低了训练成本和对高质量 PRM 数据的依赖。

### 8. 不足与局限
*   **计算开销**：训练期间需要额外的 Forward Pass 来计算视觉依赖得分，增加了训练耗时。
*   **白图假设**：视觉依赖得分依赖于“空白图像”作为基准，对于某些极端光照或极简背景的真实图像，这种对比的区分度可能会下降。
*   **任务覆盖**：虽然在推理任务上表现优异，但尚未验证该方法在非推理类任务（如纯图像描述或创意写作）中的效果。

（完）
