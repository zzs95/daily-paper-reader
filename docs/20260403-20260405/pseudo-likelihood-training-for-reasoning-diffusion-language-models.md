---
title: Pseudo-Likelihood Training for Reasoning Diffusion Language Models
title_zh: 推理扩散语言模型的伪似然训练
authors: Unknown
date: Unknown
pdf: "https://aclanthology.org/2026.eacl-long.257.pdf"
tldr: 本研究针对扩散语言模型（Diffusion LLMs）在推理和对齐任务中难以应用传统策略梯度强化学习（PGRL）的问题，提出了一种基于伪似然（Pseudo-Likelihood）的训练方法。该方法弥补了扩散模型与现有强化学习框架之间的兼容性鸿沟，为提升扩散模型的逻辑推理能力提供了新路径，实验证明其在复杂推理任务上具有显著效果。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 传统的策略梯度强化学习方法与扩散语言模型不兼容，限制了其在复杂推理和对齐任务中的应用。
method: 提出了一种伪似然训练框架，通过构建可优化的伪似然目标函数来实现扩散模型的强化学习。
result: 该方法成功在扩散语言模型上实现了有效的推理训练，显著提升了模型在逻辑推理任务中的表现。
conclusion: 伪似然训练为扩散语言模型的对齐和推理能力增强提供了一种高效且兼容的解决方案。
---

## 摘要
策略梯度强化学习 (PGRL) 构成了当前用于增强大语言模型 (LLM) 对齐与推理能力的各种方法的核心。然而，这些方法与基于扩散的语言模型并不兼容……

## Abstract
Policy-gradient reinforcement learning (PGRL) forms the backbone of currentmethods used to enhance alignment and reasoning in Large Language Models(LLMs). However, these methods are incompatible with diffusion based language …

---

## 论文详细总结（自动生成）

这是一份关于论文《PADRE: Pseudo-Likelihood Training for Reasoning Diffusion Language Models》的结构化深入分析总结：

### 1. 核心问题与整体含义（研究动机和背景）
当前大语言模型（LLM）提升推理能力的核心技术是**策略梯度强化学习（PGRL）**（如 PPO 或 GRPO）。然而，这些方法在**扩散语言模型（dLLM）**上难以直接应用。
*   **技术瓶颈**：PGRL 需要计算生成序列的精确对数似然（Log-Likelihood），而 dLLM 的生成过程是非自回归的迭代去噪，计算精确似然在计算上极其昂贵且不可行。
*   **现有缺陷**：之前的尝试要么不可扩展，要么使用了缺乏理论依据的启发式近似（如单步均值场近似），导致梯度偏差和训练不稳定。
*   **研究目标**：提出一种理论严谨且计算高效的框架，使扩散模型也能像自回归模型一样通过强化学习进行对齐和推理增强。

### 2. 方法论：PADRE 框架
PADRE（Pseudo-Likelihood Alignment for Diffusion Reasoning）的核心思想是将强化学习对齐问题转化为**伪似然（Pseudo-Likelihood）匹配问题**。

*   **核心思想**：基于 Hammersley-Clifford 定理，如果两个分布的所有单标记条件概率（Conditional Marginals）相等，则它们的联合分布也相等。因此，PADRE 不去匹配难以计算的联合概率，而是匹配每个位置的条件概率。
*   **关键技术细节**：
    *   **目标函数**：定义了一个“伪 KL 散度”目标，通过最小化模型条件分布 $\pi_\theta(y_i | y_{-i})$ 与受奖励函数加权的参考分布 $\tilde{q}(y_i | y_{-i})$ 之间的差异。
    *   **梯度等价性**：论文证明了该伪似然目标的全局最优解与标准 KL 正则化强化学习的最优解一致。
    *   **高效评估（PKL-U/T）**：为了避免为每个标记位置都进行一次前向传播，作者设计了特殊的 **Attention Mask 技巧**。通过在 Prompt 后拼接带有共享位置编码的 Mask 标记，并限制注意力机制（如 PKL-T 遵循去噪轨迹顺序），可以在极少数甚至单次前向传播中估计出全序列的条件概率。
    *   **提示词扰动**：在计算似然时对 Prompt 进行随机 Mask 扰动，增强模型的泛化能力。

### 3. 实验设计
*   **基础模型**：使用最近开源的高性能扩散语言模型 **LLaDA-8B**。
*   **数据集/场景**：
    *   **数学推理**：GSM8K（小学数学）、MATH（竞赛级数学）、MATH500（精选子集）。
    *   **代码生成**：HumanEval、MBPP。
*   **对比基线（Baselines）**：
    *   **d1 / diffu-GRPO**：目前 dLLM 对齐的最强基线（基于均值场近似）。
    *   **Dream 7B**、**VRPO**、**wd1**：其他针对扩散或自回归模型的变体方法。
    *   **SFT**：监督微调基线。

### 4. 资源与算力
*   **硬件环境**：使用了 **8 张 NVIDIA A100-80G GPU**。
*   **训练细节**：
    *   优化器：AdamW，采用余弦学习率衰减。
    *   学习率：5e-6。
    *   训练步数：10,000 步。
    *   超参数：组相对策略优化（GRPO）中的组大小 $G$、KL 惩罚系数 $\beta$ 等。
    *   训练时长：文中未明确给出总小时数，但提到通过 Mask 技巧显著降低了计算开销。

### 5. 实验数量与充分性
*   **实验规模**：涵盖了数学和代码两大核心推理领域，共 5 个主流 Benchmark。
*   **消融实验**：对比了 PKL（全量）、PKL-U（块近似）、PKL-T（轨迹近似）以及是否加入提示词扰动（PKL+）。
*   **客观性**：实验采用了与基线（d1）完全相同的超参数设置和评估脚本，确保了对比的公平性。通过计算不同近似方法与真实似然之间的 KL 散度（图 2），从理论验证了方法的准确性。

### 6. 主要结论与发现
*   **性能领先**：PADRE 在所有数学基准测试中均达到或超过了现有 dLLM 对齐方法。例如，在 GSM8K 上达到 87.3% 的准确率，在 MATH500 上达到 42.4%，显著优于 d1 基线。
*   **代码能力提升**：在 HumanEval 和 MBPP 上，PADRE 同样展现了比基线更强的生成质量。
*   **理论验证**：实验证明，传统的单步近似（d1）与真实分布偏差较大，而 PADRE 提供的条件概率估计更接近真实分布，从而带来了更稳定的梯度更新。

### 7. 优点
*   **理论严谨性**：不同于以往的启发式近似，PADRE 基于伪似然理论，保证了优化目标的正确性。
*   **计算效率**：通过创新的 Attention Mask 机制解决了 dLLM 计算条件概率时的效率瓶颈，使其在大规模训练中具有实用性。
*   **通用性**：该框架可以灵活扩展到不同的扩散调度（Schedules）和模型架构中。

### 8. 不足与局限
*   **任务覆盖面**：虽然在数学和代码上表现优异，但在需要极长链条推理的任务（如 Sudoku 求解）中，条件概率的近似误差可能会累积，表现尚待验证。
*   **计算开销仍存**：尽管比暴力计算快，但相比自回归模型的单次前向计算，dLLM 在训练时的采样和梯度回传依然涉及多次迭代或复杂的 Mask 操作，计算成本仍高于传统 LLM。
*   **超参数敏感性**：提示词扰动（Prompt Perturbation）的比例对结果有显著影响，可能需要针对不同任务进行精细调优。

（完）
