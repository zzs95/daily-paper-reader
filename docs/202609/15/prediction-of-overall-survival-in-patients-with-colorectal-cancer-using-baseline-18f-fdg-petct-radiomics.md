---
title: Prediction of overall survival in patients with colorectal cancer using baseline 18F-FDG PET/CT radiomics
title_zh: 基于基线18F-FDG PET/CT影像组学预测结直肠癌患者的总生存期
authors: Unknown
date: Unknown
pdf: "https://www.nature.com/articles/s41598-026-70862-2_reference.pdf"
tldr: 结直肠癌（CRC）总体生存（OS）预测对治疗决策很重要，但基线18F-FDG PET/CT影像组学的价值仍需验证。本研究回顾性纳入166例CRC患者，随机划分为训练队列等，提取基线PET/CT影像组学特征以预测3年OS。摘要未展示完整结果，但该设计有望建立无创预后模型，辅助临床风险分层与个体化管理决策。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 基线18F-FDG PET/CT影像组学能否预测CRC患者3年总体生存尚不明确，需构建无创预后工具。
method: 回顾性纳入166例CRC患者，随机分为训练队列等，基于基线PET/CT提取影像组学特征并建模预测3年OS。
result: 摘要仅提供研究设计与样本量，未报告训练/验证队列的生存预测性能、风险分层或统计显著性结果。
conclusion: 该研究拟验证基线PET/CT影像组学对CRC 3年OS的预测价值，若有效可辅助临床预后分层与个体化治疗决策。
---

## 摘要
使用基线18F-FDG PET/CT影像组学预测结直肠癌（CRC）患者的3年总生存期（OS）。本回顾性研究纳入了166例结直肠癌（CRC）患者，这些患者被随机分配至训练队列（n …）

## Abstract
To predict 3-year overall survival (OS) in patients with colorectal cancer (CRC) usingbaseline 18F-FDG PET/CT radiomics. This retrospective study entrolled 166 patientswith colorectal cancer (CRC), who were randomly assigned into a training cohort (n …

---

## 论文详细总结（自动生成）

# 论文结构化总结

**题目**：Prediction of overall survival in patients with colorectal cancer using baseline ¹⁸F-FDG PET/CT radiomics（基于基线 ¹⁸F-FDG PET/CT 影像组学预测结直肠癌患者总生存期）
**期刊/状态**：*Scientific Reports*，Article in Press（DOI: 10.1038/s41598-026-70862-2）
**作者与单位**：Na Wang、Huanxin Zhu、Meng Dai、Yunuan Liu、Fenglian Jing、Yuhan Sun、Jingmian Zhang、Jianfang Wang、Xinming Zhao、Zhaoqi Zhang（河北医科大学第四医院核医学科；河北省肿瘤微环境与耐药重点实验室）

---

## 1. 核心问题与研究动机

- **临床背景**：结直肠癌（CRC）是消化系统常见恶性肿瘤，在美国居癌症死因第 2 位、中国第 5 位，且发病呈年轻化趋势；转移性 CRC 的 3 年 OS 率不足 40%，因此亟需治疗前的预后分层工具来指导个体化治疗。
- **核心矛盾**：CRC 的**瘤内异质性**是复发、转移与治疗失败的核心挑战。现有影像组学预后研究多依赖**单一解剖学 CT 或 MRI 序列**，只能捕捉形态/结构特征，无法反映肿瘤内部的**糖酵解代谢异质性**这一恶性生物学行为关键标志。
- **研究缺口**：¹⁸F-FDG PET/CT 同时融合 CT 的高精度解剖定位与 PET 的体内代谢活性信号，可提供多维肿瘤表型信息；但将其用于 CRC 预后预测的研究仍很少，需要进一步验证。
- **研究目的**：利用治疗前基线 ¹⁸F-FDG PET/CT 影像组学预测 CRC 患者 3 年 OS，进行高/低危分层，并指导个体化治疗决策。

---

## 2. 方法论

### 2.1 总体思路
构建三条并行模型并进行比较：
- **影像组学模型**（PET/CT Radscore）
- **临床模型**（仅纳入 Cox 筛选出的独立临床变量，最终为 TNM 分期）
- **复合模型**（Radscore + 最优临床变量）
并进一步构建**列线图（Nomogram）**用于个体化 3 年 OS 概率预测。

### 2.2 图像预处理与分割（关键技术细节）
- 两名具 10 年经验的核医学医师使用 **3D Slicer 5.6.2** 手工勾画病灶；不一致区域共同复核，争议由资深主任核医学医师裁定。
- **统一预处理流程**：
  - 所有 PET/CT 重采样至各向同性 **1×1×1 mm** 体素（Resample Scalar Volume 模块）；PET/CT 用 **B 样条插值**，分割掩膜用**最近邻插值**。
  - PET 图像经内置 SUV 校正模块归一化为 SUV（依赖体重、注射活度、注射后延迟时间等 DICOM 元数据）。
  - 通过 **Elastix 模块**以**互信息**为相似性度量完成 CT（固定）与 PET（移动）的刚性多模态配准。
  - 勾画时结合 CT 解剖范围与 PET 高代谢区；实性肿瘤内部低代谢坏死区**手工剔除**。
  - 针对 Philips Gemini GXL16 与 Vereos 两台设备的晶体材料、重建算法、矩阵大小、层厚差异，进行**统一协调与批次效应校正**。
  - 60 例随机抽样计算观察者内/间 ICC 以量化分割可重复性。

### 2.3 特征提取
- 使用 **SlicerRadiomics** 提取 **2446 个特征**（PET 1223 个 + CT 1223 个）。
- 滤波器：**LoG（σ = 1, 2, 3, 4, 5 mm）** 与**多尺度小波变换**；PET SUV 图像采用**固定 bin-width = 25** 的灰度离散化。
- 特征类别：形状/形状2D、一阶统计、纹理（GLCM、GLDM、GLRLM、GLSZM、NGTDM），来自原始、LoG 变换或小波滤波图像。
- 所有特征经 **Z-score 标准化**。
- **主动排除** SUVmax、MTV、TLG，理由是与高维影像组学特征存在严重共线性；研究聚焦细粒度影像组学特征而非简单全局代谢指标。

### 2.4 特征筛选与建模
- 在训练队列中使用 **LASSO-Cox 回归**（lambda.min）从 2446 个特征中筛选出 **11 个非零系数特征（5 个 PET、6 个 CT）**，据此计算 Radscore。
- **Radscore 公式（文中完整给出）**：
  Radscore = 0.070×PET_original_shape_Maximum2DDiameterSlice − 0.016×PET_wavelet-LLH_firstorder_Skewness + 0.007×PET_wavelet-LHL_firstorder_Kurtosis + 0.094×PET_wavelet-LHL_glcm_Imc1 + 0.045×PET_wavelet-HHH_glszm_GrayLevelNonUniformityNormalized − 0.205×CT_original_glcm_InverseVariance + 0.006×CT_log-sigma-4-0-mm-3D_glcm_MCC + 0.106×CT_log-sigma-5-0-mm-3D_glrlm_LongRunHighGrayLevelEmphasis − 0.025×CT_wavelet-LHH_firstorder_Mean + 0.065×CT_wavelet-HHL_glszm_SmallAreaLowGrayLevelEmphasis + 0.008×CT_wavelet-HHH_firstorder_Skewness
- **临床变量筛选**：纳入年龄、性别、肿瘤部位、TNM 分期、CEA、CA19-9、CA72-4；先单因素 Cox，再多因素 Cox。结果**仅 TNM 分期**具预测作用，故未做多因素分析，直接作为独立预后因子。
- 阈值（二分）：CEA 5.0 ng/mL、CA19-9 27.0 U/mL、CA72-4 6.90 U/mL；TNM 按序数编码（I=1 … IV=4）。
- **模型评分公式**：
  - Clinical score = 1.809 × TNM stage
  - Complex score = 1.536 × Radscore + 1.587 × TNM stage
- **最优截断值**（Youden 指数）：Radscore = 0.023；Clinical score = 6.33；Complex score = 6.05。

### 2.5 模型评价与验证
- **拟合优度与区分度**：AIC、Harrell's C-index。
- **ROC 分析**：AUC、敏感度、特异度、准确率；**DeLong 非参数检验**（MedCalc 19.0）比较 AUC 差异。
- **列线图**：基于多因素 Cox 整合 TNM 分期与 Radscore。
- **校准评估**：校准曲线、校准斜率、校准截距、**积分 Brier 分数（IBS，0–36 个月）**（理想：斜率→1、截距→0、IBS 越小越好）。
- **决策曲线分析（DCA）**：与"全部治疗/全不治疗"两条极端策略比较净获益。
- **生存分析**：Kaplan–Meier + log-rank；另按单个 TNM 分期做分层 K–M 分析，以弥补序数编码的局限。
- **统计软件**：IBM SPSS 26.0、R 4.3.3；正态连续变量用独立样本 t 检验，非正态用 Mann–Whitney U，分类变量用卡方检验（样本量小用 Fisher 精确检验），p < 0.05 为显著。

---

## 3. 实验设计

### 3.1 数据集 / 场景
- **单中心回顾性队列**：2014 年 2 月—2021 年 12 月，经组织病理确诊的 **I–IV 期结直肠腺癌**患者，治疗前接受 ¹⁸F-FDG PET/CT。
- 排除标准：合并其他原发恶性肿瘤、临床资料不完整、失访。
- 最终纳入 **166 例**（男 104、女 62；平均年龄 60.19 ± 12.09 岁，范围 26–86 岁）。
- **按 8:2 随机划分**：训练队列 n = 133，验证队列 n = 33。
- 随访至 2024 年 9 月 16 日；所有患者随访 ≥ 33 个月或至死亡。**主要终点为 3 年 OS**（自确诊至任何原因死亡）。
- 设备：Philips Gemini GXL16（143 例，86.1%）与 Philips Vereos（23 例，13.9%）。
- 扫描条件：禁食 ≥ 6 h，静脉注射 ¹⁸F-FDG 3.7–5.5 MBq/kg，注射后 60 min 显像。

### 3.2 Benchmark 与对比方法
- **内部对比基线**：无外部公开 benchmark；对比对象为**自身构建的三个模型**——影像组学模型、临床模型、复合模型。
- 对比维度：AIC、C-index、AUC（DeLong 检验）、敏感度/特异度/准确率、校准指标、DCA 净获益、K–M 分层。
- **文献对照（定性）**：与既往单模态 CT/MRI 影像组学、以及 Lv 等（PET/CT 分列建模，C-index 0.716 的临床模型）的结果做定性比较。

---

## 4. 资源与算力

- **论文未提及任何 GPU 型号、数量或训练时长**。本研究为传统统计学/影像组学流程（LASSO-Cox、Cox 回归、ROC/DCA），不使用深度学习，因此不涉及 GPU 算力需求。
- 明确使用的工具与软件：**3D Slicer 5.6.2**（含 SlicerRadiomics 扩展、Elastix 模块、Resample Scalar Volume 模块、PET SUV Correction 模块）、**IBM SPSS 26.0**、**R 4.3.3**、**MedCalc 19.0**。
- 分析代码已公开于 Zenodo（DOI: 10.5281/zenodo.21783110）；个体患者数据因隐私保护不公开，可向通讯作者申请。

---

## 5. 实验数量与充分性

**大致实验组数**：
1. 分割可重复性分析（60 例，观察者内 ICC = 0.978，观察者间 ICC = 0.925）。
2. 基线特征组间比较（训练 vs 验证，7 个变量，均 P > 0.05，基线均衡）。
3. LASSO-Cox 特征筛选（2446 → 11 个特征）。
4. 单因素/多因素 Cox 临床变量筛选（7 个临床变量）。
5. **3 个模型 × 2 个队列**的 AIC 与 C-index 对比（共 6
