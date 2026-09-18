---
title: Lightweight Transformer-based knowledge distillation framework for high-dimensional spatiotemporal radiomics in breast cancer risk prediction
title_zh: 用于乳腺癌风险预测中高维时空放射组学的轻量级Transformer知识蒸馏框架
authors: Unknown
date: Unknown
pdf: "https://link.springer.com/article/10.1186/s42492-026-00231-3"
tldr: 乳腺癌存在显著时空异质性，传统影像组学多依赖低时间分辨率成像和离散图像期相，难以捕捉肿瘤内快速连续的动力学演化。为此，该研究提出轻量Transformer与知识蒸馏结合的高维时空影像组学框架，用于乳腺癌风险预测。摘要未披露具体实验指标，但该方法旨在兼顾高维时空特征建模与模型轻量化，并降低计算开销，为动态影像风险分层提供新思路。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 乳腺癌时空异质性强，传统影像组学受限于低时间分辨率和离散期相，难以刻画肿瘤快速连续的动力学演化。
method: 提出轻量Transformer与知识蒸馏结合的高维时空影像组学框架，建模动态影像时空特征并用于乳腺癌风险预测。
result: 摘要未提供具体实验数值；该方法预期提升对肿瘤连续动态演化的表征能力与风险预测性能。
conclusion: 该框架为高维时空影像组学提供轻量化方案，有望推动乳腺癌动态风险预测与临床分层应用。
---

## 摘要
乳腺癌表现出显著的时空异质性。传统放射组学方法通常依赖于低时间分辨率成像和离散图像期相，无法捕捉肿瘤内快速且连续的动力学演变……

## Abstract
Breast cancer exhibits significant spatiotemporal heterogeneity. Traditional radiomicsapproaches usually rely on low-temporal-resolution imaging and discrete imagephases, failing to capture the rapid and continuous kinetic evolution within the tumor …

---

## 论文详细总结（自动生成）

### 1. 核心问题与整体含义
- **研究动机**：乳腺癌具有显著时空异质性，传统 DCE-MRI 放射组学多依赖低时间分辨率成像（>60 s）或少数离散期相（如增强前、峰值、延迟期），难以捕捉造影剂在肿瘤微环境中的快速连续动力学变化。
- **核心问题**：现有方法存在两点不足：① 离散时间点无法准确刻画连续演化模式，限制诊断性能与生物学解释；② 缺乏针对高维动态放射组学特征的专门筛选与建模框架，大量潜在时序生物标志物未被系统挖掘。
- **整体含义**：该论文旨在利用超快 DCE-MRI 的高时间分辨率优势，结合轻量 Transformer 与知识蒸馏，构建一个面向高维时空放射组学的乳腺癌风险预测框架，实现良恶性鉴别及侵袭性评估，并提升模型可解释性。

### 2. 方法论
- **总体思想**：提出两阶段算法流水线：第一阶段基于梯度动态进行稳健特征筛选；第二阶段基于知识蒸馏构建预测网络，用于区分乳腺良恶性病变。
- **数据表示**：每例病灶从 64 个 DCE-MRI 时间期相中提取 1130 个放射组
