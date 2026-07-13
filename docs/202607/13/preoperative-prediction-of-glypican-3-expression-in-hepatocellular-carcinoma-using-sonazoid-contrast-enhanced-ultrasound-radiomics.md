---
title: Preoperative Prediction of Glypican-3 Expression in Hepatocellular Carcinoma Using Sonazoid Contrast-Enhanced Ultrasound Radiomics
title_zh: 基于 Sonazoid 造影增强超声影像组学的肝细胞癌术前 Glypican-3 表达预测
authors: Unknown
date: Unknown
pdf: "https://www.tandfonline.com/doi/pdf/10.2147/JHC.S610969"
tldr: 本研究旨在开发并验证一种基于Sonazoid造影剂增强超声（CEUS）的无创影像组学方法，用于术前预测孤立性肝细胞癌（HCC）患者的磷脂酰肌醇蛋白聚糖-3（GPC3）表达状态。通过提取和分析超声影像中的组学特征，该研究为HCC的精准诊断和预后评估提供了一种有效的辅助手段，有助于优化患者的个体化治疗策略。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在通过无创影像学手段在术前准确预测肝细胞癌中关键生物标志物GPC3的表达水平。
method: 开发并验证了一种基于Sonazoid造影增强超声影像的影像组学分析模型。
result: 研究成功构建了能够有效识别孤立性肝细胞癌患者GPC3表达状态的预测模型。
conclusion: 基于Sonazoid CEUS的影像组学方法是术前预测HCC中GPC3表达的一种可靠且无创的工具。
---

## 摘要
目的：开发并验证一种基于 Sonazoid 造影增强超声 (CEUS) 的无创影像组学方法，用于术前预测单发肝细胞癌 (HCC) 患者的 Glypican-3 (GPC3) 状态，并……

## Abstract
Objective To develop and validate a noninvasive radiomics approach based onSonazoid contrast-enhanced ultrasound (CEUS) for preoperative prediction ofGlypican-3 (GPC3) status in solitary hepatocellular carcinoma (HCC) patients and to …

---

## 论文详细总结（自动生成）

这是一份关于论文《Preoperative Prediction of Glypican-3 Expression in Hepatocellular Carcinoma Using Sonazoid Contrast-Enhanced Ultrasound Radiomics》的深度结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **核心问题**：如何在术前通过无创手段准确预测肝细胞癌（HCC）中 **Glypican-3 (GPC3)** 的表达状态。
*   **研究背景**：GPC3 是 HCC 诊断、预后及免疫治疗（如 CAR-T、疫苗）的关键靶点。目前判定 GPC3 表达的金标准是术后病理免疫组化，具有滞后性。
*   **研究动机**：Sonazoid 是一种新型超声造影剂，其独特的“Kupffer 相”能反映肝脏巨噬细胞分布，而 GPC3 与肿瘤相关巨噬细胞的招募有关。研究者希望利用 Sonazoid 造影增强超声（CEUS）的影像组学特征，建立一种术前无创预测模型。

### 2. 方法论：核心思想与技术细节
*   **核心思想**：提取 Sonazoid CEUS 多相位图像中的高通量定量特征，结合临床指标构建逻辑回归预测模型。
*   **关键流程**：
    1.  **图像采集**：涵盖常规超声及 CEUS 的四个相位（动脉期、门脉期、延迟期、Kupffer 期）。
    2.  **ROI 勾画**：由放射科医生手动勾画肿瘤最大截面的感兴趣区域（ROI）。
    3.  **特征提取**：使用 Python 提取 102 个原始特征（包括形状、一阶统计量、二阶纹理特征等），5 个相位共计 510 个特征。
    4.  **特征筛选**：采用 **mRMR（最小冗余最大相关）** 算法初步筛选前 20 个特征，随后利用 **LASSO（最小绝对收缩和选择算子）** 回归进行 10 折交叉验证，最终确定 7 个关键特征构建影像组学评分（Radscore）。
    5.  **模型构建**：通过多因素逻辑回归，将 Radscore 与具有统计学意义的临床指标（如 AFP）整合，构建**混合模型（Hybrid Model）**。

### 3. 实验设计
*   **数据集**：回顾性分析了 2020 年至 2024 年间的 278 名单发 HCC 患者。
*   **分组**：按 7:3 比例随机分为训练集（n=195）和验证集（n=83）。
*   **Benchmark（基准）**：以术后病理免疫组化结果为金标准。
*   **对比方法**：
    *   单纯影像组学模型（Radiomics Model）。
    *   临床指标模型（如 AFP 表达）。
    *   混合模型（影像组学 + 临床指标）。
*   **评估指标**：AUC（曲线下面积）、敏感性、特异性、准确性、校准曲线及决策曲线分析（DCA）。

### 4. 资源与算力
*   **软件环境**：使用了 Python (3.8.2) 进行特征提取，R 语言 (4.4.2) 进行统计分析和模型构建。
*   **硬件算力**：文中**未明确说明**具体的 GPU 或 CPU 型号及训练时长。由于影像组学特征提取和逻辑回归模型对算力要求相对较低，通常在普通工作站即可完成。

### 5. 实验数量与充分性
*   **实验规模**：总样本量 278 例，在超声影像组学研究中属于中等规模。
*   **充分性评价**：
    *   **特征稳定性**：进行了观察者内和观察者间的重复性检验（ICC > 0.75），确保了特征提取的可靠性。
    *   **统计严谨性**：使用了逻辑回归、Delong 检验对比 AUC、以及 DCA 评估临床获益，实验设计较为客观。
    *   **生存分析**：额外对 175 名随访超过 2 年的患者进行了早期复发风险（RFS）的关联分析。
    *   **不足**：GPC3 阴性样本较少（仅 51 例），存在一定的类别不平衡风险（文中通过加权逻辑回归进行了稳健性验证）。

### 6. 主要结论与发现
*   **预测效能**：混合模型表现最优。在训练集中 AUC 为 **0.81**，验证集中 AUC 为 **0.78**，显著优于单纯的影像组学模型（验证集 AUC 0.67）。
*   **独立预测因子**：**Radscore** 和 **AFP > 200 ng/mL** 是 GPC3 阳性的独立预测因子。
*   **预后关联**：研究发现 GPC3 状态及该模型评分与患者的早期复发（RFS）**无显著相关性**（p > 0.05），未能证明其在预后评估中的价值。

### 7. 优点与亮点
*   **创新性**：这是首个利用 **Sonazoid CEUS（含 Kupffer 相）** 进行 GPC3 预测的影像组学研究，填补了该领域的空白。
*   **多相位融合**：模型整合了从形态学到血流动力学再到巨噬细胞功能的五个相位信息，特征捕获更全面。
*   **临床实用性**：提供了可视化列线图（Nomogram），方便临床医生根据 Radscore 和 AFP 值直接估算 GPC3 阳性概率。

### 8. 不足与局限
*   **单中心局限**：研究数据来自单一中心，缺乏外部独立验证集，模型的泛化能力有待进一步验证。
*   **样本偏差**：GPC3 阳性率极高（约 82%），阴性样本量不足可能导致模型在识别阴性病例时存在偏差。
*   **图像维度**：仅基于静态的最大截面图像（2D），未利用动态视频序列或 3D 影像，可能丢失部分空间和时间异质性信息。
*   **预后预测失败**：模型虽能预测 GPC3 表达，但无法预测术后复发，限制了其在预后管理中的应用。

（完）
