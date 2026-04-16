---
title: Energy Matching based Preference Learning for Diffusion Language Models
title_zh: 基于能量匹配的扩散语言模型偏好学习
authors: Unknown
date: Unknown
pdf: "https://aclanthology.org/2026.eacl-srw.57.pdf"
tldr: 本研究针对扩散语言模型（Diffusion LMs）难以应用传统策略梯度强化学习的问题，提出了一种基于能量匹配（Energy Matching）的偏好学习框架。由于扩散模型在似然估计上存在挑战，导致现有RL方法难以直接迁移，该方法通过能量函数建模偏好，有效提升了扩散模型在推理任务中的表现，为扩散生成模型的对齐提供了新路径。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 传统的策略梯度强化学习方法因似然估计困难，无法直接应用于扩散语言模型的偏好对齐。
method: 提出一种基于能量匹配的偏好学习方法，通过绕过复杂的似然计算来优化扩散语言模型。
result: 该方法成功实现了扩散语言模型与人类偏好的有效对齐，并显著增强了模型的推理能力。
conclusion: 能量匹配框架为扩散语言模型的强化学习与微调提供了一种高效且兼容的解决方案。
---

## 摘要
策略梯度强化学习 (RL) 被广泛用于提升语言模型的推理能力，但现有方法与扩散语言模型并不兼容。其主要原因在于此类模型难以进行似然估计……

## Abstract
Policy-gradient reinforcement learning (RL) is widely used to improve languagemodel reasoning, but existing methods are not compatible with diffusion languagemodels. The primary reason for this is the difficulty of likelihood estimation with such …

---

## 论文详细总结（自动生成）

这是一份关于论文《Energy Matching based Preference Learning for Diffusion Language Models》的结构化总结：

### 1. 论文的核心问题与整体含义
*   **研究动机**：扩散语言模型（dLLMs）通过非自回归的迭代去噪生成文本，在推理速度和长序列处理上具有潜力。然而，现有的强化学习（RL）对齐方法（如 PPO、GRPO）高度依赖于**似然估计（Likelihood Estimation）**。
*   **核心挑战**：由于 dLLMs 的生成过程是非自回归的，精确计算序列似然在计算上是不可行的。现有的近似方法（如基于 ELBO 的估计）存在梯度偏差或高方差问题。此外，离线学习中的重要性采样（Importance Weighting）在长序列任务中极不稳定。
*   **整体含义**：本文提出了一种名为 **EMBR**（Energy Matching Based Realignment）的框架，将 KL 正则化的 RL 问题转化为能量分布匹配问题，从而绕过了似然估计和重要性采样的难题。

### 2. 论文提出的方法论
*   **核心思想**：利用 KL 正则化 RL 的最优策略符合玻尔兹曼分布（Boltzmann Distribution）的特性，通过最小化模型分布与目标能量分布之间的差异来实现对齐。
*   **关键技术细节**：
    *   **能量匹配（EMBR-E）**：通过最小化模型对数概率与奖励信号（能量）之间的均方误差（MSE）来对齐。引入一个可学习的函数 $c(x)$ 来吸收配分函数（Partition Function）的影响。
    *   **对比能量匹配（EMBR-C）**：通过成对样本（Pairwise）的对数概率差值进行训练，消除了对 $c(x)$ 的依赖，使其更易于在偏好数据集上进行监督微调（类似 DPO）。
    *   **原则性上界（EMBR-U）**：针对 dLLMs 无法直接计算对数概率的问题，利用证据下界（ELBO）和证据上界（EUBO）构建了一个严格的对比损失上界，确保优化过程在理论上是稳健的。
*   **算法流程**：支持在线（采样-存储-更新）和离线（直接利用偏好数据集）两种模式。在更新阶段，使用 ELBO/EUBO 的采样值替代传统的对数似然。

### 3. 实验设计
*   **数据集/场景**：
    *   **数学推理**：GSM8K（小学数学）、MATH500（高难度数学）。
    *   **代码生成**：HumanEval。
*   **基准模型（Backbone）**：LLaDA-8B（一种先进的扩散语言模型）。
*   **对比方法**：
    *   **在线设置**：GRPO、diffu-GRPO、wd1、UniGRPO。
    *   **离线设置**：DPO（适配扩散模型的版本）、VRPO。

### 4. 资源与算力
*   **算力说明**：论文**未明确说明**具体的 GPU 型号、数量或总训练时长。
*   **实现细节**：提到实验基于 `d1` 框架的超参数设置，并在 128、256、512 等不同序列长度下进行了评估。

### 5. 实验数量与充分性
*   **实验规模**：涵盖了三大主流推理基准测试，并在在线和离线两种主流 RL 范式下进行了验证。
*   **充分性评估**：
    *   **对比充分**：对比了 2025 年前后最新的扩散模型对齐算法。
    *   **消融实验**：对比了 EMBR 的三种变体（E、C、U），证明了基于上界的 EMBR-U 效果最佳。
    *   **客观性**：实验结果显示 EMBR 在多个指标上超过了现有 SOTA，且提供了训练动态曲线（Reward Dynamics），展示了收敛速度优势。

### 6. 论文的主要结论与发现
*   **性能卓越**：EMBR 在在线设置下匹配或超越了 GRPO 及其变体；在离线设置下显著优于 DPO。
*   **理论有效性**：提出的 EMBR-U（上界损失）在所有变体中表现最稳健，证明了在扩散模型中使用原则性界限（Bounds）比单纯使用 ELBO 近似更有效。
*   **收敛速度**：实验观察到 EMBR 比其他后训练方法学习速度更快。

### 7. 优点（亮点）
*   **无需重要性采样**：解决了长序列 RL 训练中的方差爆炸问题。
*   **通用性强**：一套框架同时兼容在线 RL 和离线偏好对齐（DPO 风格）。
*   **理论严谨**：推导了针对扩散模型的 EUBO 损失上界，为非自回归模型的对齐提供了数学支撑。

### 8. 不足与局限
*   **长程规划限制**：虽然理论上利好长序列，但实验尚未覆盖需要极长程规划（Long-horizon planning）的复杂任务。
*   **奖励粒度**：目前仅利用序列级奖励（Sequence-level），无法处理步骤级（Step-level）或跨度级（Span-level）的细粒度过程监督。
*   **算力细节缺失**：缺乏具体的资源消耗报告，难以评估其相对于自回归模型微调的实际开销比。

（完）
