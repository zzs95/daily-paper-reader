---
title: "FairVLM: Enhancing Fairness and Prompt Sensitivity in Vision Language Models for Medical Image Segmentation"
title_zh: FairVLM：增强医学图像分割中视觉语言模型的公平性与提示敏感性
authors: Unknown
date: Unknown
pdf: "https://scholar.google.com/scholar_url?url=https://openaccess.thecvf.com/content/WACV2026/papers/Rahman_FairVLM_Enhancing_Fairness_and_Prompt_Sensitivity_in_Vision_Language_Models_WACV_2026_paper.pdf&hl=en&sa=X&d=11725616490923848040&ei=HrO-aeigI5GrieoP7rnduQU&scisig=AFtJQiy6L44p3aGUXTd-PewltmgR&oi=scholaralrt&hist=Sp41LysAAAAJ:7428935191213286109:AFtJQiwzJmvzlWJgngGiB1nbZtiZ&html=&pos=7&folt=rel"
tldr: 本研究针对视觉语言模型（VLM）在医疗图像分割中存在的公平性缺失和对提示词敏感度高的问题，提出了FairVLM框架。该框架通过优化模型对放射学报告提示的理解，增强了模型在不同人群和不同描述方式下的鲁棒性。主要贡献在于提升了医疗AI在临床部署中的公平性与可靠性，为多模态医疗影像分析提供了更稳健的解决方案。
motivation: 视觉语言模型在医疗影像分割中面临公平性不足以及对临床提示词过于敏感的挑战。
method: 提出了FairVLM框架，旨在通过增强模型对提示词的鲁棒性来提升分割性能和公平性。
result: 实验表明，该方法在提高医疗图像分割准确性的同时，显著降低了模型对不同提示词的敏感度并增强了公平性。
conclusion: FairVLM为解决医疗AI临床应用中的偏见和不稳定性问题提供了有效的技术路径。
---

## 摘要
视觉语言模型（VLMs）通过利用放射学报告作为提示来分割感兴趣区域，在医学图像分割中展现出了巨大的潜力。然而，VLM 在临床环境中的部署面临着两个……

## Abstract
Vision-language models (VLMs) have demonstrated substantial promise in medicalimage segmentation by utilizing radiology reports as prompts to segment regions ofinterest. However, VLM deployment in clinical settings is challenged by two …

---

## 论文详细总结（自动生成）

这是一份关于论文《FairVLM: Enhancing Fairness and Prompt Sensitivity in Vision Language Models for Medical Image Segmentation》的结构化总结：

### 1. 论文的核心问题与整体含义
*   **研究背景**：视觉语言模型（VLMs）在医学图像分割中表现出巨大潜力，能够根据放射学报告（提示词）识别病灶。
*   **核心问题**：论文指出了 VLM 在临床部署中面临的两个相互交织的挑战：
    1.  **人口统计学偏见**：模型在不同性别、种族、民族等群体间的表现存在显著差异。
    2.  **提示词敏感性**：语义相似但措辞略有不同的提示词会导致模型输出不一致。
*   **研究动机**：人口统计学代表性不足会加剧模型对提示词的敏感性，而提示词的不稳定性又会不成比例地影响特定弱势群体。论文旨在提出一个统一框架，同时解决公平性和鲁棒性问题。

### 2. 论文提出的方法论（FairVLM 框架）
FairVLM 是一个模型无关的框架，包含三个核心组件：
*   **语义保留反事实提示（SRCP）**：
    *   利用大语言模型（GPT-4o）生成临床一致且多样化的提示词变体。
    *   通过 **Jaccard 距离**（确保词汇多样性）和 **余弦相似度**（确保临床语义一致性）筛选出高质量的反事实提示词。
*   **人口统计感知特征归一化（DAFN）**：
    *   一个轻量级模块，通过计算特定人口统计群体的特征统计量（均值和标准差）来归一化潜在表示。
    *   使用**指数移动平均（EMA）**来稳定小批量训练中的群体统计数据，减少模型对人口统计属性的依赖。
*   **公平性校准损失（FCL）**：
    *   **差距惩罚**：显式惩罚表现最好和最差群体之间的性能差距（$\Delta_{gap}$）。
    *   **熵权方案**：根据群体样本量自适应调整损失权重，优先考虑代表性不足的群体。
    *   **一致性正则化（CPR）**：通过损失函数确保原始提示词与反事实提示词生成的分割掩码保持一致。

### 3. 实验设计
*   **数据集**：主要使用 **Harvard-FairSeg** 数据集（包含 10,000 张眼底图像，涵盖性别、种族、民族、语言四种人口统计属性）。
*   **基准模型（Backbones）**：SAMed 和 LViT。
*   **对比方法**：
    *   **公平性方法**：ADV（对抗训练）、GroupDRO、FEBS。
    *   **鲁棒性方法**：CoOp、CoCoOp、PromptSmooth 等（在相关工作中提及）。
*   **评估指标**：Dice、IoU、公平性缩放指标（ES-Dice, ES-IoU）、差异指数（DI）、相对性能差距（RPG）和标准差（STD）。

### 4. 资源与算力
*   **算力说明**：论文**未明确指出**具体的 GPU 型号和数量。
*   **训练细节**：提到了使用 AdamW 优化器，学习率为 0.001，权重衰减为 $1 \times 10^{-4}$，Batch Size 为 16，训练最多 300 个 Epoch，并设有早停机制（Patience=30）。

### 5. 实验数量与充分性
*   **实验规模**：
    *   在两个主流 VLM 架构（SAMed, LViT）上进行了验证。
    *   进行了详尽的**消融实验**，验证了 SRCP、DAFN 和 FCL 每个组件的贡献。
    *   进行了**分布外（OOD）泛化测试**：包括跨提示词风格（人工 vs GPT 生成）和跨数据集（MosMedData+, QaTa-COV19）的测试。
    *   提供了定性分析：包括特征分布可视化（t-SNE）、表示对齐分析（CKA）和显著性图（Grad-CAM）。
*   **充分性评价**：实验设计非常全面，不仅关注准确性，还深入探讨了公平性指标和鲁棒性，实验结果具有较强的说服力和客观性。

### 6. 论文的主要结论与发现
*   **公平性显著提升**：FairVLM 将人口统计学差异（DI）降低了 65% 以上，相对性能差距（RPG）降低了 60% 以上。
*   **鲁棒性增强**：模型对提示词变化的敏感度极低，不同提示词下的性能波动小于 0.5%。
*   **性能保持**：在提升公平性的同时，整体分割准确率（Dice/IoU）不仅没有下降，反而略有提升或保持稳定。
*   **泛化能力**：FairVLM 在未见过的提示词风格和完全不同的医疗数据集上均表现出良好的适应性。

### 7. 优点
*   **统一视角**：首次将人口统计公平性与提示词敏感性作为互相关联的问题进行统一处理。
*   **模型无关性**：FairVLM 作为一个插件式框架，可以轻松集成到现有的各种视觉语言分割模型中。
*   **轻量化**：DAFN 模块不改变模型架构，仅在特征层进行归一化，计算开销小。
*   **临床相关性**：SRCP 确保了生成的提示词符合临床逻辑，而非随机的噪声扰动。

### 8. 不足与局限
*   **外部数据集性能微降**：在跨数据集泛化实验中，虽然公平性指标提升，但原始分割准确率（Dice/IoU）相比基准模型有 1-2% 的轻微下降。
*   **依赖 LLM**：SRCP 模块依赖于 GPT-4o 等大模型生成反事实提示，这在离线或隐私敏感的临床环境中可能存在部署限制。
*   **属性覆盖**：虽然涵盖了四种主要属性，但对于更复杂的交叉属性（如特定种族中的特定性别群体）的讨论较少。

（完）
