---
title: "MIMIC-IV-Ext-PE: Pulmonary Embolism Labels for CT Pulmonary Angiography Radiology Reports}}"
title_zh: MIMIC-IV-Ext-PE：CT肺动脉造影放射学报告的肺栓塞标签
authors: Unknown
date: Unknown
pdf: "https://physionet.org/content/mimic-iv-ext-pe/"
tldr: 肺栓塞（PE）是导致住院患者死亡的主要原因之一，但目前缺乏大规模公开数据集。本研究推出了MIMIC-IV-Ext-PE数据集，为MIMIC-IV中的CT肺血管造影（CTPA）放射学报告提供了详细的肺栓塞标签。该数据集旨在通过提供高质量的标注数据，推动肺栓塞的自动诊断、风险分层及预防研究，为临床决策支持系统的开发奠定基础。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 肺栓塞是住院患者可预防死亡的主要原因，但研究其诊断与预防需要大规模的公开标注数据集。
method: 研究者通过对MIMIC-IV数据库中的CT肺血管造影报告进行标注，构建了名为MIMIC-IV-Ext-PE的扩展数据集。
result: 成功为大量的CTPA放射学报告提供了准确的肺栓塞相关标签。
conclusion: 该数据集的发布将有效促进肺栓塞自动诊断技术的发展，并助力改善患者的临床预后。
---

## 摘要
肺栓塞 (PE) 是院内可预防死亡的主要原因。诊断、风险分层和预防方面的进展可以改善预后。为了推动研究进展，需要大型公开数据集，但目前……

## Abstract
Pulmonary embolism (PE) is a leading cause of preventable in-hospital mortality.Advances in diagnosis, risk stratification, and prevention can improve outcomes.Large, publicly available datasets are needed to move research forward but are …

---

## 论文详细总结（自动生成）

这是一份关于论文《MIMIC-IV-Ext-PE: Pulmonary Embolism Labels for CT Pulmonary Angiography Radiology Reports》的深度结构化总结：

### 1. 研究动机与背景
*   **核心问题**：肺栓塞（PE）是住院患者中领先的可预防死因，但由于其症状（如心动过速、呼吸短促）缺乏特异性，诊断极具挑战。
*   **背景**：虽然机器学习在PE检测中展现出潜力，但领域内缺乏大规模、高质量且公开的标注数据集。现有的RSNA和INSPECT数据集虽有图像或部分数据，但未能充分利用MIMIC-IV这种包含丰富纵向电子健康记录（EHR）的多模态资源。
*   **研究目标**：为MIMIC-IV中的CT肺动脉造影（CTPA）报告提供专家级的PE标签，构建一个可链接至EHR、心电图、影像等多维数据的多模态科研基准。

### 2. 方法论
*   **核心思想**：结合正则表达式（RegEx）、自然语言处理（NLP）模型与双医生人工审核，对大规模放射学报告进行精准分类。
*   **关键流程**：
    1.  **报告识别**：利用RegEx从MIMIC-IV的230多万份报告中筛选出涉及CTPA的报告（n=19,942）。
    2.  **文本预处理**：提取包含PE关键词的句子（Snippets）。
    3.  **模型应用**：使用**VTE-BERT**（基于Bio_ClinicalBERT微调的Transformer模型）对提取的句子进行自动分类（阳性/阴性）。
    4.  **金标准构建（人工审核）**：两名医生对报告进行独立标注。标签分为五类：急性PE（Positive）、亚段PE（Subsegmental）、慢性PE（Chronic）、疑似/模糊（Equivocal）和无PE（Negative）。
    5.  **冲突解决**：两名医生对不一致的标注进行讨论，达成最终共识。

### 3. 实验设计
*   **数据集**：基于MIMIC-IV v3.1，最终确认了19,942份CTPA报告，涉及15,875名患者。
*   **Benchmark（基准对比）**：
    *   **人工标注**：作为“金标准”。
    *   **ICD诊断代码**：对比传统基于国际疾病分类代码的识别准确率。
    *   **VTE-BERT模型**：评估Transformer模型在处理此类医疗文本时的性能。
*   **评价指标**：灵敏度（Sensitivity）、特异性（Specificity）、阳性预测值（PPV）和阴性预测值（NPV）。

### 4. 资源与算力
*   **算力说明**：论文中**未明确提及**具体的GPU型号、数量或训练时长。
*   **软件环境**：提到使用了Python 3.11进行数据分析，且该项目得到了Google Cloud Research Credits计划的支持。

### 5. 实验数量与充分性
*   **实验规模**：对近2万份报告进行了全量人工审核，这在同类研究中属于大规模标注。
*   **充分性评价**：
    *   **一致性检验**：计算了Cohen’s kappa系数（k=0.82），证明了人工标注的高可靠性。
    *   **对比维度**：不仅对比了模型性能，还深入分析了ICD代码在不同临床场景（如急诊、住院）下的局限性。
    *   **细分分析**：专门针对“亚段PE”这一临床争议点进行了细分标注和分析。
    *   **整体评价**：实验设计客观、严谨，通过双盲审核机制最大程度减少了主观偏差。

### 6. 主要结论与发现
*   **数据集构成**：在19,942份报告中，识别出1,591份急性PE（含233份仅限亚段PE）。
*   **模型表现**：VTE-BERT表现优异，灵敏度为0.92，PPV为0.88。最常见的错误是将单纯的“慢性PE”误判为阳性。
*   **ICD代码局限性**：虽然ICD代码在住院患者中灵敏度较高（0.95），但PPV较低（0.84），且在识别“亚段PE”方面表现极差（仅能识别出2.4%的亚段病例）。
*   **数据价值**：该数据集通过`note_id`等标识符，可完美链接至MIMIC-IV的其他临床数据。

### 7. 优点与亮点
*   **多模态潜力**：该数据集最大的亮点是其扩展性，研究者可以将PE标签与患者的实验室检查、生命体征、甚至原始影像结合。
*   **高质量标注**：采用了双医生审核+冲突裁决的流程，提供了比单纯算法或ICD代码更可靠的“金标准”。
*   **临床深度**：区分了急性、慢性、亚段和模糊发现，这对于研究PE的过度诊断和临床决策具有重要意义。

### 8. 不足与局限
*   **单一影像手段**：研究仅关注CTPA报告，排除了通气灌注扫描（V/Q scans）等其他诊断手段，可能导致部分患者（如孕妇或造影剂过敏者）样本缺失。
*   **潜在偏差**：尽管采取了双盲措施，但医生在审核时仍可能受到VTE-BERT预分类结果的潜在心理暗示（尽管研究者已尽力规避）。
*   **临床闭环缺失**：标签仅基于放射学报告，未结合患者最终是否接受了抗凝治疗等临床实际处理结果。
*   **泛化性限制**：数据来源于单一医疗系统（Beth Israel Deaconess Medical Center），在其他机构的适用性仍需验证。

（完）
