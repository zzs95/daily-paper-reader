---
title: "Beyond Accuracy: An Empirical Study of Perception Stability in Multimodal Large Language Models"
title_zh: 超越准确率：多模态大语言模型感知稳定性的实证研究
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026F/papers/Chen_Beyond_Accuracy_An_Empirical_Study_of_Perception_Stability_in_Multimodal_CVPRF_2026_paper.pdf"
tldr: 本研究针对当前多模态大模型（MLLM）评估中过度依赖准确率而忽视稳定性的问题，开展了感知稳定性的实证研究。通过在不同任务、领域和评估因素下对主流模型进行测试，揭示了模型在感知一致性方面的不足。研究指出，高准确率并不等同于高稳定性，为未来构建更鲁棒、可靠的多模态模型提供了重要参考和评估维度。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 当前多模态大模型的评估主要集中在准确率上，缺乏对模型在不同任务和环境下性能稳定性的深入探讨。
method: 通过实证研究方法，系统地分析了多模态大模型在多种基准测试、领域及评估因子下的感知稳定性表现。
result: 实验结果表明，高准确率的模型在不同条件下仍可能出现显著的性能波动，感知稳定性与准确率之间并非线性正相关。
conclusion: 稳定性应作为多模态大模型评估的核心指标之一，未来研究需致力于提升模型在复杂多变场景下的感知鲁棒性。
---

## 摘要
近期的多模态大语言模型（MLLMs）主要通过报告在一系列基准测试上的准确率来进行比较，而较少关注其性能在不同任务、领域和评估因素之间的稳定性。

## Abstract
Recent multimodal large language models (MLLMs) are predominantly compared byreporting accuracy on a collection of benchmarks, while paying much less attentionto how stable their performance is across tasks, domains, and evaluation factors …

---

## 论文详细总结（自动生成）

这是一份关于论文《Beyond Accuracy: An Empirical Study of Perception Stability in Multimodal Large Language Models》的结构化深入分析报告：

### 1. 论文的核心问题与整体含义（研究动机和背景）
*   **核心问题**：当前多模态大语言模型（MLLM）的评估过度依赖**聚合准确率（Aggregate Accuracy）**，而忽视了**感知稳定性（Perception Stability）**。
*   **研究动机**：作者发现，即使两个模型在某个能力（如实体识别）上的平均准确率接近，它们在不同基准测试（如 MME vs. MMBench）中的表现排名可能剧烈波动。这种“准确率中心化”的评估方式掩盖了模型在不同任务、领域和评估因子下的不一致性，导致对模型真实能力的误导性认知。
*   **整体含义**：本文旨在系统性地定义、量化并分析 MLLM 的感知稳定性，探讨其在预训练、后训练及推理阶段的演变规律。

### 2. 论文提出的方法论
*   **核心思想**：将感知能力细化，并引入统计学指标来衡量模型在异构子任务间表现的一致性。
*   **能力分解**：将 11 个主流基准测试分解为 6 种核心感知能力：计数（Counting）、OCR、属性识别（Attribute）、实体提取（Entity）、定位（Grounding）和结构化数据理解（Structured Data）。
*   **关键技术细节与指标**：
    *   **得分修正**：针对不同题型（判断、单选、简答）的随机猜测基准（Chance Baseline）进行归一化处理，使不同任务的得分具有可比性。
    *   **RES（Rank-Entropy Score，排名熵得分）**：通过计算模型在不同子任务中排名分布的香农熵，衡量模型排名的波动性。数值越小，排名越稳定。
    *   **DVS（Dispersion-based Variance Stability，离散方差稳定性）**：计算模型在各子任务中 z-score（标准分数）的标准差，衡量模型相对于群体平均水平的离散程度。数值越小，性能分布越均衡。

### 3. 实验设计
*   **数据集/基准测试**：整合了 MME, MMBench, SeedBench, MuirBench, Mirb, MMStar, OCRBench, SynthDog, ChartQA, AI2D, ConBench 共 11 个感知类 Benchmark。
*   **对比方法（模型池）**：共评估了 18 个主流 MLLM，包括：
    *   **闭源模型**：GPT-4-Vision, GPT-4o, Claude-3.5-Sonnet。
    *   **开源模型**：LLaVA 系列（1.5, 1.6, OV, Video）、Qwen2-VL 系列（2B, 7B, 72B）、Qwen2.5-VL 系列、InternVL2/3 系列。
*   **实验场景**：涵盖了模型开发的全生命周期，包括预训练动态监控、后训练（微调与合并）以及推理时缩放（Test-time Scaling）。

### 4. 资源与算力
*   **文中提及的算力消耗**：
    *   **连续微调（Continuous Fine-tuning）**：实验中为了缓解能力冲突，对 LLaVA-OV-SI-Qwen2-7b 进行微调，耗费了 **665.6 GPU 小时**。
    *   **模型合并（Task Arithmetic）**：作为对比方案，该方法仅需 **13.7 GPU 小时**（主要用于校准集微调）。
*   **背景说明**：文中提到 SOTA 模型（如 Qwen2.5-VL）的训练通常需要数千 GPU 小时，但作者自身的分析实验主要集中在对现有检查点的评估和轻量级微调上。

### 5. 实验数量与充分性
*   **实验规模**：
    *   对 18 个模型在 6 大能力维度上进行了详尽的准确率与稳定性对比。
    *   监控了 LLaVA-OV 训练过程中 20,000 个 Step 的性能演变。
    *   针对模型规模（0.5B 到 72B）、数据配比（减少 50% 结构化数据等）、视觉编码器（CLIP vs. SigLIP）进行了多组消融实验。
    *   测试了三种推理策略（CoT, Self-reflection, Self-consistency）对稳定性的影响。
*   **充分性评价**：实验设计非常系统且客观。通过跨阶段（训练到推理）和跨维度（数据、规模、策略）的分析，提供了多维度的证据支持，能够较好地排除单一变量的偶然性。

### 6. 论文的主要结论与发现
1.  **开源 vs. 闭源差距**：尽管开源模型在准确率上已追平甚至超越闭源模型，但在**稳定性**上仍存在显著差距。
2.  **能力冲突（Ability Conflict）**：在训练过程中，某项能力的提升往往伴随着另一项能力准确率和稳定性的剧烈下降（例如 OCR 与结构化数据理解之间的冲突）。
3.  **稳定性驱动因素**：
    *   **训练期**：主要受**数据混合比例**和 **LLM 参数规模**驱动。大模型通常比小模型更能抵抗能力冲突。
    *   **推理期**：**推理风格**（如 CoT）能显著调节稳定性，有时即使准确率提升不明显，稳定性也会改善。
4.  **缓解策略**：针对性的微调和模型合并（Task Arithmetic）可以部分缓解能力冲突，但无法完全消除多项能力间的并发冲突。

### 7. 优点
*   **视角新颖**：跳出了单纯追求准确率的“军备竞赛”，提出了“稳定性”这一关键但被长期忽视的评估维度。
*   **指标科学**：RES 和 DVS 指标互补，既考虑了相对排名也考虑了绝对表现的离散度。
*   **全生命周期覆盖**：不仅关注最终模型，还深入分析了训练动态，揭示了“能力冲突”这一重要现象。

### 8. 不足与局限
*   **领域覆盖**：研究主要集中在静态图像感知，未涵盖视频时序理解、3D 感知或复杂的交互式任务。
*   **能力局限**：未深入探讨逻辑推理、指令遵循等高阶认知能力的稳定性。
*   **指标局限**：稳定性指标主要衡量一致性，尚未涵盖模型校准（Calibration，即模型是否知道自己不知道）或在对抗扰动下的鲁棒性。
*   **模型池偏差**：虽然包含了 18 个模型，但对于闭源模型的内部训练细节（数据配比等）只能通过推测，无法像开源模型那样进行精确的受控实验。

（完）
