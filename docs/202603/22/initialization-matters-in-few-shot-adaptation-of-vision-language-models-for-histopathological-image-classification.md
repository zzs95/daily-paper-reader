---
title: Initialization matters in few-shot adaptation of vision-language models for histopathological image classification
title_zh: 初始化在视觉语言模型用于组织病理学图像分类的少样本自适应中至关重要
authors: Unknown
date: Unknown
pdf: "https://scholar.google.com/scholar_url?url=https://arxiv.org/pdf/2602.18766&hl=en&sa=X&d=18393132975771409144&ei=HrO-aeigI5GrieoP7rnduQU&scisig=AFtJQiyT-D-muL3a6UzRMqdGn2UX&oi=scholaralrt&hist=Sp41LysAAAAJ:7428935191213286109:AFtJQiwzJmvzlWJgngGiB1nbZtiZ&html=&pos=9&folt=rel"
tldr: 本研究探讨了视觉语言模型（VLM）在组织病理学图像分类中的少样本适配问题，重点分析了初始化策略的重要性。虽然预训练的VLM支持零样本分类，但在数据有限的情况下进行监督微调时，初始参数的选择显著影响特征提取和分类性能。研究证明了合理的初始化是提升病理图像少样本学习效果的关键。
motivation: 旨在解决视觉语言模型在组织病理学图像少样本适配过程中，初始化策略对分类性能影响不明确的问题。
method: 通过对比实验，评估了预训练VLM图像编码器在不同初始化设置下进行少样本监督微调的效果。
result: 发现初始化方式对模型在病理图像任务上的收敛速度和最终分类精度具有显著的决定性作用。
conclusion: 强调了在医疗影像领域应用VLM时，优化初始化策略是实现高效少样本适配的必要前提。
---

## 摘要
在组织病理学图像-描述对数据集上预训练的视觉语言模型 (VLM) 实现了零样本切片级分类。VLM 图像编码器提取判别性特征的能力也为有监督微调提供了可能……

## Abstract
Vision language models (VLM) pre-trained on datasets of histopathological image-caption pairs enabled zero-shot slide-level classification. The ability of VLM imageencoders to extract discriminative features also opens the door for supervised fine …

---

## 论文详细总结（自动生成）

以下是对论文《Initialization matters in few-shot adaptation of vision-language models for histopathological image classification》的结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **核心问题**：在组织病理学全切片图像（WSI）分类任务中，如何高效地将预训练的视觉语言模型（VLM）适配到下游任务，特别是在标注样本极少（Few-shot）的情况下。
*   **研究背景**：
    *   WSI 具有像素极高（Gigapixel）的特点，通常采用多实例学习（MIL）框架进行处理。
    *   现有的高效迁移学习（ETL）方法（如线性探测 Linear Probing）在少样本场景下往往表现不佳，甚至不如原始的零样本（Zero-shot）预测。
    *   **动机**：作者发现分类层权重的**随机初始化**是导致性能下降和波动的主要原因，因此探索如何利用 VLM 的文本先验知识来优化初始化过程。

### 2. 论文提出的方法论：ZS-MIL
*   **核心思想**：提出 **Zero-Shot Multiple-Instance Learning (ZS-MIL)**。该方法不再使用随机分布初始化分类器权重，而是利用 VLM 文本编码器生成的**类级别嵌入（Class-level Embeddings）**作为分类层的起始权重。
*   **关键技术细节**：
    1.  **特征提取**：使用预训练 VLM 的图像编码器提取 WSI 中每个图像块（Patch）的特征。
    2.  **特征聚合**：通过 MIL 聚合函数（如注意力机制 ABMIL）将块特征组合成切片级嵌入 $Z$。
    3.  **零样本原型生成**：针对每个类别设计一组文本提示（Prompts），通过 VLM 文本编码器获取其嵌入向量，作为“零样本原型”。
    4.  **分类器初始化**：将分类层的权重初始化为这些零样本原型。预测时计算切片嵌入 $Z$ 与原型之间的余弦相似度。
    5.  **微调优化**：在少样本数据上，通过标准交叉熵损失对聚合模块和分类层进行有监督微调。

### 3. 实验设计
*   **数据集**：使用公共数据集 **TCGA-NSCLC**（非小细胞肺癌），包含 445 张肺鳞状细胞癌（LUSC）和 291 张肺腺癌（LUAD）的 WSI。
*   **实验场景**：
    *   **少样本设置**：每类仅选取 $k=4$ 和 $k=16$ 个样本进行训练。
    *   **任务**：肺癌亚型分类（LUSC vs LUAD）。
*   **Benchmark 与对比方法**：
    *   **零样本基准**：MI-Zero。
    *   **初始化对比**：对比了 Kaiming (Uniform/Normal) 和 Xavier (Uniform/Normal) 等经典随机初始化方法。
    *   **聚合模型对比**：对比了 BGMP（最大池化）、BGAP（平均池化）、ABMIL（注意力 MIL）和 TransMIL（Transformer MIL）。

### 4. 资源与算力
*   **算力说明**：论文中**未明确说明**具体的 GPU 型号、数量及训练时长。
*   **实现细节**：提到了使用 CLAM 工具进行组织分割和 20x 倍率下的图像块提取（256x256 像素）。

### 5. 实验数量与充分性
*   **实验规模**：
    *   进行了初始化策略的消融实验（5 种初始化方法对比）。
    *   进行了不同 MIL 聚合器的对比实验（4 种模型）。
    *   所有实验均重复运行 5 次并计算标准差，以评估结果的稳定性。
*   **充分性评价**：实验在初始化策略的对比上非常充分，清晰地展示了 ZS-MIL 在低样本量下的优势。但实验仅限于单一数据集（TCGA-NSCLC）和二分类任务，在多中心数据验证和多分类任务上的泛化性仍有待进一步证明。

### 6. 主要结论与发现
*   **初始化至关重要**：在 $k=4$ 的极少样本场景下，ZS-MIL 的准确率比表现最好的随机初始化方法（Xavier Uniform）高出 **19.57%**。
*   **性能超越零样本**：ZS-MIL 成功克服了线性探测在少样本下性能退化的现象，其表现优于纯零样本迁移（MI-Zero）。
*   **稳定性更高**：ZS-MIL 显著降低了因样本选择不同而导致的性能波动（标准差更小）。
*   **轻量级模型更优**：在少样本场景下，参数量较少的 ABMIL 表现优于复杂的 TransMIL，后者更容易出现过拟合。

### 7. 优点
*   **简单高效**：无需复杂的架构改动，仅通过改变初始化方式就大幅提升了少样本适配的效果。
*   **知识融合**：巧妙地将 VLM 的多模态对齐能力（文本先验）引入到传统的 MIL 框架中。
*   **可解释性**：结合注意力机制，模型能够生成热力图，其高贡献区域与病理学家的标注具有高度一致性。

### 8. 不足与局限
*   **实验覆盖面有限**：仅在一个肺癌数据集上进行了验证，缺乏在其他器官或更复杂病理任务上的测试。
*   **提示词依赖**：虽然使用了提示词集成，但未深入探讨不同文本描述（Prompt Engineering）对初始化效果的具体影响。
*   **应用限制**：该方法依赖于高质量的预训练病理 VLM，如果基础模型的文本-图像对齐能力较弱，初始化的增益可能会受限。

（完）
