---
title: "VCGD: Visual Clue Guided Decoding with Caption Model for Mitigating Hallucination in Multimodal Large Language Models"
title_zh: VCGD：利用描述模型进行视觉线索引导解码以缓解多模态大语言模型中的幻觉
authors: Unknown
date: Unknown
pdf: "https://ojs.aaai.org/index.php/AAAI/article/download/39089/43051"
tldr: 针对多模态大语言模型（MLLM）中普遍存在的幻觉问题，本文提出了视觉线索引导解码（VCGD）方法。该方法通过引入图像描述模型生成的视觉线索，在解码阶段实时引导模型生成更符合视觉事实的内容。实验证明，VCGD能有效减少模型生成的错误或虚假信息，显著提升了MLLM在多模态理解任务中的忠实度和可靠性。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在解决多模态大语言模型在生成过程中容易产生与视觉事实不符的幻觉信息这一核心局限性。
method: 提出了一种名为VCGD的解码策略，利用图像描述模型提供的视觉线索来动态引导主模型的文本生成过程。
result: 实验结果表明，该方法在多个基准测试中均能显著降低MLLM的幻觉率，提高生成内容与图像的一致性。
conclusion: VCGD为缓解多模态模型幻觉提供了一种无需额外训练且行之有效的解码端解决方案。
---

## 摘要
多模态大语言模型（MLLMs）在多模态理解、推理和交互方面展现出强大的能力，但仍面临幻觉这一根本性限制，即模型会生成错误或虚假的信息……

## Abstract
Multimodal large language models (MLLMs) demonstrate strong capabilities inmultimodal understanding, reasoning, and interaction but still face the fundamentallimitation of hallucinations, where they generate erroneous or fabricated information …

---

## 论文详细总结（自动生成）

这是一份关于论文 **《VCGD: Visual Clue Guided Decoding with Caption Model for Mitigating Hallucination in Multimodal Large Language Models》** 的结构化深入总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
多模态大语言模型（MLLM）虽然在视觉理解和推理上表现出色，但普遍存在**幻觉（Hallucination）**问题，即生成与图像事实不符的错误信息（如错误的物体数量、颜色或空间关系）。
*   **研究动机**：现有的缓解幻觉方法（如对比解码 VCD 或 CODE）大多依赖模型自身的感知能力。作者认为，如果模型本身的感知能力有限，自生成的描述也会包含幻觉，导致“幻觉传播”。
*   **核心目标**：引入一个专门训练的辅助描述模型（Caption Model）来提供精确的“视觉线索”，并在解码阶段通过对比机制引导主模型，从而纠正感知偏差。

### 2. 论文提出的方法论
该方法名为 **VCGD（视觉线索引导解码）**，主要包含两个核心部分：

*   **RA-GRPO 强化学习训练框架**：
    *   为了让辅助模型生成更有用的线索，作者采用了类似 DeepSeek-R1 的 **GRPO（群体相对策略优化）** 算法进行训练。
    *   **Reward Agent（奖励代理）**：从四个维度打分：
        1.  **格式奖励**：确保输出符合规范。
        2.  **准确性奖励**：利用 GPT-4 作为评判者，验证视觉线索是否能辅助回答问题。
        3.  **匹配奖励**：鼓励生成与问题相关的关键信息，减少冗余。
        4.  **图像一致性奖励**：利用 FG-CLIP 计算线索与图像的匹配得分。
*   **VCGD 解码策略**：
    *   **核心公式**：在生成每个 Token 时，将“原始图像输入”产生的 Logits 与“视觉线索输入”产生的 Logits 进行加权对比。
    *   **动态约束 ($\alpha_t$)**：引入图像置信度约束。利用 CLIP 分数评估视觉线索的可靠性，如果线索置信度低，则减小其权重，防止幻觉从辅助模型传播到主模型。
    *   **自适应截断**：结合自适应概率约束（Adaptive Plausibility Constraint），只在概率较高的 Token 集合中进行选择，确保生成的文本通顺。

### 3. 实验设计
*   **数据集/场景**：
    *   **POPE**：评估物体存在性的幻觉。
    *   **MMVP**：评估 CLIP 模型难以识别的视觉细节对。
    *   **MMHal-Bench**：评估复杂问答中的幻觉。
    *   **LLaVA-Bench (In-the-Wild)**：评估模型在真实场景下的综合表现。
*   **对比方法（Baselines）**：
    *   传统解码：Greedy Search, Beam Search, Nucleus Sampling。
    *   SOTA 缓解幻觉方法：**OPERA**（惩罚过度信赖）、**VCD**（视觉对比解码）、**CODE**（对比自生成描述）。
*   **实验模型**：使用 Qwen2.5-VL-7B 作为辅助模型；在 LLaVA-1.5-13B、LLaVA-NeXT-34B 和 InternVL-26B 三个主流模型上验证效果。

### 4. 资源与算力
*   **算力说明**：论文中**未明确给出**具体的 GPU 型号、数量及总训练时长。
*   **模型规模**：提到了对 Qwen2.5-VL 系列（3B, 7B, 32B, 72B）进行了实验对比，并最终选择 7B 版本作为默认的辅助模型。

### 5. 实验数量与充分性
*   **实验规模**：
    *   在 4 个主流 Benchmark 上进行了全面测试。
    *   针对 3 种不同架构和参数规模的主模型进行了验证。
    *   **消融实验**：详细分析了 Reward Agent 中四个奖励项的必要性（表 2），以及强化学习训练前后的效果对比（表 3）。
    *   **鲁棒性测试**：手动注入幻觉信息来测试“图像置信度约束”拦截错误传播的能力。
*   **评价**：实验设计较为充分，涵盖了从判别式任务到生成式任务的多种维度，对比了当前最先进的同类方法，结果具有较强的说服力。

### 6. 论文的主要结论与发现
*   **显著提升**：VCGD 在所有基准测试中均优于现有的对比解码方法（如 CODE 和 VCD）。例如在 MMVP 上，LLaVA-1.5-13B 的准确率从 30.6% 提升至 37.2%。
*   **强化学习的价值**：通过 RA-GRPO 训练后的辅助模型，其提供的视觉线索质量远高于原始模型，能更有效地引导主模型。
*   **抑制传播**：引入的置信度约束能有效防止辅助模型自身的错误干扰最终输出。
*   **通用性**：该方法是一个“即插即用”的解码策略，无需对主模型进行微调。

### 7. 优点（亮点）
*   **外部引导思路**：不同于以往只挖掘模型内部潜力，VCGD 引入外部高质量视觉线索，解决了主模型感知能力本身不足的问题。
*   **训练范式创新**：将强化学习（GRPO）应用于视觉描述的优化，并设计了多维度的奖励机制，使描述更具“问题导向性”。
*   **安全性设计**：通过 CLIP 分数动态调整权重，体现了对辅助模型不可信风险的防御意识。

### 8. 不足与局限
*   **推理延迟**：由于需要先运行辅助模型生成线索，且在解码每一步都要计算两遍 Logits，其推理时间比 Greedy 搜索长（实验显示约为 2 倍左右），虽然优于 OPERA，但仍存在计算开销。
*   **依赖辅助模型**：VCGD 的效果高度依赖于辅助 Caption Model 的质量。如果辅助模型在某些极端场景下也失效，性能提升将受限。
*   **算力细节缺失**：未披露具体的训练资源消耗，不便于其他研究者评估复现成本。

（完）
