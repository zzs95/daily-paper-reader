---
title: "GiLT: Augmenting Transformer Language Models with Dependency Graphs"
title_zh: GiLT：利用依存图增强 Transformer 语言模型
authors: Unknown
date: Unknown
pdf: "https://faculty.sist.shanghaitech.edu.cn/faculty/tukw/acl26-gilt.pdf"
tldr: 本研究提出了GiLT，旨在通过引入依存图（Dependency Graphs）结构来增强Transformer语言模型的句法泛化能力。相比于以往侧重于成分树（Constituency Trees）的研究，GiLT利用依存关系捕捉更丰富的语言结构信息。实验表明，该方法能有效提升模型在处理复杂句法结构时的表现，为结合语言学知识与深度学习模型提供了新思路。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 现有的Transformer增强研究多关注成分树结构，而忽略了依存图在提升模型句法泛化能力方面的潜力。
method: 提出了GiLT模型，通过将依存图结构集成到Transformer架构中，使模型能够学习更深层的语言依赖关系。
result: 实验结果显示，引入依存图结构显著增强了语言模型在句法泛化任务上的性能。
conclusion: 将依存图与Transformer结合是提升语言模型理解复杂语言结构能力的有效途径。
---

## 摘要
利用语言结构增强 Transformer 可以有效提升语言模型的句法泛化性能。该研究方向的先前工作主要集中在语言的句法树结构上，特别是成分树……

## Abstract
Augmenting Transformers with linguistic structures effectively enhances the syntacticgeneralization performance of language models. Previous work in this directionfocuses on syntactic tree structures of languages, in particular constituency tree …

---

## 论文详细总结（自动生成）

这是一份关于论文《GiLT: Augmenting Transformer Language Models with Dependency Graphs》的结构化深入分析总结：

### 1. 论文的核心问题与整体含义（研究动机和背景）
传统的 Transformer 语言模型（LM）虽然性能强大，但缺乏显式的语言学结构（如句法或语义解析）。
*   **研究动机**：以往将语言结构引入 Transformer 的工作（如 RNNG、TG 等）主要集中在**成分树（Constituency Trees）**上，且通常需要向输入/输出序列中**插入额外的结构化 Token**（如括号或操作符）。这导致序列变长、计算开销增加，且难以直接微调现有的预训练模型。
*   **核心问题**：如何利用更通用、更灵活的**依存图（Dependency Graphs）**来增强 Transformer，且在**不改变符号空间**（不添加额外 Token）的前提下实现高效的结构注入。

### 2. 论文提出的方法论：GiLT
GiLT（Graph-Infused Layers Transformer）的核心思想是在生成 Token 的同时，增量地构建依存图，并将图结构特征融入注意力机制。

*   **依存评分（Dependency Scoring）**：当生成一个词 $w_i$ 时，利用双仿射（Biaffine）机制计算它与之前所有词之间存在依存关系的概率。为了不破坏因果掩码，它使用中间层和倒数第二层的隐藏状态作为表示。
*   **图更新（Graph Update）**：为了降低搜索空间，采用两步法：首先预测当前词应有的依存边数量 $c_i$，然后选取概率最高的 $c_i$ 条边加入图中。
*   **特征提取（Feature Tapes）**：从动态构建的图中提取三种关键特征：
    1.  **度数（Degree）**：入度和出度的加权和。
    2.  **距离（Distance）**：词与词之间在图上的加权最短路径。
    3.  **深度（Depth）**：词到根节点的距离。
*   **注意力调制（Attention Modulation）**：将上述特征映射为嵌入向量，直接加到 Transformer 自注意力机制的 **Key（键）** 中，从而引导模型关注具有特定结构关系的 Token。

### 3. 实验设计
*   **数据集**：
    *   **BLLIP-LG**：用于语言建模训练。
    *   **语义依存图数据**：PSD、PAS、DM（通过 ACE 解析器获取的银标数据）。
    *   **依存树数据**：DP（通过 Biaffine 解析器获取）。
*   **Benchmark（基准）**：
    *   基础模型：Transformer-XL (TXL)。
    *   对比方法：Pushdown-LM（基于成分树）、PLM、TG、DTG（基于依存树且含额外 Token）。
*   **评估指标**：困惑度（PPL）、句法泛化能力（BLiMP 10% 子集、SG 测试集）、下游任务性能（GLUE 中的 RTE, SST2, MRPC, STS-B）。

### 4. 资源与算力
论文明确记录了实验环境：
*   **硬件**：
    *   **语言建模训练**：每组实验使用 1 块 **NVIDIA A6000** GPU，耗时约 **50 小时**。
    *   **下游任务微调**：每组实验使用 1 块 **NVIDIA H800** GPU，每个任务耗时**小于 1 小时**。
*   **软件**：PyTorch 2.7.0。

### 5. 实验数量与充分性
实验设计非常全面，涵盖了多个维度：
*   **多类型结构对比**：分别在 PSD、DM、PAS 和 DP 四种不同的图/树结构上训练了 GiLT。
*   **句法泛化评估**：在 BLiMP 和 SG 两个权威测试集上验证了模型对复杂句法的理解。
*   **下游任务微调**：验证了 GiLT 作为一种架构，可以无缝替换预训练 GPT-2 的层并提升性能。
*   **消融实验**：针对度数、深度、距离及其权重进行了 5 组消融，证明了各特征的必要性。
*   **效率测试**：对比了生成速度（Tokens/s）和显存占用。
*   **充分性评价**：实验设计客观、公平（如对比了同等参数量的 TXL-Large），样本量和对比维度足以支撑其结论。

### 6. 论文的主要结论与发现
1.  **句法泛化提升**：GiLT（尤其是 GiLT-PSD）在句法泛化测试（SG）上显著优于基准 TXL 和 Pushdown-LM，同时保持了极具竞争力的困惑度（PPL）。
2.  **微调优势**：GiLT 可以直接加载预训练 GPT-2 的权重进行微调，在 GLUE 任务上全面超越了原始 GPT-2。
3.  **效率优势**：由于不产生额外 Token，GiLT 的推理速度和显存效率远高于 DTG 等需要预测结构 Token 的模型。
4.  **结构灵活性**：图结构（PSD/DM）在语言建模上的表现优于纯树结构（DP），说明更灵活的语言学表示对模型更有利。

### 7. 优点：亮点与创新
*   **无缝集成**：不改变 Token 空间，解决了结构化 LM 难以微调大规模预训练模型的痛点。
*   **图结构引入**：突破了以往仅限于“树”结构的局限，引入了更丰富的语义依存图。
*   **特征带（Feature Tapes）设计**：通过简单的注意力调制实现了复杂的图特征注入，计算开销相对较小。
*   **推理效率**：在保持结构化能力的同时，推理速度接近标准 Transformer。

### 8. 不足与局限
*   **推理开销**：虽然比 DTG 快，但为了估计边概率，推理时仍需 Beam Search，这比标准 Transformer 慢（TXL 152.6 tokens/s vs GiLT 143.0 tokens/s）。
*   **树结构利用不足**：在纯依存树（DP）任务上表现略逊，作者认为是因为图模型未能充分利用树的递归特性。
*   **依赖银标数据**：训练依赖于自动解析器生成的“银标”数据，解析器的错误可能会传播给语言模型。
*   **搜索空间限制**：为了计算可行性，对每步生成的边数做了硬性上限限制。

（完）
