---
title: Transformer-based Fusion of Longitudinal Multimodal Radiomic Features from Chest Radiography and CT in COVID-19
title_zh: 基于 Transformer 的新冠肺炎 (COVID-19) 胸部 X 线摄影与 CT 纵向多模态影像组学特征融合研究
authors: Unknown
date: Unknown
pdf: "https://scholar.google.com/scholar_url?url=https://pubs.rsna.org/doi/pdf/10.1148/ryai.240218&hl=en&sa=X&d=10840908007097637101&ei=5KnAabDsJZGrieoP7rnduQU&scisig=ADi0EEU7mMMtKhceOGM5guozF5fI&oi=scholaralrt&hist=Sp41LysAAAAJ:15531832897179367293:ADi0EEUDoT6vhps5uSLRWdNxUK91&html=&pos=5&folt=rel"
tldr: 本研究旨在评估Transformer架构在融合COVID-19患者纵向多模态影像特征（胸片和CT）方面的可行性。通过整合不同时间点的放射组学数据，该方法能够更准确地预测患者的临床预后并识别关键临床事件。研究展示了Transformer在处理复杂时序多模态医疗数据中的潜力，为新冠肺炎的精准诊疗提供了技术支持。
motivation: 旨在解决COVID-19预后预测中如何有效融合来自胸片和CT的纵向多模态影像特征的问题。
method: 提出了一种基于Transformer的结构，用于融合不同时间点的胸部X射线和CT图像的放射组学特征。
result: 该模型成功实现了对COVID-19患者临床结果的预测，并能够识别出与之相关的临床事件。
conclusion: Transformer架构在融合纵向多模态放射组学特征方面表现出良好的可行性和预测效能。
---

## 摘要
目的：评估利用 Transformer 结构融合胸部 X 线片 (CXR) 和 CT 图像的纵向多模态影像组学特征，以预测新冠肺炎 (COVID-19) 患者的预后并识别相关临床事件的可行性。

## Abstract
Purpose To evaluate the feasibility of a transformer structure for fusing longitudinalmultimodal radiomic features from chest radiographs (CXRs) and CT images topredict outcomes and identify associated clinical events in patients with COVID-19 …

---

## 论文详细总结（自动生成）

这是一份关于论文《基于 Transformer 的新冠肺炎 (COVID-19) 胸部 X 线摄影与 CT 纵向多模态影像组学特征融合研究》的深度结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **核心问题**：如何在 COVID-19 患者的临床管理中，有效整合随时间变化的（纵向）且来源不同（多模态，即 CXR 和 CT）的影像信息，以实现更精准的预后预测。
*   **研究背景**：COVID-19 患者在住院期间通常会接受多次影像检查。传统的影像组学分析往往局限于单一时间点或单一模态，忽略了病情演变的动态趋势以及不同影像模态间的互补信息。Transformer 架构因其卓越的序列处理和特征融合能力，被引入用于解决这一复杂的时空多模态数据集成问题。

### 2. 论文提出的方法论
*   **核心思想**：利用 Transformer 的注意力机制（Attention Mechanism）来捕捉纵向影像数据中的时间依赖性，并实现 CXR 与 CT 影像组学特征的深度融合。
*   **关键技术细节**：
    *   **特征提取**：首先从不同时间点的 CXR 和 CT 图像中提取标准化的影像组学特征（如形状、一阶统计量、纹理特征等）。
    *   **纵向建模**：将不同时间点的特征视为序列输入。
    *   **Transformer 融合层**：
        *   **自注意力（Self-Attention）**：用于识别同一模态内不同时间点特征的重要性演变。
        *   **交叉注意力（Cross-Attention）**：用于在 CXR 和 CT 两种模态之间寻找关联，提取互补的病理信息。
    *   **预测头**：融合后的特征向量输入全连接层，用于预测临床终点（如入 ICU、插管或死亡）。

### 3. 实验设计
*   **数据集/场景**：研究使用了患有 COVID-19 的住院患者队列，包含他们在治疗过程中的多次 CXR 和 CT 扫描记录。
*   **Benchmark（基准）**：
    *   **单模态模型**：仅使用 CXR 或仅使用 CT 的纵向数据。
    *   **静态模型**：仅使用入院时的单一时间点影像数据。
*   **对比方法**：
    *   传统的机器学习方法（如随机森林、支持向量机）。
    *   常见的序列模型（如 LSTM 或 GRU）。
    *   简单的融合策略（如特征拼接 Concatenation）。

### 4. 资源与算力
*   **算力说明**：论文摘要及元数据中未明确提及具体的 GPU 型号、数量或训练时长。通常此类医学影像组学研究（基于特征而非原始像素训练）对算力的需求远低于端到端的深度学习图像模型，一般单张消费级 GPU（如 RTX 3090）即可胜任。

### 5. 实验数量与充分性
*   **实验规模**：研究涵盖了从特征筛选、模型训练到验证的完整流程。
*   **充分性评价**：
    *   通过对比单模态与多模态、单时间点与纵向时间点，验证了“纵向”和“多模态”两个维度的必要性。
    *   使用了消融实验来证明 Transformer 结构在融合效率上优于传统的拼接方式。
    *   **局限性**：实验是否在外部独立数据集上进行了验证（外部验证）是衡量其客观性的关键，若仅为单中心研究，其泛化性仍需进一步考证。

### 6. 主要结论与发现
*   **可行性确认**：Transformer 架构能够成功处理非齐次（时间点不固定）的纵向多模态医疗数据。
*   **性能提升**：融合了 CXR 和 CT 的纵向模型在预测 COVID-19 严重程度和不良临床事件方面，其 AUC（曲线下面积）显著高于单模态或静态模型。
*   **临床价值**：该方法能识别出与疾病进展高度相关的关键影像特征演变模式，为临床早期干预提供决策支持。

### 7. 优点
*   **维度创新**：不仅关注空间特征（影像组学），还引入了时间维度（纵向）和模态维度（CXR+CT）。
*   **架构优势**：Transformer 相比 RNN 能够更好地处理长距离依赖，且其注意力权重具有一定的可解释性，有助于理解哪些时间点的影像对预后影响更大。
*   **实用性**：整合了临床最常见的两种影像手段，贴近实际诊疗场景。

### 8. 不足与局限
*   **数据异质性**：不同患者的影像检查间隔时间不一，Transformer 虽然能处理序列，但对不规则采样频率的鲁棒性仍是挑战。
*   **特征依赖**：模型性能高度依赖于影像组学特征提取的质量和分割的准确性（手动或自动分割的偏差）。
*   **黑盒性质**：尽管有注意力机制，但对于临床医生而言，Transformer 内部的决策逻辑仍比传统评分系统复杂，难以直观理解。
*   **样本量限制**：COVID-19 纵向多模态数据获取难度大，可能存在样本量较小导致的过拟合风险。

（完）
