---
title: "Combined radiomics, PI-RADS, and clinical model improve significant prostate cancer prediction and guide biopsy decision"
title_zh: 结合影像组学、PI-RADS 及临床模型提高显著性前列腺癌的预测准确性并指导活检决策
authors: Unknown
date: Unknown
pdf: "https://link.springer.com/article/10.1186/s13244-026-02295-4"
tldr: 本研究旨在开发并验证一种基于MRI影像组学的预测模型，用于识别显著性前列腺癌（sPCa）。通过整合影像组学特征、PI-RADS评分及临床指标，研究构建了一个综合预测模型。结果表明，该模型在预测sPCa方面优于单一的PI-RADS评分，能更有效地辅助临床活检决策，减少不必要的穿刺，具有重要的临床应用价值。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在提高显著性前列腺癌的诊断准确性，并优化临床活检决策以减少不必要的穿刺。
method: 开发并验证了一种结合MRI影像组学特征、PI-RADS评分及临床因素的综合预测模型。
result: 研究发现综合模型在区分显著性前列腺癌方面的预测效能显著优于传统的PI-RADS评分。
conclusion: 结合影像组学与临床指标的综合模型能有效提升sPCa的预测精度，并为前列腺活检决策提供更科学的指导。
---

## 摘要
目的：本研究旨在开发并验证一种基于 MRI 影像组学的预测模型，用于鉴别显著性前列腺癌 (sPCa)，将其与 PI-RADS 进行比较，并确定整合 PI-RADS 及其他临床……

## Abstract
Objectives The aim of this study was to develop and validate an MRI radiomics-based predictive model to discriminate significant prostate cancer (sPCa), compare itwith PI-RADS, and determine whether incorporating PI-RADS and other clinical …

---

## 论文详细总结（自动生成）

这是一份关于论文《Combined radiomics, PI-RADS, and clinical model improve significant prostate cancer prediction and guide biopsy decision》的结构化深入总结：

### 1. 论文的核心问题与整体含义
*   **研究动机**：前列腺癌（PCa）是男性常见的恶性肿瘤。目前临床主要依赖多参数磁共振成像（mpMRI）及 PI-RADS 评分进行风险评估。然而，PI-RADS 存在明显的局限性：读者间主观差异大、假阳性率高（尤其是 PI-RADS 3 分病变），导致大量不必要的活检和对惰性前列腺癌（iPCa）的过度诊断。
*   **核心目标**：开发并验证一种结合影像组学（Radiomics）、PI-RADS 评分和临床变量的综合预测模型，旨在提高对显著性前列腺癌（sPCa，定义为 Gleason 等级 ≥ 7）的识别精度，从而优化活检决策，减少不必要的穿刺。

### 2. 论文提出的方法论
*   **核心思想**：通过自动化软件提取前列腺全腺体的客观影像特征，并将其与放射科医生的主观评分及患者的临床指标（如 PSA、年龄等）进行机器学习融合。
*   **关键技术细节**：
    *   **图像处理**：使用 QP-Prostate® 软件自动分割外周带、移行带和精囊。
    *   **特征提取**：从 T2、DWI（b-1400）和 ADC 序列中提取了 1379 个手工影像组学特征（Handcrafted features），每个病例共获得 8274 个特征。
    *   **模型构建**：测试了多种分类器，最终选用**随机森林（Random Forest）**算法。
    *   **模型组合**：构建了四个递进模型：
        1.  **PIR**：仅基于 PI-RADS 评分。
        2.  **RAD**：仅基于影像组学特征。
        3.  **PIR_RAD**：结合 PI-RADS 和影像组学。
        4.  **RAD_PIR_CLIN**：结合影像组学、PI-RADS 及 7 项临床变量（年龄、PSA、前列腺体积、DRE 结果、既往活检史、家族史等）。
    *   **可解释性**：引入 **SHAP (SHapley Additive exPlanations)** 分析，量化各变量对预测结果的贡献度。

### 3. 实验设计
*   **数据集**：来自西班牙 Vall Hebron 医院的单中心回顾性队列，包含 1395 名男性的 1497 例 MRI 案例（2015-2022 年）。
*   **Benchmark（基准）**：以病理活检结果（系统活检 + 靶向活检）为金标准。
*   **对比方法**：将影像组学模型、PI-RADS 评分模型以及不同组合模型进行两两对比。
*   **评价指标**：AUC（曲线下面积）、灵敏度、特异性、决策曲线分析（DCA）和临床效用曲线（CUC）。

### 4. 资源与算力
*   **软件平台**：使用了 Quibim 公司的 QP-Prostate®（用于自动分割）和 QP-Insights®（用于特征提取），统计分析使用 R 语言（4.5.0 版本）。
*   **算力说明**：论文**未明确说明**具体的硬件配置（如 GPU 型号、数量）或模型训练的具体时长。由于使用的是手工影像组学特征和随机森林算法（非深度学习端到端训练），其对算力的需求通常远低于深度卷积神经网络。

### 5. 实验数量与充分性
*   **样本规模**：1497 例样本在影像组学研究中属于**较大规模**，增强了结果的统计效力。
*   **实验分组**：采用了 80% 训练集和 20% 测试集的随机划分，并进行了详细的消融实验（逐步加入影像组学和临床变量）。
*   **客观性评价**：实验遵循了 STARD（诊断准确性研究报告标准）和 CLAIM（医学影像 AI 检查表）指南，评估了模型在固定灵敏度（97.4%）下的活检规避率，具有较强的临床参考价值。

### 6. 论文的主要结论与发现
*   **性能表现**：
    *   单纯影像组学模型（AUC 0.838）与单纯 PI-RADS 模型（AUC 0.833）性能相当（*p* = 0.874）。
    *   **综合模型（RAD_PIR_CLIN）表现最优**，AUC 达到 **0.891**，显著优于其他所有模型（*p* < 0.05）。
*   **临床意义**：在保持极高灵敏度（不漏诊 sPCa）的前提下，综合模型可实现 29.41% 的特异性和 18.15% 的活检规避率。
*   **关键特征**：SHAP 分析显示，PI-RADS 评分、年龄和前列腺体积是贡献最大的预测因子。

### 7. 优点
*   **自动化程度高**：采用自动分割技术，减少了人工勾画病灶带来的主观偏差和工作量。
*   **多模态融合**：成功证明了将“医生经验（PI-RADS）+ 机器特征（影像组学）+ 患者背景（临床变量）”三者结合的优越性。
*   **临床落地导向**：通过 DCA 和 CUC 曲线分析了模型在实际临床决策中的净获益，而非仅仅停留在数学指标上。

### 8. 不足与局限
*   **单中心局限**：数据来自单一中心和单一厂商设备，模型的泛化能力（跨医院、跨机器）尚未得到验证。
*   **缺乏外部验证**：由于难以获取外部队列的完整临床变量，本研究未进行外部独立验证。
*   **技术代差**：研究使用的是手工影像组学特征，而非目前前沿的深度影像组学（Deep Radiomics），后者在处理复杂图像模式上可能更具潜力。
*   **回顾性偏倚**：作为回顾性研究，可能存在选择性偏倚，未来需前瞻性研究证实其临床价值。

（完）
