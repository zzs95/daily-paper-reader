---
title: "DELRER: Disease Evolution-Informed Longitudinal Radiology Report Generation"
title_zh: DELRER：基于疾病演化信息的纵向放射学报告生成
authors: Unknown
date: Unknown
pdf: "https://openaccess.thecvf.com/content/CVPR2026F/papers/Wang_DELRER_Disease_Evolution-Informed_Longitudinal_Radiology_Report_Generation_CVPRF_2026_paper.pdf"
tldr: 自动放射科报告生成（RRG）能减轻医生负担，而纵向报告生成（LRRG）通过利用患者的历史随访检查提供更准确的诊断。本文提出DELRER模型，旨在利用疾病演变信息来增强纵向放射报告的生成质量。该方法通过整合患者随访过程中的时间演变特征，提升了报告的准确性和临床一致性，为临床决策提供了更具参考价值的自动化工具。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 传统的放射报告生成往往忽略了患者多次随访检查中的疾病演变信息，导致对病情动态变化的描述不够准确。
method: 提出了一种名为DELRER的框架，通过整合疾病演变信息来指导纵向放射报告的生成。
result: 实验结果表明，该方法在生成报告的准确性和临床相关性方面优于现有的基准模型。
conclusion: 结合疾病演变信息的纵向建模是提升自动化放射报告质量的有效途径，具有重要的临床应用潜力。
---

## 摘要
自动放射学报告生成 (RRG) 可以有效减轻放射科医生的工作负担。在此基础上，纵向放射学报告生成 (LRRG) 利用患者的纵向随访放射学检查来提供……

## Abstract
Abstract Auto Radiology Report Generation (RRG) can effectively help relieve theworkload of radiologists. Based on this, Longitudinal Radiology Report Generation(LRRG) utilizes patients' longitudinal follow-up radiology examinations to provide a …

---

## 论文详细总结（自动生成）

以下是对论文《DELRER: Disease Evolution-Informed Longitudinal Radiology Report Generation》的结构化深入总结：

### 1. 核心问题与整体含义（研究动机和背景）
放射科医生在撰写诊断报告时，通常会参考患者的历史影像记录，通过观察疾病的演变模式（如病灶的扩大或缩小）来评估当前状态。然而，现有的**纵向放射学报告生成（LRRG）**方法大多将历史影像视为简单的辅助输入（如黑盒拼接或计算差异），缺乏对疾病演化规律的显式建模。
本文提出了 **DELRER** 框架，旨在模拟医生的临床思维：先根据历史影像和疾病演变规律预估患者当前的“预期状态”，再结合实际影像生成报告，从而提高诊断的准确性和临床一致性。

### 2. 方法论：核心思想与关键技术
DELRER 的核心思想是**利用神经微分方程（Neural ODE）建模疾病的动态演化过程**。其流程分为三个阶段：
*   **阶段一：疾病严重程度回归（Disease Severity Regression）**
    *   利用大语言模型（ChatGPT）生成正则表达式，从历史报告中提取疾病严重程度的伪标签（如：无、轻度、中度、重度）。
    *   训练疾病特异性的回归模型，将离散的伪标签转化为连续的细粒度严重程度评分，为后续的演化建模提供时间轴参考。
*   **阶段二：疾病演化学习（Disease Evolution Learning）**
    *   根据预测的严重程度构建“缓解”和“加重”两种影像序列。
    *   采用 **NDCN（基于复杂网络的神经动力学）** 模型，利用 Neural ODE 学习疾病随严重程度变化的动态导数。
    *   给定历史影像和当前预测的严重程度，ODE 解算器会生成一个“预期当前状态”的辅助特征图。
*   **阶段三：诊断报告生成（Diagnostic Report Generation）**
    *   使用 Q-Former 提取预期状态影像的特征，并将其转化为可学习的 Token。
    *   将真实的历史影像、当前影像与预期的演化特征融合，输入生成模型（如 DDaTR）产生最终的诊断文本。

### 3. 实验设计
*   **数据集**：使用了 **Longitudinal-MIMIC (L.M.)** 数据集，并根据解剖部位细分为三个子集：**L.L.M.（肺部）**、**P.L.M.（胸膜）** 和 **H.L.M.（心脏）**，以验证模型在不同器官上的泛化能力。
*   **Benchmark 与对比方法**：
    *   对比了 7 种 SOTA 方法，包括传统 Transformer 模型（R2Gen, R2GenCMN）、纵向专用模型（LR2Gen, DDaTR, PromptMRG）以及基于大语言模型的方法（R2GenGPT, HC-LLM）。
*   **评估指标**：
    *   **临床有效性（CE）**：Precision、Recall、F1-score（通过 CheXbert 标注器评估诊断实体的准确性）。
    *   **自然语言生成（NLG）**：BLEU-4、METEOR、ROUGE-L（评估文本流畅度）。

### 4. 资源与算力
*   **硬件**：实验明确指出所有训练和推理过程均在**单张 NVIDIA GeForce RTX 4090 GPU** 上完成。
*   **软件/算法**：使用了 RAD-DINO 作为视觉编码器，ODE 解算器采用 `dopri5` 算法。文中未详细说明具体的训练时长，但从硬件配置看，该方法在算力消耗上相对可控。

### 5. 实验数量与充分性
*   **实验规模**：在 4 个数据集上进行了全量对比实验，涵盖了从通用纵向数据到特定器官数据的验证。
*   **消融实验**：对比了“有无预期疾病状态影像（EDSI）”的效果，证明了演化信号的有效性。
*   **敏感性分析**：针对 Neural ODE 训练中的“最大序列长度”和融合时的“Token 数量”进行了多组实验，探讨了超参数对性能的影响。
*   **客观性**：实验设计较为公平，对比了多种类型的基准模型，且使用了标准的临床评估工具（CheXbert），结果具有较强的说服力。

### 6. 主要结论与发现
*   **临床准确性提升**：DELRER 在所有数据集的 CE 指标（尤其是 F1 分数）上均优于现有 SOTA 方法，证明了显式建模疾病演化能显著减少漏诊和误诊。
*   **演化建模的必要性**：实验发现，Neural ODE 需要足够长的演化序列（长度 > 20）才能有效捕捉疾病进展规律。
*   **辅助信号的平衡**：辅助演化 Token 的数量需与视觉特征维度匹配（如 49 个），过多或过少都会削弱模型性能。
*   **LLM 的局限性**：虽然基于 LLM 的方法在文本流畅度（NLG）上占优，但在临床诊断准确性（CE）上往往不如专门设计的纵向模型。

### 7. 优点与亮点
*   **临床启发式建模**：不同于纯数据驱动的拼接，该方法成功将放射科医生的“预期诊断”思维转化为数学上的 Neural ODE 建模，具有良好的可解释性。
*   **细粒度演化**：通过将离散报告标签转化为连续严重程度评分，解决了医学影像随访时间点不固定、不规则的问题。
*   **器官特异性验证**：针对肺、胸膜、心脏分别建模，证明了该方法在处理不同病理特征时的鲁棒性。

### 8. 不足与局限
*   **伪标签依赖**：严重程度的获取依赖于 LLM 对报告的文本匹配，如果原始报告存在错误或描述模糊，生成的伪标签会干扰 ODE 的学习。
*   **罕见病挑战**：敏感性分析显示长序列有助于学习，但对于样本量较少的罕见疾病，构建长演化序列非常困难，可能导致模型在稀有病种上表现不佳。
*   **计算复杂度**：虽然使用了单卡，但 Neural ODE 的训练和推理（涉及 ODE Solver 的迭代）通常比普通 CNN/Transformer 更耗时。

（完）
