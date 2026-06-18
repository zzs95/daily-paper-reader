---
title: "Supplementary Material—LLaDA-MedV: Exploring Large Language Diffusion Models for Biomedical Image Understanding"
title_zh: 补充材料——LLaDA-MedV：探索用于生物医学图像理解的大语言扩散模型
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026/supplemental/Dong_LLaDA-MedV_Exploring_Large_CVPR_2026_supplemental.pdf"
tldr: 本研究提出了LLaDA-MedV，旨在探索大语言扩散模型在生物医学图像理解中的应用。通过精心设计的三阶段训练过程，模型首先建立生物医学语言与视觉内容之间的深层语义对齐，随后通过指令微调提升其对复杂医学任务的理解与执行能力，为医学多模态学习提供了新的扩散模型范式。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 针对生物医学领域中语言与视觉语义对齐难度大的问题，探索大语言扩散模型在医学影像理解中的潜力。
method: 采用三阶段训练架构，前两个阶段侧重于跨模态语义对齐，第三阶段旨在增强模型遵循指令的能力。
result: 成功构建了能够实现生物医学语言与视觉内容精准对齐的多模态扩散模型框架。
conclusion: LLaDA-MedV证明了扩散模型在生物医学图像理解任务中的有效性，为该领域的跨模态研究提供了新路径。
---

## 摘要
LLaDA-MedV 的训练过程分为三个阶段。遵循 [5] 的方法，前两个阶段旨在建立生物医学语言与视觉内容之间的语义对齐，同时使模型能够遵循……

## Abstract
The training process of LLaDA-MedV is structured into three stages. Following theapproach of [5], the first two stages aim to establish semantic alignment betweenbiomedical language and visual content, while also enabling the model to follow …

---

## 论文详细总结（自动生成）

以下是对论文补充材料《LLaDA-MedV: Exploring Large Language Diffusion Models for Biomedical Image Understanding》的结构化深入总结：

### 1. 论文的核心问题与整体含义
*   **研究背景**：生物医学图像理解要求模型具备极高的语义对齐能力和精确的指令遵循能力。传统的自回归多模态模型在处理长文本医学解释时，有时会出现信息密度不足或逻辑断裂。
*   **核心问题**：本文旨在探索**大语言扩散模型（LLaDA）**在生物医学领域的应用潜力。通过将扩散机制引入视觉语言模型（VLM），研究如何利用非自回归的掩码预测机制来提升模型对复杂医学影像的理解与对话生成质量。

### 2. 论文提出的方法论
*   **核心架构**：
    *   **语言骨干**：采用 LLaDA-8B-Instruct（基于扩散的大语言模型）。
    *   **视觉编码器**：使用 SigLIP2-so400m-patch14-384。
    *   **连接模块**：轻量化两层 MLP，使用 GELU 激活函数。
*   **三阶段训练策略**：
    1.  **语义对齐阶段**：使用 600K 图像-文本对，仅训练投影层，使模型学习图像特征与生物医学词汇的映射。
    2.  **多轮对话微调**：使用 60K 包含实体提及的对话数据，使模型具备遵循视觉指令和处理上下文的能力。
    3.  **特定任务 SFT**：在 VQA-RAD、SLAKE 和 PathVQA 三个医学 VQA 数据集上进行监督微调，强化模型在专业场景下的表现。
*   **推理算法（关键技术）**：
    *   **掩码扩散逆过程**：从全掩码状态开始，迭代预测并填充 token。
    *   **低置信度重掩码（Low-confidence Remasking）**：在每一步迭代中，仅保留高置信度 token，对低置信度部分重新掩码。
    *   **半自回归生成（Semi-autoregressive Generation）**：将长响应划分为多个块（Block），在块内进行扩散生成，块间保持顺序，平衡了生成效率与全局一致性。

### 3. 实验设计
*   **数据集**：
    *   **训练集**：600K 对齐数据 + 60K 对话数据 + 3个 VQA 训练集。
    *   **下游 Benchmark**：VQA-RAD（放射学）、SLAKE（语义标注医学影像）、PathVQA（病理学）。
    *   **开放式对话评估**：包含 193 个问题和 50 张未见图像的测试集。
*   **对比方法**：对比了 9 种模型，包括通用模型（LLaMA-3.2-Vision, LLaVA-1.5, Qwen2-VL）和医学专用模型（LLaVA-Med, Med-Flamingo, MedVLM-R1, RetinalGPT 等）。
*   **评估指标**：采用 GPT-4.1 mini 作为自动评估员，从有用性、相关性、准确性和细节度四个维度评分，并计算相对于 GPT-4 参考答案的相对得分。

### 4. 资源与算力
*   **硬件环境**：使用了 **4 台 NVIDIA A100 (80GB)** GPU。
*   **训练细节**：
    *   使用了 DeepSpeed ZeRO-3 优化策略。
    *   学习率：投影层最高 $1 \times 10^{-3}$，语言骨干最高 $1 \times 10^{-5}$。
    *   Batch Size：全局为 32（对齐阶段）或 8（微调阶段）。
*   **时长说明**：文中未明确给出总训练时长，但提到遵循了 LLaVA-Med 的高效训练流程。

### 5. 实验数量与充分性
*   **实验规模**：
    *   涵盖了三大主流医学 VQA 数据集。
    *   针对推理时的关键超参数（响应长度 $L$、块长度 $B$、采样步数 $Z$）进行了详细的消融实验和定性可视化分析。
*   **公平性与客观性**：
    *   所有对比模型均设置了相同的 256 token 长度限制。
    *   使用了最新的 SigLIP2 视觉塔和 LLaDA 骨干，确保了基准线的先进性。
    *   通过 GPT-4.1 mini 提供详细的评分理由，增加了评估的透明度。

### 6. 论文的主要结论与发现
*   **扩散模型的优势**：LLaDA-MedV 在相同长度限制下，生成的响应比自回归模型（如 LLaVA-Med）更详尽、上下文信息更丰富。
*   **推理参数的影响**：
    *   **采样步数 $Z$**：步数不足会导致 token 重复（如“the the the”现象），增加步数能显著提升生成质量。
    *   **块长度 $B$**：在半自回归模式下，块的大小直接影响逻辑连贯性。
*   **性能表现**：模型在开放式医学对话和结构化 VQA 任务中均表现出极强的竞争力，证明了扩散模型在多模态医学理解中的可行性。

### 7. 优点
*   **范式创新**：打破了医学 VLM 领域由自回归模型主导的局面，引入了大语言扩散模型。
*   **推理灵活**：通过半自回归和重掩码策略，提供了比传统模型更多的推理时可调空间。
*   **可视化深入**：补充材料提供了大量对比图，直观展示了不同参数对医学文本生成逻辑的影响。

### 8. 不足与局限
*   **推理延迟**：扩散模型需要多次迭代预测，其推理速度（Latency）通常高于自回归模型，文中未详细对比推理耗时。
*   **评估偏差**：虽然使用了 GPT-4.1 mini，但 LLM 作为裁判可能存在对“长文本”或“特定风格”的偏好偏见。
*   **算力门槛**：A100 级别的训练和复杂的扩散推理过程对实际部署的硬件有一定要求。

（完）
