---
title: End-to-End Optimization of LLM-Driven Multi-Agent Search Systems via Heterogeneous-Group-Based Reinforcement Learning
title_zh: 基于异构群体强化学习的大语言模型驱动多智能体搜索系统端到端优化
authors: Unknown
date: Unknown
pdf: "https://aclanthology.org/2026.acl-long.1399.pdf"
tldr: 本研究针对大语言模型在处理复杂实时任务时存在的知识滞后和单次推理可控性差的问题，提出了多智能体搜索系统（MASS）。为了解决现有系统优化不足的挑战，论文引入了一种基于异构群体强化学习（HGRL）的端到端优化框架。该方法通过协调不同角色的智能体并利用强化学习进行联合调优，显著提升了系统在复杂搜索场景下的表现，为构建高效、动态的LLM应用提供了新思路。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 解决大语言模型因知识截止日期限制和单次推理难以应对复杂实时搜索任务的局限性。
method: 提出一种基于异构群体强化学习（HGRL）的框架，对多智能体搜索系统进行端到端的协同优化。
result: 实验证明该方法能有效提升多智能体系统在复杂搜索任务中的协作效率和准确性。
conclusion: 通过异构群体强化学习进行端到端优化是提升LLM驱动的多智能体系统性能的关键途径。
---

## 摘要
大语言模型 (LLMs) 功能多样，但其在复杂现实场景中的部署受到静态知识截止以及在单次推理中难以产生可控行为的限制。多智能体搜索系统 (MASS) ……

## Abstract
Large language models (LLMs) are versatile, yet their deployment in complex real-world settings is limited by static knowledge cutoffs and the difficulty of producingcontrollable behavior within a single inference. Multi-agent search systems (MASS) …

---

## 论文详细总结（自动生成）

这篇论文介绍了一种名为 **MHGPO**（Multi-Agent Heterogeneous Group Policy Optimization，多智能体异构组策略优化）的强化学习框架，旨在解决大语言模型（LLM）驱动的多智能体搜索系统（MASS）在端到端优化中的效率与稳定性问题。

以下是对该论文的结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **研究动机**：虽然 LLM 在多智能体系统（MAS）中通过任务分解和检索增强生成（RAG）提升了处理复杂问题的能力，但现有的优化手段存在局限：
    *   **工程成本高**：依赖手动 Prompt 工程或逐个智能体的监督微调（SFT），难以适应动态需求。
    *   **MARL 瓶颈**：传统多智能体强化学习（如 MAPPO）依赖庞大的 Critic 网络来评估联合动作，导致训练不稳定且显存开销巨大。
    *   **信用分配难**：系统层面的全局奖励难以准确归因到各个独立运行、上下文不连贯的智能体身上。
*   **核心问题**：如何在不依赖 Critic 网络的情况下，实现多智能体系统的高效、稳定、端到端全局优化？

### 2. 方法论：核心思想与关键技术
MHGPO 借鉴了 GRPO（组相对策略优化）的思想，并将其扩展到多智能体、多上下文场景。
*   **核心思想**：通过在异构组（Heterogeneous Groups）内估计相对优势，取消 Critic 网络，将多智能体学习转化为多任务优化问题。
*   **关键技术细节**：
    *   **参数共享（Parameter Sharing）**：所有智能体角色（如重写者、重排者、回答者）共享同一个 LLM 底座，降低内存开销。
    *   **反向奖励传播（Backward Reward Propagation）**：将系统最终的奖励（如答案的 F1 分数）沿执行轨迹反向传播并聚合，捕捉智能体间的间接依赖关系。
    *   **异构组优势估计**：在同一根查询下，将不同轨迹、不同前缀产生的输出组成“异构组”，通过组内奖励归一化计算优势信号，迫使模型关注全局成功而非局部最优。
*   **采样策略**：
    *   **IS (Independent Sampling)**：每个智能体独立进行 1-G 采样，仅利用同质组。
    *   **FoF (Fork-on-first)**：仅在首个智能体处分叉采样 G 个路径，后续智能体 1-1 执行，效率高且引入异构性。
    *   **RR (Round-robin)**：随机选择分叉点，平衡全局协调压力与局部学习稳定性。

### 3. 实验设计
*   **数据集/场景**：主要针对多跳问答（Multi-hop QA）任务，使用了 **HotpotQA**（训练与测试）、**2WikiMultihopQA** 和 **MuSiQue**（用于评估泛化性）。
*   **Benchmark 与对比方法**：
    *   **基础模型**：Llama3.1-8B-Instruct, Qwen2.5-72B。
    *   **强化学习基线**：PPO, GRPO, MAPPO。
    *   **RAG 系统基线**：Search-o1（类 o1 搜索推理模型）, R1-Searcher（基于 R1 思想优化的搜索器）。
    *   **系统架构**：对比了单上下文 RAG 和三智能体 MASS 架构。

### 4. 资源与算力
*   **硬件环境**：使用了单台配备 **8 张 NVIDIA H100 (80GB)** 显存的服务器。
*   **处理器**：Intel Xeon Platinum 8468 CPU。
*   **训练细节**：在 HotpotQA 上训练 1 个 epoch（约 176 步），Batch Size 为 512。
*   **效率对比**：文中明确指出 MHGPO 相比 MAPPO 显著降低了显存占用（减少约 40% 以上）并缩短了训练时间（FoF 变体比 MAPPO 快约 2 倍）。

### 5. 实验数量与充分性
*   **实验规模**：论文涵盖了主任务性能对比、跨数据集 OOD（域外）泛化测试、训练动力学可视化。
*   **消融实验**：非常充分，包括：
    *   角色消融（证明了协同训练优于单智能体训练）。
    *   奖励聚合函数对比（AVG vs MAX/MIN）。
    *   组大小（Group Size）对性能的影响。
    *   奖励稀疏性测试（仅保留最终奖励 vs 复合奖励）。
*   **客观性**：通过三组随机种子取平均值，并对比了不同规模的开源模型，实验设计较为严谨、公平。

### 6. 主要结论与发现
*   **性能卓越**：MHGPO 变体（尤其是 FoF 和 RR）在所有指标上均显著优于 MAPPO 和未经优化的 MAS。
*   **效率优势**：取消 Critic 网络后，MHGPO 在有限算力下表现出极强的稳定性，避免了 MAPPO 常见的训练崩溃现象。
*   **协同效应**：端到端优化使智能体学会了“自我进化”，例如重写者学会了生成更符合检索引擎偏好的查询，而非仅仅是人类可读的查询。
*   **泛化能力**：在 HotpotQA 上训练的模型在 2WikiMultihopQA 等其他数据集上同样表现出显著的性能提升。

### 7. 优点（亮点）
*   **首创性**：这是首个系统性研究将组相对优化（GOA）应用于多智能体搜索系统的工作。
*   **理论联系实际**：论文在附录中推导了 MHGPO 与单上下文 GRPO 的等价性，为多上下文优化提供了理论支撑。
*   **实用性强**：提出的 RR 和 FoF 策略为工业界在有限显存下训练复杂 Agent 系统提供了可落地的方案。

### 8. 不足与局限
*   **任务覆盖面**：实验主要集中在问答任务（QA），尚未在长程规划、复杂工具调用（如代码执行）等更广泛的 Agent 场景中验证。
*   **模型规模限制**：实验最高仅测试到 8B 参数模型，更大规模模型（如 70B+）的扩展性表现有待观察。
*   **智能体数量**：实验固定为 3 个智能体的流水线，对于更复杂、非线性的多智能体拓扑结构（如网状协作）探讨不足。
*   **理论简化**：理论推导基于“上下文充分性”假设，但在实际应用中，Prompt 压缩往往会导致信息丢失，此时异构组的方差分析仍需深入研究。

（完）
