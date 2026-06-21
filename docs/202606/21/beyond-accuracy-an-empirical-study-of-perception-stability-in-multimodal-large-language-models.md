---
title: "Beyond Accuracy: An Empirical Study of Perception Stability in Multimodal Large Language Models"
title_zh: 超越准确率：多模态大语言模型感知稳定性的实证研究
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026F/papers/Chen_Beyond_Accuracy_An_Empirical_Study_of_Perception_Stability_in_Multimodal_CVPRF_2026_paper.pdf"
tldr: 本研究针对多模态大语言模型（MLLM）在评估中过度关注准确率而忽视稳定性这一现状，开展了深入的实证研究。通过在不同任务、领域和评估因子下测试模型的感知稳定性，揭示了现有模型在性能一致性方面的不足。该研究不仅填补了MLLM稳定性评估的空白，还为构建更可靠的多模态系统提供了重要参考。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 当前对多模态大语言模型的评估主要集中在准确率指标上，缺乏对其在不同任务和环境下性能稳定性的深入探讨。
method: 通过在多种任务、领域和评估因子下进行大规模实证研究，系统性地衡量和分析了主流MLLM的感知稳定性。
result: 实验发现，即使是准确率较高的模型，在面对不同评估因素时也表现出显著的性能波动，揭示了感知稳定性的普遍缺失。
conclusion: 研究强调了在准确率之外引入稳定性评估的重要性，为未来开发更稳健、可靠的多模态大模型指明了方向。
---

## 摘要
最近的多模态大语言模型（MLLMs）主要通过在一系列基准测试上报告准确率来进行比较，而对其在不同任务、领域和评估因素下的性能稳定性关注较少。

## Abstract
Recent multimodal large language models (MLLMs) are predominantly compared byreporting accuracy on a collection of benchmarks, while paying much less attentionto how stable their performance is across tasks, domains, and evaluation factors …

---

## 论文详细总结（自动生成）

这篇论文《Beyond Accuracy: An Empirical Study of Perception Stability in Multimodal Large Language Models》对多模态大语言模型（MLLM）的感知稳定性进行了系统性的实证研究，旨在探讨准确率之外的关键性能维度。

### 1. 论文的核心问题与整体含义
*   **研究动机**：当前的 MLLM 评估过度依赖**聚合准确率（Aggregate Accuracy）**，这往往掩盖了模型在不同任务、领域和评估条件下的表现不一致性。例如，一个模型在某个基准测试中表现优异，但在另一个测试的相同能力项上可能表现极差。
*   **核心问题**：论文旨在定义并量化“感知稳定性（Perception Stability）”，分析其在预训练、微调和推理阶段的演变规律，并揭示开源模型与闭源模型之间存在的稳定性差距。

### 2. 论文提出的方法论
*   **核心思想**：将感知能力解构为细粒度维度，并引入两个互补的稳定性度量指标，以捕捉模型在异构子任务中的排名波动和性能离散度。
*   **能力解构**：将 11 个感知基准测试分解为 6 种核心能力：计数（Counting）、OCR、属性识别（Attribute）、实体提取（Entity）、定位（Grounding）和结构化数据理解（Structured Data）。
*   **关键指标**：
    *   **分数对齐**：通过公式 $\tilde{m}_{ij} = \frac{m_{ij} - BL_j}{UB_j - BL_j}$ 将不同题型（如判断题、选择题）的随机基准（BL）和上限（UB）进行归一化。
    *   **秩熵稳定性（RES）**：基于模型在各子任务中的排名分布计算香农熵，衡量模型排名的波动性。
    *   **离散度稳定性（DVS）**：计算模型在各子任务中 Z-score 的标准差，衡量模型相对于群体平均水平的性能离散程度。

### 3. 实验设计
*   **数据集与基准**：整合了 11 个主流感知基准（如 MME, MMBench, SeedBench, OCRBench, ChartQA 等），构建了一个包含 1.2 万个样本的平衡评估集。
*   **对比方法**：评估了 18 个主流 MLLM，包括：
    *   **闭源模型**：GPT-4V, GPT-4o, Claude-3.5-Sonnet。
    *   **开源模型**：LLaVA 系列（1.5, 1.6, OV, Video）、Qwen2-VL 系列、Qwen2.5-VL 系列、InternVL 系列。
*   **推理策略**：对比了 Baseline、思维链（CoT）、自我反思（Self-reflection）和自我一致性（Self-consistency）对稳定性的影响。

### 4. 资源与算力
*   **算力提及**：文中提到了部分训练细节。例如，在进行持续微调实验时，使用了 LLaVA-OV 的训练配置。
*   **具体数值**：
    *   持续微调（Continuous Fine-tuning）耗费了约 **665.6 GPU 小时**。
    *   模型合并（Task Arithmetic）耗费了约 **13.7 GPU 小时**。
    *   未明确说明具体的 GPU 型号（推测为 A100 或 H100 集群），但强调了当前 SOTA 模型训练通常需要数千 GPU 小时。

### 5. 实验数量与充分性
*   **实验规模**：涵盖了从 0.5B 到 72B 不同参数规模的模型，跨越了预训练、后训练（微调）和推理三个阶段。
*   **充分性**：
    *   **多维度分析**：不仅有横向的模型对比，还有纵向的训练动态监控（每隔一定 step 评估一次）。
    *   **消融实验**：针对数据混合比例、模型规模、视觉编码器类型（CLIP vs SigLIP）进行了消融研究。
    *   **客观性**：通过对齐随机基准线，消除了不同题型对得分的干扰，评估过程较为公正。

### 6. 论文的主要结论与发现
*   **开源 vs 闭源差距**：尽管开源模型在准确率上已追平闭源模型，但在稳定性上仍有显著差距。
*   **能力冲突（Ability Conflict）**：在训练过程中，某项能力的提升往往伴随着另一项能力准确率和稳定性的剧烈下降（如 OCR 与结构化数据理解之间的冲突）。
*   **稳定性驱动因素**：
    *   **训练期**：主要受数据混合比例和 LLM 规模驱动，大模型通常更稳定。
    *   **推理期**：推理风格（如 CoT）能显著调节稳定性，有时即使准确率提升不大，一致性也会增强。
*   **缓解策略**：模型合并（Model Merging）在缓解单项能力冲突方面比持续微调更有效，但解决多项并发冲突仍是难题。

### 7. 优点
*   **视角新颖**：跳出了单纯追求准确率的“刷榜”思维，关注模型在实际应用中更重要的“一致性”特质。
*   **工具化贡献**：提出了 AbilityLens 框架和 RES/DVS 指标，为未来的 MLLM 评估提供了更科学的度量衡。
*   **深度诊断**：通过监控训练动态，揭示了“能力冲突”这一被忽视的训练现象，具有很强的工程指导意义。

### 8. 不足与局限
*   **能力覆盖有限**：主要集中在感知能力，未深入探讨逻辑推理、指令遵循或多轮对话中的稳定性。
*   **模态局限**：实验主要基于静态图像，未扩展到视频、3D 或交互式多模态场景。
*   **指标局限**：RES 和 DVS 捕捉的是相对波动，未能涵盖模型校准度（Calibration）或在极端扰动下的鲁棒性。
*   **模型池限制**：虽然包含了 18 个模型，但对于某些特定规模（如中等规模）的检查点密度不足，难以绘制完美的缩放定律曲线。

（完）
