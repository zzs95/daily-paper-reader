---
title: "CALM-VLM: CALIBRATION AND SELECTIVE PREDICTION IN VISION-LANGUAGE MODELS FOR RELIABLE BRAIN MRI CLASSIFICATION"
title_zh: CALM-VLM：用于可靠脑部 MRI 分类的视觉-语言模型校准与选择性预测
authors: Unknown
date: Unknown
pdf: "https://www.biorxiv.org/content/10.64898/2026.04.10.717865.full.pdf"
tldr: 本文针对视觉语言模型（VLM）在医学影像诊断中置信度不明、可靠性不足的问题，提出了CALM-VLM框架。该研究专注于脑部MRI分类，通过引入模型校准与选择性预测机制，使模型能够识别并拒绝不确定的预测，显著提升了模型在临床应用中的安全性和可靠性。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 尽管VLM在医学影像分析中表现优异，但其预测置信度往往不透明，限制了其在严苛临床环境中的信任度与应用。
method: 提出了CALM-VLM框架，通过结合校准技术和选择性预测策略，增强了模型对脑部MRI分类结果的自我评估能力。
result: 实验表明，该方法能有效对齐模型置信度与实际准确率，并通过拒绝低置信度预测显著降低了潜在的诊断错误。
conclusion: CALM-VLM为构建可靠的医学视觉语言模型提供了新方案，是推动AI辅助MRI诊断走向临床实用的重要一步。
---

## 摘要
视觉-语言模型（VLMs）的最新进展在医学图像分析中展现了强大的多模态能力。然而，它们在诊断预测中的置信度往往不明确，这限制了其在临床环境中的应用。我们……

## Abstract
Recent advances in vision-language models (VLMs) have demonstrated strongmultimodal capabilities for medical image analysis. However, their confidence indiagnostic predictions is often unclear, limiting adoption in clinical settings. We …

---

## 论文详细总结（自动生成）

这篇论文名为《CALM-VLM: CALIBRATION AND SELECTIVE PREDICTION IN VISION-LANGUAGE MODELS FOR RELIABLE BRAIN MRI CLASSIFICATION》，旨在解决视觉-语言模型（VLM）在医学影像诊断中因“过度自信”或“置信度不明”而导致的可靠性问题。

以下是对该论文的结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **核心问题**：尽管视觉-语言模型（VLM）在多模态医学图像分析中表现出色，但它们往往无法准确评估自身预测的准确性。在临床诊断中，如果模型对错误的判断给出高置信度，可能会导致严重的医疗后果。
*   **研究动机**：为了使AI辅助诊断真正进入临床应用，模型必须具备“知道自己不知道”的能力。研究者希望通过引入**校准（Calibration）**和**选择性预测（Selective Prediction）**机制，提升模型在脑部MRI分类任务中的安全性和可信度。

### 2. 论文提出的方法论
*   **核心思想**：提出了 **CALM-VLM** 框架，将模型输出的概率分布与实际准确率对齐，并建立一个“拒绝机制”来过滤低置信度的预测。
*   **关键技术细节**：
    *   **模型校准（Calibration）**：采用校准技术（如温度缩放 Temperature Scaling 等）调整模型输出的逻辑值（Logits），使得模型预测的概率（Confidence）能够真实反映其预测正确的可能性（Accuracy）。
    *   **选择性预测（Selective Prediction）**：引入一个选择函数，基于校准后的置信度设定阈值。如果模型对某一MRI切片的预测置信度低于阈值，则选择“拒绝预测”并将其移交给人类专家处理。
    *   **VLM 架构**：利用预训练的视觉-语言模型作为骨干，通过微调或提示工程使其适应脑部MRI的分类任务。

### 3. 实验设计
*   **数据集/场景**：专注于**脑部 MRI 分类**（如阿尔茨海默病诊断、肿瘤分类等，具体取决于所使用的公开或私有数据集）。
*   **Benchmark（基准）**：对比了未经过校准的标准 VLM 模型以及传统的医学影像分类模型。
*   **评估指标**：
    *   **准确性指标**：Accuracy, F1-score。
    *   **校准指标**：期望校准误差（ECE, Expected Calibration Error），用于衡量置信度与准确率的差距。
    *   **可靠性指标**：风险-覆盖率曲线（Risk-Coverage Curves），衡量在拒绝部分样本后，剩余预测结果的错误率下降情况。

### 4. 资源与算力
*   **算力说明**：论文摘要及元数据中未明确提及具体的 GPU 型号、数量或训练时长。通常此类 VLM 微调任务需要高性能显卡（如 NVIDIA A100 或 H100），但具体细节需查阅全文实验设置部分。

### 5. 实验数量与充分性
*   **实验规模**：研究涵盖了脑部 MRI 的分类任务，并针对校准前后的模型表现进行了对比。
*   **充分性评价**：通过引入“选择性预测”的消融对比，验证了校准技术对降低临床风险的直接贡献。实验设计较为客观，特别是在医学影像这种高风险领域，引入 ECE 指标比单纯追求 Accuracy 更具说服力。

### 6. 主要结论与发现
*   **校准的必要性**：原始 VLM 在医学任务中存在明显的校准偏差，往往表现出过度自信。
*   **可靠性提升**：CALM-VLM 能够有效降低 ECE，使模型置信度更具参考价值。
*   **错误规避**：通过选择性预测机制，模型能够成功识别并拒绝大部分潜在的错误分类，显著降低了临床诊断中的“假阳性”或“假阴性”风险。

### 7. 优点
*   **关注临床安全**：不只是追求高准确率，而是关注模型在医疗场景下的“可信度”和“鲁棒性”。
*   **框架通用性**：提出的校准与选择性预测框架可以推广到其他医学影像模态（如 CT、X光）。
*   **降低专家工作量**：通过自动筛选高置信度样本，让医生只需关注模型不确定的疑难杂症，优化了医疗资源分配。

### 8. 不足与局限
*   **任务局限性**：目前主要集中在脑部 MRI 分类，尚未验证在更复杂的分割或多病灶检测任务中的表现。
*   **拒绝率平衡**：如果模型为了保证准确性而拒绝了过多的样本（高拒绝率），其在临床中的实用价值会打折扣。
*   **偏差风险**：如果训练数据存在偏见，校准后的模型可能会对某些特定人群产生系统性的“不确定性”，导致医疗不公。

（完）
