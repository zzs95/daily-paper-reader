---
title: "RepoReasoner: Evaluating Repository-Level Code Reasoning Ability of Long-Context Language Models"
authors: Unknown
date: Unknown
pdf: "https://dl.acm.org/doi/pdf/10.1145/3808131"
tldr: "Recent large language models (LLMs) have shown strong performance on softwareengineering tasks, yet most existing benchmarks evaluate code reasoning at thefunction level, where all relevant information is localized. This setting fails to reflect …。"
source: google_scholar_email
selection_source: fresh_fetch
motivation: 本文关注一个具有代表性的研究问题，并尝试提升现有方法的效果或可解释性。
method: 方法与实现细节请参考摘要与正文。
result: 结果与对比结论请参考摘要与正文。
conclusion: 总体而言，该工作在所述任务上展示了有效性，并提供了可复用的思路或工具。
---

## 摘要
近期的大型语言模型（LLMs）在软件工程任务中展现出强大性能，然而大多数现有基准测试仅在函数级别评估代码推理，其中所有相关信息均局限在局部范围内。这种设定未能反映出……

## 速览
**TLDR**：现有代码推理评估局限于函数级，忽略仓库级多文件依赖。本文提出RepoReasoner基准，包含跨文件上下文推理任务，用于评估长上下文语言模型。实验表明现有模型在仓库级推理上准确率显著低于函数级，暴露了长上下文利用的挑战。该基准为提升代码智能体能力提供了新视角和评估标准。 \
**Motivation**：现有基准仅评估函数级代码推理，无法反映真实仓库场景中跨文件依赖的复杂推理需求。 \
**Method**：提出RepoReasoner基准，构建包含多文件依赖和长上下文推理的仓库级代码理解任务。 \
**Result**：长上下文LLM在仓库级推理任务上准确率低于函数级，且对上下文长度增加表现不稳定。 \
**Conclusion**：仓库级推理对当前模型构成挑战，RepoReasoner为改进长上下文代码推理提供了评估基础。

---

## Abstract
Recent large language models (LLMs) have shown strong performance on softwareengineering tasks, yet most existing benchmarks evaluate code reasoning at thefunction level, where all relevant information is localized. This setting fails to reflect …

---

## 论文详细总结（自动生成）

## 1. 核心问题与整体含义（研究动机和背景）

- 现有代码推理基准（如 CRUXEval、REval）**几乎全部在函数级别**进行评估，即所有必要信息都局限在单一函数片段内。这无法反映真实软件开发中**跨文件依赖**、**多文件上下文**的复杂性。
- 长上下文语言模型（如 DeepSeek-R1、GPT-4.1-Mini）已展现出处理长文本的能力，但尚缺乏专门评估其在**仓库级代码推理**（需要跨文件检索与推理）上表现的基准。
- 本文提出 **RepoReasoner**，旨在填补该空白，系统评估 LLMs 在仓库级代码推理中的**细粒度状态执行推理**与**高层架构依赖理解**两个核心能力。

## 2. 论文提出的方法论

### 核心思想
- 设计两个互补任务：
  - **Output Prediction**（输出预测）：在测试函数中掩码一个断言值，要求模型利用整个仓库的上下文（包括多个文件）推理出该值。测试的是**微观点**：多文件状态追踪、继承/多态解析、全局变量影响等。
  - **Call Chain Prediction**（调用链预测）：给定包含噪声文件池，要求模型识别出执行测试函数时实际被调用的文件序列。测试的是**宏观点**：架构理解、多跳依赖追踪、抗噪声能力。

### 关键技术细节
- 构造管道分四阶段：
  1. **仓库收集**：从 GitHub 挑选 20+ 科学领域、具有复杂跨文件依赖、pytest 测试套件完备的 Python 仓库。
  2. **执行过滤**：在 Docker 隔离环境中，利用自定义 pytest 插件 + hunter 库动态追踪执行轨迹，记录每个函数调用的源文件、目标文件及文件跳转序列，获得 ground-truth 调用链。经过此阶段，从 100 仓库筛选到 14 个可成功执行且有可跟踪链的仓库。
  3. **数据改写**：为防止模型记忆，使用 LLM（GPT-4）自动生成 I/O 重写的测试用例（仅修改输入和期望输出），保留逻辑等价但语法不同。重写后再次执行确保正确。
  4. **实例收集**：将每个实例打包为标准格式，包含目标测试函数、掩码断言、所有有效答案（Output Prediction）或 ground-truth 文件路径列表（Call Chain Prediction）。最终得到 858 个 Output Prediction 样本、169 个 Call Chain Prediction 样本。

### 公式与评估指标
- **Pass@k**：对于 Output Prediction，生成 k 个样本，若至少一个与 ground-truth 精确匹配（EM）则算通过。
- **F1-score** 与 **Exact Match (EM)**：用于 Call Chain Prediction。F1 采用宏平均（每实例独立计算 Precision、Recall、F1 后再平均）。
- 两种上下文策略：**Oracle Context**（提供 ground-truth 调用链文件）和 **Retrieval Context**（使用 BM25 检索得到 top 文件）。

## 3. 实验设计

### 数据集 / 场景
- 14 个 Python 仓库（科学计算、数据处理等），共 525 个测试函数。
- 两个任务分别有 858 和 169 个实例。
- 引入 I/O 重写后的“新数据”作为对比，测试记忆影响。

### Benchmark
- 使用自己提出的 RepoReasoner 基准。
- 评估任务本身即为 benchmark。

### 对比方法（7 个 LLM）
| 类别 | 模型 |
|------|------|
| 开源 | Qwen-2.5-14B、R1-Distill-Qwen-14B、Qwen-2.5-Coder-14B、Qwen3-235B-A22B、DeepSeek-R1 |
| 闭源 | GPT-4.1-Mini、Gemini-2.5-Flash |

- 每个实例采样 5 次（n=5），温度 0.7，top-p 0.9。

### 实验设置
- 回答 5 个研究问题（RQs）：
  - RQ1：Oracle 上下文下的 Output Prediction 性能。
  - RQ2：Call Chain Prediction 在不同信噪比（25%、50%、Oracle）下的性能。
  - RQ3：原始 vs I/O 重写数据对比，量化记忆依赖。
  - RQ4：上下文长度从 10k 增大到 30k 对 Output Prediction 的影响。
  - RQ5：错误分析（手动检查 200 个 Output Prediction 失败样本和 100 个 Call Chain Prediction 失败样本）。

## 4. 资源与算力

- 文中明确提及实验环境：
  - 操作系统：CentOS Linux release 7.9.2009 (Core)
  - CPU：Intel(R) Xeon(R) Platinum 8376H @ 2.60GHz（1 个 CPU）
  - GPU：NVIDIA A800 80GB × 2
- **未说明训练时长**（因为本工作只进行模型推理评估，不涉及训练）。评估所需时间未报告。

## 5. 实验数量与充分性

- 实验组数较多：
  - **Table 1**：7 个模型在 Oracle 上下文（10k）下的 Output Prediction（Pass@1/5）。
  - **Table 2**：Call Chain Prediction 在不同信噪比（25%/50%/Oracle）下的 Precision/Recall/F1/EM。
  - **Table 3**：原始 vs I/O 重写数据在 Oracle 上下文下的输出预测。
  - **Table 4**：10k vs 30k Retrieval 上下文的输出预测（包含原始和重写数据）。
  - **RQ5 错误分析**：手动分类 200+100 个错误样本，并提供了分布图。
- **充分性**：覆盖了多个模型、多种上下文条件、消融（重写、不同信号比）、错误分析，实验设计系统且全面。
- **公平性**：所有模型使用相同生成参数（n=5, temperature=0.7, top-p=0.9），评估指标一致。但仅使用 BM25 作为检索方法，可能不能代表所有检索技术。

## 6. 论文的主要结论与发现

1. **仓库级推理仍存在根本瓶颈**：即使提供完美 Oracle 上下文，最佳模型 DeepSeek-R1 也仅达到 69.1% Pass@1，说明跨文件推理比函数级推理难得多。
2. **调用链理解：高精度低召回**：模型能识别直接依赖（精度高），但多跳遍历能力弱（召回低），即使在 Oracle 条件下召回也有限。EM 分数普遍低于 20%。
3. **模型部分依赖记忆**：所有模型在 I/O 重写数据上性能均下降（如 GPT-4.1-Mini 从 66.6% 降至 58.8%），表明依赖训练数据中的模式匹配而非纯推理。
4. **更长的上下文不一定更好**：对某些模型（如 Qwen-2.5-Coder-14B），从 10k 增加到 30k 上下文反而导致性能下降，因为噪声增加超过了信息增益。
5. **错误模式**：
   - Output Prediction 主要错误是“错误值”（50-83%），其次是“标识符混淆”和“格式错误”。
   - Call Chain Prediction 中，大型模型的主要错误是“错误答案”（80-93%），小型模型容易产生“不可解析/空输出”。

## 7. 优点

- **范式创新**：首次系统地将代码推理评估从函数级提升到仓库级，更贴近真实开发场景。
- **双任务设计合理**：Output Prediction（微观状态推理）和 Call Chain Prediction（宏观架构理解）互补，分别捕捉不同维度的能力。
- **自动化构造管道**：利用动态追踪（pytest + hunter）获取 ground-truth，减少人工标注成本，可扩展。
- **防记忆机制**：I/O 重写确保评估的是推理而非记忆，并量化了记忆依赖程度。
- **广泛模型覆盖**：包含开源/闭源、不同规模（14B ~ 671B）、通用/代码专用、MoE 等架构，结论具有普适性。
- **详细错误分析**：手动分类揭示了具体的失败模式，为后续改进提供方向。

## 8. 不足与局限

- **语言限制**：仅限 Python，结论可能不适用于其他编程语言（如 Java、C++）。
- **检索方法单一**：仅使用 BM25 构建 Retrieval 上下文，未对比向量检索等更先进方法，可能低估模型在有更好检索下的表现。
- **I/O 重写深度有限**：仅修改输入输出，未进行函数重构或调用链重组，缓解记忆的效果可能不足。
- **评估方式**：使用静态匹配（Exact Match）而非执行验证，可能因格式差异导致误判。作者虽尝试补充 ground-truth，但仍有风险。
- **数据泄露风险**：虽然做了重写，但原始代码可能已在训练集中见过，I/O 重写不能完全消除记忆影响。
- **模型选择时效性**：评估时点的模型可能很快被新版本取代，但本文的评估框架和方法论具有长期参考价值。
- **计算资源未详细报告**：未给出每个模型评估的 GPU 时长，不利于复现成本评估。

（完）
