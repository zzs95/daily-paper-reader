---
title: "OpenMedQ: Broad Open Pretraining for Medical Vision-Language Models"
title_zh: OpenMedQ：面向医学视觉-语言模型的广泛开放预训练
authors: Unknown
date: Unknown
pdf: "https://openreview.net/pdf?id=xD07n1BUnV"
tldr: 本研究推出了OpenMedQ，这是一个在迄今为止最广泛的完全开放医学数据集上预训练的视觉语言模型。该模型整合了14个开源数据集，包含约335万个样本，涵盖了病理学、放射学、显微镜学及纯文本临床问答等多个领域。通过这种大规模、多模态的开放预训练，OpenMedQ为医疗AI提供了一个高性能且通用的开源基准，显著提升了模型在多样化医疗场景下的理解能力。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在解决现有医学视觉语言模型在数据多样性和开放性上的局限，构建一个覆盖多领域的通用开源预训练模型。
method: 利用包含14个开源数据集、共计335万个样本的混合数据，对模型进行跨病理、放射和显微镜等多模态的预训练。
result: 成功构建了目前规模最大、覆盖面最广的完全开放医学预训练模型，实现了对多种医疗影像和临床知识的深度整合。
conclusion: OpenMedQ证明了通过大规模整合开放医学数据，可以有效提升视觉语言模型在复杂医疗场景下的通用性和性能。
---

## 摘要
我们提出了 OpenMedQ，这是一个在迄今为止最广泛的全开放医学混合数据集上进行预训练的医学视觉-语言模型。该模型在包含 14 个数据集、总计约 335 万个预训练样本的数据集上进行了训练，涵盖了病理学、放射学、显微镜学以及纯文本临床问答（QA）等多个领域。

## Abstract
We present OpenMedQ, a medical vision-language model pretrained on thebroadest fully-open medical mix to date: 14 datasets totaling∼ 3.35 M pretrainingsamples spanning pathology, radiology, microscopy, and text-only clinical QA …

---

## 论文详细总结（自动生成）

以下是对论文《OpenMedQ: Broad Open Pretraining for Medical Vision-Language Models》的结构化深入总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
医学基础模型虽然发展迅速，但现有的医学视觉-语言模型（VLM）普遍存在两个痛点：
*   **封闭性：** 许多高性能模型（如 Med-PaLM M、BiomedGPT）不公开模型权重或预训练数据。
*   **局限性：** 现有的开源模型往往只针对单一模态（如仅放射影像）或使用较窄的预训练数据集。
**研究动机：** 旨在构建一个**完全开放**、**预训练数据最广泛**的医学 VLM 基准模型（OpenMedQ），为社区提供一个可检查、可重用且可扩展的基石。

### 2. 论文提出的方法论
*   **核心思想：** 采用 LLaVA 风格的架构，通过在大规模、多领域的开源医学数据集上进行“自回归次标记预测（Next-token prediction）”预训练，提升模型的通用医学理解能力。
*   **关键技术细节：**
    *   **架构组成：** 视觉编码器（$f_{vis}$）采用 **BiomedCLIP** (ViT-base-patch16-224)；语言模型采用 **PMC-LLaMA** (7B)；两者通过一个线性投影层（Linear Projection）连接。
    *   **训练策略：** 使用 **LoRA**（秩 $r=8$）进行高效微调。
    *   **输入处理：** 图像统一缩放至 $224 \times 224$。将图像 token 与文本 token 拼接后，对图像和前缀 token 进行掩码，仅对后续文本 token 计算交叉熵损失。

### 3. 实验设计
*   **预训练数据集（14个，约335万样本）：**
    *   **多模态：** 涵盖病理学（PathVQA）、放射学（MIMIC-CXR, IU-XRAY, VQA-RAD, ROCO, OmniMedVQA）、显微镜学（$\mu$-Bench）及混合模态（Slake, PMC-OA, PMC-VQA, VQA-MED）。
    *   **纯文本：** 包含约41万条临床 QA 样本（MedQA, MedMCQA, PubMedQA），用于在预训练期间保持语言能力。
*   **下游评估任务：**
    *   **分类迁移：** 在 8 个未见过的医学分类数据集（如 CXR8, MedFMC, Breast-Ultrasound 等）上测试视觉特征提取能力。
    *   **开放式 VQA：** 在 PathVQA 和 VQA-MED 上测试生成能力。
*   **对比方法（Benchmark）：**
    *   对比学习基准：BiomedCLIP, PMC-CLIP, PubMedCLIP。
    *   大规模生成模型：Med-PaLM M（参数量高达 562B）。

### 4. 资源与算力
*   **硬件：** 使用了**单张 NVIDIA A100 GPU**。
*   **训练参数：** 采用 AdamW 优化器，Batch Size 为 64，学习率为 $5 \times 10^{-5}$。
*   **时长：** 训练时长最多为 15 个 epoch。
*   **评价：** 论文展示了该模型在有限算力资源下（单卡）即可完成高效训练，具有较好的复现性。

### 5. 实验数量与充分性
*   **实验规模：** 涵盖了 14 个预训练数据集和 8 个下游分类基准，实验覆盖面较广。
*   **充分性：** 论文通过固定下游任务的微调方案（Identical downstream recipe），确保了不同预训练编码器之间的对比是**公平且客观**的。
*   **局限：** 作为一篇短论文（Short Paper），缺乏针对不同模型组件（如投影层、LoRA 秩）的详细消融实验。

### 6. 论文的主要结论与发现
*   **小模型胜大模型：** 仅 7B 参数的 OpenMedQ 在 PathVQA 上的 BLEU-1 分数（75.9）超过了参数量大 80 倍的 Med-PaLM M (562B)。
*   **预训练广度的价值：** 在 8 个未见过的分类任务中，OpenMedQ 的视觉编码器获得了最高的平均 Macro-F1 分数（0.757），证明了广泛的多模态预训练能显著增强视觉特征的通用性。
*   **数据多样性是关键：** 实验证明，数据的多样性是提升医学 VLM 性能的“竞争杠杆”，其效果甚至优于单纯的参数规模扩张。

### 7. 优点
*   **完全开源：** 承诺公开权重、数据集配方和交互式 Demo，极大地促进了医学 AI 的透明度和可复现性。
*   **跨领域覆盖：** 突破了单一放射影像的局限，整合了病理、显微镜等多种医学视觉数据。
*   **高效性：** 证明了在单张 A100 上通过合理的预训练策略也能达到 SOTA 性能。

### 8. 不足与局限
*   **分辨率限制：** 图像输入仅为 $224 \times 224$，对于需要高分辨率细节的医学影像（如某些病理切片或微小病灶）可能存在信息丢失。
*   **特定领域劣势：** 在某些特定模态（如乳腺超声）上，其表现略逊于专门针对该领域的编码器。
*   **评估指标单一：** VQA 任务主要依赖 BLEU-1，这只能反映表面文本的一致性，无法完全体现临床逻辑的准确性。

（完）
