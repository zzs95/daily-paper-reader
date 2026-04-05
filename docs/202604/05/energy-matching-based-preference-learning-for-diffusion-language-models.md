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
method: 提出一种基于能量匹配的偏好学习方法，通过能量函数建模来优化扩散语言模型的策略。
result: 该方法成功解决了扩散模型在强化学习中的兼容性问题，实现了有效的偏好对齐。
conclusion: 能量匹配为扩散语言模型的优化提供了高效框架，显著拓展了其在复杂推理和对齐任务中的应用潜力。
---

## 摘要
策略梯度强化学习 (RL) 被广泛用于提升语言模型的推理能力，但现有方法与扩散语言模型并不兼容。其主要原因在于此类模型难以进行似然估计……

## Abstract
Policy-gradient reinforcement learning (RL) is widely used to improve languagemodel reasoning, but existing methods are not compatible with diffusion languagemodels. The primary reason for this is the difficulty of likelihood estimation with such …

---

## 论文详细总结（自动生成）

这篇论文《Energy Matching based Preference Learning for Diffusion Language Models》针对扩散语言模型（dLLMs）在强化学习对齐方面的难题提出了创新的解决方案。以下是对该论文的深度结构化总结：

### 1. 论文的核心问题与整体含义
*   **研究动机**：当前大语言模型（LLMs）主要通过策略梯度强化学习（PGRL，如 PPO、GRPO）进行后训练以提升推理能力。然而，这些方法依赖于**似然估计（Likelihood Estimation）**。
*   **核心挑战**：扩散语言模型（dLLMs）采用非自回归的迭代去噪生成方式，其精确似然计算在计算上是不可行的。此外，现有的离策（Off-policy）学习依赖重要性采样（Importance Weighting），在处理长推理链（如 Chain-of-Thought）时会产生极大的方差和不稳定性。
*   **整体含义**：论文提出了一种名为 **EMBR**（Energy Matching Based Realignment）的框架，将 RL 任务转化为能量分布匹配问题，从而绕过了似然估计和重要性采样的障碍，为 dLLMs 提供了一种高效、稳定的对齐路径。

### 2. 论文提出的方法论
*   **核心思想**：利用 KL 正则化 RL 与贝叶斯推理之间的等价性，将目标策略建模为玻尔兹曼分布（Boltzmann Distribution）。通过最小化模型输出与目标能量景观之间的差异来实现对齐。
*   **关键技术细节**：
    *   **能量匹配（EMBR-E）**：最小化模型对数概率与目标能量（奖励 + 参考模型概率）之间的均方误差（MSE）。引入一个可学习的标量函数 $c(x)$ 来吸收配分函数（Partition Function）。
    *   **对比能量匹配（EMBR-C）**：通过成对的生成样本（$y$ 和 $y'$）构建对比损失，消除了对 $c(x)$ 的依赖，使其更接近 DPO 的形式，便于直接利用偏好数据集。
    *   **原则性上界（EMBR-U）**：针对 dLLMs 无法直接计算对数概率的问题，利用**证据下界（ELBO）**和**证据上界（EUBO）**构建了对比损失的一个严格数学上界，确保优化过程在理论上是稳健的。
*   **算法流程**：支持在线（采样-存入缓存-更新）和离线（直接利用静态偏好数据）两种模式。在更新阶段，通过随机掩码时间步 $t$ 并计算去噪损失来近似能量梯度。

### 3. 实验设计
*   **数据集/场景**：
    *   **数学推理**：GSM8K（小学数学）、MATH500（高难度数学）。
    *   **代码生成**：HumanEval。
*   **基准模型（Base Model）**：LLaDA-8B（一种先进的扩散语言模型）。
*   **对比方法（Baselines）**：
    *   **在线场景**：UniGRPO、d1（diffu-GRPO）、wd1 等针对扩散模型的改进版 GRPO。
    *   **离线场景**：DPO（适配版）、VRPO（方差缩减偏好优化）。
*   **评估指标**：不同生成长度（128, 256, 512）下的测试准确率。

### 4. 资源与算力
*   **算力说明**：论文**未明确说明**具体的 GPU 型号、数量及总训练时长。
*   **实现细节**：提到实验基于 `d1` 开源框架的超参数设置进行，通常此类 8B 规模模型的微调需要多张 A100 或 H100 GPU。

### 5. 实验数量与充分性
*   **实验规模**：
    *   涵盖了数学和代码两大核心推理领域。
    *   对比了 EMBR 的三个变体（E, C, U），验证了不同损失函数的有效性。
    *   同时进行了在线和离线两种模式的实验，这在同类研究中较为少见。
*   **充分性评价**：实验设计较为充分，通过与多种最新的扩散模型专用 RL 算法对比，证明了其优越性。但在消融实验方面（如超参数 $\gamma$ 对上界紧致性的影响）略显单薄。

### 6. 论文的主要结论与发现
*   **性能领先**：EMBR（尤其是 EMBR-U 变体）在 GSM8K 和 HumanEval 等任务上一致优于现有的 diffu-GRPO 等方法。
*   **离线能力**：EMBR 成功证明了 dLLMs 也可以像自回归模型一样，通过静态偏好数据进行有效的离线对齐（超越了 DPO 适配版）。
*   **稳定性**：通过能量匹配避免了重要性采样，使得长序列生成的训练过程更加稳定，收敛速度通常快于基准方法。

### 7. 优点
*   **理论优雅**：将 RL 问题转化为能量匹配，从数学上解决了 dLLMs 似然估计难的问题。
*   **通用性强**：一套框架同时兼容在线强化学习和离线偏好微调。
*   **无需重要性采样**：彻底消除了长序列训练中的高方差风险，提高了样本效率。

### 8. 不足与局限
*   **长程规划缺失**：实验主要集中在数学和代码，尚未在需要极长程规划或复杂系统思维的任务上验证。
*   **奖励粒度**：目前仅利用序列级（Sequence-level）奖励，无法处理步骤级（Step-level）或跨度级（Span-level）的细粒度反馈。
*   **计算开销**：EMBR-U 涉及 EUBO 的计算，可能需要多次采样来估计期望，增加了单次迭代的计算负担。
*   **超参数敏感性**：对于能量匹配中的温度参数 $\beta$ 和上界参数 $\gamma$ 的敏感度分析不足。

（完）
