---
title: Prediction of p53 Expression in Intrahepatic Mass-forming Cholangiocarcinoma Using a Union Model Based on Intra-and Peritumoral MRI Radiomics
authors: Unknown
date: Unknown
pdf: "https://www.researchsquare.com/article/rs-9155751/latest.pdf"
tldr: 本研究旨在开发一种非侵入性预测肝内肿块型胆管癌（IMCC）中p53表达的模型。通过整合临床特征以及基于T2WI和DWI序列的瘤内与瘤周影像组学特征，构建了一个联合模型。研究结果表明，该模型在预测p53表达方面具有较高的准确性，为IMCC的术前评估和个体化治疗提供了重要的影像学参考。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在通过非侵入性影像学手段术前预测肝内肿块型胆管癌中p53的表达水平，以辅助临床决策。
method: 整合临床特征与基于T2WI和DWI序列的瘤内及瘤周影像组学特征，构建并验证了一个联合预测模型。
result: 联合模型在预测p53表达方面表现出良好的性能，优于单一的临床或影像组学模型。
conclusion: 基于瘤内和瘤周MRI影像组学的联合模型是预测IMCC中p53表达的有效工具，具有临床应用潜力。
---

## Abstract
Objective To develop and validate a Union Model integrating clinical features withradiomics signatures derived from intratumoral and peritumoral T2-weighted imaging(T2WI) and diffusion-weighted imaging (DWI) for the non-invasive prediction of p53 …

---

## 论文详细总结（自动生成）

这是一份关于论文《Prediction of p53 Expression in Intrahepatic Mass-forming Cholangiocarcinoma Using a Union Model Based on Intra- and Peritumoral MRI Radiomics》的结构化深入总结：

### 1. 核心问题与整体含义（研究动机和背景）
肝内肿块型胆管癌（IMCC）是一种侵袭性极强的恶性肿瘤，预后较差。**p53 蛋白的表达状态**（通常由 TP53 基因突变引起）是衡量其恶性程度、耐药性及预后的关键生物标志物。目前，p53 的检测依赖于有创的穿刺活检或手术病理免疫组化（IHC），具有滞后性和局部取样偏差。
本研究的核心问题是：**能否利用非侵入性的 MRI 影像组学技术，结合瘤内和瘤周的微环境信息，构建一个能够准确预测 IMCC 患者 p53 表达状态的模型**，从而辅助临床制定个体化治疗方案。

### 2. 方法论：核心思想与技术细节
研究采用回顾性多中心设计，核心思想是**“多序列融合+多尺度瘤周扩展+机器学习优化”**。
*   **图像分割与多尺度 ROI**：在 T2WI 和 DWI 序列上手动勾画瘤内区域（ROI），并利用算法向外自动扩展 3mm、5mm、10mm、15mm 和 20mm，以捕捉瘤周微环境（如淋巴细胞浸润、微血管侵犯）的信息。
*   **特征提取与筛选**：从每个 ROI 中提取了 6,539 个影像组学特征。通过三步筛选法：1) 低方差过滤；2) 高相关性过滤（Pearson > 0.98）；3) 统计学显著性测试（ANOVA F-test）结合随机森林（RF）重要性评分，最终保留 11 个核心特征。
*   **模型构建流程**：
    1.  **算法筛选**：对比了 LR、SVM、KNN、RF、Bayesian、XGBoost 和 LightGBM 七种算法，确定 **随机森林（RF）** 为最优分类器。
    2.  **单序列模型**：分别建立基于不同瘤周范围的 T2WI 和 DWI 模型。
    3.  **融合模型（Fusion Model）**：整合最优的 T2WI 和 DWI 影像组学特征。
    4.  **联合模型（Union Model）**：在融合模型基础上加入临床特征（如年龄、AFP、CEA、CA19-9、T2WI 肿瘤边缘、肝包膜凹陷）。
*   **可解释性**：引入 **SHAP (SHapley Additive exPlanations)** 值分析各特征对预测结果的贡献度。

### 3. 实验设计
*   **数据集**：来自四个医疗中心的 104 名 IMCC 患者。
    *   训练集：61 例。
    *   内部验证集：16 例。
    *   外部验证集：27 例（来自独立中心，用于评估泛化能力）。
*   **Benchmark 与对比**：
    *   对比了 12 个单序列模型（不同序列 × 不同瘤周范围）。
    *   对比了临床模型（Clinical）、影像组学融合模型（Fusion）与联合模型（Union）。
    *   评价指标：AUC（曲线下面积）、准确率、敏感性、特异性及混淆矩阵。

### 4. 资源与算力
*   **软件环境**：使用 Python 3.8.20、3D Slicer、ITK-SNAP 3.8.0。
*   **核心库**：PyRadiomics (v3.0.1)、Scikit-learn、OpenCV 等。
*   **算力说明**：文中**未明确提及**具体的 GPU 型号或训练时长。由于影像组学特征提取和机器学习模型（如随机森林）对算力要求远低于深度学习大模型，通常在常规工作站 CPU 上即可完成。

### 5. 实验数量与充分性
*   **实验组数**：研究进行了多维度的消融与对比实验，包括 7 种机器学习算法的横向对比、6 种不同瘤周范围（0-20mm）的纵向对比，以及临床/影像/联合模型的对比。
*   **充分性评价**：
    *   **优点**：包含了外部验证集，这在医学影像研究中是评估模型鲁棒性的“金标准”；使用了 ICC（组内相关系数）评估不同医生勾画 ROI 的一致性。
    *   **局限**：总样本量（n=104）相对较小，尤其是 p53 阴性样本较少，可能存在一定的过拟合风险或类别不平衡影响。

### 6. 主要结论与发现
*   **最优预测范围**：**瘤内结合瘤周 5mm (Peri-5mm)** 是预测 p53 状态的最佳范围。过大的范围（如 20mm）会引入过多正常肝实质噪声，降低预测效能。
*   **模型表现**：**Union Model（联合模型）** 表现最优。在训练集、内部验证集和外部验证集中的 AUC 分别达到 **0.992、0.945 和 0.825**。
*   **特征贡献**：SHAP 分析显示，DWI 序列的特征对预测 p53 阳性贡献最大，反映了 p53 突变与肿瘤细胞密度及扩散受限的密切关系。

### 7. 优点（亮点）
*   **系统性探索瘤周范围**：不同于以往研究随机选择瘤周范围，本研究系统对比了 0-20mm 的多个尺度，确定了 5mm 的科学性。
*   **多中心验证**：通过外部独立中心数据验证，证明了模型具有较好的通用性。
*   **临床实用性**：模型整合了易于获取的临床指标（如肿瘤标志物），提高了临床医生的接受度。

### 8. 不足与局限
*   **样本量限制**：104 例样本对于机器学习模型来说仍显单薄，可能限制了模型的深度挖掘能力。
*   **回顾性偏差**：作为回顾性研究，可能存在选择性偏差。
*   **影像序列局限**：仅使用了 T2WI 和 DWI 序列，未纳入增强 MRI（动态对比增强）或肝胆特异性造影剂序列，后者可能包含更多关于血供和肝细胞功能的信息。
*   **生物学验证**：未直接对比 TP53 基因测序结果，而是以 IHC 蛋白表达作为标准（虽然两者高度相关，但非完全等同）。

（完）
