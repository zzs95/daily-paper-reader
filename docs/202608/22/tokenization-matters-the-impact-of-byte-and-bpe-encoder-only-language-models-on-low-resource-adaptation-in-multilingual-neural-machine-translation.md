---
title: "Tokenization Matters:: The Impact of Byte and BPE Encoder-Only Language Models on Low-Resource Adaptation in Multilingual Neural Machine Translation"
title_zh: 分词重要性：字节和BPE编码器-仅语言模型对多语言神经机器翻译中低资源适配的影响
authors: Unknown
date: Unknown
pdf: "https://dl.acm.org/doi/abs/10.1016/j.procs.2026.06.244"
tldr: 多语言神经机器翻译中，字节级分词常引发分词偏差与数据稀疏，在低资源语言上尤为突出。针对该问题，本文提出字节级编码器语言模型，并与BPE分词模型进行对比，考察其对低资源语言适应的影响。实验表明，字节级分词能有效缓解分词偏差，提升Dogri和Kashmiri等低资源语言的翻译性能。研究强调分词选择对多语言翻译低资源适应至关重要，为构建更鲁棒的翻译模型提供了新思路。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 字节级多语言翻译模型存在分词偏差和数据稀疏，低资源语言适应困难。
method: 提出字节级编码器语言模型，与BPE分词模型对比，评估低资源语言翻译性能。
result: 字节级分词缓解分词偏差，提升Dogri和Kashmiri等低资源语言的翻译质量。
conclusion: 分词策略显著影响低资源适应，字节级分词是更优选择。
---

## 摘要
字节分词的多语言神经机器翻译（MNMT）模型常常面临分词偏差和数据稀疏性问题，尤其是对于多格里语和克什米尔语等低资源语言。为了解决这些问题，本研究提出了一种字节分词的方法……

## Abstract
Byte-tokenized multilingual neural machine translation (MNMT) models often facetokenization bias and data sparsity, especially for low-resource languages such asDogri and Kashmiri. To address these issues, this work presents a byte-tokenized …

---

## 论文详细总结（自动生成）

## 论文总结报告

### 论文信息

- **标题**：Tokenization Matters: The Impact of Byte and BPE Encoder-Only Language Models on Low-Resource Adaptation in Multilingual Neural Machine Translation
- **中译名**：分词重要性：字节和BPE编码器-仅语言模型对多语言神经机器翻译中低资源适配的影响
- **来源**：Procedia Computer Science（2026年6月发表）

---

### 1. 核心问题与研究动机

- **问题背景**：多语言神经机器翻译（Multilingual Neural Machine Translation, MNMT）在多语言间共享参数和词汇表时，常采用字节对编码（Byte Pair Encoding, BPE）作为分词方案。但BPE分词在**低资源语言**上存在严重问题：
  - **分词偏差（Tokenization Bias）**：BPE词表通常由高资源语言主导，低资源语言的词汇被切分成碎片化的子词单元，导致语义表示质量低下。
  - **数据稀疏（Data Sparsity）**：低资源语言（如多格里语 Dogri、克什米尔语 Kashmiri）可用语料极为有限，BPE词表难以充分覆盖其语言结构，造成罕见词与形态变化处理困难。
- **核心研究问题**：**字节级（Byte-level）分词方案能否替代BPE，提升低资源语言在多语言翻译中的适应性？** 更具体地说，基于字节级预训练编码器的嵌入注入，能否有效缓解分词偏差并改善翻译质量？

---

### 2. 方法论：核心技术方案

#### 核心思想

- 提出一个**字节级分词的多语言NMT框架**，将来自**预训练字节级掩码语言模型（byte-level masked language models）**的**语言特定表示**注入MNMT编码器，以解决字节级MNMT对低资源语言表示能力不足的问题。
- 关键词是"**可控注入（controlled injection）**"：只对低资源语言（Dogri、Kashmiri）使用预训练字节级嵌入，且**冻结**这些嵌入（held fixed），不参与端到端更新，以保留低资源语言的先验语义知识。

#### 关键技术细节

1. **预训练阶段**：
   - 训练两个**编码器-仅（encoder-only）Transformer**模型：
     - **doiByte**：在单语Dogri语料上从零训练。
     - **kasByte**：在单语Kashmiri语料上从零训练。
   - 每个模型使用**6层Transformer结构，1024维嵌入**，并在字节级（byte-level）上运行。

2. **初始化阶段**：
   - 在13种印度语言到英语（Indic-to-English）的MNMT模型中，将**Dogri和Kashmiri对应的编码器嵌入**初始化为从上述两个预训练模型学到的**BPE和字节级嵌入表示**。

3. **训练阶段**：
   - 在MNMT训练过程中：
     - Dogri和Kashmiri的字节级编码器嵌入保持**冻结**（不被更新）。
     - 其他语言（剩余11种）的嵌入**从零开始学习**。
   - 通过这种方式，让低资源语言在翻译训练中保留预训练的语言学知识，同时避免干扰其他语言的嵌入收敛。

4. **对比配置**：
   - **BPE-MNMT**：基线系统，使用BPE分词。
   - **Byte-MNMT + DoiByte**：字节级MNMT，注入Dogri预训练模型。
   - **Byte-MNMT + kasByte**：字节级MNMT，注入Kashmiri预训练模型。

---

### 3. 实验设计与评估

#### 数据集 / 基准

- **基准1**：**IN22-Gen** —— 印度语言到英语的通用翻译基准测试集。
- **基准2**：**IN22-Conv** —— 面向对话场景的印度语言翻译基准测试集。
- **语言覆盖**：13种印度语言翻译为英语，其中包括：
  - 重点关注语言：Dogri（多格里语）、Kashmiri（克什米尔语）。
  - 其他受影响语言：Assamese（阿萨姆语）、Urdu（乌尔都语）、Nepali（尼泊尔语）、Bodo（博多语）等。

#### 对比方法

- **BPE-MNMT 基线**（BPE分词 + 端到端训练）。
- **Byte-MNMT + DoiByte**（字节级 + Dogri预训练嵌入注入）。
- **Byte-MNMT + kasByte**（字节级 + Kashmiri预训练嵌入注入）。

#### 主要实验结果

| 配置 | 语言 | BLEU变化 |
|------|------|----------|
| Byte-MNMT + DoiByte | Dogri | **+7.85** |
| Byte-MNMT + DoiByte | Assamese | +2.49 |
| Byte-MNMT + DoiByte | Urdu | +1.09 |
| Byte-MNMT + DoiByte | Nepali | +0.13 |
| Byte-MNMT + DoiByte | Bodo | +0.35 |
| Byte-MNMT + kasByte | Kashmiri | **+3.45** |
| Byte-MNMT + kasByte | Dogri | +4.96 |
| Byte-MNMT + kasByte | 不相关语言 | **-0.3 到 -0.7** |

- **IN22-Conv** 数据集上呈现**类似的总体趋势**，证明结果具有一定的一致性。

---

### 4. 资源与算力

- **文中未明确说明**：
  - 未提供GPU型号（如A100、V100等）。
  - 未提供GPU数量。
  - 未提供训练时长（小时/天）。
  - 未提供具体参数量（总参数量、预训练模型参数量、MNMT总参数量）。
  - 未提及单语语料规模（Dogri/Kashmiri语料的具体词数或句数）。

> 这是一个明显的信息缺失点：由于本文对比了从零预训练两个模型 + 训练13语言MNMT，算力开销在通常的研究中是不小的，但论文未披露任何硬性资源指标，影响可复现性评估。

---

### 5. 实验数量与充分性评估

#### 实验数量

- **数据集**：2个（IN22-Gen, IN22-Conv）。
- **系统配置**：3种（BPE-MNMT基线、Byte+DoiByte、Byte+kasByte）。
- **评估语言**：13种语言（重点语言2种 + 其他受影响的若干语言）。
- **消融实验**：摘要中未明确提到消融实验（如：不冻结嵌入的效果、不同模型深度的效果、不同嵌入维度的影响等）。

#### 充分性与客观性分析

- **优点**：
  - 使用了两个基准数据集（通用生成 + 对话），验证了结论在不同任务场景下的一致性。
  - 报告了正收益语言和负收益语言，没有选择性忽略负面结果（kasByte对不相关语言的-0.3~-0.7 BLEU下降有明确说明），显示了一定客观性。

- **不足**：
  - **缺少消融实验**：未说明"如果不用预训练嵌入直接训练字节级MNMT"的基线效果如何，因此无法区分提升是来自"字节级分词"还是"预训练嵌入注入"。
  - **缺少与既有强基线对比**：未和mBART、mT5、IndicTrans2、NLLB等成熟多语言模型对比，难以判断该方法在更广领域的实际竞争力。
  - **实验重复次数与显著性检验未报告**：未给出多次运行的方差或统计显著性测试，单次运行结果可能存在随机性。
  - **跨语言负迁移问题未被深入分析**：kasByte导致其他语言下降，文中仅归因于"跨语言嵌入漂移"，但未做任何分析验证或缓解尝试。

---

### 6. 主要结论与发现

1. **字节级分词 + 语言特定预训练嵌入对低资源语言翻译有显著提升**：
   - Dogri获得最大提升（+7.85 BLEU），Kashmiri也获得稳定提升（+3.45 BLEU）。

2. **预训练嵌入注入具有目标语言特异性**：
   - DoiByte嵌入主要提升Dogri及相关语言（Assamese, Urdu等），kasByte嵌入主要提升Kashmiri和Dogri，但对无关语言有轻微负面影响。

3. **可控冻结参数是一种高效的适应策略**：
   - 仅冻结低资源语言嵌入、其余语言从零训练，在语料有限的情况下仍然可以取得显著收益，说明该方法对**语料效率（corpus-efficient）**有优势。

4. **分词策略的选择对低资源语言至关重要**：
   - 字节级分词相比BPE能更好地覆盖低资源语言的词汇形态，缓解分词偏差，从而提升翻译质量。

5. **方法具有可扩展性（scalable）**：
   - 通过为单个低资源语言预训练较小的字节级编码器模型，再注入大型MNMT，可以按语言增量式扩展，无需为全部语言重新训练大型模型。

---

### 7. 方法亮点与优势

- **巧妙的问题定位**：将"分词选择（tokenization）"与"低资源语言适应"两个问题结合，切入点清晰、有针对性。
- **模块化的设计**：
  - 每个低资源语言只需要训练一个小型编码器（6层、1024维），然后复用到大MNMT中，**计算成本相对可控**。
  - 嵌入冻结策略简洁有效，避免了灾难性遗忘和跨语言干扰。
- **增量式资源利用**：对新的低资源语言，只需训练新的单语编码器即可扩展，不必重新训练整个MNMT，具备实用价值。
- **客观的负面结果报告**：明确指出kasByte导致无关语言性能下降，而非只报告正面结果，增加了研究的可信度。

---

### 8. 不足与局限

- **对"字节级分词"单独贡献的归因不清**：未能区分"字节级分词本身"和"预训练嵌入注入"各自的贡献，因为缺少"字节级MNMT + 随机初始化"或"字节级MNMT + 从头训练嵌入"的对比实验。
- **低资源语言覆盖范围有限**：只关注了Dogri和Kashmiri两种低资源语言，未在更多低资源语言（如Sindhi, Maithili等）上验证方法的普适性。
- **算力与数据细节缺失**：未报告训练数据量、GPU资源、训练耗时，读者难以判断方法的复现成本和实际部署门槛。
- **嵌入冻结的长期效应未探讨**：冻结嵌入可能阻碍模型在翻译训练中进一步适应目标语言的分布，是否在更大规模训练数据下依然最优，尚不明确。
- **对负迁移缺乏深入分析**：kasByte导致无关语言下降约0.3~0.7 BLEU，文中仅用"跨语言嵌入漂移"一句话带过，未分析漂移产生的机制，也未尝试相应的缓解手段（如正则化、嵌入归一化等）。
- **与SOTA方法缺少对比**：未与IndicTrans2（目前印度语言翻译的强基线）等主流模型进行比较，难以判断技术在实际应用中的绝对水平。
- **统计显著性未验证**：单次实验结果缺少误差棒和显著性检验，BLEU的微小变化（如+0.13）可能不具统计意义。

---

**（完）**
