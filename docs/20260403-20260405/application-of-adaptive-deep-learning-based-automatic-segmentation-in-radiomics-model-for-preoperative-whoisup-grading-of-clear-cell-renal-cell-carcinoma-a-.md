---
title: "Application of adaptive deep learning-based automatic segmentation in radiomics model for preoperative WHO/ISUP grading of clear cell renal cell carcinoma: a …"
title_zh: 基于自适应深度学习的自动分割在透明细胞肾细胞癌术前 WHO/ISUP 分级影像组学模型中的应用：一项……
authors: Unknown
date: Unknown
pdf: "https://peerj.com/articles/21022/"
tldr: 本研究旨在评估不同肿瘤区域分割方法在构建透明细胞肾细胞癌（ccRCC）WHO/ISUP分级预测模型中的表现。通过引入基于自适应深度学习的自动分割技术，研究对比了其与传统方法在放射组学建模中的差异。结果表明，该自动化方法能有效提高术前分级预测的效率与准确性，为临床决策提供可靠的影像学支持。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 探讨不同肿瘤区域分割方法对构建透明细胞肾细胞癌术前WHO/ISUP分级预测模型性能的影响。
method: 对比分析了基于自适应深度学习的自动分割技术与传统分割方法在放射组学模型中的应用效果。
result: 评估并验证了自适应深度学习自动分割在提升ccRCC病理分级预测模型准确性方面的有效性。
conclusion: 自适应深度学习自动分割技术是构建ccRCC术前分级预测模型的可靠工具，具有较高的临床应用价值。
---

## 摘要
目的：评估在构建透明细胞肾细胞癌世界卫生组织/国际泌尿病理学会（WHO/ISUP）分级预测模型中，不同肿瘤感兴趣区分割方法的有效性……

## Abstract
Aim To evaluate the effectiveness of different methods for segmenting tumor regionsof interest in building prediction models for the World Health Organization/International Society of Urological Pathology (WHO/ISUP) grade of clear cell renal …

---

## 论文详细总结（自动生成）

这是一份关于论文《Application of adaptive deep learning-based automatic segmentation in radiomics model for preoperative WHO/ISUP grading of clear cell renal cell carcinoma: a retrospective comparative study with manual segmentation》的结构化分析报告：

### 1. 论文的核心问题与整体含义
*   **研究背景**：透明细胞肾细胞癌（ccRCC）是最常见的肾癌类型。其 WHO/ISUP 病理分级（I-IV级）是评估恶性程度和预后的关键指标。目前术前评估依赖有创活检（存在异质性偏差）或影像组学分析。
*   **核心问题**：传统的影像组学工作流依赖放射科医生手动分割肿瘤区域（ROI），这既耗时又具有主观性。本研究旨在探讨：**基于深度学习的自适应自动分割技术（nnU-Net）能否在保证 ccRCC 术前分级预测准确性的同时，替代人工分割并优化临床工作流？**

### 2. 论文提出的方法论
*   **核心思想**：利用自适应深度学习框架 nnU-Net 实现肿瘤自动分割，并将其生成的特征与人工分割生成的特征进行对比，构建基于机器学习的分级预测模型。
*   **关键技术细节**：
    *   **自动分割**：采用 **nnU-Net** 框架，其核心是 **3D U-Net** 架构。该框架能根据数据集特征自动调整预处理（如 Hounsfield 单位裁剪、归一化）、网络结构和训练策略。
    *   **影像组学流程**：
        1.  **特征提取**：使用 Pyradiomics 提取 1,834 个特征（一阶、形状、纹理等）。
        2.  **特征筛选**：通过 Mann-Whitney U 检验、Spearman 相关系数消除冗余，最后利用 **LASSO 回归**确定最优特征子集。
        3.  **模型构建**：采用支持向量机（**SVM**）和 K-最近邻（**KNN**）算法构建分类模型（低级别 I-II vs. 高级别 III-IV）。
*   **算法流程**：CT 图像输入 -> nnU-Net 自动分割/人工分割 -> 特征提取与降维 -> 机器学习分类器 -> 性能评估（ROC、校准曲线、决策曲线）。

### 3. 实验设计
*   **数据集**：回顾性分析了 405 名 ccRCC 患者的术前增强 CT 图像（皮质髓质期）。
    *   **训练集**：324 例；**测试集**：81 例。
*   **Benchmark（基准）**：由两名分别具有 8 年和 10 年经验的放射科医生进行的手动分割结果。
*   **对比方法**：
    *   **分割性能对比**：计算 Dice 相似系数（DSC）并对比分割耗时。
    *   **预测模型对比**：对比了四种模型：AutoSeg-SVM、AutoSeg-KNN、ManualLabel-SVM、ManualLabel-KNN。

### 4. 资源与算力
*   **算力说明**：论文提到使用了在 KiTS19 公开数据集上预训练的 nnU-Net 模型，并将其直接应用于本研究数据。
*   **具体细节**：文中**未明确说明**具体的 GPU 型号、显存大小或在本研究数据集上的具体推理/微调时长。

### 5. 实验数量与充分性
*   **实验规模**：总样本量 405 例，在放射组学研究中属于中等偏上规模。
*   **充分性评估**：
    *   **多维度评估**：不仅对比了分割精度（Dice），还对比了时间效率、模型预测力（AUC）、校准度和临床净获益（DCA）。
    *   **统计学严谨性**：使用了 DeLong 检验对比 AUC 差异，并进行了特征提取的重测信度分析（ICC）。
    *   **客观性**：通过 10 折交叉验证进行参数调整，并在独立的测试集上验证，有效防止了数据泄露。

### 6. 论文的主要结论与发现
*   **分割效能**：nnU-Net 的平均 Dice 系数为 **0.842**，表现出良好的分割精度。
*   **效率提升**：自动分割平均耗时 **1.29 分钟/例**，显著低于人工分割的 **7.07 分钟/例**（P < 0.01）。
*   **预测性能**：**AutoSeg-SVM 模型表现最优**，在测试集中的 AUC 达到 **0.865**，优于人工分割模型（AUC 0.817），但 DeLong 检验显示两者差异无统计学意义（P = 0.431）。
*   **结论**：自动分割在 ccRCC 术前分级预测中具有与人工分割相当甚至更优的诊断效能，且效率更高，具备替代人工分割的潜力。

### 7. 优点与亮点
*   **临床实用性强**：研究重点不在于单纯追求分割精度，而在于验证自动分割对“下游临床决策任务”（分级预测）的影响。
*   **自适应性**：采用 nnU-Net 避免了繁琐的人工调参，增强了模型在不同医疗中心推广的可能性。
*   **多模型对比**：通过 SVM 和 KNN 的对比，证明了分类器选择对最终结果的影响，增加了结论的可靠性。

### 8. 不足与局限
*   **单中心研究**：数据来源于单一医疗机构，缺乏多中心外部验证，泛化性有待进一步确认。
*   **影像相位单一**：仅使用了皮质髓质期图像，未探讨静脉期或排泄期图像是否能提供补充信息。
*   **统计效能限制**：作者自评在测试集上检测 AUC 微小差异的统计效能（Power）仅为 11%，这意味着可能存在未被发现的性能差异。
*   **范围局限**：分割仅限于肿瘤区域，未包含肾周脂肪等可能影响分级的微环境特征。

（完）
