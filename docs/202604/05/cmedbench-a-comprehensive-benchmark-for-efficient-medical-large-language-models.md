---
title: "CMedBench: A Comprehensive Benchmark for Efficient Medical Large Language Models"
title_zh: CMedBench：高效医疗大语言模型的综合基准测试
authors: Unknown
date: Unknown
pdf: "https://ojs.aaai.org/index.php/AAAI/article/download/39264/43225"
tldr: 本研究针对医疗大语言模型在部署时面临的高计算和内存消耗挑战，提出了CMedBench，这是一个专门用于评估高效医疗LLM的综合基准。该基准重点关注量化和稀疏化等模型压缩技术在医疗场景下的表现，旨在为开发兼顾性能与效率的医疗AI模型提供标准化评估工具，推动医疗大模型在实际临床环境中的落地应用。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 医疗大语言模型因极高的计算和内存需求，导致其在实际医疗场景中的部署受到严重限制。
method: 提出了CMedBench基准，专门用于系统性评估经过量化和稀疏化等压缩技术处理后的医疗LLM性能。
result: 该基准为衡量不同压缩技术在医疗专业任务中的有效性提供了全面的评估框架和实验数据。
conclusion: CMedBench填补了高效医疗大模型评估领域的空白，对促进低资源环境下医疗AI的普及具有重要意义。
---

## 摘要
大语言模型 (LLMs) 在增强医疗应用方面具有巨大潜力，但其部署受到高计算和内存需求的阻碍。模型压缩技术，如量化和稀疏化……

## Abstract
Large Language Models (LLMs) hold significant potential for enhancing healthcareapplications, yet their deployment is hindered by high computational and memorydemands. Model compression techniques, such as quantization and sparsification …

---

## 论文详细总结（自动生成）

### CMedBench：高效医疗大语言模型综合基准测试论文总结

#### 1. 论文的核心问题与整体含义
*   **研究动机**：大语言模型（LLMs）在医疗诊断和决策支持方面潜力巨大，但其高昂的计算和内存需求限制了在资源受限或隐私敏感的临床环境中的部署。
*   **核心问题**：虽然模型压缩（如量化、稀疏化）是降低开销的关键，但压缩对医疗LLM的专业知识、临床应用能力、可信度及实际效率的影响尚缺乏系统性评估。
*   **研究目标**：填补医疗领域压缩模型评估的空白，提供一个标准化的框架，指导研究者在医疗场景中平衡模型效率与临床性能。

#### 2. 论文提出的方法论
CMedBench 提出了一个包含五个核心维度的评估框架，并定义了相应的量化指标：
*   **Track 1: 医疗知识能力 (Medical Knowledge Ability)**：评估通用医疗知识（GMK）、高级医疗知识（AMK）和生物医学文献理解（BLC）。
    *   **指标 (CPS)**：使用对数变换后的性能比率（压缩模型 vs. 原始模型），确保结果非负且抑制极端离群值。
*   **Track 2: 医疗应用能力 (Medical Application Ability)**：评估辅助医疗解释（AME）、临床诊断助手（CDA）和专家级理解与推理（EUR）。
*   **Track 3: 可信度维护 (Trustworthiness Maintenance)**：涵盖真实性、安全性、隐私性、伦理、鲁棒性和公平性六大维度。
    *   **指标 (TWY)**：通过指数变换评估压缩前后的可靠性差异。
*   **Track 4: 压缩交叉组合 (Compression Cross Combination)**：评估不同模型架构（如 LLaMA, Qwen）与不同规模（7B 到 72B）在各种压缩算法下的表现一致性。
*   **Track 5: 计算效率 (Computational Efficiency)**：测量显存占用（VRAM）、参数位宽（Bits）以及推理加速指标（首字延迟 TTFT、平均完成时间 ACT、吞吐量 TPS）。

#### 3. 实验设计
*   **模型选择**：共涉及 14 种模型架构，包括医疗微调模型（Meditron, HuatuoGPT-o1）和通用基座模型（LLaMA3, Qwen2.5），参数量跨度从 7B 到 72B。
*   **数据集**：使用了 31 个数据集，包括 MMLU-Health, MedQA, PubMedQA, MedexQA, MedMCQA 等专业医疗问答和推理数据集。
*   **压缩方法**：对比了 11 种免训练（Training-free）压缩设置：
    *   **量化**：GPTQ, AWQ (4/8-bit), SmoothQuant (4-bit)。
    *   **稀疏化**：非结构化稀疏 (Wanda, 50%)，结构化剪枝 (ShortGPT, 15%/25%)。
*   **Benchmark 参照**：以原始稠密模型（Dense Model）的性能作为基准。

#### 4. 资源与算力
*   **硬件环境**：实验在 NVIDIA **A800** GPU 上进行。
*   **软件框架**：使用 **vLLM** 推理框架进行效率测试。
*   **训练/评估时长**：由于评估的是免训练压缩算法，不涉及大规模重训练，但论文未详细列出所有 31 个数据集在 14 个模型上的总推理耗时。

#### 5. 实验数量与充分性
*   **实验规模**：论文进行了大规模的实证研究，涵盖了 14 种模型、31 个数据集和 11 种压缩配置，实验组数非常多。
*   **充分性**：实验不仅关注准确率，还深入探讨了可信度和硬件效率，维度非常全面。
*   **客观性**：通过引入 CPS、TWY 等归一化指标，消除了不同任务难度差异带来的偏差，评估过程较为客观、公平。

#### 6. 论文的主要结论与发现
*   **量化表现优异**：4-bit 权重量化（如 AWQ, GPTQ）在大多数医疗任务中几乎能实现无损压缩，是目前医疗 LLM 部署的首选。
*   **稀疏化挑战**：非结构化稀疏（Wanda）虽然能保持性能，但由于缺乏硬件算子支持，实际推理加速不明显；结构化剪枝（ShortGPT）会导致性能显著下降。
*   **规模效应**：大尺寸模型（如 70B/72B）对结构化剪枝的耐受度更高，显示出更强的层冗余性。
*   **可信度波动**：压缩对真实性和安全性影响与性能趋势一致，但有趣的是，某些压缩设置反而提升了模型的“公平性”得分，这提示压缩过程可能改变了模型的内在偏差。

#### 7. 优点（亮点）
*   **首创性**：这是首个专门针对医疗领域压缩 LLM 的综合性基准测试。
*   **多维度评估**：不仅看分数，还看“可信度”和“实际部署效率”，非常贴合临床应用需求。
*   **实用指导性**：为医疗机构在不同硬件条件下选择“模型+压缩算法”的组合提供了量化依据。

#### 8. 不足与局限
*   **压缩算法覆盖有限**：主要集中在免训练（Training-free）方法，未涉及需要微调的压缩技术（如 QLoRA 或蒸馏）。
*   **任务类型局限**：虽然数据集多，但大多仍基于多选题或短文本问答，对于长篇病历生成、多轮复杂问诊的评估相对较少。
*   **硬件单一性**：效率测试主要基于 A800，未涵盖更广泛的边缘侧医疗设备（如移动端或嵌入式医疗终端）。

（完）
