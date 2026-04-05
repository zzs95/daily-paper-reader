---
title: "VCGD: Visual Clue Guided Decoding with Caption Model for Mitigating Hallucination in Multimodal Large Language Models"
title_zh: VCGD：利用描述模型进行视觉线索引导解码以缓解多模态大语言模型中的幻觉
authors: Unknown
date: Unknown
pdf: "https://ojs.aaai.org/index.php/AAAI/article/download/39089/43051"
tldr: 针对多模态大语言模型（MLLM）中普遍存在的幻觉问题，本文提出了VCGD（视觉线索引导解码）方法。该方法通过引入图像描述模型生成的视觉线索来干预解码过程，确保生成内容与图像事实一致。研究证明，VCGD能显著降低模型生成错误或虚假信息的概率，在不重新训练模型的情况下，有效提升了MLLM在多模态理解任务中的可靠性与忠实度。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 多模态大语言模型在理解和交互中常产生幻觉，即生成与实际视觉内容不符的错误或虚假信息。
method: 提出VCGD解码策略，利用图像描述模型提供的视觉线索来引导MLLM的解码过程，以减少幻觉。
result: 实验结果显示，VCGD方法能够有效缓解MLLM中的幻觉问题，显著提高生成内容与视觉事实的匹配度。
conclusion: VCGD通过引入外部视觉线索约束，为提升多模态大模型的忠实度和可靠性提供了一种简单且有效的解码方案。
---

## 摘要
多模态大语言模型（MLLMs）在多模态理解、推理和交互方面展现出强大的能力，但仍面临幻觉这一根本性局限，即模型会生成错误或虚假的信息……

## Abstract
Multimodal large language models (MLLMs) demonstrate strong capabilities inmultimodal understanding, reasoning, and interaction but still face the fundamentallimitation of hallucinations, where they generate erroneous or fabricated information …

---

## 论文详细总结（自动生成）

这是一份关于论文《VCGD: Visual Clue Guided Decoding with Caption Model for Mitigating Hallucination in Multimodal Large Language Models》的结构化深入总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
*   **核心问题**：多模态大语言模型（MLLMs）虽然在理解和推理上表现出色，但普遍存在**幻觉（Hallucination）**问题，即生成与视觉事实不符的错误信息（如误报物体、颜色错误、空间关系混乱）。
*   **研究动机**：现有的缓解策略（如对比解码 VCD、CODE 等）大多依赖模型自身的感知能力。作者认为，如果模型本身的视觉感知受限，自生成的描述也会包含幻觉，导致对比解码失效。因此，需要引入一个更精准的外部“视觉线索”来引导解码过程，并防止幻觉在生成过程中进一步传播。

### 2. 论文提出的方法论
该方法名为 **VCGD（视觉线索引导解码）**，主要包含两个核心阶段：

*   **Caption Model 的强化学习训练 (RA-GRPO)**：
    *   **核心思想**：训练一个专门的描述模型（Caption Model）来生成对回答问题最有帮助的“视觉线索”。
    *   **关键技术**：提出 **RA-GRPO** 算法，这是一种基于奖励代理（Reward Agent）的群体相对策略优化（GRPO）框架。
    *   **奖励机制**：Reward Agent 从四个维度评分：**格式奖励**（规范性）、**准确性奖励**（线索能否辅助 LLM 答对问题）、**匹配奖励**（线索与问题关键点的相关性）、**图像一致性奖励**（利用 CLIP 分数确保线索与图像内容一致）。
*   **视觉线索引导解码策略**：
    *   **对比解码公式**：在生成每个 Token 时，对比“原始图像输入”和“高质量视觉线索输入”下的 Logits 分布。通过动态权重 $\alpha_t$ 将两者结合，抑制模型自身的感知偏差。
    *   **图像置信度约束 (ICC)**：引入基于 CLIP 分数的动态约束。当视觉线索的置信度较低时，自动减小其对解码的影响，从而阻断幻觉的传播。
    *   **自适应概率约束**：仅在概率较高的 Token 集合（Vhead）中进行选择，确保生成的文本通顺且合理。

### 3. 实验设计
*   **数据集/场景**：
    *   **POPE**：评估物体存在性的幻觉。
    *   **MMVP**：评估 CLIP 模型难以识别的视觉细微差异。
    *   **MMHal-Bench**：评估更具挑战性的图像-问题对下的幻觉。
    *   **LLaVA-Bench (In-the-Wild)**：评估模型在复杂现实场景下的表现。
*   **基座模型 (Target MLLMs)**：LLaVA-1.5-13B、LLaVA-NeXT-34B、InternVL-26B。
*   **对比方法**：
    *   传统策略：Greedy Search、Beam Search、Nucleus Sampling。
    *   SOTA 缓解幻觉方法：**OPERA**（惩罚过度信任）、**VCD**（视觉对比解码）、**CODE**（对比自生成描述）。

### 4. 资源与算力
*   **模型规模**：训练了 Qwen2.5-VL 系列（3B, 7B, 32B, 72B）作为 Caption Model，最终主实验采用 **Qwen2.5-VL-7B**。
*   **算力细节**：论文中**未明确说明**具体的 GPU 型号、数量及总训练时长。但提到训练数据采样自 ShareGPT4V 和 LLaVA-CoT，并使用了 GPT-4 进行数据增强和奖励计算。

### 5. 实验数量与充分性
*   **实验规模**：在 4 个主流 Benchmark 上进行了全面测试，涵盖了从 13B 到 34B 不同参数规模的基座模型。
*   **消融实验**：
    *   验证了 Reward Agent 中四个奖励维度的必要性。
    *   对比了有无 RA-GRPO 训练的效果。
    *   分析了 Caption Model 不同规模对结果的影响。
    *   测试了手动注入幻觉信息时，ICC 约束的鲁棒性。
*   **充分性评价**：实验设计较为充分，不仅对比了准确率，还分析了推理延迟（Latency），并提供了定性的案例分析（Case Study），能够客观反映该方法的优劣。

### 6. 论文的主要结论与发现
*   **显著降低幻觉**：VCGD 在所有测试基准上均优于现有的对比解码方法（如 CODE 和 VCD）。例如在 MMVP 任务上，LLaVA-1.5-13B 的表现提升显著。
*   **强化学习的有效性**：通过 RA-GRPO 训练后的 Caption Model 提供的线索比原始模型生成的描述更能有效引导解码。
*   **鲁棒性强**：即使视觉线索中包含错误信息，ICC 约束也能有效防止这些错误传播到最终答案中。
*   **泛化性**：该方法是一个“即插即用”的增强策略，可以无缝集成到现有的各种 MLLM 架构中。

### 7. 优点（亮点）
*   **外部引导思路**：突破了模型自身感知能力的限制，通过辅助模型提供“第二意见”。
*   **创新的奖励设计**：RA-GRPO 框架将 LLM 的反馈（能否答对题）直接转化为视觉描述的优化目标，使线索更具实用性。
*   **动态置信度控制**：引入 ICC 机制解决了辅助模型可能引入新幻觉的风险，增强了系统的可靠性。

### 8. 不足与局限
*   **推理延迟**：由于需要先运行 Caption Model 生成线索，再进行双路 Logit 计算，其推理时间比 Greedy 搜索长（实验显示约为 2 倍左右），虽然优于 OPERA，但仍存在计算开销。
*   **依赖性**：VCGD 的效果高度依赖于 Caption Model 的质量。如果辅助模型规模太小，提升效果会打折扣。
*   **算力成本**：虽然是推理侧增强，但训练一个高性能的辅助 Caption Model 仍需要一定的标注数据和强化学习算力支持。

（完）
