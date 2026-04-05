---
title: Energy Matching based Preference Learning for Diffusion Language Models
title_zh: 基于能量匹配的扩散语言模型偏好学习
authors: Unknown
date: Unknown
pdf: "https://aclanthology.org/2026.eacl-srw.57.pdf"
tldr: 本研究针对扩散语言模型（Diffusion LMs）难以应用策略梯度强化学习的问题，提出了一种基于能量匹配（Energy Matching）的偏好学习框架。由于扩散模型在似然估计上存在挑战，传统RL方法难以直接迁移，该方法通过能量函数建模绕过了似然计算难题，为提升扩散语言模型的推理能力和对齐效果提供了新途径。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 传统的策略梯度强化学习方法因似然估计困难而无法直接应用于扩散语言模型。
method: 提出一种基于能量匹配的偏好学习方法，通过能量函数建模实现扩散模型的策略优化。
result: 该方法成功解决了扩散语言模型在强化学习中的兼容性问题，实现了有效的偏好对齐。
conclusion: 能量匹配为扩散语言模型的优化提供了高效框架，显著拓展了其在复杂推理和偏好学习任务中的应用潜力。
---

## 摘要
策略梯度强化学习 (RL) 被广泛用于提升语言模型的推理能力，但现有方法与扩散语言模型并不兼容。其主要原因在于此类模型难以进行似然估计……

## Abstract
Policy-gradient reinforcement learning (RL) is widely used to improve languagemodel reasoning, but existing methods are not compatible with diffusion languagemodels. The primary reason for this is the difficulty of likelihood estimation with such …

---

## 论文详细总结（自动生成）

这是一份关于论文《Energy Matching based Preference Learning for Diffusion Language Models》的结构化深入总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
*   **核心问题**：如何有效地对**扩散语言模型（dLLMs）**进行强化学习（RL）对齐。
*   **研究背景**：目前大语言模型（LLMs）主要通过策略梯度强化学习（如 PPO, GRPO）进行后训练以提升推理能力。然而，这些方法依赖于精确的似然估计（Likelihood Estimation）。
*   **动机**：dLLM 采用非自回归的迭代去噪生成方式，其似然计算在计算上是不可行的（Intractable）。现有的近似方法（如基于 ELBO 的近似）会导致梯度偏差。此外，离线学习中的重要性采样（Importance Weighting）在长序列推理任务中会产生极大的方差，导致训练不稳定。

### 2. 论文提出的方法论
论文提出了 **EMBR (Energy Matching Based Realignment)** 框架，其核心思想是将 KL 正则化的 RL 问题转化为一个**能量分布匹配**问题。
*   **核心思想**：利用玻尔兹曼分布（Boltzmann Distribution）作为目标分布，通过最小化模型策略与目标分布之间的能量差异（Energy Difference）来实现对齐，从而绕过复杂的似然计算。
*   **关键技术细节**：
    *   **EMBR-E (Vanilla)**：最小化 log 策略与 log 目标分布之间的均方误差（MSE），引入一个可学习的函数 $c(x)$ 来吸收配分函数（Partition Function）。
    *   **EMBR-C (Contrastive)**：对比式能量匹配。通过成对样本（Pairwise）对比，消除对 $c(x)$ 的依赖，类似于 DPO 的思路，但适用于扩散模型。
    *   **EMBR-U (Upper Bound)**：针对 dLLM 似然难以计算的问题，利用**证据下界 (ELBO)** 和**证据上界 (EUBO)** 构建了一个原则性的损失函数上界。这是该论文在数学推导上的核心贡献，确保了优化过程在理论上的严谨性。
*   **算法流程**：支持在线（采样-存入缓存-更新）和离线（直接利用偏好数据集）两种模式，无需计算重要性权重。

### 3. 实验设计
*   **基础模型**：使用最新的扩散语言模型 **LLaDA-8B**。
*   **数据集/场景**：
    *   **数学推理**：GSM8K（小学数学）、MATH500（竞赛级数学）。
    *   **代码生成**：HumanEval。
*   **Benchmark 与对比方法**：
    *   **在线设置**：对比了 GRPO 的扩散模型变体，包括 `diffu-GRPO`、`wd1` 和 `UniGRPO`。
    *   **离线设置**：对比了 `DPO`（适配扩散模型版）和 `VRPO`（方差缩减偏好优化）。
*   **评估指标**：在不同生成长度（128, 256, 512）下的测试准确率。

### 4. 资源与算力
*   **算力说明**：论文中**未明确说明**具体的 GPU 型号、数量以及总训练时长。
*   **实现细节**：提到实验基于 `d1`（diffu-GRPO 的官方实现）的代码库和超参数进行，采样温度在训练时设为 0.9，评估时设为 0.0。

### 5. 实验数量与充分性
*   **实验规模**：论文在三个主流推理基准上进行了测试，涵盖了在线和离线两种主流 RL 范式。
*   **充分性评价**：
    *   实验设计较为全面，对比了当前扩散语言模型对齐领域几乎所有最前沿的基线方法。
    *   通过 EMBR-E、EMBR-C、EMBR-U 三个变体的对比，验证了不同能量匹配策略的效果。
    *   **客观性**：实验结果显示 EMBR-U 在多数任务中表现最优，且在离线设置下显著优于 DPO，证明了其方法的有效性。但缺乏针对超参数敏感性的深度消融实验。

### 6. 论文的主要结论与发现
*   **性能领先**：EMBR 在在线学习中达到或超过了 GRPO 变体的性能，在离线学习中显著优于 DPO。
*   **上界优势**：提出的基于 EUBO/ELBO 的上界损失函数（EMBR-U）在稳定性表现上最为出色。
*   **无需权重**：证明了在不使用重要性采样的情况下，依然可以实现高效的扩散模型策略优化，解决了长序列训练不稳定的问题。
*   **通用性**：该框架统一了在线和离线偏好学习，为扩散语言模型的后训练提供了一个实用的替代方案。

### 7. 优点（亮点）
*   **理论严谨**：将能量匹配引入 dLLM 对齐，并推导出基于 EUBO 的原则性上界，填补了扩散模型 RL 理论的空白。
*   **架构简洁**：无需额外的重要性采样机制，降低了实现复杂度，且对长序列生成更友好。
*   **灵活性高**：既能像 PPO 一样进行在线强化学习，也能像 DPO 一样进行离线监督微调。

### 8. 不足与局限
*   **任务覆盖有限**：实验主要集中在数学和代码等具有明确奖励函数的任务，未在更广泛的开放域对话或长程规划任务中验证。
*   **奖励粒度**：目前仅支持序列级（Sequence-level）奖励，无法直接利用过程监督（Step-level/Process-based）信号。
*   **算力信息缺失**：缺乏训练开销的具体数据，难以评估该方法在实际生产环境中的计算效率。
*   **长程规划风险**：虽然理论上避开了重要性采样，但在极长序列的复杂推理中，扩散模型的迭代开销依然是一个潜在的瓶颈。

（完）
