---
title: Frequency disentanglement with State space gating network for medical image segmentation
title_zh: 基于状态空间门控网络与频率解耦的医学图像分割
authors: Unknown
date: Unknown
pdf: "https://link.springer.com/article/10.1007/s11517-026-03603-2"
tldr: 本研究针对医学图像分割中现有CNN和Transformer模型的局限性，提出了一种结合频率解耦与状态空间门控网络（SSN）的新方法。该方法通过将图像信号分解为不同频率分量，并利用状态空间模型的长程建模能力，有效提升了对解剖结构细节和全局上下文的捕捉能力，为计算机辅助诊断和放射治疗规划提供了更高精度的分割方案。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 现有的医学图像分割模型在处理复杂解剖结构时，难以平衡局部细节提取与全局上下文信息的有效整合。
method: 提出一种基于状态空间门控网络的频率解耦框架，通过分离不同频率特征来增强模型对多尺度信息的表达能力。
result: 实验结果表明，该方法在多个医学图像分割任务上均优于现有的主流CNN和Transformer模型。
conclusion: 频率解耦与状态空间网络的结合为实现高精度、自动化的医学图像分割提供了一种高效且极具潜力的新途径。
---

## 摘要
解剖结构的精确自动分割是计算机辅助诊断、放射治疗规划和定量医学分析的必要前提。然而，现有的模型，无论是基于卷积神经网络 (CNN) ……

## Abstract
Precise automated segmentation of anatomical structures is a prerequisite forcomputer-aided diagnosis, radiotherapy planning, and quantitative medical analysis.However, existing models, whether based on convolutional neural networks (CNN) …

---

## 论文详细总结（自动生成）

这是一份关于论文《Frequency disentanglement with State space gating network for medical image segmentation》的深度学术总结：

### 1. 研究动机与背景（核心问题）
医学图像的精确分割是临床诊断和治疗规划的关键。然而，现有的主流架构（如 CNN 和 Transformer）主要关注**空间特征**的提取，存在**光谱特征纠缠（Spectral Feature Entanglement）**的问题。这意味着低频（全局结构）、中频（轮廓）和高频（纹理细节）特征被无差别地混合处理，导致模型在处理复杂的解剖边界和细微纹理时精度下降。本研究旨在通过频率域的显式解耦来解决这一瓶颈。

### 2. 方法论：FD-SSGNet 架构
论文提出了一种结合**频率解耦（Frequency Disentanglement）**与**状态空间门控网络（State-Space Gating）**的框架，核心流程如下：
*   **频率显式解耦**：利用快速傅里叶变换（FFT）将特征图显式分解为低频、中频和高频三个分量。
*   **位移双向选择性门控 Mamba (SBSGM)**：针对不同频段设计了并行的、异构配置的路径。利用 Mamba（状态空间模型 SSM）的线性复杂度长程建模能力，捕捉各频段特有的依赖关系。
*   **动态融合模块**：采用自适应机制重新整合处理后的多频段特征，以生成精细的分割图。
*   **U型结构**：整体维持类 UNet 的编码器-解码器结构，确保多尺度特征的传递。

### 3. 实验设计
*   **数据集**：
    1.  **BTCV (Synapse)**：多器官分割数据集，包含腹部多种器官，挑战在于器官形状多变且边界模糊。
    2.  **ACDC**：心脏 MRI 分割数据集，用于验证模型在循环解剖结构上的表现。
*   **基准方法 (Benchmarks)**：对比了包括 TransUnet、Swin-Unet、MissFormer、PVT-CASCADE、PVT-GCASCADE 等在内的多种最先进（SOTA）的 CNN 和 Transformer 模型。

### 4. 资源与算力
*   **硬件环境**：论文明确提到使用单块 **NVIDIA V100 GPU** 进行评估。
*   **训练细节**：输入图像分辨率统一为 $224 \times 224$。
*   **算力说明**：文中提供了参数量（Params）与计算量（FLOPs）的对比图，证明其在维持高性能的同时，计算开销与主流 SOTA 模型相当，具有临床部署的可行性。

### 5. 实验数量与充分性
*   **实验规模**：
    *   在两个主流数据集上进行了全面的性能对比。
    *   进行了**消融实验**，验证了频率解耦模块和 SBSGM 模块的有效性。
    *   提供了**定性可视化分析**，包括复杂病例的缩放对比图。
*   **客观性与公平性**：所有对比实验均在相同输入分辨率和硬件环境下运行，且结果取五次独立运行的平均值，实验设计较为严谨、客观。

### 6. 主要结论与发现
*   **性能领先**：FD-SSGNet 在 BTCV 和 ACDC 数据集上均刷新了 SOTA 记录，尤其在器官边界的勾勒上表现优异。
*   **频率建模的价值**：显式处理频率分量能显著减少边界处的分割错误，证明了光谱解耦在医学影像任务中的必要性。
*   **Mamba 的优势**：相比 Transformer，基于 Mamba 的 SBSGM 在处理长程依赖时更具效率，且能更好地适应不同频段的特征特性。

### 7. 优点与亮点
*   **视角新颖**：从频率域解耦的角度切入，解决了传统空间域模型难以处理的特征纠缠问题。
*   **架构高效**：引入了最新的 Mamba 架构并进行了针对性改进（SBSGM），在精度和计算效率（FLOPs）之间取得了良好的平衡。
*   **鲁棒性强**：在处理严重变形、形状不规则以及边界模糊的解剖结构时，表现出极强的鲁棒性。

### 8. 不足与局限
*   **参数量略增**：由于采用了多路径并行架构，其参数量（Params）相比某些轻量级 CNN 有所增加。
*   **频率划分的先验性**：低、中、高频的划分界限可能需要根据不同类型的医学影像（如 CT vs 超声）进行手动微调，缺乏完全自适应的频段定义。
*   **维度限制**：目前主要针对 2D 图像或 2.5D 切片进行验证，尚未深入探讨在原生 3D 医疗数据上的扩展性。

（完）
