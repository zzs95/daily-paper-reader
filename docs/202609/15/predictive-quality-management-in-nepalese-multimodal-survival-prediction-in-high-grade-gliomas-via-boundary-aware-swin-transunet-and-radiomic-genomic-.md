---
title: Predictive Quality Management in Nepalese Multimodal Survival Prediction in High-Grade Gliomas via Boundary-Aware Swin-TransUNet and Radiomic-Genomic …
title_zh: 基于边界感知 Swin-TransUNet 与放射组学-基因组学的尼泊尔高级别胶质瘤多模态生存预测中的预测性质量管理 …
authors: Unknown
date: Unknown
pdf: "https://svedbergopen.com/index.php/ijaiml/article/download/1809/1166"
tldr: 高级别胶质瘤术前总生存期预测受肿瘤空间异质性、微环境浸润及临床-影像-基因组非线性关系制约。为此，研究提出边界感知 Swin-TransUNet 与放射基因组融合的多模态生存预测框架，并引入预测质量管理。方法先分割肿瘤边界与浸润区，再融合影像组学、基因组和临床特征进行 OS 建模。该框架在尼泊尔多模态数据上可提升术前风险分层稳健性与可解释性，为个体化治疗决策提供支持。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 高级别胶质瘤术前 OS 预测困难，主要受肿瘤空间异质性、微环境浸润及多组学非线性关系影响。
method: 提出边界感知 Swin-TransUNet 分割，融合放射组学、基因组与临床多模态特征，并引入预测质量管理。
result: 摘要显示，该框架在尼泊尔多模态数据上提升 OS 预测性能与风险分层稳健性，并增强可解释性。
conclusion: 边界感知与放射基因组融合可改善 HGG 术前生存预测，支持个体化治疗决策与预测质量管理。
---

## 摘要
对于高级别胶质瘤（HGG），术前预测总生存期（OS）具有挑战性，因为其特征是复杂的肿瘤空间异质性、变化的微环境浸润以及临床…之间的非线性关系。

## Abstract
Predicting overall survival (OS) prior surgery is challenging in high-grade gliomas(HGG) because they are characterized by complex spatial tumor heterogeneity,varying microenvironmental infiltration and non-linear relationships between clinical …

---

## 论文详细总结（自动生成）

## 1. 核心问题与整体含义

- **研究动机**：高级别胶质瘤（HGG）术前总生存期（OS）预测困难，原因包括肿瘤空间异质性高、微环境浸润范围不清，以及临床、影像、基因组风险因素之间呈非线性关系。
- **临床背景**：HGG 主要包括 WHO IV 级胶质母细胞瘤和 III 级间变性星形细胞瘤/少突胶质细胞瘤；患者中位生存期通常仅 12–18 个月，5 年生存率极低。年龄、KPS、切除程度、IDH1/2 突变、MGMT 启动子甲基化等均影响预后。
- **传统范式问题**：既有方法多采用“先分割、再提取手工放射组学特征、再做生存建模”的两阶段流水线，存在：
  - 分割误差向下游传播，造成累计误差；
  - 手工放射组学特征维度有限，丢失三维空间和边界浸润信息；
  - 生存结局离散化或线性 Cox 假设，难以建模非线性跨模态交互；
  - 对肿瘤与脑室下区、胼胝体等非肿瘤解剖结构关系“空间盲”。
- **整体含义**：论文提出 **Surv-TransNet**，即边界感知 Swin-TransUNet 与放射基因组交叉注意力融合的端到端多任务框架，试图在同一前向过程中完成 3D 肿瘤分割与连续生存风险预测，从而减少两阶段误差传播，提升 HGG 术前风险分层和个体化治疗决策支持能力。
- **需注意**：元数据标题含“Nepalese / Predictive Quality Management”，但正文标题、实验队列和结果均未涉及尼泊尔数据或预测质量管理主题；正文主要使用 BraTS 和 CHIC-344 队列。

## 2. 方法论

- **核心思想**：将 3D 多参数 MRI、临床变量和分子标志物联合输入共享编码器，通过多任务学习同时优化肿瘤子区分割和连续生存风险预测。
- **输入数据**：
  - 3D mpMRI：T1、T1c、T2、T2-FLAIR 四序列；
  - 临床/分子变量：年龄、KPS、切除程度、IDH1/2 突变、MGMT 启动子甲基化等；
  - 输出：4 类肿瘤子区分割掩膜（背景、坏死/非增强核心、水肿、增强肿瘤）和连续 log-hazard 风险分数。
- **混合 3D Swin-Transformer 编码器**：
  - 前两层使用 3D 卷积/ResNet 块保留局部细节；
  - 后两层使用 3D Shifted-Window Swin-Transformer 块，窗口大小 7×7×7，结合 W-MSA 与 SW-MSA 实现跨窗口信息交换；
  - 兼顾局部边界与全局解剖上下文，复杂度相对全局自注意力更低。
- **Spatial Edge Attention, SEA**：
  - 在解码器跳跃连接中计算 3D Sobel 梯度：  
    \(\nabla F_{dec}^l = \sqrt{(\partial F/\partial x)^2+(\partial
