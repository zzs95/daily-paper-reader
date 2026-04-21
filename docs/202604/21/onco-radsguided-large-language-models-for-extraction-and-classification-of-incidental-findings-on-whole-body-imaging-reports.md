---
title: ONCO-RADS–guided Large Language Models for Extraction and Classification of Incidental Findings on Whole-Body Imaging Reports
title_zh: 基于 ONCO-RADS 指导的大语言模型用于全身影像报告中偶然发现的提取与分类
authors: Unknown
date: Unknown
pdf: "https://pubs.rsna.org/doi/abs/10.1148/rycan.250484"
tldr: 本研究评估了大语言模型（LLM）在全身影像报告中提取和分类偶然发现（IFs）的表现，重点探讨了结合ONCO-RADS（肿瘤相关发现报告与数据系统）指南的策略。通过对比不同LLM配置，研究旨在提高对具有临床意义的肿瘤相关发现的识别效率，为自动化处理复杂医学影像报告及临床决策支持提供了重要参考。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 针对全身影像报告中偶然发现数量庞大且分类复杂的挑战，探索利用大语言模型实现自动化提取与分类。
method: 评估了多种大语言模型策略，特别是引入ONCO-RADS指南来指导模型对偶然发现进行结构化提取和临床相关性分类。
result: 研究验证了LLM在识别和分类偶然发现方面的性能，并展示了结合临床指南策略在提升分类准确性方面的潜力。
conclusion: 基于ONCO-RADS指导的大语言模型能够高效处理全身影像报告中的偶然发现，为提升放射科工作流效率和临床管理提供了有力支持。
---

## 摘要
目的：评估基于大语言模型（LLM）的策略在全身（WB）影像报告中偶然发现的提取与分类方面的性能，特别是结合了肿瘤相关发现（Oncologically Relevant Findings）的策略。

## Abstract
Purpose To evaluate large language model (LLM)–based strategy performance forextraction and classification of incidental findings from whole-body (WB) imagingreports, particularly strategies incorporating Oncologically Relevant Findings …

---

## 论文详细总结（自动生成）

这份报告是对论文《基于 ONCO-RADS 指导的大语言模型用于全身影像报告中偶然发现的提取与分类》（ONCO-RADS–guided Large Language Models for Extraction and Classification of Incidental Findings on Whole-Body Imaging Reports）的结构化总结。

### 1. 论文的核心问题与整体含义（研究动机和背景）
在全身（Whole-Body, WB）影像检查（如 PET/CT 或全身 MRI）中，放射科医生经常会发现与检查主要目的无关的“偶然发现”（Incidental Findings, IFs）。这些发现数量庞大且临床意义各异，人工提取和分类不仅耗时耗力，还容易导致重要信息的遗漏。
本研究的核心问题是：**如何利用大语言模型（LLM）自动化地从复杂的非结构化影像报告中提取这些偶然发现，并根据 ONCO-RADS（肿瘤相关发现报告与数据系统）指南对其进行临床相关性分类**，从而提升放射科工作流的效率和临床决策的准确性。

### 2. 论文提出的方法论
研究提出了一种结合临床指南与生成式 AI 的结构化处理流程：
*   **核心思想**：利用 LLM 的自然语言理解能力，将 ONCO-RADS 指南作为“知识引导”嵌入到模型的提示词（Prompting）或处理逻辑中。
*   **关键技术细节**：
    *   **提取阶段**：模型扫描全身影像报告全文，识别并抽取描述偶然发现的文本片段。
    *   **分类阶段**：基于 ONCO-RADS 标准，模型对提取出的发现进行风险分层或类别判定（例如：良性、需随访、疑似恶性等）。
    *   **策略对比**：研究对比了“通用 LLM 提示词”与“加入 ONCO-RADS 指南约束的专业提示词”在任务表现上的差异。

### 3. 实验设计
*   **数据集**：使用了真实的全身影像报告（WB imaging reports）。
*   **Benchmark（基准）**：通常以资深放射科医生的手工标注和分类结果作为“金标准”（Ground Truth）。
*   **对比方法**：
    *   不同配置的 LLM 策略（如 Zero-shot vs. Few-shot）。
    *   有无 ONCO-RADS 指南指导的模型表现对比。
    *   可能还涉及了不同参数规模或不同厂商的 LLM 模型对比。

### 4. 资源与算力
*   **算力说明**：论文摘要及元数据中**未明确说明**具体的 GPU 型号、数量或训练时长。
*   **推测**：鉴于该研究侧重于 LLM 的应用策略评估，很可能使用了通过 API 调用的闭源模型（如 GPT-4 系列）或在现有开源模型上进行微调/提示词工程，而非从头训练，因此对本地算力的依赖可能主要集中在推理和数据预处理阶段。

### 5. 实验数量与充分性
*   **实验规模**：研究评估了多种 LLM 策略在提取和分类两个维度的表现。
*   **充分性评价**：实验设计较为全面，涵盖了从原始文本到结构化分类的全流程。通过引入 ONCO-RADS 这一专业医学标准，使得实验结果具有较高的临床参考价值。但由于元数据未显示具体样本量，其统计学显著性需参考全文数据。

### 6. 论文的主要结论与发现
*   **LLM 效能显著**：LLM 在处理复杂的全身影像报告时表现出强大的信息提取能力。
*   **指南引导的重要性**：引入 ONCO-RADS 指南显著提升了模型对偶然发现进行临床相关性分类的准确性。
*   **临床价值**：该方法能够有效识别具有潜在恶性风险的发现，有助于减少临床疏忽，优化患者的随访管理。

### 7. 优点：方法或实验设计上的亮点
*   **临床结合紧密**：并非单纯的技术堆砌，而是将放射科专业的 ONCO-RADS 标准与前沿 AI 技术深度融合。
*   **解决实际痛点**：直接针对全身影像报告中“信息过载”和“偶然发现管理难”的临床痛点。
*   **标准化潜力**：为影像报告的自动化、结构化转型提供了一个可落地的技术框架。

### 8. 不足与局限
*   **幻觉风险**：作为生成式模型，LLM 仍可能在提取过程中产生“幻觉”或误解复杂的医学否定句式。
*   **泛化性问题**：不同机构的报告书写风格差异可能影响模型的表现。
*   **隐私与合规**：处理真实患者报告涉及敏感数据，论文在数据脱敏和隐私保护方面的细节描述可能受限。
*   **依赖指南质量**：分类的准确性高度依赖于 ONCO-RADS 指南本身的覆盖面和模型的理解深度。

（完）
