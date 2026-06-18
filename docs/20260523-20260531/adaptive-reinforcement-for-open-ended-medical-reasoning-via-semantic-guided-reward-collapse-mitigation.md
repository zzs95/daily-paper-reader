---
title: Adaptive Reinforcement for Open-ended Medical Reasoning via Semantic-Guided Reward Collapse Mitigation
title_zh: 基于语义引导奖励崩溃缓解的开放式医学推理自适应强化
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026F/papers/Liu_Adaptive_Reinforcement_for_Open-ended_Medical_Reasoning_via_Semantic-Guided_Reward_Collapse_CVPRF_2026_paper.pdf"
tldr: 本研究针对视觉语言模型在开放式医疗推理中的奖励坍缩问题，提出了一种语义引导的自适应强化学习框架。该方法通过优化奖励机制，有效缓解了模型在强化学习过程中过度拟合规则而忽视语义逻辑的现象，在保持计算效率的同时，显著提升了模型在复杂医疗场景下的推理深度与泛化能力。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 解决视觉语言模型在利用规则奖励进行强化学习时，容易出现的奖励坍缩及医疗推理逻辑退化问题。
method: 提出一种语义引导的奖励坍缩缓解机制，通过自适应强化学习算法优化模型的开放式医疗推理路径。
result: 实验证明该方法显著增强了模型在医疗视觉问答任务中的推理准确性，并展现出优异的泛化性能。
conclusion: 语义引导的奖励优化机制是提升医疗大模型推理可靠性并克服强化学习训练不稳定性的一种有效方案。
---

## 摘要
结合基于规则的奖励函数的强化学习 (RL) 近期在增强视觉语言模型 (VLMs) 的推理深度和泛化能力方面展现出巨大潜力，同时能够保持计算效率。尽管……

## Abstract
Reinforcement learning (RL) with rule-based reward functions has recently showngreat promise in enhancing the reasoning depth and generalization ability of vision-language models (VLMs), while maintaining computational efficiency. In spite of …

---

## 论文详细总结（自动生成）

这是一份关于论文《Adaptive Reinforcement for Open-ended Medical Reasoning via Semantic-Guided Reward Collapse Mitigation》的结构化深入分析报告。

---

### 1. 核心问题与整体含义（研究动机和背景）
论文聚焦于**医学视觉问答（Medical VQA）**领域，指出当前视觉语言模型（VLM）在临床应用中的两大瓶颈：
*   **任务形式局限**：现有的强化学习微调（RFT）多针对闭口式（选择题）任务，而真实的临床诊断需要**开放式推理**，要求模型不仅给出结论，还要提供解释。
*   **奖励崩溃（Reward Collapse）问题**：在开放式任务中，使用传统的文本重叠指标（如 BLEU）无法捕捉深层语义，而使用基于模型的语义奖励（如 BERTScore）时，不同语义的回答往往得到极其接近的分数（高均值、低方差），导致强化学习的梯度信号微弱，模型难以优化。

**研究动机**：开发一种能够处理开放式医学推理、且能有效缓解语义奖励崩溃的自适应强化学习框架。

### 2. 方法论：ARMed 框架
论文提出了 **ARMed**（Adaptive Reinforcement for Medical Reasoning），其核心思想是通过自适应缩放机制增强奖励的判别力。

*   **核心算法**：基于 **GRPO**（Group Relative Policy Optimization，组相对策略优化），这是一种无需 Critic 网络的强化学习算法，通过组内样本的相对奖励来计算优势函数。
*   **自适应语义奖励（关键技术）**：
    *   **动态阈值**：维护一个历史奖励缓冲区，动态计算分位数作为奖励阈值。
    *   **非线性映射**：使用非线性的 S 型函数（S-shaped mapping）对原始语义分数进行重塑，放大阈值附近的差异，强制拉开“好回答”与“平庸回答”的得分差距。
*   **三阶段训练流程**：
    1.  **奖励驱动预训练 (ARMed-I)**：在基础模型上使用自适应奖励进行初步强化。
    2.  **知识增强微调 (ARMed-A)**：利用阶段一的模型生成思维链（CoT）数据，通过聚类筛选代表性样本进行监督微调（SFT），注入领域知识。
    3.  **奖励驱动精炼 (ARMed-R)**：在注入知识后的模型上再次进行强化学习，得到最终专家级模型。

### 3. 实验设计
*   **数据集**：
    *   **域内（In-domain）**：VQA-RAD、SLAKE、PathVQA。
    *   **域外（Out-of-domain）**：VQA-Med、PMC-VQA、MedXpertQA。
*   **Benchmark 与对比方法**：
    *   **通用 VLM**：Qwen2.5-VL (3B/7B)、InternVL3 (2B/8B/14B)、LLaVA-v1.6。
    *   **医疗专用 VLM**：LLaVA-Med、HuatuoGPT-Vision。
*   **评估指标**：BLEU-1、ROUGE-1、BERTScore、Cosine Similarity（使用医学专用模型 PubMedBERT 计算）。

### 4. 资源与算力
*   **硬件环境**：使用了 **4 台 NVIDIA H100 (80GB)** GPU。
*   **训练细节**：
    *   基于 Qwen2.5-VL-3B-Instruct 进行全参数微调。
    *   使用了 FlashAttention-2 加速。
    *   GRPO 每组采样 8 个响应，温度系数为 0.7。
    *   使用了 MS-SWIFT 分布式训练框架。

### 5. 实验数量与充分性
*   **实验规模**：在 6 个主流医学数据集上进行了全面测试，涵盖了放射学、病理学等多种模态。
*   **消融实验**：论文详细对比了“仅文本奖励”、“文本+语义奖励”、“文本+自适应语义奖励”以及“有无数据增强”等多种组合（见 Table 3），验证了每个模块的有效性。
*   **客观性**：实验不仅对比了同参数规模的模型，还跨级对比了更大参数量的模型（如 14B），并提供了奖励分布的可视化分析，证明了自适应机制确实缓解了奖励崩溃。

### 6. 主要结论与发现
*   **性能领先**：ARMed 在域内和域外测试中均达到 SOTA。3B 规模的模型在多个指标上超越了 14B 的通用模型。
*   **缓解崩溃**：自适应奖励机制将语义奖励的方差从 0.029 提升至 0.104 以上，为模型提供了更清晰的优化方向。
*   **泛化能力**：通过 CoT 知识注入和强化学习的结合，模型在未见过的医疗数据集上表现出极强的鲁棒性。

### 7. 优点（亮点）
*   **解决了痛点**：针对 RL 在开放式文本生成中普遍存在的“奖励分布平坦化”问题给出了数学上的解决方案。
*   **临床对齐**：通过 CoT 强制模型输出推理过程，使 AI 的诊断过程更具可解释性，符合医疗场景需求。
*   **效率高**：基于 GRPO 框架，避免了复杂的 Critic 网络训练，且在较小参数规模（3B）下实现了高性能。

### 8. 不足与局限
*   **评估依赖度**：虽然引入了语义奖励，但最终评估仍部分依赖 BERTScore 等自动指标，这些指标与人类医生真实临床判断之间仍可能存在细微偏差。
*   **任务广度**：实验主要集中在视觉问答，尚未验证该框架在长篇医疗报告撰写或多轮复杂医患对话中的表现。
*   **计算成本**：尽管使用了 GRPO，但强化学习阶段每步采样 8 个响应，对于显存和计算时间仍有一定要求。

（完）
