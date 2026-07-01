---
title: nnU-Net-based whole-coronary pericoronary adipose tissue radiomics combined with clinical factors for predicting coronary plaque development in individuals with …
title_zh: 基于 nnU-Net 的全冠状动脉周脂肪组织影像组学结合临床因素预测个体冠状动脉斑块进展……
authors: Unknown
date: Unknown
pdf: "https://link.springer.com/content/pdf/10.1186/s40001-026-04772-4_reference.pdf"
tldr: 本研究针对冠状动脉疾病早期预测的难题，提出了一种基于nnU-Net的自动化分析方法。通过提取全冠状动脉周脂肪（PCAT）的影像组学特征，并将其与临床因素相结合，构建了斑块发育预测模型。研究结果表明，该多模态方法能显著提升预测准确性，为临床早期干预和风险分层提供了重要的影像学依据。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在解决冠状动脉疾病早期预测困难的问题，探索更精准的风险评估手段。
method: 采用nnU-Net对全冠状动脉周脂肪进行自动分割，并结合影像组学特征与临床因素构建综合预测模型。
result: 研究发现全冠状动脉PCAT影像组学特征与临床因素的结合能有效预测冠状动脉斑块的进展。
conclusion: 基于深度学习的全冠状动脉PCAT影像组学分析是预测冠状动脉斑块发育的有效手段，具有临床应用潜力。
---

## 摘要
背景：冠状动脉疾病的有效早期预测仍具有挑战性。本研究旨在探讨利用 nnU-Net 从全冠状动脉树提取的冠状动脉周脂肪组织（PCAT）影像组学特征是否……

## Abstract
Background Effective early prediction of coronary artery disease remainschallenging. This study aims to investigate whether radiomic features of pericoronaryadipose tissue (PCAT) derived from the whole-coronary tree using nnU-Net …

---

## 论文详细总结（自动生成）

这是一份关于论文《nnU-Net-based whole-coronary pericoronary adipose tissue radiomics combined with clinical factors for predicting coronary plaque development in individuals with normal coronary arteries》的结构化深入总结：

### 1. 论文的核心问题与整体含义
*   **研究动机**：冠状动脉疾病（CAD）的早期预测和干预对于改善患者预后至关重要。虽然临床风险因素（如年龄、血压等）和冠状动脉周脂肪组织（PCAT）的常规指标（如 FAI 和 FV）已被证明与血管炎症相关，但它们在预测**基线正常**的个体未来是否会长出斑块方面表现有限。
*   **核心问题**：如何利用深度学习自动化技术，通过分析全冠状动脉树的 PCAT 影像组学特征，提高对初始正常冠状动脉个体未来斑块发育的预测准确性。

### 2. 论文提出的方法论
*   **核心思想**：结合深度学习自动分割技术（nnU-Net）与高通量影像组学分析，构建一个融合临床因素、常规 PCAT 指标和全冠状动脉影像组学特征的多模态预测模型。
*   **关键技术流程**：
    1.  **自动分割**：基于 **nnU-Net v2** 框架构建 3D 全分辨率 U-Net 架构，对 CCTA 图像中的全冠状动脉树进行自动分割。
    2.  **ROI 提取**：以血管直径为半径向外扩展提取 PCAT 区域（CT 值范围 -190 至 -30 HU）。
    3.  **特征提取**：使用 PyRadiomics 提取 1,561 个影像组学特征（包括形状、一阶和纹理特征）。
    4.  **特征筛选**：通过 Pearson 相关系数（|r| ≥ 0.90）、SelectKBest 和 LASSO 回归进行三步降维，最终保留 20 个关键影像组学特征。
    5.  **模型构建**：使用逻辑回归（LR）构建五个模型：临床模型、PCAT 模型、临床-PCAT 模型、影像组学模型、以及三者结合的**联合模型**。
    6.  **可解释性**：引入 **SHAP (SHapley Additive exPlanation)** 框架，量化各特征对预测结果的贡献度。

### 3. 实验设计
*   **数据集**：
    *   **分割模型**：使用 ImageCAS 数据库（86 例）进行训练和内部验证，另有 26 例外部验证数据。
    *   **预测模型**：回顾性纳入 210 名基线 CCTA 正常且有随访记录的患者（来自两家中心），其中 77 人在随访中发育出斑块（阳性），133 人未发育（阴性）。
*   **Benchmark 与对比方法**：
    *   以单一的临床因素模型和常规 PCAT 指标（LAD/LCx/RCA 的 FAI 和 FV）模型作为基准。
    *   对比了不同组合下的五个逻辑回归模型。
*   **评价指标**：AUC、敏感性（SEN）、特异性（SPE）、准确率（ACC）、F1 分数、校准曲线（CC）和决策曲线分析（DCA）。

### 4. 资源与算力
*   **软件环境**：Python 3.6.5，使用了 nnU-Net v2 框架、PyRadiomics、scikit-learn、XGBoost 和 SHAP 库。
*   **硬件说明**：文中**未明确说明**具体的 GPU 型号、数量及训练时长。但提到使用了 3D 全分辨率 U-Net 架构，这通常需要具备较高显存（如 11GB 以上）的专业级 GPU。

### 5. 实验数量与充分性
*   **实验规模**：
    *   分割模型进行了 5 折交叉验证。
    *   预测模型按 7:3 比例随机分为训练集（n=147）和验证集（n=63）。
*   **充分性评价**：实验设计较为客观。研究不仅对比了模型性能，还通过校准曲线验证了预测概率与实际发生率的一致性，通过 DCA 验证了临床净获益。使用了外部验证集（虽然样本量较小，n=26）来测试分割模型的泛化能力，增加了结果的可信度。

### 6. 论文的主要结论与发现
*   **预测效能**：联合模型表现最优，训练集 AUC 为 **0.931**，验证集 AUC 为 **0.896**。
*   **关键特征**：SHAP 分析显示，LAD-FAI、RCA-FAI、影像组学特征（如 wavelet-LHH_firstorder_Median）和年龄是预测斑块发育的关键因素。
*   **影像组学的价值**：全冠状动脉影像组学模型（AUC 0.870）显著优于单纯的临床模型（AUC 0.605）和 PCAT 指标模型（AUC 0.767）。
*   **自动化潜力**：基于 nnU-Net 的自动分割在外部验证集上达到了 0.862 的 Dice 系数，证明了全自动分析流程的可行性。

### 7. 优点与亮点
*   **全冠状动脉分析**：不同于以往仅关注近端血管的研究，本研究分析了全冠状动脉树的 PCAT，能更全面地捕捉系统性炎症负担。
*   **高度自动化**：利用 nnU-Net 实现了端到端的自动分割，解决了手动勾画 PCAT 耗时且重复性差的痛点。
*   **模型可解释性**：通过 SHAP 动力图和瀑布图，将复杂的黑盒模型转化为临床医生可理解的个体化风险评分，具有较强的临床指导意义。

### 8. 不足与局限
*   **样本量与分布**：总样本量（210例）相对较小，且两家中心的数据比例严重失衡（195 vs 15），导致无法进行真正意义上的独立外部验证。
*   **回顾性设计**：随访间隔不统一（8.52–51.36个月），且逻辑回归模型未考虑时间因素（如右删失数据），可能存在时间偏倚。
*   **技术限制**：影像组学特征对扫描参数（如管电压、层厚）较为敏感，不同设备间的特征稳定性仍需进一步验证。
*   **模型选择**：虽然逻辑回归易于解释，但可能无法捕捉特征间的非线性复杂关系，未来可探索更先进的机器学习或深度学习分类器。

（完）
