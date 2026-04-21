---
title: "GiLT: Augmenting Transformer Language Models with Dependency Graphs"
title_zh: GiLT：利用依存图增强 Transformer 语言模型
authors: Unknown
date: Unknown
pdf: "https://faculty.sist.shanghaitech.edu.cn/faculty/tukw/acl26-gilt.pdf"
tldr: 本研究提出GiLT，旨在通过引入依存图（Dependency Graphs）来增强Transformer语言模型的语言结构建模能力。以往研究多侧重于成分树结构，而本文探索了依存关系在提升模型语法泛化性能方面的潜力。通过将依存图集成到Transformer架构中，该方法有效增强了模型对复杂句法结构的理解，为提升语言模型的结构化表示提供了新思路。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 以往研究主要关注成分树结构，而利用依存图来增强Transformer的语法泛化能力仍有待深入探索。
method: 提出GiLT模型，通过将依存图结构集成到Transformer语言模型中，使模型能够直接利用词汇间的依存关系。
result: 实验结果表明，引入依存图结构显著提升了语言模型在语法泛化任务中的表现。
conclusion: 将依存图与Transformer结合是提升语言模型句法理解能力的有效途径，能比传统树结构提供更丰富的结构信息。
---

## 摘要
利用语言结构增强 Transformer 可有效提升语言模型的句法泛化性能。该方向的先前工作主要关注语言的句法树结构，特别是成分句法树……

## Abstract
Augmenting Transformers with linguistic structures effectively enhances the syntacticgeneralization performance of language models. Previous work in this directionfocuses on syntactic tree structures of languages, in particular constituency tree …

---

## 论文详细总结（自动生成）

以下是对论文《GiLT: Augmenting Transformer Language Models with Dependency Graphs》的结构化深入总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
*   **核心问题**：如何在不改变 Transformer 语言模型（LM）符号空间（即不插入额外结构化标记）的前提下，有效地将复杂的语言结构（特别是**依存图**，而非传统的成分树或依存树）集成到模型中，以增强其句法泛化能力。
*   **研究背景**：
    *   传统的 Transformer 缺乏显式的语言结构建模。
    *   现有的句法增强 LM 多基于成分树，且通常需要插入额外的操作标记（如 `(`, `)`），这增加了序列长度和计算开销，且难以直接微调预训练模型。
    *   依存图（Dependency Graphs）比树结构更灵活，能同时捕捉句法和语义关系，但相关研究较少。

### 2. 论文提出的方法论：GiLT
GiLT 的核心思想是在生成单词的同时增量构建依存图，并利用从图中提取的特征来调制 Transformer 的注意力权重。
*   **依存关系评分（Dependency Scoring）**：使用双仿射（Biaffine）机制。利用当前词的中间层、倒数第二层隐藏状态及输入嵌入构建词表示，计算当前词与之前所有词之间存在依存关系的概率。
*   **图更新（Graph Update）**：采用两步法。首先预测当前词拥有的依存关系数量 $c_i$，然后选择得分最高的 $c_i$ 条边加入图。这种方法将搜索空间从指数级降低到线性级。
*   **特征提取（Feature Extraction）**：从局部构建的图中提取三种特征形成“特征磁带”（Feature Tape）：
    1.  **度数（Degree）**：入度和出度的加权和。
    2.  **距离（Distance）**：词与词之间在图上的加权最短路径。
    3.  **深度（Depth）**：词到根节点的距离。
*   **注意力调制（Attention Modulation）**：将上述特征映射为嵌入向量，直接加到 Transformer 自注意力机制的“键”（Key）中，从而影响注意力分数的计算。

### 3. 实验设计
*   **数据集**：
    *   **语言模型训练**：BLLIP-LG 数据集，包含 PSD、PAS、DM 三种语义依存图及标准依存树（DP）。
    *   **句法评估**：BLiMP（语言最小对测试集）和 SG（句法泛化测试集）。
    *   **下游任务**：GLUE 榜单中的 RTE、SST2、MRPC、STS-B。
*   **Benchmark 与对比方法**：
    *   **基准**：Transformer-XL (TXL), TXL-Large。
    *   **不增加标记的方法**：Pushdown-LM（基于成分树的栈操作）。
    *   **增加标记的方法**：PLM, TG, DTG（依存 Transformer 语法）。

### 4. 资源与算力
*   **算力设备**：
    *   **语言模型训练**：使用 1 张 **NVIDIA A6000** GPU，每组实验耗时约 **50 小时**。
    *   **微调实验**：使用 1 张 **NVIDIA H800** GPU，每个任务耗时**少于 1 小时**。
*   **软件环境**：PyTorch 2.7.0。

### 5. 实验数量与充分性
*   **实验规模**：
    *   针对四种不同的结构（PSD, DM, PAS, DP）分别训练了模型。
    *   进行了 5 组**消融实验**（分别移除度数、深度、距离特征及权重系数）。
    *   进行了**推理速度与显存占用**对比实验。
    *   进行了**GPT-2 微调**实验及**案例分析**（注意力可视化）。
*   **充分性评价**：实验设计非常充分且客观。通过对比同等参数规模的 TXL-Large，排除了性能提升仅来自参数量增加的可能性；通过多种依存图类型的对比，验证了该方法的普适性。

### 6. 论文的主要结论与发现
*   **句法泛化显著提升**：GiLT-PSD 在 SG 测试集上比基准 TXL 提升了 7.6 个百分点，在 BLiMP 上也有稳定提升。
*   **保持困惑度（PPL）**：在增强句法能力的同时，GiLT 维持了与标准 Transformer 相当的语言建模性能（PPL 损失极小）。
*   **微调有效性**：将 GiLT 结构应用于预训练的 GPT-2 并微调，在所有测试的下游任务上均优于原始 GPT-2。
*   **效率优势**：由于不产生额外标记，GiLT 的推理速度和显存效率远优于 DTG 等需要生成结构标记的模型。

### 7. 优点
*   **非侵入性**：不改变输入输出空间，使其能够无缝集成到现有的预训练模型架构中。
*   **结构灵活性**：首次系统地将“图”结构（而非简单的树）引入 Transformer 内部调制。
*   **特征设计巧妙**：通过度数、距离、深度三个维度全面刻画了图的拓扑结构。
*   **推理高效**：相比于需要同步生成句法动作的模型，GiLT 的计算开销更低。

### 8. 不足与局限
*   **推理成本**：虽然比 DTG 快，但为了估计边际概率，推理时仍需使用 Beam Search，这比标准 Transformer 慢。
*   **树结构利用不足**：实验发现 GiLT 在纯依存树（DP）上的表现不如语义图，说明该模型可能未充分利用树结构的递归特性。
*   **概率估计**：推理时计算的是概率的下界（Lower Bound），而非精确值。
*   **依赖外部解析器**：训练时需要高质量的“银标”（Silver）依存图数据，这取决于现有解析器的准确性。

（完）
