---
title: Energy Matching based Preference Learning for Diffusion Language Models
title_zh: 基于能量匹配的扩散语言模型偏好学习
authors: Unknown
date: Unknown
pdf: "https://aclanthology.org/2026.eacl-srw.57.pdf"
tldr: 本研究针对扩散语言模型（Diffusion LMs）难以应用传统策略梯度强化学习的问题，提出了一种基于能量匹配（Energy Matching）的偏好学习框架。该方法避开了扩散模型中复杂的似然估计难题，通过能量函数建模偏好，实现了扩散模型与人类偏好的有效对齐，为提升扩散语言模型的推理和生成质量提供了新路径。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 传统的策略梯度强化学习依赖似然估计，难以直接应用于似然计算极其困难的扩散语言模型。
method: 提出一种基于能量匹配的偏好学习方法，通过将扩散模型与能量函数结合来优化模型行为。
result: 成功克服了扩散语言模型在强化学习对齐中的技术瓶颈，实现了高效且兼容的偏好学习。
conclusion: 该研究为扩散语言模型的对齐和推理能力提升提供了一种创新且有效的技术方案。
---

## 摘要
策略梯度强化学习 (RL) 被广泛用于提升语言模型的推理能力，但现有方法与扩散语言模型并不兼容。其主要原因在于此类模型难以进行似然估计……

## Abstract
Policy-gradient reinforcement learning (RL) is widely used to improve languagemodel reasoning, but existing methods are not compatible with diffusion languagemodels. The primary reason for this is the difficulty of likelihood estimation with such …

---

## 论文详细总结（自动生成）

这是一份关于论文《Energy Matching based Preference Learning for Diffusion Language Models》的结构化总结：

### 1. 论文的核心问题与整体含义
*   **研究背景**：扩散语言模型（dLLMs）通过非自回归的迭代去噪生成文本，在推理速度和长文本处理上具有潜力。然而，传统的强化学习（RL）对齐方法（如 PPO、GRPO）依赖于对生成序列似然（Likelihood）的精确估计。
*   **核心问题**：dLLM 的似然计算在数学上是不可解的（Intractable），现有的近似方法（如基于 ELBO 的估计）存在偏差大、方差高的问题。此外，离策（Off-policy）学习中的重要性采样（Importance Weighting）在处理长推理链时极不稳定。
*   **整体含义**：本文提出了一种名为 **EMBR**（Energy Matching Based Realignment）的框架，将 KL 正则化的 RL 问题转化为能量分布匹配问题，从而绕过了似然估计和重要性采样的难题，为 dLLM 的后训练（Post-training）提供了一种高效、稳定的新路径。

### 2. 论文提出的方法论
*   **核心思想**：利用玻尔兹曼分布（Boltzmann Distribution）将 RL 目标重新表述为概率推理问题。通过最小化模型策略与目标能量分布之间的差异，使模型生成的响应符合高奖励特征。
*   **关键技术细节**：
    *   **EMBR-E (Vanilla)**：直接最小化模型对数概率与奖励信号之间的均方误差（MSE），引入一个可学习的参数 $c(x)$ 来吸收配分函数（Partition Function）的影响。
    *   **EMBR-C (Contrastive)**：对比变体。通过成对样本（$y$ 和 $y'$）的对数概率差值来抵消 $c(x)$，类似于 DPO 的思想，但适用于扩散架构。
    *   **EMBR-U (Upper Bound)**：**原则性上界损失**。由于 dLLM 无法直接计算对数概率，作者利用证据下界（ELBO）和证据上界（EUBO）构建了一个严格的对比损失上界，确保优化过程在数学上是有界且稳健的。
*   **算法流程**：支持在线（采样-存入缓存-训练）和离线（直接利用偏好数据集）两种模式。在训练迭代中，通过随机掩码（Masking）和去噪步骤计算损失，无需计算完整序列的似然比。

### 3. 实验设计
*   **数据集/场景**：
    *   **数学推理**：GSM8K（小学数学）、MATH500（竞赛级数学）。
    *   **代码生成**：HumanEval。
*   **Benchmark 与对比方法**：
    *   **基座模型**：LLaDA-8B（目前领先的开源扩散语言模型）。
    *   **在线对比方法**：UniGRPO、d1、wd1（均为针对 dLLM 优化的 GRPO 变体）。
    *   **离线对比方法**：DPO（适配扩散版）、VRPO（方差缩减偏好优化）。

### 4. 资源与算力
*   **算力说明**：论文**未明确说明**具体的 GPU 型号、数量或总训练时长。
*   **实现细节**：作者提到实验基于 `d1` 算法的开源代码库和超参数设置进行，暗示其算力需求与现有的 dLLM 强化学习方法相当。

### 5. 实验数量与充分性
*   **实验规模**：
    *   涵盖了三个主流的推理任务 Benchmark。
    *   针对在线学习和离线学习两种场景分别进行了验证。
    *   对 EMBR 的三个变体（E, C, U）进行了消融对比。
*   **充分性评价**：实验设计较为充分，对比了 2025 年最新的扩散模型对齐算法。通过在不同生成长度（128, 256, 512）下测试准确率，验证了方法在不同复杂度下的鲁棒性。

### 6. 论文的主要结论与发现
*   **性能领先**：EMBR 在在线设置下优于或持平现有的 GRPO 变体；在离线设置下，EMBR 显著优于 DPO 适配版。
*   **上界损失的有效性**：EMBR-U（基于上界的损失）在多数任务中表现最佳，证明了在似然不可解的情况下，使用数学原则性的界限函数比直接使用 ELBO 近似更有效。
*   **收敛速度**：训练动态图表显示，EMBR 比同类方法学习速度更快，奖励提升更迅速。

### 7. 优点
*   **理论优雅**：将能量匹配引入扩散模型对齐，解决了 dLLM 无法直接应用策略梯度的问题。
*   **无需重要性采样**：避免了长序列训练中的梯度爆炸或消失问题，提高了训练稳定性。
*   **通用性强**：同一套框架可同时兼容在线强化学习和离线偏好微调（类似 DPO）。

### 8. 不足与局限
*   **任务覆盖面**：实验主要集中在数学和代码等具有明确客观奖励的任务，未在开放式对话或主观偏好任务上进行测试。
*   **奖励粒度**：目前仅支持序列级（Sequence-level）奖励，无法利用过程监督（Process Supervision）或跨度级（Span-level）的细粒度反馈。
*   **长程规划**：作者承认 dLLM 在处理需要极长程规划的任务时仍有挑战，EMBR 虽然提升了对齐效率，但尚未根本性解决扩散模型在复杂逻辑规划上的底层弱点。

（完）
