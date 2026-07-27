---
title: A Survey on Post-Training of Multimodal Large Language Models
authors: Unknown
date: Unknown
pdf: "https://www.preprints.org/frontend/manuscript/ed7a20eb7a0ebbc2b648751981fa9240/download_pub"
tldr: "The technical evolution of Multimodal Large Language Models (MLLMs) hasprofoundly influenced the AI community, reshaping how intelligent systemsunderstand, reason, and interact in both the digital and physical worlds. Through …。"
source: google_scholar_email
selection_source: fresh_fetch
motivation: 本文关注一个具有代表性的研究问题，并尝试提升现有方法的效果或可解释性。
method: 方法与实现细节请参考摘要与正文。
result: 结果与对比结论请参考摘要与正文。
conclusion: 总体而言，该工作在所述任务上展示了有效性，并提供了可复用的思路或工具。
---

## 摘要
多模态大型语言模型（MLLMs）的技术进化对人工智能社区产生了深远影响，重塑了智能系统在数字和物理世界中理解、推理和交互的方式。通过…

## 速览
**TLDR**：多模态大语言模型后训练技术综述，涵盖指令微调、偏好对齐和参数高效微调等方法。研究发现后训练显著提升模型在视觉问答、多模态推理等任务上的性能，同时揭示数据质量与多样化的重要性。该综述系统梳理了后训练范式的演进，为未来多模态基础模型的研究提供方向性指导。 \
**Motivation**：系统梳理多模态大语言模型后训练的技术路径与进展，为领域研究提供结构化参考。 \
**Method**：归纳分类后训练方法，包括指令微调、偏好优化、参数高效微调等，分析其设计原则与效果。 \
**Result**：后训练在保持泛化能力的同时，显著增强模型的多模态对齐与指令遵从能力。 \
**Conclusion**：后训练是释放多模态大语言模型潜力的关键，高质量数据和多样化训练策略是未来重点。

---

## Abstract
The technical evolution of Multimodal Large Language Models (MLLMs) hasprofoundly influenced the AI community, reshaping how intelligent systemsunderstand, reason, and interact in both the digital and physical worlds. Through …

---

## 论文详细总结（自动生成）

## 1. 论文的核心问题与整体含义

- **研究动机**：多模态大语言模型（MLLMs）通过大规模预训练获得了基础感知和对齐能力，但如何进一步将其转化为符合人类意图和真实任务需求的可靠、可控行为，是一个关键挑战。后训练（post-training）作为连接预训练与人类对齐的桥梁，正成为推动多模态智能的重要范式。
- **研究问题**：本文旨在系统回答“什么是 MLLMs 后训练的共同过程，以及它如何引导预训练模型趋向期望的多模态行为？”
- **整体含义**：本文主张从“行为塑造（behavior shaping）”视角统一理解后训练，将分散的技术方法（指令微调、偏好优化、推理增强等）整合为一个完整的闭环框架（Refine & Update 与 Source & Feedback），从而为 MLLMs 后训练领域提供结构化综述，并指明未来方向。

## 2. 论文提出的方法论

- **核心思想**：将 MLLMs 后训练视为多模态行为塑造过程：通过不同的训练算法（指令跟随、偏好校准、推理增强、领域适应、可扩展训练）对预训练模型进行迭代更新，同时依赖多模态数据和基准提供学习信号和评估反馈。
- **关键技术细节**：
  - **指令跟随（Instruction Following）**：基于视觉指令调优（SFT），使用（图像/视频 + 指令 → 响应）对训练，典型方法如 LLaVA、InstructBLIP。形式化为最小化交叉熵损失。
  - **偏好校准（Preference Calibration）**：利用人类 / AI 反馈或直接偏好优化（DPO），通过偏好对（选择/拒绝）或奖励信号引导模型生成更符合人类偏好的输出。涵盖 RLHF（PPO）、RLAIF、DPO 及其变体（如 HA-DPO、V-DPO）。
  - **推理增强（Reason Enhancement）**：引入可验证奖励的强化学习（如 GRPO），模仿 o1 / DeepSeek-R1 式推理，通过“思考+答案”格式强化结构化推理。代表方法有 Vision-R1、R1-Onevision 等，并包括“用图像思考”（Thinking with Images）和自我进化机制。
  - **领域适应（Domain Adaptation）**：针对特定领域（如 GUI 代理、医学、文档理解）进行后训练，调整感知、动作和推理能力。方法包括 Mobile-Agent、Med-Gemini 等。
  - **可扩展训练（Scalable Training）**：通过参数高效微调（LoRA、MoE）和计算高效优化（令牌压缩、长上下文优化）实现大规模行为塑造，降低资源开销。

- **公式/算法流程**：论文给出了通用的优化目标：
  - 后训练优化：max<sub>θ</sub> E[U(π<sub>θ</sub>; x<sub>m</sub>, x<sub>t</sub>, f)] s.t. C(π<sub>θ</sub>) ≤ τ  
    其中 U 表示有用性、安全性等，C 表示约束（延迟、内存等）。
  - 指令跟随损失：L<sub>SFT</sub> = -∑log p<sub>θ</sub>(y<sub>t</sub> | ...)
  - 偏好优化：L<sub>DPO</sub> = -E[log σ(β (log (π<sub>θ</sub>(y<sub>w</sub>)/π<sub>ref</sub>(y<sub>w</sub>)) - log (π<sub>θ</sub>(y<sub>l</sub>)/π<sub>ref</sub>(y<sub>l</sub>)) )]
  - 推理增强：L<sub>R1</sub> = -E<sub>y~π<sub>θ</sub></sub>[A(x,y)] + λR(π<sub>θ</sub>, π<sub>ref</sub>)

## 3. 实验设计

- **使用的数据集/场景**：论文系统梳理了五类行为的典型数据集：
  - 指令跟随：LLaVA-Instruct-150K、ShareGPT4V、MMBench、MME、SEED-Bench 等。
  - 偏好校准：POPE、MMHal-Bench、HallusionBench、RLHF-V 数据等。
  - 推理增强：ScienceQA、MMMU、MathVista、MME-CoT、MME-Reasoning、PuzzleBench 等。
  - 领域适应：DocVQA、Mind2Web、ChartX、ScreenSpot、OCRBench 等。
- **Benchmark**：综述总结了主流评测基准和指标，包括参考式（准确率、F1、ANLS）和裁判式（人工评估、LLM-as-Judge）指标。
- **对比方法**：文中通过多个表格（Table 1-7）比较了代表性方法的架构、参数量、训练数据规模、优化范式等，但未进行统一量化对比（因是综述，无自身实验）。

## 4. 资源与算力

- 论文部分表格中提及了一些方法的 GPU 配置：
  - Table 5（LoRA 方法）：LLaVA-MoLE 使用 64×A100，MixLoRA 使用 4×A100，MokA 使用 8×A100（推测），LiLoRA 使用 4×A100。
  - 其他方法如 LLaVA、Qwen2-VL 等未明确具体 GPU 数量或训练时长。
  - 对于大规模模型（如 Qwen3-VL、InternVL3），论文提到使用了大量预训练数据（例如 Qwen2.5-VL 使用了 ~4.1T tokens + ~2M 指令数据），但未给出确切算力数字。
- **总体**：论文以综述为主，对多数方法的训练具体算力描述不够全面，仅在部分 LoRA/MoE 方法中有所提及。

## 5. 实验数量与充分性

- **覆盖范围**：论文全面覆盖了 2022–2026 年间 MLLMs 后训练的主要工作，涉及五个家族数百篇文献，并给出时间线（Figure 4）。
- **实验充分性**：作为综述，自身不包含实验，但对每种方法家族的关键评估基准和结果进行了总结，并讨论了不同方法的行为差异。其分析基于已发表的实验结果，相对客观。
- **公平性**：论文指出不同方法在反馈源、目标、更新组件和评估协议上存在差异，因此直接比较困难，但通过统一框架进行比较具有参考价值。

## 6. 论文的主要结论与发现

- **后训练是 MLLMs 行为塑造的核心机制**：从早期 SFT 激活能力，到 RLHF/DPO 对齐偏好，再到 R1 式推理和自我进化，后训练逐步将预训练模型转化为可靠、可控的系统。
- **五大家族分类有效覆盖了现有方法**：指令跟随、偏好校准、推理增强、领域适应、可扩展训练构成了完整的技术图谱。
- **高质量数据和多样化训练策略是关键**：有效的行为塑造不仅依赖算法，还依赖于数据组合、反馈质量和约束设计。
- **未来方向**：原生多模态后训练、物理世界交互、可信评估、流式理解、可扩展泛化是重要前沿。

## 7. 优点

- **统一行为塑造视角**：将分散的后训练技术整合为一个闭环框架，清晰展现了“算法-反馈-评估”的迭代过程。
- **系统全面的综述**：覆盖了截至 2026 年的大量代表性工作，提供了详细分类表格（方法、参数、数据、优化范式）和时间线。
- **前瞻性洞察**：识别出领域适应、推理增强、可扩展训练等新兴方向，并给出了未来研究路线图。
- **实用性强**：附有开源论文列表链接（GitHub），便于研究者追踪最新进展。

## 8. 不足与局限

- **无自身实验验证**：作为综述，未提出新方法或进行实验，因此无法验证其分类框架的有效性或对具体方法给出定量比较。
- **算力信息不完整**：对多数方法的训练资源（GPU 型号、数量、时长）未做系统统计，不利于资源评估。
- **部分领域覆盖有限**：虽然包括了医疗、GUI、文档等，但对自动驾驶、3D 感知等更多细分领域的后训练讨论较浅。
- **评估指标分析偏泛**：虽然提到了参考式和裁判式指标，但未深入分析各指标的局限性（如基准泄漏、裁判偏见等）。
- **时效性风险**：由于是预印本（2026 年 7 月发），后训练领域发展迅速，部分最新进展可能未纳入。

（完）
