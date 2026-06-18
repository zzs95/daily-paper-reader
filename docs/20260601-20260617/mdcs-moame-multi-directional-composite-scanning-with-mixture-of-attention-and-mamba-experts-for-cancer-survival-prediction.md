---
title: "MDCS-MoAME: Multi-directional Composite Scanning with Mixture of Attention and Mamba Experts for Cancer Survival Prediction"
title_zh: MDCS-MoAME：结合注意力与 Mamba 专家混合模型的多向复合扫描用于癌症生存预测
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026/papers/Qu_MDCS-MoAME_Multi-directional_Composite_Scanning_with_Mixture_of_Attention_and_Mamba_CVPR_2026_paper.pdf"
tldr: 本研究针对癌症生存预测中病理图像与基因组数据融合的长程依赖难题，提出了MDCS-MoAME模型。该模型创新性地结合了多方向复合扫描（MDCS）与混合注意力及Mamba专家（MoAME）机制，通过多维度的特征捕捉与动态专家分配，实现了对复杂多模态数据的高效建模。实验证明，该方法在提升生存预测准确率的同时，显著优化了长序列处理性能，为精准医疗提供了有力的技术支撑。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 现有的多模态癌症生存预测方法在处理病理图像和基因组数据的长程依赖关系方面存在局限性。
method: 提出MDCS-MoAME模型，通过多方向复合扫描技术结合混合注意力与Mamba专家机制来增强特征提取。
result: 该方法在癌症生存预测任务中取得了显著的准确率提升，并有效解决了长序列建模的计算挑战。
conclusion: MDCS-MoAME为整合病理与基因组数据的多模态学习提供了一种高效且精准的新型架构方案。
---

## 摘要
整合病理图像与基因组谱的多模态学习方法显著提高了生存预测任务的准确性。然而，以往的方法通常难以有效处理长程……

## Abstract
Multi-modal learning approaches that integrate pathological images with genomicprofiles have significantly enhanced the accuracy of survival prediction tasks.However, previous methods often struggle to effectively process long-range …

---

## 论文详细总结（自动生成）

这篇论文提出了 **MDCS-MoAME**，一种用于癌症生存预测的新型多模态学习框架。以下是对该论文的结构化深入总结：

### 1. 核心问题与研究动机
*   **核心问题**：如何有效整合超高分辨率的**全切片病理图像（WSIs）**与稀疏的**基因组数据（Genomic Profiles）**以提高癌症生存预测的准确性。
*   **研究背景与动机**：
    *   **长程依赖难题**：WSIs 具有吉像素（Gigapixel）级别，传统方法难以捕捉长距离的空间依赖。
    *   **扫描策略局限**：现有的 Mamba 模型通常只进行水平扫描，忽略了垂直、斜向等方向的组织结构关联。
    *   **基因组建模不足**：现有的基因分组方法存在功能重叠，难以捕捉远距离基因间的潜在联系。
    *   **模态异质性**：病理图像与基因数据特征差异巨大，简单的融合方式容易产生冗余且难以建模复杂的跨模态相关性。

### 2. 方法论：核心思想与关键技术
MDCS-MoAME 的核心在于通过多方向扫描增强特征提取，并利用专家混合机制（MoE）优化模态融合。
*   **多方向复合扫描（MDCS）**：
    *   **WSI 层面**：在区域（Region）和补丁（Patch）两个层级，应用五种方向的扫描（水平、垂直、左斜、右斜、回环），以扩大感受野并捕捉多维度的形态学特征。
    *   **基因层面**：除了传统的顺序扫描，引入了**间隔扫描（Interval Scanning）**，通过跨组采样揭示稀疏基因间的潜在功能关联。
*   **特征增强模块（MDSFE）**：使用 Mamba2 编码器处理上述扫描序列，并结合位置感知编码（PPEG）和注意力池化，提取具有判别力的模态内表示。
*   **专家驱动的跨模态交互（EDIMI）与 MoAME**：
    *   设计了**混合注意力与 Mamba 专家（MoAME）**模块。
    *   包含三个专家：**CroAttFusion**（利用注意力捕捉全局相关性）、**CroMamFusion**（利用 Mamba 处理序列交互）、**StackedMamFusion**（通过堆叠 Mamba 蒸馏关键信息）。
    *   **门控网络**：动态选择最适合当前输入特征对的专家，实现灵活的异质模态融合。
*   **对齐约束与损失函数**：引入跨模态对齐损失（$L_{cro}$）和模态内差异损失（$L_{intra}$），通过单向优化减少特征冗余，增强预测头的判别能力。

### 3. 实验设计
*   **数据集**：使用了来自 TCGA 的 5 个公开数据集：BLCA（膀胱癌）、BRCA（乳腺癌）、GBMLGG（胶质瘤）、LUAD（肺腺癌）和 UCEC（子宫内膜癌）。
*   **Benchmark 与对比方法**：
    *   **单模态方法**：基因模态（MLP, SNN, SNNTrans）、病理模态（ABMIL, CLAM, TransMIL, MambaMIL, PAM, PAMoE）。
    *   **多模态方法**：MCAT, MOTCAT, SurvPath, CMTA, CCL, PIBD, MoME, SurvMamba。
*   **评价指标**：一致性指数（C-index）的均值与标准差（5 折交叉验证）。

### 4. 资源与算力
*   **硬件环境**：实验在 **NVIDIA GTX 4090 GPU** 上运行。
*   **训练细节**：使用 Adam 优化器，初始学习率为 1e-3，权重衰减为 1e-5，Batch Size 为 1，每个 Fold 训练 30 个 Epoch。
*   **计算效率**：论文特别提到，由于采用了稀疏门控机制（每次仅激活一个专家）和 Mamba 的线性复杂度，该模型在参数量（8.93M）和计算量（5.67G FLOPs）上均优于同类 MoE 模型（如 MoME 和 PAMoE）。

### 5. 实验数量与充分性
*   **实验规模**：在 5 个不同癌种的数据集上进行了广泛测试，涵盖了从单模态到多模态、从 Transformer 到 Mamba 架构的 17 种对比方法。
*   **消融实验**：针对 MDCS 扫描策略、MoAME 专家组合、分层特征提取以及损失函数约束分别进行了详细的消融研究。
*   **充分性评价**：实验设计较为充分，通过 t-SNE 可视化证明了多向扫描的特征互补性，通过 Kaplan-Meier 生存曲线验证了临床风险分层的有效性，结果具有较高的客观性和说服力。

### 6. 主要结论与发现
*   **性能领先**：MDCS-MoAME 在所有五个数据集上均达到了 SOTA 性能，平均 C-index 显著超过现有方法。
*   **扫描方向的重要性**：实验证明，结合水平、斜向和回环扫描能显著提升病理图像的特征表达能力；基因的间隔扫描对捕捉稀疏关联至关重要。
*   **专家混合的优势**：动态选择注意力或 Mamba 专家比单一融合机制更能适应多模态数据的异质性。
*   **分层结构价值**：同时利用区域级（粗粒度）和补丁级（细粒度）信息对准确预测生存期不可或缺。

### 7. 优点与亮点
*   **创新扫描机制**：打破了 Mamba 在病理图像中单一扫描的局限，提出了多向复合扫描，极大地丰富了感受野。
*   **高效融合架构**：MoAME 模块巧妙结合了注意力机制的全局建模能力和 Mamba 的线性序列处理能力，且计算开销可控。
*   **端到端优化**：通过专门设计的对齐损失解决了多模态融合中的冗余问题。
*   **可解释性**：通过可视化展示了不同扫描方向捕捉到的特征差异，增强了模型的可信度。

### 8. 不足与局限
*   **超参数敏感性**：损失函数中的权重系数（$\alpha, \beta$）在不同数据集上差异较大（如 $\alpha$ 从 4e-1 到 1e-4 不等），这表明模型对超参数较为敏感，迁移到新数据集时可能需要大量调优。
*   **数据依赖性**：尽管在 TCGA 上表现优异，但尚未在外部独立队列（External Validation）上验证其泛化性。
*   **计算瓶颈**：虽然推理效率高，但多向扫描在预处理阶段和训练初期可能会增加数据加载和重排的复杂性。

（完）
