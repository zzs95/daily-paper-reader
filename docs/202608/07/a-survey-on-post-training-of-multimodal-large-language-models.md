---
title: A Survey on Post-Training of Multimodal Large Language Models
title_zh: 多模态大语言模型后训练综述
authors: Unknown
date: Unknown
pdf: "https://www.preprints.org/frontend/manuscript/ed7a20eb7a0ebbc2b648751981fa9240/download_pub"
tldr: 多模态大语言模型（MLLMs）的后训练技术正深刻影响AI系统对数字与物理世界的理解与交互。现有综述往往聚焦于预训练或架构，对后训练阶段缺乏系统梳理。本文系统回顾了MLLMs后训练的关键方法，涵盖指令微调、偏好对齐、多模态推理增强等方向，并总结了相关基准与评估结果。该工作为研究者提供了清晰的技术图谱，有助于推动更高效、更可控的多模态模型开发。
source: google_scholar_email
selection_source: fresh_fetch
motivation: MLLMs后训练阶段对模型能力至关重要，但缺乏系统综述，亟需梳理技术脉络。
method: 系统分类并归纳后训练技术，包括监督微调、偏好优化及多模态对齐等方法。
result: 总结了各方法的适用场景与效果，并整合了常用基准与评估结论。
conclusion: 后训练技术是提升MLLMs性能的关键，未来需关注统一框架与动态对齐。
---

## 摘要
多模态大语言模型（MLLMs）的技术演进深刻影响了人工智能社区，重塑了智能系统在数字世界和物理世界中理解、推理和交互的方式。通过…

## Abstract
The technical evolution of Multimodal Large Language Models (MLLMs) hasprofoundly influenced the AI community, reshaping how intelligent systemsunderstand, reason, and interact in both the digital and physical worlds. Through …

---

## 论文详细总结（自动生成）

# 多模态大语言模型后训练（MMPoT）综述：中文详细总结

## 1. 论文的核心问题与整体含义（动机与背景）

- **研究背景**：多模态大语言模型（MLLMs）通过大规模多模态预训练，已具备跨图像、视频、音频和文本的基础感知与对齐能力，成为通往通用人工智能（AGI）的重要路径。然而，预训练本质上是学习大规模数据中的统计模式，**并不能保证模型行为符合人类需求、伦理原则和真实世界任务要求**（如有用性、安全性、忠实性、鲁棒性）。
- **核心问题**：预训练模型如何被转化为人类可接受、可控、可靠的行为系统？由此引出论文的根本性问题：**“MLLMs 后训练的共同底层过程是什么？它如何引导预训练模型形成期望的多模态行为？”**
- **现有综述缺陷**：已有工作或聚焦特定领域的人类对齐（应用导向），或只关注单一方法范式（技术导向），缺乏统一视角。本文首创性地提出**“行为塑造”（behavior-shaping）视角**，将后训练视为一套从“能力激活”到“策略精炼”再到“推理增强”的完整闭环过程。
- **桥接意义**：论文将 MLLMs 后训练定位为连接**多模态学习、数字AI与物理AI**的关键桥梁，是迈向 AGI 的核心中间步骤。

## 2. 论文提出的方法论

### 2.1 统一行为塑造框架

将后训练方法按“行为塑造循环”组织为两个互补视角：  
- **Refine & Update（精炼与更新）**：使用什么算法、改进什么能力；  
- **Source & Feedback（来源与反馈）**：监督来自哪里、行为如何被评估。

### 2.2 形式化定义

- 输入：多模态输入 $x_m$（图像、视频、音频等）+ 文本指令 $x_t$；输出：响应/动作 $y$。后训练优化目标：  
$$\max_\theta \mathbb{E}_{(x_m,x_t,f)\sim\mathcal{D}} [U(\pi_\theta; x_m, x_t, f)] \quad \text{s.t.} \quad C(\pi_\theta) \le \tau$$
其中 $U$ 衡量有用性、忠实性、推理成功、安全或任务奖励；$C$ 编码延迟、内存、标注成本、隐私与安全约束。

### 2.3 五大方法家族

1. **指令跟随（Instruction Following）**：基于多模态监督微调（SFT），优化损失：  
   $$\mathcal{L}_{SFT} = -\mathbb{E}_{(x_m,x_u,y)\sim\mathcal{D}_{inst}}\left[\sum_{t=1}^T \log p_\theta(y_t | y_{<t}, x_m, x_u)\right]$$  
   核心技术：视觉指令微调（LLaVA、MiniGPT-4、InstructBLIP）、指令感知视觉注入（LLaVA-1.5、LaVIN）、细粒度区域级微调（Shikra、Ferret）、多图像/视频扩展、指令数据混合策略（文本-多模态平衡）。

2. **偏好校准（Preference Calibration）**：
   - **RLHF**：奖励函数分结果奖励机制（ORM）与过程奖励机制（PRM，如 VisualPRM）；目标函数使用 KL 正则化：  
     $$\mathcal{L}_{RLHF} = -\mathbb{E}_{y\sim\pi_\theta}[r_\phi(x_t,x_v,y)] + \beta D_{KL}(\pi_\theta \| \pi_{ref})$$
   - **RLAIF**：用 AI 评估器替代或补充人类标注，提升反馈可扩展性（VLM-RLAIF、RLAIF-V）。
   - **多模态 DPO**：无需显式奖励模型，直接优化偏好对数概率差。演进出响应级、幻觉感知（HA-DPO、V-DPO、CLIP-DPO）、模态条件（mDPO、MoD-DPO）、硬负样本（DA-DPO）、列表级（LPOI）等多种变体。

3. **推理增强（Reason Enhancement）**：
   - **R1 风格多模态推理**：采用 R1-Zero（纯 RL 激发推理）和 R1（冷启动 SFT + RLVR/GRPO 两阶段）两种范式，奖励分解为：  
     $$r(x,y) = \lambda_{ans} r_{ans}(x,y) + \lambda_{fmt} r_{fmt}(y)$$  
     结构化输出格式为 `<think>推理过程</think><answer>答案</answer>`；代表工作：Vision-R1、VLM-R1、R1-Onevision、R1-Omni、Video-R1。
   - **图像思维（Thinking with Images）**：将图像作为主动推理媒介——视觉证据定位（GRIT、Point-RFT）、视觉工具调用（VTool-R1、DeepEyes）、潜在视觉推理（LanteRn）。
   - **自进化（Self-Evolution）**：自生成数据（VIGC、MindGYM）、反思与批判学习（SRPO、LLaVA-Critic）、验证器引导的自我改进（MM-UPT、LLaVA-Critic-R1）。
   - **高效推理/蒸馏**：离线知识蒸馏（LLaVA-KD、LLaVA-MoD）与在策略蒸馏 OPD（Uni-OPD、Video-OPD、Vision-OPD）。

4. **领域适配（Domain Adaptation）**：针对 GUI 代理、文档/高分率图像、医疗、自动驾驶等专门场景，联合考虑数据分布、视觉细节、任务接口与可靠性要求。代表方法：Mobile-Agent、GUI-R1、mPLUG-DocOwl1.5、LLaVA-UHD、Med-Gemini、AdaMLLM。

5. **可扩展训练（Scalable Training）**：
   - **参数高效**：LoRA 族方法（MixLoRA、LiLoRA、LLaVA-MoLE）、MoE 专家扩展（MoE-LLaVA、MoExtend、Qwen3-VL）。
   - **计算高效**：高效视觉处理（LLaVA-UHD、AdaLLaVA）、令牌压缩（FastV、VisionZip、SparseVLM、TokenPacker）、长上下文优化（LongVU、LongVILA、VideoChat-Flash）。

## 3. 实验设计（作为综述的覆盖范围与评估框架）

- **说明**：本文是**综述论文，不包含作者自行设计的新实验**；其“实验”体现在对文献方法、数据集与基准的系统梳理与归纳。
- **数据集/基准的四类归纳**：
  - **指令跟随**：LLaVA-Instruct-150K、ShareGPT4V（训练）；SEED-Bench、MM-Vet、MMBench、MME、MM-IFInstruct（评估）。
  - **偏好校准**：POPE、MMHal-Bench、HallusionBench、Lingua-SafetyBench（评估/安全）；LLaVA-RLHF、RLHF-V（反馈数据）。
  - **推理增强**：ScienceQA、MMMU、MathVista、MathVision、OlympiadBench、PuzzleBench、MME-CoT、MME-Reasoning。
  - **领域适配**：DocVQA、OCRBench、ChartQA、ChartX、Mind2Web、ScreenSpot（文档/GUI/图表）。
- **评估指标**：
  - 基于参考的指标：精确匹配、准确率、F1、mAP、IoU、BLEU、CIDEr、ANLS，以及循环评估（MMBench）、对数概率评分（MMMU）、推理感知评估（MathVista）。
  - 基于裁判的指标：评分制（MM-Vet、MMHal-Bench）与比较/胜率制（LLaVA-RLHF、Silkie）。
- **对比方法**：正文表格系统对比了代表性的 SFT 方法（LLaVA、InstructBLIP、Qwen2.5-VL 等 30+ 种）、偏好校准方法（多模态 RLHF/RLAIF/DPO 20+ 种）、推理增强方法（R1 系列、自进化、蒸馏 20+ 种）以及 LoRA/MoE/计算高效方法 20+ 种。

## 4. 资源与算力

- **综述本身未报告 GPU 数量、训练时长或模型规模**（综述不需要训练实验）。
- 仅在列举具体方法时有所体现，例如：LLaVA-MoLE 使用 64×A100，MixLoRA 使用 4×A100，MokA 约 8 个 GPU，LiLoRA 约 4 个 GPU；各基础模型参数量从 0.5B 到 235B 不等（Qwen3-VL 的 30B/235B 配置）。这说明论文在资源信息上为“间接转述”而非自行报告。

## 5. 实验数量与充分性（覆盖广度评估）

- **覆盖规模**：论文覆盖 2023—2026 年间大量代表性工作，正文 8 个表格汇总了约 90 项方法，参考文献近 200 篇，覆盖面广，横跨指令跟随、偏好对齐、推理增强、领域适配、高效扩展五大方向。
- **综述式评估的充分性**：
  - 由于是综述，**不涉及自身实验的客观性、公平性检验**；其价值体现在分类框架的完整性与方法论对比的结构化呈现。
  - 对每类方法都提供了技术细节、优化公式（SFT/RLHF/DPO/GRPO 目标函数）和代表性工作，便于读者横向比较。
  - 但各方法之间缺乏统一的定量性能对比表（即未报告具体 benchmark 分数），因此无法从数据上严格判断方法优劣，这是综述文体固有的局限。

## 6. 论文的主要结论与发现

- **后训练的本质是行为塑造**：后训练不是简单的“再训练”，而是将预训练的统计能力（capability activation）逐步转化为人类偏好对齐、视觉忠实、安全可控的策略过程（policy refinement）。
- **方法演化路径清晰**：从 2022—2023 年的 SFT/RLHF，到 2024 年的偏好学习与 DPO，再到 2024—2026 年的复杂多模态推理（R1 风格）、在策略蒸馏（OPD）与通用智能体对齐，体现了从“响应级修正”到“推理与决策级塑造”的演进。
- **奖励机制从粗到细**：从结果奖励（ORM）走向过程奖励（PRM）、可验证奖励（RLVR）、自奖励（无监督 GRPO），实现更细粒度的信用分配。
- **后训练是连接数字 AI 与物理 AI 的必经桥梁**：它赋予模型目标导向、决策、交互与行动能力，是通往 AGI 的关键一步。
- **未来三大开放问题**：扎根行为塑造（原生多模态信号、物理交互）、可靠性感知评估（抗幻觉/过置信/分布偏移、复杂真实场景）、面向泛化的规模化（通才模型、持续流式世界理解）。

## 7. 优点

- **统一视角新颖**：以“行为塑造循环”整合看似碎片化的后训练方法，回答了“不同方法背后的共同机制是什么”，填补了现有综述缺乏统一框架的空白。
- **分类系统全面**：五大方法家族覆盖了从训练算法（SFT/RLHF/DPO/GRPO）到数据来源（人类/AI 反馈、自生成）再到部署效率（LoRA/MoE/令牌压缩）的完整链条。
- **公式与流程清晰**：对 SFT、RLHF、DPO、R1 奖励函数等关键形式给出形式化定义，同时用图（行为塑造循环、时序图、流程图）辅助理解。
- **资源整理开源**：提供持续更新的方法列表（GitHub 仓库），社区参考价值高。
- **评估体系结构化**：按四类行为目标拆解数据集与基准，并区分参考型与裁判型指标，便于研究者快速选择评价工具。

## 8. 不足与局限

- **未同行评审**：论文发表于 2026 年 7 月的 Preprints.org 预印本，尚未经过正式同行评议，部分内容（如 2026 年大量 arXiv 编号）可靠性需后续验证。
- **缺乏定量对比**：作为综述未提供统一的实验性能比较表，无法直接从数字上判断各方法之间的优劣，分类结论可能受作者主观判断影响。
- **领域覆盖存在边界**：明确将红外、LiDAR 等专用传感器模态排除在外，对自动驾驶、医疗等下游领域的分析仅作为示例，未深入讨论这些领域特有的后训练约束。
- **分类边界偶有重叠**：某些方法同时涉及多个家族（如 RLAIF 既属于偏好校准也与推理增强相关），五大类的划分并非绝对互斥。
- **横跨预训练与后训练的方法处理较模糊**：论文对“跨阶段方法”的处理策略是仅纳入相关部分，但未详细说明剥离标准，可能造成理解偏差。
- **未来方向较宏观**：提出的三大未来方向偏纲领性，缺乏具体可操作的技术路线或评估协议建议。

（完）
