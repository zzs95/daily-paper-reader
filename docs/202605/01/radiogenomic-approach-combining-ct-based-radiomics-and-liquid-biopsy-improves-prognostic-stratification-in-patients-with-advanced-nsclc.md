---
title: Radiogenomic Approach Combining CT-based Radiomics and Liquid Biopsy Improves Prognostic Stratification in Patients with Advanced NSCLC
title_zh: 结合基于CT的影像组学与液体活检的放射基因组学方法改善了晚期非小细胞肺癌患者的预后分层
authors: Unknown
date: Unknown
pdf: "https://www.sciencedirect.com/science/article/pii/S2950195426000160"
tldr: 本研究针对晚期非小细胞肺癌（NSCLC），提出了一种结合CT影像组学与循环肿瘤DNA（ctDNA）液体活检的放射基因组学方法。通过整合宏观影像特征与微观基因组数据，研究旨在提升患者的预后分层精度。结果表明，这种多模态整合方案在预测患者生存预后方面优于单一评估手段，为临床制定个体化治疗方案提供了更可靠的无创评估工具。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在通过结合影像组学和液体活检这两种微创手段，提升晚期非小细胞肺癌患者预后评估的准确性。
method: 整合了基于CT扫描的影像组学特征与循环肿瘤DNA（ctDNA）分析，构建了一种放射基因组学综合评估模型。
result: 研究发现，结合影像组学与ctDNA的整合模型在晚期NSCLC患者的预后分层中表现出显著优于单一手段的效能。
conclusion: 影像组学与液体活检的联合应用为晚期NSCLC提供了一种更精准的无创预后预测方案，具有重要的临床应用价值。
---

## 摘要
背景：影像组学和液体活检是评估实体瘤疾病特征的微创方法。我们整合了计算机断层扫描（CT）影像组学和循环肿瘤DNA（ctDNA）分析，以增强……

## Abstract
Background Radiomics and liquid biopsy represent minimally invasive approachesto assess disease characteristics in solid tumors. We integrated computedtomography (CT) radiomics and circulating tumor DNA (ctDNA) analysis to enhance …

---

## 论文详细总结（自动生成）

这是一份关于论文《Radiogenomic approach combining CT-based radiomics and liquid biopsy improves prognostic stratification in patients with advanced NSCLC》的深度结构化总结：

### 1. 核心问题与研究背景
*   **核心问题**：如何通过整合**CT影像组学（Radiomics）**与**液体活检（Liquid Biopsy/ctDNA）**，克服传统组织活检在空间和时间上的局限性，从而更精准地对晚期非小细胞肺癌（NSCLC）患者进行预后分层和治疗监测。
*   **研究背景**：晚期NSCLC具有高度异质性。虽然液体活检和影像组学各自展现了潜力，但前者在低肿瘤负荷下敏感度受限，后者则面临可重复性挑战。研究者试图通过“放射基因组学（Radiogenomics）”这一多模态方法，提供更全面的肿瘤生物学评估。

### 2. 方法论与核心技术
*   **核心思想**：将宏观的CT影像特征与微观的循环肿瘤DNA（ctDNA）突变信息相结合，构建多维度的预后预测模型。
*   **关键技术细节**：
    *   **影像组学流程**：使用深度学习（nnU-Net模型）对CT图像中的肺部病灶进行自动分割，随后利用PyRadiomics提取定量特征。通过LASSO回归进行特征筛选，计算**影像组学评分（Radiomic Score, RS）**。
    *   **液体活检流程**：利用NGS（二代测序）技术分析血浆中的cfDNA。在基线期评估ctDNA与组织样本的突变一致性，并在治疗期间进行纵向监测（VAF，变异等位基因频率的变化）。
    *   **整合模型**：利用Cox比例风险回归模型，将临床指标（如吸烟史、脑转移）、影像组学评分（RS）和基因突变状态（是否有可行动突变）整合在一起。

### 3. 实验设计与对比
*   **数据集**：一项前瞻性、单中心研究，纳入了91名晚期非鳞状NSCLC患者（2019-2023年）。
*   **对比基准（Benchmark）**：
    *   **临床模型**：仅包含年龄、性别、吸烟史、分期等传统指标。
    *   **影像组学模型**：仅基于CT提取的RS评分。
    *   **整合模型**：临床+影像组学、临床+影像组学+基因组学。
*   **评估指标**：总生存期（OS）和无进展生存期（DFS），使用C-index（一致性指数）衡量预测准确度。

### 4. 资源与算力
*   **算力说明**：论文提到使用了**nnU-Net模型**进行自动分割，这通常涉及GPU加速训练，但文中**未明确说明**具体的GPU型号、数量或训练时长。
*   **软件工具**：使用了PyRadiomics v2.2.0进行特征提取，Ion Reporter和AVENIO软件进行基因数据分析。

### 5. 实验数量与充分性
*   **实验规模**：
    *   对91名患者进行了基线分析。
    *   对67名患者进行了组织与液体活检的一致性对比。
    *   对25名EGFR突变亚组进行了深入分析。
    *   对21名接受靶向治疗的患者进行了纵向随访监测。
*   **充分性评价**：实验设计涵盖了从诊断一致性到预后预测，再到治疗监测的全流程。使用了交叉验证（Cross-validation）来确保模型的稳健性。虽然样本量对于深度学习而言较小，但作为一项前瞻性临床研究，其数据质量和实验维度较为充分。

### 6. 主要结论与发现
*   **一致性**：液体活检与组织活检在检测*EGFR*（91%）和*KRAS*（99%）突变方面具有极高的一致性。
*   **预后价值**：
    *   **OS预测**：整合模型（C-index: 0.73）显著优于纯临床模型（C-index: 0.62）。
    *   **DFS预测**：临床+影像组学模型（C-index: 0.77）优于纯临床模型（C-index: 0.59）。
*   **EGFR亚组**：在EGFR突变患者中，基线ctDNA阳性预示着更高的进展风险；结合特定影像特征后，预测DFS的C-index达到了0.80。
*   **动态监测**：ctDNA的清除（Negativization）或VAF下降与靶向治疗的早期分子反应密切相关。

### 7. 优点与亮点
*   **多模态整合**：成功证明了影像组学特征包含传统临床和分子标记物无法捕捉的生物学信息。
*   **前瞻性设计**：相比回顾性研究，前瞻性收集的数据减少了选择偏倚，提高了结果的可信度。
*   **自动化流程**：引入深度学习自动分割算法，提高了影像分析的效率和一致性。

### 8. 不足与局限
*   **样本量限制**：91例的总样本量以及特定突变亚组（如EGFR）的样本量较小，限制了结论的普适性。
*   **单中心研究**：缺乏外部独立数据集的验证，模型在不同机构、不同CT设备间的泛化能力有待考察。
*   **技术瓶颈**：液体活检在检测融合基因（如ALK, ROS1）方面敏感度仍低于组织活检。
*   **复杂性**：影像组学特征的生物学解释性仍是一个挑战，且临床转化需要标准化的基础设施。

（完）
