---
title: "Teresa: Uncertainty-Aware Generalizable Chest X-ray Report Generation and Disease Classification"
title_zh: Teresa：不确定性感知的可泛化胸部 X 射线报告生成与疾病分类
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026W/DG-EBF/papers/Ullah_Teresa_Uncertainty-Aware_Generalizable_Chest_X-ray_Report_Generation_and_Disease_Classification_CVPRW_2026_paper.pdf"
tldr: 针对胸部X射线报告生成中存在的疾病标签不精确和医学不确定性挑战，本文提出了Teresa框架。该框架通过引入不确定性感知机制，旨在提升模型在不同临床环境下的泛化能力，同时实现高精度的疾病分类与报告生成。研究通过建模影像中的不确定性，显著提高了生成报告的临床准确性，为减轻放射科医生工作压力并提升临床效率提供了有效的技术支撑。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 解决医学报告生成中因疾病标注不准和固有不确定性导致的报告质量与泛化性差的问题。
method: 提出一种名为Teresa的不确定性感知框架，通过建模不确定性来优化疾病分类与报告生成任务。
result: 实验证明该方法在生成准确报告的同时，显著提升了疾病分类的性能和跨场景的泛化能力。
conclusion: Teresa框架通过有效处理医学不确定性，为构建可靠且通用的自动化医疗诊断系统奠定了基础。
---

## 摘要
医学报告生成 (MRG) 对于减轻放射科医生的工作量和提高临床效率至关重要。然而，由于需要精确的疾病标注以及在……中的不确定性，生成准确的报告仍然具有挑战性。

## Abstract
Medical report generation (MRG) is vital for reducing workload of radiologists andimproving clinical efficiency. However, generating accurate reports remainschallenging due to the need for precise disease labeling and the uncertainty in …

---

## 论文详细总结（自动生成）

以下是对论文《Teresa: Uncertainty-Aware Generalizable Chest X-ray Report Generation and Disease Classification》的结构化深入总结：

### 1. 核心问题与整体含义
医学报告生成（MRG）旨在通过自动化手段减轻放射科医生的负担。然而，现有的 MRG 模型面临两大挑战：
*   **标注不确定性**：医学影像解读具有主观性，训练标签（如由 CheXbert 提取的标签）常包含“不确定”类别，简单地将其视为正例、负例或独立类别都会引入噪声，降低模型可靠性。
*   **泛化能力差**：模型在特定数据集上表现良好，但在跨医院、跨设备的临床场景下性能往往大幅下降。

**Teresa** 的核心目标是通过系统性地处理样本级的不确定性，并结合对比学习与正则化手段，提升报告生成的准确性与跨域泛化能力。

### 2. 方法论核心思想
Teresa 采用“编码器-解码器”架构，并引入了专门的分类分支来引导文本生成。其关键技术包括：
*   **确定性增强模块 (CEM)**：
    *   **Aether Positive Codex (APC)**：从训练集中提取确诊为阳性的样本作为“锚点”，通过预训练的 ResNet-18 提取特征。
    *   **Aether Certainty Codex (ACC)**：利用孪生网络架构，计算不确定样本与 APC 锚点之间的余弦相似度。根据预设阈值（如 $\ge 0.6$ 为阳性，$\le 0.4$ 为阴性），将模糊标签重新分配为确定的标签，从而净化监督信号。
*   **分类分支 (CB)**：使用 ResNet-101 作为图像编码器，引入 **Focal Loss** 解决类别不平衡问题（强调罕见疾病），并结合 **监督对比学习 (Supervised Contrastive Loss)** 增强特征表示，使同类疾病特征更聚集。
*   **语言模型 (LM) 与 KL 散度正则化**：
    *   将分类结果转化为文本 Prompt（如 POS, NEG, UNC）引导解码器。
    *   引入 **KL 散度** 作为正则化项，最小化模型输出分布与均匀先验分布之间的差异，确保文本生成的鲁棒性。

### 3. 实验设计
*   **数据集**：
    *   **MIMIC-CXR**：大规模数据集，用于模型训练和内部测试。
    *   **IU X-Ray**：较小规模数据集，用于**直接跨域测试**（不进行微调），以验证模型的泛化性。
*   **Benchmark 与对比方法**：
    *   对比了 R2Gen, KNOWMAT, CVT2Dis, METransformer, 以及最新的 **PromptMRG** (2024)。
    *   还与医疗大模型（如 Med-PaLM M, ME-LLaMA）在临床事实准确性（F1-RadGraph）上进行了对比。
*   **评价指标**：临床有效性指标（Precision, Recall, F1）和自然语言生成指标（BLEU, METEOR, ROUGE-L）。

### 4. 资源与算力
*   **硬件**：使用了一台 **NVIDIA A6000 GPU**。
*   **训练配置**：Batch size 为 16，训练 10 个 epoch。
*   **优化器**：AdamW，初始学习率为 $5 \times 10^{-5}$，采用余弦退火调度。

### 5. 实验数量与充分性
*   **实验规模**：在两个主流数据集上进行了详尽测试，包含数千个测试样本。
*   **消融实验**：系统地验证了 APC、对比学习、Focal Loss 和 KL 正则化对性能的增量贡献。
*   **定性分析**：通过 t-SNE 可视化展示了 CEM 模块消除不确定性的效果，并通过热图展示了特征对齐的改进。
*   **充分性评价**：实验设计较为全面，特别是跨数据集的“零样本”泛化测试，有力地证明了模型在实际临床应用中的潜力。

### 6. 主要结论与发现
*   **性能领先**：Teresa 在 MIMIC-CXR 和 IU X-Ray 上均达到了 SOTA 水平。在 IU X-Ray 的跨域测试中，F1 分数比基准模型提升了 16.1%，BLEU-4 提升了 45.9%。
*   **不确定性处理的有效性**：通过 CEM 模块将模糊标签转化为确定标签，能显著提升分类分支的准确度，进而通过更准确的 Prompt 引导生成更高质量的报告。
*   **优于大模型**：在特定任务上，Teresa 的临床事实准确性优于通用的医疗大语言模型（如 Med-PaLM M）。

### 7. 优点（亮点）
*   **首创性**：据论文所述，这是首个系统性处理 MRG 中标签不确定性的工作。
*   **泛化性强**：无需针对新数据集微调即可获得优异表现，具有极高的临床实用价值。
*   **多任务协同**：巧妙地将疾病分类（诊断）与报告生成（描述）结合，利用诊断结果作为 Prompt 增强了文本的逻辑一致性。

### 8. 不足与局限
*   **阈值敏感性**：CEM 模块中的相似度阈值（0.6 和 0.4）是人为设定的，不同数据集或疾病类别可能需要不同的最优阈值。
*   **计算开销**：虽然推理速度未详细说明，但在训练阶段需要维护 APC 锚点并进行频繁的相似度计算，增加了训练复杂度。
*   **语言多样性限制**：虽然临床准确性高，但基于 Prompt 的生成方式可能会限制报告在修辞和表达上的多样性（尽管在医学场景下准确性比多样性更重要）。

（完）
