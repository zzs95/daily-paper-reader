---
title: "Toward a Biopsy-Free Diagnosis of Prostate Cancer: Potential of Combined 18F-Flotufolastat PSMA PET and mpMRI"
title_zh: 迈向无活检的前列腺癌诊断：18F-Flotufolastat PSMA PET 与 mpMRI 联合应用的潜力
authors: Unknown
date: Unknown
pdf: "https://jnm.snmjournals.org/content/early/2026/07/02/jnumed.125.271916.abstract"
tldr: 本研究通过回顾性分析，评估了 18F-flotufolastat PSMA PET 与多参数核磁共振（mpMRI）联合成像在检测临床显著性前列腺癌（csPCa）中的诊断效能。研究旨在探索一种非侵入性的诊断方案，以减少对传统活检的依赖。结果表明该联合技术具有极高的诊断潜力，为未来实现前列腺癌的“无活检”精准诊断提供了重要依据。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在探讨 18F-flotufolastat PSMA PET 结合 mpMRI 在无需活检的情况下诊断临床显著性前列腺癌的潜力。
method: 采用回顾性分析方法，评估 18F-flotufolastat PET/MRI 联合成像对临床显著性前列腺癌的检测性能。
result: 研究分析了该联合影像技术在识别临床显著性前列腺癌患者比例方面的诊断表现。
conclusion: 18F-flotufolastat PSMA PET 与 mpMRI 的结合为实现前列腺癌的无活检诊断提供了有力支持。
---

## 摘要
这项回顾性分析旨在评估 18F-flotufolastat PET/MRI 在检测临床显著性前列腺癌 (csPCa) 中的诊断性能。本研究的主要目标是评估患者的比例……

## Abstract
This retrospective analysis aimed to evaluate the diagnostic performance of 18 F-flotufolastat PET/MRI for the detection of clinically significant prostate cancer(csPCa). The primary objective of the study was to assess the proportion of patients …

---

## 论文详细总结（自动生成）

这篇论文发表于《核医学杂志》（Journal of Nuclear Medicine），探讨了利用先进的影像学手段实现前列腺癌“无活检”诊断的可能性。以下是对该研究的结构化总结：

### 1. 研究动机与背景
*   **核心问题**：传统的前列腺癌诊断依赖于侵入性的穿刺活检，这不仅给患者带来痛苦，还存在感染、出血等风险。
*   **研究背景**：多参数磁共振成像（mpMRI）和前列腺特异性膜抗原（PSMA）PET成像是目前最先进的检测手段。研究旨在探索将 18F-Flotufolastat（一种新型 PSMA 示踪剂）PET 与 mpMRI 结合，是否能提供足够的诊断准确性，从而在部分患者中安全地省去活检步骤。

### 2. 方法论
*   **核心思想**：通过整合 mpMRI 的解剖/功能评分（PI-RADS）与 PET 的定量代谢指标（SUVmax），对临床显著性前列腺癌（csPCa）进行多维度评估。
*   **关键技术细节**：
    *   **影像融合**：使用 18F-flotufolastat PET/MRI 一体化成像。
    *   **定量分析**：提取病灶的 SUVmax（最大标准摄取值）和 PI-RADS 评分。
    *   **分层策略**：
        *   **高阈值策略**：设定高 SUVmax 阈值（>10.0）以追求极高的特异性，识别可直接进入治疗的患者。
        *   **低阈值策略**：设定低 SUVmax 阈值（>4.5）以保证敏感性，识别可安全排除癌症的患者。
    *   **统计模型**：采用受试者工作特征曲线（ROC）分析和逻辑回归评估诊断效能。

### 3. 实验设计
*   **数据集**：79 名 PSA 水平升高（>4 ng/mL）且疑似患有前列腺癌的患者。
*   **金标准（Benchmark）**：活检或前列腺切除术后的**组织病理学结果**（ISUP 分级分组 ≥ 2 定义为 csPCa）。
*   **对比方法**：
    *   单独使用 PI-RADS 评分。
    *   单独使用 SUVmax 指标。
    *   PI-RADS 与 SUVmax 联合诊断。

### 4. 资源与算力
*   **算力说明**：文中未明确提及具体的 GPU 型号或计算时长。此类临床研究通常侧重于影像处理工作站和统计软件（如 SPSS 或 R）的应用，而非大规模深度学习训练。

### 5. 实验数量与充分性
*   **实验规模**：分析了 79 例病例，其中 42 例确诊为 csPCa，37 例排除。
*   **充分性评价**：
    *   作为一项回顾性初步研究，样本量相对较小。
    *   实验设计包含了 ROC 曲线对比和不同阈值的敏感性/特异性分析，逻辑严密。
    *   **局限性**：缺乏外部验证集，且回顾性设计可能存在选择性偏差。

### 6. 主要结论与发现
*   **效能提升**：联合诊断的 AUC（87.1%）优于单独 mpMRI（75.2%）或单独 PET（80.7%），尽管统计学差异在小样本下未达显著水平，但趋势明显。
*   **高特异性**：当 SUVmax > 10.0 时，PSMA PET 的特异性达到 **100%**，这意味着这部分患者几乎可以确定患有 csPCa。
*   **活检规避潜力**：
    *   28% 的患者因极高风险可直接治疗。
    *   29% 的患者因极低风险可安全观察。
    *   **总体而言，该研究模型理论上可帮助 57% 的患者避免不必要的活检。**
*   **三分类模型**：建议将患者分为“高风险（直接治疗）”、“低风险（无需活检）”和“不确定（仍需活检）”三组。

### 7. 优点
*   **临床意义重大**：直接切入“无活检诊断”这一前沿且极具争议的临床痛点。
*   **新型示踪剂应用**：展示了 18F-flotufolastat 这一新型示踪剂在原发灶诊断中的优异性能。
*   **实用性强**：提出的三分类管理路径为临床医生提供了清晰的决策参考。

### 8. 不足与局限
*   **样本量限制**：79 例样本不足以改变目前的临床指南，需大规模多中心前瞻性研究证实。
*   **偏差风险**：回顾性研究可能无法完全模拟真实临床筛查环境中的人群分布。
*   **成本考虑**：PET/MRI 检查费用昂贵，其作为普筛或替代活检手段的经济学效益尚待评估。
*   **技术可及性**：一体化 PET/MRI 设备在全球范围内的普及程度远低于单独的 MRI 或 PET/CT。

（完）
