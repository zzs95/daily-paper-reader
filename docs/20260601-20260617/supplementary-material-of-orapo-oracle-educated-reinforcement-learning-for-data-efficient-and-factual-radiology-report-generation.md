---
title: "Supplementary Material of OraPO: Oracle-educated Reinforcement Learning for Data-efficient and Factual Radiology Report Generation"
title_zh: OraPO 的补充材料：用于数据高效且事实准确的放射学报告生成的受先知引导的强化学习
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026/supplemental/Chen_OraPO_Oracle-educated_Reinforcement_CVPR_2026_supplemental.pdf"
tldr: 本研究针对放射科报告生成中数据效率低和事实错误的问题，提出了OraPO框架。该方法通过引入“先知教育”的强化学习机制，利用专家知识引导模型优化，显著提升了在有限数据下的报告准确性与事实一致性。其核心贡献在于结合了领域知识与偏好优化，为医疗影像自动诊断提供了更可靠且高效的生成方案。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在解决现有放射科报告生成模型在数据稀缺情况下容易产生事实性错误且训练效率低的问题。
method: 提出了一种基于先知引导的强化学习方法（OraPO），利用专家级知识作为反馈信号来优化模型生成质量。
result: 该方法在较小的计算资源和数据量下，实现了具有高度事实一致性的放射科报告生成。
conclusion: OraPO证明了通过引入领域专家知识的强化学习可以有效提升医疗文本生成的准确性与数据利用率。
---

## 摘要
表 1 总结了我们方法的超参数以及在调优过程中探索的范围。我们使用了较小的有效批量大小 B=16，选择该数值是为了适应我们计算高效的 4× A10 配置，并采用了 2.5× 10⁻⁷ 的保守学习率以稳定……

## Abstract
Table 1 summaries the hyperparameters of our method and the ranges exploredduring tuning. We use a small effective batch size of B= 16, chosen to fit our compute-efficient 4× A10 setup, and a conservative learning rate of 2.5× 10− 7 to stabilise …

---

## 论文详细总结（自动生成）

这篇论文是关于 **OraPO (Oracle-educated Reinforcement Learning)** 框架的补充材料，旨在解决放射学报告生成（RRG）中的数据效率和事实准确性问题。以下是对该论文的深度结构化总结：

### 1. 核心问题与整体含义
*   **研究动机**：传统的放射学报告生成模型通常依赖海量的标注数据（如 MIMIC-CXR 的 22.3 万对数据），且容易产生事实性错误（幻觉或漏诊）。
*   **核心目标**：在**极低数据量**（仅 1000 个样本）的情况下，通过强化学习（RL）和专家知识引导，生成临床事实准确、高召回率的放射学报告。

### 2. 方法论：OraPO 框架
*   **核心思想**：结合了 **GRPO**（群体相对策略优化）的探索能力和 **DPO**（直接偏好优化）的纠偏能力，并引入“先知”（Oracle）反馈。
*   **关键技术细节**：
    *   **FactS Reward（事实得分奖励）**：模型不只是模仿文本，而是提取生成报告中的“原子事实”（Atomic Facts），并检查这些事实是否被金标准标签（Ground Truth Labels）所蕴含。
    *   **ZRR-controlled Mixing（零奖励率控制混合）**：引入零奖励率（Zero-Reward Rate, ZRR）动态调整 GRPO 和 DPO 的权重。当 GRPO 无法获得有效奖励时，增加 DPO 的权重以提供强监督信号。
    *   **长度感知优化**：采用 DR.GRPO 和 LN-DPO 变体，消除模型倾向于生成长文本以获取更高奖励的偏见。
*   **算法流程**：采样 minibatch -> 行为策略生成 K 个报告 -> 计算 FactS 奖励 -> 根据 ZRR 计算混合权重 -> 联合优化 GRPO 和 DPO 目标函数 -> 更新策略模型。

### 3. 实验设计
*   **数据集**：主要在 **MIMIC-CXR**（胸部 X 光）和 **CheXpert Plus** 上进行验证。
*   **Benchmark（基准）**：对比了 14 种主流方法，包括 MedRAT (ECCV24)、MET (CVPR23)、RGRG (CVPR23)、MambaXray-L (CVPR25) 等。
*   **对比维度**：微观平均（Micro-averaging）的精确率（Precision）、召回率（Recall）和 F1 分数，以及数据效率对比。

### 4. 资源与算力
*   **硬件配置**：使用了 **4 × NVIDIA A10 GPU**。
*   **训练设置**：有效批量大小（Effective Batch Size）为 16，学习率为 $2.5 \times 10^{-7}$。
*   **算力评价**：该配置属于中等算力需求，强调了方法的计算效率（Compute-efficient）。

### 5. 实验数量与充分性
*   **实验规模**：
    *   **定量分析**：在 MIMIC-CXR 上进行了全面的微观指标对比。
    *   **消融/参数研究**：对超参数（如 EMA 动量 $\alpha$、混合权重 $w_{min}/w_{max}$、指数 $\gamma$）进行了网格搜索。
    *   **定性分析**：提供了 3 个详细的病例案例，展示了图像、金标准、生成报告及事实提取过程。
*   **充分性评价**：实验设计较为充分，特别是通过 1K 数据与 22.3K 甚至 1.27M 数据的对比，有力证明了其数据效率。

### 6. 主要结论与发现
*   **极高的数据效率**：OraPO 仅使用 1000 个训练样本（约占全集的 0.1% - 0.4%），其性能即可媲美甚至超越使用全量数据训练的 SOTA 模型。
*   **临床高召回率**：在微观召回率（Micro Recall）上达到了 0.811，比最强基准（EKAGen）提升了 **67.9%**。这在临床上至关重要，因为漏诊（假阴性）的危害远大于误诊。
*   **指标反思**：传统的 NLP 指标（如 ROUGE-L）在医疗领域具有误导性。OraPO 虽然 ROUGE 分数不高，但其生成的事实与临床标签高度一致。

### 7. 优点
*   **事实驱动**：通过原子事实提取和蕴含检查，确保了报告的临床可靠性。
*   **动态平衡**：ZRR 机制巧妙地平衡了强化学习的自由探索与偏好优化的稳定引导。
*   **实用性强**：在医疗数据获取成本极高的情况下，提供了一种低成本、高性能的解决方案。

### 8. 不足与局限
*   **精确率与召回率的权衡**：为了追求极高的召回率，模型在某些复杂病例中会出现假阳性（如案例 2 中预测了金标准中未提及的胸腔积液）。
*   **表面指标表现差**：由于不模仿特定写作风格，在基于词法重叠的指标（ROUGE/METEOR）上表现较弱，可能难以通过传统的自动化文本评估。
*   **依赖预设标签**：FactS 奖励依赖于高质量的疾病标签集，对于标签集之外的罕见病发现可能受限。

（完）
