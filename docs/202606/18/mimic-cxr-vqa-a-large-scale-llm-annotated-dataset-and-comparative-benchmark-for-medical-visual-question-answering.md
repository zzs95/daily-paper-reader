---
title: "MIMIC-CXR-VQA: A Large-Scale LLM-Annotated Dataset and Comparative Benchmark for Medical Visual Question Answering"
title_zh: MIMIC-CXR-VQA：一个用于医学视觉问答的大规模 LLM 标注数据集与对比基准
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026W/CV4Clinic2026/papers/Aas-Alas_MIMIC-CXR-VQA_A_Large-Scale_LLM-Annotated_Dataset_and_Comparative_Benchmark_for_Medical_CVPRW_2026_paper.pdf"
tldr: 本研究针对临床放射科中胸部X射线（CXR）解释耗时且专家资源有限的问题，提出了MIMIC-CXR-VQA数据集。这是一个利用大语言模型（LLM）进行标注的大规模医学视觉问答数据集，并构建了相应的对比基准。该工作为自动化医学影像分析提供了重要资源，旨在提升医疗诊断的效率和准确性。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 临床放射科中胸部X射线影像的解读任务繁重且极度依赖稀缺的专家资源。
method: 利用大语言模型（LLM）对大规模胸部X射线影像进行自动标注，构建了MIMIC-CXR-VQA数据集。
result: 成功建立了一个大规模的医学视觉问答数据集及相关的性能评估基准。
conclusion: 该数据集和基准为医学视觉问答领域提供了高质量的训练资源，有助于推动自动化放射影像诊断技术的发展。
---

## 摘要
胸部 X 射线（CXR）的解读是临床放射学中一项关键且耗时的任务，通常受限于专业放射科医生的短缺。为了应对这一挑战，我们引入了一个新的大规模医学视觉问答（VQA）数据集……

## Abstract
The interpretation of chest X-rays (CXRs) is a critical yet time-consuming task inclinical radiology, often limited by the availability of expert radiologists. To addressthis challenge, we introduce a new large-scale medical Visual Question Answering …

---

## 论文详细总结（自动生成）

这篇论文介绍了一个名为 **MIMIC-CXR-VQA** 的大规模医学视觉问答（VQA）数据集及其基准测试。以下是对该论文的结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **核心问题**：胸部 X 射线（CXR）的解读极度依赖放射科专家，且现有的医学 VQA 数据集规模较小（如 VQA-RAD、SLAKE）或语言表达过于机械、模板化（如 Medical-Diff-VQA），无法模拟真实的临床推理过程。
*   **研究动机**：利用大语言模型（LLM）的生成能力，从现有的放射学报告中提取并生成具有语言多样性、临床准确性且证据充分的问答对，以训练能够辅助放射科医生处理复杂诊断问题的多模态模型。

### 2. 论文提出的方法论
*   **核心思想**：基于 MIMIC-CXR 数据库，通过“结构化标签引导+多级提示词工程+LLM 自动生成”的流水线构建大规模数据集。
*   **关键技术细节**：
    *   **问题生成**：利用 CheXpert 标注的 14 个类别加上新增的“心脏（heart）”类别，为每个类别设计 6 类问题。通过引入 NaN 标签（未提及即为阴性）来平衡正负样本分布。
    *   **答案生成（5 级提示词策略）**：为了确保答案的临床忠实度并消除幻觉，设计了五个级别的 Prompt 约束：1. 任务定义；2. 严格基于证据；3. 禁止对比历史报告（针对单图 VQA）；4. 术语规范；5. 中立客观描述。
    *   **模型选择**：对比了 Meditron、LLaMA 3.1、Qwen 3、DeepSeek-R1 等模型，最终选用 **DeepSeek-R1 (8B)** 进行全量数据生成。
    *   **验证机制**：采用人类专家与 LLM 评测器（Verifier）相结合的方式，通过 Fleiss’ κ 和 Gwet’s AC1/AC2 指标验证生成质量。

### 3. 实验设计
*   **数据集**：基于 MIMIC-CXR，包含 **3,247,512 个问答对**，涵盖 15 个临床相关类别。
*   **Benchmark 与对比方法**：
    *   **Cycle-VQA**：一种强调问题-答案循环一致性的框架。
    *   **BLIP-2-MultiView**：基于 BLIP-2 架构，针对胸片多视角（AP/PA/侧位）进行了适配。
    *   **SwinVED-SCST（本文基线）**：采用 Swin Transformer 作为视觉编码器，并引入 **自我批判序列训练（SCST）** 强化学习算法，以 BERTScore 作为奖励函数优化生成效果。
*   **评估指标**：BLEU-1~4, METEOR, ROUGE-L, CIDEr, 以及 BERTScore。

### 4. 资源与算力
*   **硬件环境**：实验使用了单块 **NVIDIA RTX 4090 (24GB)** 显卡。
*   **耗时**：
    *   **数据生成**：使用 DeepSeek-R1 (8B) 量化版生成全量 320 万问答对耗时约 **8 天**。
    *   **训练**：基线模型在单卡上完成训练，显示了该方法在消费级显卡上的可行性。

### 5. 实验数量与充分性
*   **实验规模**：
    *   **消融实验**：对 5 种模型在 5 个 Prompt 级别下进行了 20 组组合测试，每组评估 500 个样本（共 10,000 个）。
    *   **验证实验**：对 33,130 个 QA 对进行了大规模自动验证，并由 3 名人类审核员对 100 个样本进行金标准校准。
*   **充分性评价**：实验设计非常充分。不仅对比了不同架构的模型，还深入探讨了 Prompt 工程对医学文本生成质量的影响，验证过程客观且引入了多种统计学一致性指标。

### 6. 主要结论与发现
*   **LLM 标注的有效性**：DeepSeek-R1 等推理型 LLM 在遵循复杂临床指令方面表现优异，生成的答案在正确性、一致性和临床相关性上均达到极高水平（>95%）。
*   **强化学习的作用**：引入 SCST 强化学习阶段显著提升了模型的语义对齐能力，SwinVED-SCST 在多数指标上优于 BLIP-2 和 Cycle-VQA。
*   **语言多样性**：相比于传统的模板化数据集，本数据集能显著提升模型处理自然语言描述的能力，而非简单的分类任务。

### 7. 优点
*   **规模巨大**：320 万 QA 对是目前医学 VQA 领域最大的数据集之一。
*   **临床忠实度高**：通过多级 Prompt 严格限制了 LLM 的幻觉，确保答案完全基于放射学报告。
*   **双重平衡**：在病理类别和正/负诊断结果上都做了均衡处理，避免了模型产生预测偏见。
*   **开源贡献**：公开了数据集生成代码和基准模型，具有很强的社区推动作用。

### 8. 不足与局限
*   **单图限制**：为了简化任务，Prompt 强制去除了历史影像对比信息，但在实际临床中，对比历史影像对诊断至关重要。
*   **模型参数量**：基线模型（如 8B 参数）虽然在消费级显卡上运行良好，但对于更复杂的医学推理，可能仍需更大规模的视觉语言模型（VLM）。
*   **偏差风险**：尽管经过了验证，但数据集本质上仍依赖于原始 MIMIC-CXR 报告的质量，若原始报告存在漏诊，生成的数据也会继承这些偏差。

（完）
