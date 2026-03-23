---
title: An explainable radiomics model based on multiparametric magnetic resonance for differentiating benign and malignant orbital tumors
title_zh: 一种基于多参数磁共振的可解释影像组学模型，用于鉴别良恶性眼眶肿瘤
authors: Unknown
date: Unknown
pdf: "https://scholar.google.com/scholar_url?url=https://link.springer.com/content/pdf/10.1186/s12885-026-15853-2_reference.pdf&hl=en&sa=X&d=7822657205755707395&ei=5KnAabDsJZGrieoP7rnduQU&scisig=ADi0EEVizgmWmeAO9hOZNGa1UN2_&oi=scholaralrt&hist=Sp41LysAAAAJ:15531832897179367293:ADi0EEUDoT6vhps5uSLRWdNxUK91&html=&pos=6&folt=rel"
tldr: 本研究旨在开发并验证一种基于多参数磁共振成像（MRI）的可解释影像组学模型，用于鉴别眼眶肿瘤的良恶性。通过对来自两个中心的147例患者数据进行回顾性分析，研究构建了结合影像组学特征与临床指标的综合模型。该研究的主要贡献在于提供了一种无创且具有解释性的辅助诊断工具，显著提升了眼眶肿瘤术前鉴别的准确性，为临床决策提供了科学依据。
motivation: 准确鉴别眼眶肿瘤的良恶性对临床治疗方案的制定至关重要，但传统影像学诊断往往存在主观性且准确率有待提高。
method: 回顾性分析了147例患者的多参数MRI影像数据，提取影像组学特征并构建了一个可解释的综合预测模型。
result: 该多参数影像组学模型在区分良性和恶性眼眶肿瘤方面表现出良好的预测性能和临床适用性。
conclusion: 基于多参数MRI的影像组学模型为眼眶肿瘤的术前无创鉴别诊断提供了一种有效的辅助手段。
---

## 摘要
目的：开发并内部验证一种用于鉴别良恶性眼眶肿瘤的多参数影像组学联合模型。患者与方法：本回顾性研究分析了来自两个中心的147名患者（2014年12月至……）。

## Abstract
Objective To develop and internally test a multiparametric radiomics combinedmodel for differentiating benign and malignant orbital tumors. Patients and MethodsThis retrospective study analyzed 147 patients from two centers (December 2014 to …

---

## 论文详细总结（自动生成）

这是一份关于论文《An explainable radiomics model based on multiparametric magnetic resonance for differentiating benign and malignant orbital tumors》（一种基于多参数磁共振的可解释影像组学模型，用于鉴别良恶性眼眶肿瘤）的结构化总结分析：

### 1. 论文的核心问题与整体含义
*   **研究背景**：眼眶肿瘤种类繁多（如海绵状血管瘤、淋巴瘤等），解剖结构复杂且与视觉系统紧密相连。准确区分良恶性对制定治疗方案（手术切除、放化疗或临床观察）至关重要。
*   **核心问题**：传统的影像诊断依赖放射科医生的主观经验，且不同肿瘤的影像特征存在重叠；有创活检则存在损伤视神经的风险。
*   **研究目的**：开发一种基于多参数 MRI（T2WI 和增强 T1WI）的非侵入性、可解释的影像组学模型，以提高术前鉴别眼眶肿瘤良恶性的准确性。

### 2. 方法论
*   **核心思想**：通过提取 MRI 图像中肉眼难以察觉的高维特征，利用机器学习算法构建预测模型，并引入 SHAP 解释工具提升模型的临床透明度。
*   **关键技术流程**：
    1.  **图像分割**：使用 ITK-SNAP 软件对 T2WI 和 CE T1WI 序列进行三维手动分割（ROI）。
    2.  **预处理**：包括强度截断（0.5th-99.5th 百分位）、1mm³ 各向同性重采样及灰度离散化。
    3.  **特征提取**：利用 PyRadiomics 提取 3668 个特征（含一阶、形状、纹理及小波变换特征）。
    4.  **特征筛选**：采用四步法：统计检验（t-test/U-test） -> 相关性分析（Pearson > 0.9 去冗余） -> mRMR（最大相关最小冗余） -> LASSO 回归确定最终特征。
    5.  **模型构建**：对比了逻辑回归（LR）、朴素贝叶斯（NaiveBayes）和多层感知机（MLP）。
    6.  **综合建模**：将最佳影像组学特征与临床因子（年龄、肿瘤直径）结合，构建列线图（Nomogram）。
    7.  **可解释性**：使用 SHAP（Shapley Additive Explanations）值量化各特征对预测结果的贡献。

### 3. 实验设计
*   **数据集**：回顾性分析了来自两个中心的 147 例病理确诊患者（82 例良性，65 例恶性）。
*   **数据划分**：按 7:3 比例随机分为训练集（n=102）和测试集（n=45）。
*   **Benchmark 与对比对象**：
    *   **序列对比**：T2WI 模型 vs. CE T1WI 模型 vs. 联合模型（CRM）。
    *   **算法对比**：LR vs. NaiveBayes vs. MLP。
    *   **综合对比**：临床模型 vs. 影像组学模型 vs. 结合两者的列线图模型。
*   **评价指标**：AUC、准确率（ACC）、灵敏度、特异性、DCA（决策曲线分析）、NRI（净重分类改进指数）和 IDI（综合判别改进指数）。

### 4. 资源与算力
*   **软件环境**：R 语言 (4.0.2)、Python (PyRadiomics 3.0.1)、ITK-SNAP (3.8.0)。
*   **算力说明**：文中**未明确提及**具体的 GPU 型号或训练时长。鉴于 MLP 模型规模较小（两层隐藏层，128/64 神经元），该实验在常规工作站或高性能笔记本电脑上即可完成。

### 5. 实验数量与充分性
*   **实验规模**：进行了多算法横向对比、多序列消融对比以及临床因子的增量价值分析。
*   **充分性评估**：
    *   **优点**：采用了 100 次重复随机抽样验证（Repeated random sub-sampling），有效降低了数据划分随机性带来的偏差；进行了观察者间一致性评价（ICC）。
    *   **不足**：虽然数据来自两个中心，但作者将数据合并后随机划分，**未进行严格的独立机构外部验证**，这在一定程度上削弱了结论的普适性。

### 6. 主要结论与发现
*   **最佳算法**：MLP（多层感知机）在所有机器学习算法中表现最优。
*   **模型性能**：联合模型（CRM）在测试集的 AUC 达到 0.860，优于单一序列模型。最终的列线图模型在训练集和测试集的 AUC 分别为 0.890 和 0.846。
*   **关键特征**：SHAP 分析显示，来自增强序列的特征（如 `wavelet_LLH_glcm_Correlation_CE T1WI`）对恶性肿瘤的预测贡献最大，反映了恶性肿瘤内部的高度异质性。
*   **临床价值**：列线图在 NRI 和 IDI 指标上表现出显著改进，证明加入临床因子能进一步优化诊断。

### 7. 优点
*   **多参数融合**：充分利用了 T2WI 的组织对比度和 CE T1WI 的血供强化特征。
*   **可解释性强**：通过 SHAP 散点图和力导向图，将“黑盒”模型转化为临床医生可理解的特征贡献分析。
*   **流程严谨**：特征筛选过程多重把关，并使用了重复抽样技术确保模型稳健。

### 8. 不足与局限
*   **缺乏外部验证**：未采用一个中心训练、另一个中心完全独立测试的模式，泛化能力有待验证。
*   **手动分割偏差**：ROI 依赖人工勾画，耗时且存在主观性，未来需引入自动分割技术。
*   **样本量限制**：147 例样本对于深度学习或复杂机器学习模型而言仍显不足，且病理类型分布不均（淋巴瘤占比偏高）。
*   **生物学解释局限**：虽然 SHAP 提供了数学上的解释，但影像特征与底层生物学机制（如基因表达）的直接联系仍需进一步研究。

（完）
