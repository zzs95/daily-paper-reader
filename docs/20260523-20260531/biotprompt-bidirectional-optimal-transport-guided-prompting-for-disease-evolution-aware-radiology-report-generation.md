---
title: "BiOTPrompt: Bidirectional Optimal Transport Guided Prompting for Disease Evolution-aware Radiology Report Generation"
title_zh: BiOTPrompt：面向疾病演变感知的放射学报告生成的双向最优传输引导提示方法
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026/papers/Liu_BiOTPrompt_Bidirectional_Optimal_Transport_Guided_Prompting_for_Disease_Evolution-aware_Radiology_CVPR_2026_paper.pdf"
tldr: 本研究针对放射科报告生成（RRG）中忽视病变演变的问题，提出了BiOTPrompt框架。该方法通过双向最优传输（BiOT）引导的提示机制，有效地对比当前与历史胸部X射线图像，捕捉疾病的动态进展。BiOTPrompt能够学习图像间的对齐关系，从而生成更具临床参考价值的演变感知报告，在多项指标上提升了报告生成的准确性。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 临床医生需要对比新旧影像来评估病情进展，但现有自动报告生成方法往往缺乏对这种时间维度演变的有效建模。
method: 提出BiOTPrompt框架，利用双向最优传输理论引导提示学习，实现当前影像与历史影像特征的深度对齐与对比。
result: 实验证明该方法能更准确地描述病灶变化，显著提升了放射报告的临床一致性和生成质量。
conclusion: BiOTPrompt通过引入纵向演变信息，为开发具备临床洞察力的自动放射报告生成系统提供了有效方案。
---

## 摘要
放射学报告生成 (RRG) 旨在通过自由文本报告自动描述医学图像。在临床实践中，比较当前与之前的胸部 X 射线检查对于评估疾病进展至关重要，这推动了……的发展。

## Abstract
Radiology report generation (RRG) aims to automatically describe medical imagesvia free-text reports. In clinical practice, comparing current and prior chest X-rays isessential for assessing disease progression, motivating the development of …

---

## 论文详细总结（自动生成）

以下是对论文《BiOTPrompt: Bidirectional Optimal Transport Guided Prompting for Disease Evolution-aware Radiology Report Generation》的结构化深入总结：

### 1. 核心问题与研究动机
*   **核心问题**：传统的放射学报告生成（RRG）多关注单张图像，而临床诊断通常需要对比“当前”与“历史”影像以评估疾病的演变（如病灶的新发、消失或稳定）。
*   **研究动机**：
    *   **时空对齐难**：不同时间点的影像因拍摄角度、呼吸相位不同存在空间失配。
    *   **演变不对称性**：疾病进展（新发）与好转（消失）在特征空间上是不对称的，现有方法多采用单向对齐或静态推理，难以捕捉细粒度的局部变化。
    *   **幻觉问题**：模型容易生成与视觉证据不符的描述。

### 2. 核心方法论
BiOTPrompt 框架通过**双向最优传输（BiOT）**显式建模疾病演变动态，其核心流程包括：
*   **双向最优传输 (BiOT)**：
    *   将当前图 $I_c$ 和历史图 $I_p$ 编码为 Patch 级特征集。
    *   利用 Sinkhorn 算法求解两个方向的最优传输方案（$P_{c \to p}$ 和 $P_{p \to c}$），实现非对齐解剖区域间的软匹配。
*   **双流不对称分析器 (Dual-Flow Asymmetry Analyzer)**：
    *   通过计算传输质量的发送与接收强度，识别“新发区域”（在当前图中存在但在历史图中无对应）和“消失区域”（在历史图中存在但在当前图中已解决）。
*   **OT 引导的动态提示构建**：
    *   将识别出的演变区域空间索引转化为结构化文本提示（Prompt），告知大语言模型（LLM，如 Llama-2）哪些位置出现了新病灶或病灶已吸收。
*   **视觉-语言一致性约束 (VLCC)**：
    *   引入双分支分类头（视觉分支和文本分支），通过二元交叉熵损失和 KL 散度损失，强制生成的文本描述与视觉特征在疾病标签分布上保持一致，减少幻觉。

### 3. 实验设计
*   **数据集**：使用 **Longitudinal-MIMIC** 数据集（MIMIC-CXR 的子集），包含 26,625 名患者的 94,169 对“影像-报告”对。
*   **Benchmark 与对比方法**：
    *   **单时点方法**：R2Gen, R2GenGPT, PromptMRG 等。
    *   **纵向（多时点）方法**：Prefilling, HERGen, HC-LLM 等。
*   **评价指标**：
    *   **NLG 指标**：BLEU, ROUGE-L, METEOR, CIDEr。
    *   **临床准确性 (CE)**：使用 CheXbert 提取标签，计算 Precision, Recall, F1-score。

### 4. 资源与算力
*   **硬件**：使用单张 **NVIDIA A800 (80GB)** GPU。
*   **训练细节**：采用混合精度训练，共 5 个 Epoch；Batch Size 为 12；学习率为 1e-4。
*   **模型配置**：视觉编码器为 Swin-Transformer，语言模型为 Llama-2-7B。

### 5. 实验数量与充分性
*   **实验规模**：在近 10 万规模的大型数据集上进行了验证。
*   **消融实验**：系统地验证了 BiOT 模块、不对称分析器（DFAA）、一致性约束（VLCC）以及不同损失项的贡献。
*   **敏感性分析**：针对不对称阈值 $\delta$、损失权重 $\lambda_1, \lambda_2$ 以及不同的区域选择策略（如 Top-K、固定阈值等）进行了详尽的参数讨论。
*   **充分性评价**：实验设计全面，涵盖了定量指标、定性可视化（t-SNE 分布、病灶掩码可视化）及临床一致性分析，结果具有较强的说服力。

### 6. 主要结论与发现
*   **性能领先**：BiOTPrompt 在所有语言指标和临床 F1 分数上均达到了 SOTA 水平。
*   **视觉演变的重要性**：即使不依赖历史文本报告（仅靠历史图像），BiOTPrompt 的表现也优于许多同时利用历史图像和报告的方法。
*   **双向建模的必要性**：实验证明，双向 OT 比单向对齐能更精准地定位病理变化，显著提升报告的临床忠实度。

### 7. 优点与亮点
*   **理论创新**：首次将双向最优传输引入纵向 RRG，巧妙地解决了医学影像对齐与不对称演变建模的难题。
*   **细粒度感知**：不同于以往的全局对齐，该方法能定位到 Patch 级别的局部变化，并将其转化为 LLM 可理解的提示。
*   **鲁棒性强**：通过双流校验机制减少了因噪声或解剖差异导致的误报。

### 8. 不足与局限
*   **时间跨度限制**：目前主要针对“两个时间点”的对比建模，尚未扩展到更长序列的多时点（Multi-timepoint）分析。
*   **模态局限**：实验仅在胸部 X 射线（CXR）上完成，对于 CT、MRI 等三维或更复杂的医学影像模态的泛化性有待验证。
*   **计算开销**：虽然使用了 Sinkhorn 算法优化，但 Patch 级的双向 OT 计算在处理极高分辨率图像时可能存在计算瓶颈。

（完）
