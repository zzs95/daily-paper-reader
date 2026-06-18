---
title: "LlamaRG: A Multi-View Large Language Model for Radiology Report Generation"
title_zh: LlamaRG：一种用于放射学报告生成的多视图大语言模型
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026F/papers/Jayas_LlamaRG_A_Multi-View_Large_Language_Model_for_Radiology_Report_Generation_CVPRF_2026_paper.pdf"
tldr: 放射科报告自动生成对提高临床效率至关重要。本研究提出了LlamaRG，这是一种基于LLaMA 3.2构建的统一视觉语言架构。该模型专门针对多视图放射影像设计，能够整合不同角度的医学图像信息，生成高质量的诊断报告。LlamaRG通过利用大语言模型的强大理解能力，显著提升了报告生成的准确性和临床实用性，为辅助医生诊断提供了有力工具。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在通过人工智能自动化生成放射科报告，以减轻医生的工作负担并提高临床处理效率。
method: 提出了一种名为LlamaRG的统一视觉语言架构，该架构基于LLaMA 3.2模型并支持多视图影像输入。
result: LlamaRG能够有效地整合多视图放射影像信息，生成结构化且准确的医疗诊断报告。
conclusion: 该研究证明了基于大语言模型的多视图架构在放射报告生成领域的有效性，具有重要的临床应用潜力。
---

## 摘要
利用人工智能自动生成放射学报告，可以通过为医生提供辅助工具来提高临床效率。在本研究中，我们介绍了 llamaRG，这是一种基于 LLaMA3.2 构建的统一视觉-语言架构……

## Abstract
Automated radiological report generation using artificial intelligence can increaseclinical throughput by creating an assistive tool for physicians. In this study, weintroduce llamaRG, a unified vision-language architecture built upon the LLaMA3. 2 …

---

## 论文详细总结（自动生成）

这是一份关于论文《LlamaRG: A Multi-View Large Language Model for Radiology Report Generation》的深度结构化总结：

### 1. 核心问题与研究动机
*   **核心问题**：如何利用大语言模型（LLM）自动生成准确、连贯且符合临床逻辑的胸部 X 光（CXR）放射学报告。
*   **研究背景**：放射科医生面临巨大的工作负荷，手动编写报告耗时且易出错。
*   **动机**：
    *   现有方法多采用“独立图像编码器+文本解码器”架构，存在模态对齐瓶颈。
    *   大多数模型仅支持单视图（如正位 PA 视图），而临床医生通常需要结合多视图（正位、侧位等）进行综合诊断。
    *   需要一种能够模拟放射科医生临床工作流、无需额外辅助信息（如病史、标签）的端到端模型。

### 2. 方法论
LlamaRG 采用基于 **LLaMA 3.2-11B Vision** 的统一多模态架构，分为两个训练阶段：
*   **核心思想**：利用原生多模态 LLM 的跨模态推理能力，直接处理多视图图像网格并生成自由格式文本。
*   **关键技术细节**：
    *   **多视图集成**：将一个检查研究中的所有可用视图拼接成一个复合图像网格（Tiled Grid），通过视觉编码器提取联合特征。
    *   **自定义跨注意力掩码（CAM）**：在微调阶段引入特定掩码，确保模型能平衡地关注图像网格中的不同视图，防止注意力泄露到填充标记（Padding tokens）。
    *   **LoRA 高效微调**：仅对查询/键/值投影矩阵、嵌入层和语言模型头进行低秩自适应微调（参数量小于总量的 1%）。
    *   **强化学习优化（SCST）**：第二阶段采用自批判序列训练（Self-Critical Sequential Training），利用结合了自然语言指标（BLEU, ROUGE-L, METEOR）和临床效能指标（Precision, Recall）的**混合奖励函数**进行优化。

### 3. 实验设计
*   **数据集**：使用最大的公开基准数据集 **MIMIC-CXR**，遵循官方 7:1:2 的划分比例。
*   **Benchmark（基准）**：
    *   **传统图像描述方法**：Show-Tell, Att2in, AdaAtt, Transformer 等。
    *   **领域特定模型**：R2Gen, R2GenCMN, PPKED, MSAT, METransformer 等。
    *   **基于 LLM 的模型**：R2GenGPT, B-LLM, MedLLM, MedGemma。
*   **评估指标**：
    *   **NLG 指标**：BLEU-1/4, ROUGE-L, METEOR, CIDEr。
    *   **临床效能（CE）指标**：使用 CheXpert 标注器对生成的报告进行 14 种疾病分类，计算 Precision、Recall 和 F1 分数。

### 4. 资源与算力
*   **硬件**：使用了 **1 台 NVIDIA H200 (70GB) GPU**。
*   **训练细节**：
    *   第一阶段（SFT）：8 个 Epoch，学习率 2e-4，混合精度训练。
    *   第二阶段（RL）：Batch size 为 8。
    *   图像输入分辨率：256 × 256。
*   **时长**：文中未明确给出具体的训练总时长，但提到使用了 LoRA 以提高计算效率。

### 5. 实验数量与充分性
*   **实验规模**：
    *   在 MIMIC-CXR 全量数据集上进行了主实验。
    *   **消融实验**：包括 LoRA 微调层的选择（4 种配置）、自定义掩码（CAM）的有效性分析、强化学习样本量（5k/10k/15k）及奖励函数权重的对比。
    *   **外部验证**：在附录中补充了 IU-Xray 和 RexGradient 数据集的验证。
*   **充分性评价**：实验设计较为全面，对比了从传统 CNN-RNN 到最新 LLM 的各类 SOTA 方法。通过 CE 指标验证了临床准确性，通过消融实验验证了各组件的贡献，实验结果具有较高的客观性和说服力。

### 6. 主要结论与发现
*   **性能领先**：LlamaRG 在临床效能（CE）指标上显著优于现有方法（F1 达到 0.414），在文本流畅度（NLG）上也表现出色。
*   **多视图优势**：相比单视图输入，多视图输入使临床 F1 分数提升了约 4.1%，证明了整合解剖学互补信息的重要性。
*   **强化学习作用**：SCST 阶段通过混合奖励函数显著提升了报告的诊断准确性和语言一致性。
*   **架构效率**：统一的视觉-语言架构避免了模态碎片化，LoRA 微调在极低参数更新下实现了高效的领域迁移。

### 7. 优点与亮点
*   **临床一致性**：模型设计贴合放射科医生实际工作流，仅依赖当前检查的图像，不依赖难以获取的先验标签。
*   **原生多模态**：利用 LLaMA 3.2 的原生视觉能力，减少了外部编码器带来的对齐损失。
*   **多视图处理**：通过自定义掩码和图像网格技术，优雅地解决了变长多视图输入的处理问题。
*   **定性表现**：生成的报告能识别细微的临床细节（如手术夹、血管支架），减少了模板化描述。

### 8. 不足与局限
*   **CIDEr 指标较低**：尽管其他指标领先，但 CIDEr 分数相对较低，这可能与 LLM 生成文本的风格与参考报告的统计分布差异有关。
*   **分辨率限制**：输入图像被缩放至 256x256，对于某些需要极高分辨率才能观察到的微小病灶，可能会存在信息丢失。
*   **计算资源需求**：虽然使用了 LoRA，但 11B 参数规模的模型在推理阶段仍比传统轻量化模型需要更多的显存和算力。
*   **幻觉风险**：作为生成式模型，虽然经过 RL 优化，但在极端罕见病例上仍可能存在生成错误描述的潜在风险。

（完）
