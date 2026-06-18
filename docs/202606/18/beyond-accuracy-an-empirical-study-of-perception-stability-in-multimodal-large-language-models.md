---
title: "Beyond Accuracy: An Empirical Study of Perception Stability in Multimodal Large Language Models"
title_zh: 超越准确率：多模态大语言模型感知稳定性的实证研究
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026F/papers/Chen_Beyond_Accuracy_An_Empirical_Study_of_Perception_Stability_in_Multimodal_CVPRF_2026_paper.pdf"
tldr: 本研究针对多模态大语言模型（MLLM）在评估中过度关注准确率而忽视稳定性的问题，开展了感知稳定性的实证研究。通过分析模型在不同任务、领域及评估因子下的表现波动，揭示了现有模型在感知一致性方面的局限，为提升多模态系统的鲁棒性提供了重要参考。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 当前对多模态大语言模型的评估过于依赖准确率指标，忽视了模型在不同任务和环境下的感知稳定性。
method: 通过在多种任务、领域和评估因子下进行大规模实证研究，系统性地衡量MLLM的感知稳定性。
result: 研究发现现有MLLM在感知稳定性方面表现参差不齐，即使是高准确率模型在特定因素干扰下也会出现显著波动。
conclusion: 感知稳定性是评价MLLM性能的重要维度，未来的模型开发需更加注重在复杂多变场景下的表现一致性。
---

## 摘要
最近的多模态大语言模型（MLLMs）主要通过报告在一系列基准测试上的准确率来进行比较，而较少关注其性能在不同任务、领域和评估因素之间的稳定性。

## Abstract
Recent multimodal large language models (MLLMs) are predominantly compared byreporting accuracy on a collection of benchmarks, while paying much less attentionto how stable their performance is across tasks, domains, and evaluation factors …

---

## 论文详细总结（自动生成）

这是一份关于论文《Beyond Accuracy: An Empirical Study of Perception Stability in Multimodal Large Language Models》的结构化分析报告：

### 1. 论文的核心问题与整体含义（研究动机和背景）
*   **核心问题**：当前多模态大语言模型（MLLM）的评估过度依赖**聚合准确率（Aggregate Accuracy）**，而忽视了**感知稳定性（Perception Stability）**。
*   **研究动机**：作者发现，即使两个模型在总分上接近，它们在不同任务、领域或评估条件下的表现可能存在剧烈波动（例如在 A 榜单表现最好，在 B 榜单表现最差）。这种不一致性在现实应用中是危险的。
*   **整体含义**：论文旨在系统性地定义、衡量并分析 MLLM 的感知稳定性，探讨其在预训练、微调及推理阶段的演变规律，并揭示开源模型与闭源模型在稳定性上的显著差距。

### 2. 论文提出的方法论
*   **核心思想**：将感知能力细化，并引入统计学指标来量化模型在不同子任务间表现的一致性。
*   **能力分解**：将 11 个主流感知基准测试分解为 6 种核心能力：计数（Counting）、OCR、属性识别（Attribute）、实体提取（Entity）、定位（Grounding）和结构化数据理解（Structured Data）。
*   **关键技术细节与指标**：
    *   **得分修正**：针对不同题型（判断、单选、问答）的随机猜测率（Chance Baseline）进行归一化处理，使不同任务的得分具有可比性。
    *   **RES（秩熵稳定性，Rank-Entropy Score）**：基于香农熵衡量模型在不同子任务中排名位置的波动性。RES 越低，排名越稳定。
    *   **DVS（离散方差稳定性，Dispersion-based Variance Stability）**：通过计算模型在各子任务上 Z-score（标准分数）的标准差，衡量模型相对于群体平均水平的离散程度。DVS 越低，表现越均衡。

### 3. 实验设计
*   **数据集/基准**：整合了 MME, MMBench, SeedBench, MuirBench, Mirb, MMStar, OCRBench, SynthDog, ChartQA, AI2D 和 ConBench 共 11 个基准，构建了一个包含 1.2 万个样本的平衡评估集。
*   **对比方法**：评估了 18 个主流 MLLM，包括：
    *   **闭源模型**：GPT-4V, GPT-4o, Claude-3.5-Sonnet。
    *   **开源模型**：LLaVA 系列（1.5, 1.6, OV, Video）、Qwen2-VL 系列、Qwen2.5-VL 系列、InternVL 系列。
*   **实验场景**：涵盖了多阶段训练动态监控、不同模型规模对比、不同数据配比实验以及推理策略（CoT, 自我反思等）的影响分析。

### 4. 资源与算力
*   **文中提及**：论文提到了 Qwen2.5-VL 等 SOTA 模型的训练需要数千 GPU 小时。
*   **具体实验算力**：
    *   作者在进行“持续微调”实验时消耗了 **665.6 GPU 小时**。
    *   使用“任务算术（Task Arithmetic）”模型融合方法时消耗了 **13.7 GPU 小时**。
*   **未明确说明**：文中未详细列出具体使用的 GPU 型号（如 A100 或 H100）及总集群规模，但从训练步数（20,000 step）和模型参数（最高 72B）来看，实验依赖于大规模计算资源。

### 5. 实验数量与充分性
*   **实验规模**：
    *   对 18 个模型在 6 维能力上进行了全面横向评测。
    *   对 LLaVA-OV-SI 进行了全生命周期的训练动态监控（每隔一定 step 采样评估）。
    *   针对数据配比、视觉编码器（CLIP vs SigLIP）、语言模型骨干（Qwen2, Phi3.5, Gemma2）做了多组消融实验。
*   **充分性与公平性**：实验覆盖了从 0.5B 到 72B 的参数梯度，且通过子采样解决了原始基准测试中样本分布不均的问题。引入了随机基准修正，确保了不同题型评估的公平性。整体实验设计严谨，统计学意义较强。

### 6. 主要结论与发现
1.  **稳定性鸿沟**：开源模型虽然在准确率上已追平甚至超越闭源模型，但在稳定性（RES/DVS）上仍存在显著差距。
2.  **能力冲突（Ability Conflict）**：在训练过程中，某些能力的提升往往伴随着另一种能力准确率和稳定性的剧烈下降（例如 OCR 能力在训练后期可能因其他数据的加入而崩溃）。
3.  **规模效应**：增大 LLM 骨干规模能显著减少能力冲突，提高稳定性，但这种提升在不同能力间是不均匀的。
4.  **推理调节**：推理策略（如 Self-Consistency）对稳定性的影响大于对准确率的影响，能够有效减少模型在特定任务上的“失常”。

### 7. 优点
*   **视角新颖**：跳出了单纯追求 Accuracy 的怪圈，首次系统性地定义并量化了 MLLM 的“感知稳定性”。
*   **工具实用**：开源了 `AbilityLens` 工具，能够帮助开发者监控训练过程中的能力冲突，避免盲目优化。
*   **分析深入**：不仅提出了问题，还从数据配比、模型规模、推理风格等多个维度探讨了不稳定的根源。

### 8. 不足与局限
*   **覆盖范围限制**：研究主要集中在静态图像感知，未深入探讨视频理解、3D 感知以及复杂的指令遵循能力。
*   **指标维度**：RES 和 DVS 虽然捕捉了波动，但尚未涵盖模型校准度（Calibration，即模型是否知道自己不知道）和对抗扰动下的鲁棒性。
*   **冲突解决方案有限**：虽然提出了模型融合等缓解策略，但如何彻底根治多目标优化中的“能力冲突”仍是一个未解决的开放问题。

（完）
