---
title: "PolyAudio: Advancing Multi-Audio Reasoning in Large Audio Language Models with Interleaved Multi-Audio Contexts"
title_zh: PolyAudio：通过交错多音频上下文提升大型音频语言模型的多音频推理能力
authors: Unknown
date: Unknown
pdf: "https://aclanthology.org/2026.findings-acl.2101.pdf"
tldr: PolyAudio 针对现有大音频语言模型在处理交错多音频上下文推理方面的局限性，提出了一种全新的模型架构。该研究通过引入交错的多音频上下文学习，使模型能够理解并推理多个音频片段之间的复杂关系。PolyAudio 在多音频任务中表现出色，显著提升了模型在复杂音频场景下的交互与分析能力，为音频语言模型的研究开辟了新方向。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 现有音频语言模型大多局限于单片段音频任务，难以处理涉及多个音频片段及其交错文本的复杂推理场景。
method: 提出了 PolyAudio 模型，通过构建交错的多音频上下文数据集，并优化模型以支持对多个音频流的联合建模与推理。
result: 实验结果显示，PolyAudio 在多音频推理和跨音频关联任务上取得了显著的性能提升，优于现有的单音频模型。
conclusion: 该研究成功扩展了音频语言模型的能力边界，证明了交错上下文对于实现高级多音频推理至关重要。
---

## 摘要
大型音频语言模型在单片段音频语言任务（如自动语音识别、音频描述和声音事件识别）上表现出了卓越的性能。然而，它们在交错多音频上下文中的推理能力……

## Abstract
Abstract Large Audio Language Models have shown impressive performance onsingle-clip audio language tasks such as automatic speech recognition, captioning,and sound event recognition. Yet, their ability to reason over interleaved multi-audio …

---

## 论文详细总结（自动生成）

这是一份关于论文《PolyAudio: Advancing Multi-Audio Reasoning in Large Audio Language Models with Interleaved Multi-Audio Contexts》的结构化深入总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
目前的大型音频语言模型（LALMs）在处理单段音频（如语音识别、音频描述）方面表现出色，但在**交错多音频上下文（Interleaved Multi-Audio Contexts）**下的推理能力非常有限。
*   **研究动机**：现实世界的听觉环境通常是多维的，用户经常需要比较不同录音、跨文件追踪说话人或推断不连续片段间的叙事逻辑（例如：“第二个片段的背景噪音是否比第一个大？”）。
*   **核心挑战**：现有模型大多将音频视为孤立输入，缺乏处理跨片段引用、声学细微差异比较以及长上下文“大海捞针”问题的能力。

### 2. 论文提出的方法论
论文提出了 **PolyAudio**，这是一个基于 Audio Flamingo 3 构建的、专门针对多音频理解进行指令微调的模型。
*   **核心思想**：通过高质量的指令微调（Post-training Instruction Tuning）而非大规模预训练，赋予模型多音频推理能力。
*   **关键技术细节**：
    *   **交错表示法**：采用显式的交错格式，使用边界标记（`[BOA]` 和 `[EOA]`）和显式的片段索引（如 `audio {i}`）来标记音频块。这有助于模型在自然语言回复中准确地进行“接地”（Grounding）。
    *   **PolyAudio-Instruct 数据集**：构建了一个包含 **130万+ QA对** 的大规模数据集，涵盖 14 个子任务，分为四大核心能力：
        1.  **比较与差异**：识别异类、语音质量对比。
        2.  **共指与链接**：跨片段说话人链接、共同关键词提取。
        3.  **推理与逻辑**：音频蕴含、事实一致性、NeedleQA。
        4.  **时间理解**：按时间排序、时间定位、跨片段计数。
*   **算法流程**：音频经编码器（Whisper Large v3）和重采样投影后进入 LLM（Qwen-2.5-7B），模型在全上下文注意力机制下对交错的音频标记和文本进行联合推理。

### 3. 实验设计
*   **数据集/场景**：
    *   **PolyAudio-Bench**：论文自建的基准测试，包含 2000 个 QA 对，覆盖上述 14 类任务。
    *   **MMAU-Pro**：评估复杂多音频问答的第三方基准。
    *   **Audio Difference Dataset (ADIFF)**：评估音频对差异解释能力的基准。
*   **对比方法**：
    *   **通用/闭源模型**：Gemini 2.5 Pro。
    *   **开源 LALMs**：Qwen2-Audio-7B、Audio Flamingo 3（基座模型）。
    *   **专用模型**：ADIFF、Mellow（专门针对双音频设计的模型）。

### 4. 资源与算力
*   **硬件**：使用了 **8 张 NVIDIA A6000 GPU**。
*   **训练细节**：采用 LoRA 适配器微调，学习率为 1e-5，有效 Batch Size 为 128，Warmup 比例为 0.05。
*   **时长**：文中未明确给出总训练时长，但提到通过 LoRA 微调可以高效地在学术规模下完成。

### 5. 实验数量与充分性
*   **实验规模**：训练集包含 131 万个样本，测试集包含 2000 个样本，规模较大。
*   **消融实验**：
    *   **片段数量扩展**：测试了训练时音频片段数量（N=2 到 5）对性能的影响，发现 N=4 时性能趋于饱和。
    *   **输入格式对比**：对比了“显式交错”与“简单拼接（加静音）”，证明交错格式在保留片段身份方面具有显著优势。
    *   **推理模式对比**：对比了“端到端推理”与“文本后期融合（先生成描述再由 LLM 推理）”，证明端到端能保留更多声学细节。
*   **客观性**：引入了 **LLM-as-a-Judge**（使用 Qwen3-7B-Instruct）进行自动化评分，并通过人工评分验证了其相关性（Spearman 相关系数达 0.748），确保了评估的客观性。

### 6. 论文的主要结论与发现
*   **性能领先**：PolyAudio 在多音频推理任务上显著优于 Qwen2-Audio（领先 28.4%）和 Gemini 2.5 Pro。
*   **能力迁移**：通过针对性的指令微调，模型在提升多音频能力的同时，**并未牺牲**在单音频任务（如 MMAU-test）上的表现，甚至略有提升。
*   **数据效率**：证明了无需大规模多音频预训练，仅靠高质量的指令微调即可解锁高级跨片段推理能力。

### 7. 优点
*   **任务全面性**：首次系统性地定义并分类了多音频推理的四大核心能力和 14 个子任务。
*   **显式索引设计**：通过 `[BOA]/[EOA]` 和索引标记解决了多音频场景下的指代模糊问题。
*   **开源贡献**：提供了大规模的高质量指令微调数据集和基准测试，填补了该领域的空白。

### 8. 不足与局限
*   **合成数据依赖**：PolyAudio-Instruct 大量依赖 GPT-5 生成的合成脚本和 TTS 渲染，可能无法完全模拟真实世界中复杂的声学重叠或动态环境变化。
*   **基座模型限制**：性能受限于 Audio Flamingo 3 的音频编码器能力，对于极长音频或极高采样率的音频处理可能存在瓶颈。
*   **隐私风险**：论文提到跨片段说话人链接技术若被滥用，可能带来隐私追踪或监控方面的风险。

（完）
