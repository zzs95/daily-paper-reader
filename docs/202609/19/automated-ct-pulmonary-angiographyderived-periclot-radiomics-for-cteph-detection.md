---
title: Automated CT Pulmonary Angiography‐Derived Periclot Radiomics for CTEPH Detection
title_zh: 自动化CT肺动脉造影衍生的血栓周围放射组学用于CTEPH检测
authors: Unknown
date: Unknown
pdf: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13551595/"
tldr: CTEPH常被漏诊，且在常规CTPA上难以与急性肺栓塞及无肺血栓栓塞患者区分。研究提出基于CTPA的血栓周围（periclot）影像组学特征，并构建全自动机器学习流程用于CTEPH检测，核心是利用血栓周围区域而非单一血栓特征。该工作将影像组学与自动化分割/特征提取结合，评估其在临床鉴别中的可行性。摘要未报告具体性能，但为CTEPH的无创识别提供了新思路。
source: google_scholar_email
selection_source: fresh_fetch
motivation: CTEPH易漏诊，常规CTPA难与急性PE及无肺血栓栓塞者区分，亟需自动化无创鉴别工具。
method: 开发并评估全自动CTPA机器学习流程，提取血栓周围（periclot）影像组学特征用于CTEPH检测。
result: 研究评估了自动化流程，摘要未报告AUC/敏感度等具体数值，提示其具备CTEPH检测潜力。
conclusion: 该自动化periclot影像组学方法有望辅助CTEPH的无创检出与鉴别，仍需外部验证。
---

## 摘要
摘要 CTEPH仍诊断不足，并且在常规CTPA上可能难以与急性PE以及无肺血栓栓塞的患者相鉴别。我们开发并评估了一种全自动的基于CTPA的机器学习……

## Abstract
ABSTRACT CTEPH remains underdiagnosed and can be difficult to differentiate onroutine CTPA from acute PE and from patients without pulmonary thromboembolism.We developed and evaluated a fully automated CTPA‐based machine learning …

---

## 论文详细总结（自动生成）

## 1. 核心问题与整体含义

- **临床痛点**：CTEPH 是罕见但可致命、且部分可经肺内膜剥脱术治愈的肺高血压类型；但早期症状非特异，常与急性 PE、其他 PH 亚型重叠，导致漏诊、误诊和延迟治疗。
- **影像鉴别难点**：常规 CTPA 是疑似急性 PE 的首选检查，也是机会性识别慢性血栓的窗口；但 CTEPH 的远端微血管改变、亚毫米血管重塑和慢性血栓机化在视觉评估中细微且易与急性 PE、PAH 重叠。
- **病理学假设**：慢性血栓会经历机化、纤维化和血管壁重塑，除管腔内血栓外，血栓周围组织（periclot region）可能携带区分“慢性 vs 急性”的微结构异质性信号。
- **整体含义**：研究旨在开发并评估一种全自动 CTPA 机器学习流程，联合血管血容量指标、血栓特征和血栓周围放射组学特征，用于区分 CTEPH、无肺血栓栓塞对照和急性 PE，探索无创、可扩展的 CTEPH 辅助识别工具。

## 2. 方法论

- **核心思想**：从常规 CTPA 中自动分割肺内血管，沿血管轴采样横截面 patch，利用深度学习估计血栓和血管参数，再提取管腔、血栓及 periclot 区域的放射组学特征，结合血容量指标，用 XGBoost 做受试者级分类。
- **七阶段流程**：
  - 尺度空间粒子检测分割肺内血管树。
  - 沿血管轴提取标准化 32×32 像素横截面 patch。
  - 深度网络估计血管半径、血栓概率和血栓面积；方法正文重点描述用于血栓存在分类和血栓面积回归的两个共享双路径 CNN。
  - 从血管管腔、检测到的血栓和 10×10×10 体素 periclot 立方区域提取放射组学特征。
  - 计算血容量指标：BV1、BV5、BV5-20、TBV，并按总肺容积归一化。
  - 汇总为受试者级特征向量。
  - 使用 XGBoost 分类，并用 SHAP 做可解释性分析。
- **关键细节**：
  - 仅保留估计 CSA 3–50 mm² 的肺内血管用于血栓检测和放射组学；<3 mm² 接近分辨率极限，>50 mm² 更偏近端且视觉评估较可靠。
  - CNN 训练数据为合成 32×32 血管 patch：先构建高分辨率几何血管模型并嵌入模拟血栓，再重采样、PSF 模糊、加噪；约 80% patch 含血栓，闭塞程度 30%–80%，总生成量超过 700 万 patch。
  - CNN 使用双路径卷积结构、Adam 优化、dropout、early stopping；推理时保留预测血栓概率 ≥0.80 的 patch。
  - 放射组学特征包括管腔衰减、血栓面积百分比、periclot 衰减；受试者级聚合采用均值、标准差、偏度、峰度。
  - 管腔密度用主肺动脉平均衰减归一化，主肺动脉由 TotalSegmentator-v1.5 自动检测。
  - XGBoost 仅用 Northwestern University（NU）数据开发，采用分层 70%/30% 划分、五折交叉验证调参；分类阈值由训练集 Youden index 确定，并在所有后续评估中固定。
  - 预设消融：排除 periclot 特征，检验其
