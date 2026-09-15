---
title: Interpretable prediction of macrotrabecular-massive HCC and recurrence-free survival by integrating MRI LI-RADS features with deep learning habitat radiomics
title_zh: 整合MRI LI-RADS特征与深度学习栖息地影像组学对巨梁状-巨块型HCC及无复发生存的可解释预测
authors: Unknown
date: Unknown
pdf: "https://link.springer.com/article/10.1186/s41747-026-00795-y"
tldr: 针对巨梁状-块状型（MTM+）肝细胞癌预后差、易早期复发，且缺乏可解释术前预测工具的问题，本研究整合MRI LI-RADS语义特征与深度学习habitat放射组学，构建并验证预测MTM+及无复发生存的列线图。模型融合肿瘤异质性空间信息，旨在提升术前识别与风险分层能力，为个体化诊疗提供可解释依据，有助于指导治疗决策。
source: google_scholar_email
selection_source: fresh_fetch
motivation: MTM+ HCC侵袭性强、预后差且易早期复发，术前准确识别和复发风险分层对治疗决策至关重要。
method: 整合MRI LI-RADS特征与深度学习habitat放射组学，构建并验证预测MTM+和无复发生存的列线图。
result: 研究开发并验证了整合模型，用于预测MTM+ HCC及无复发生存，显示影像语义与habitat特征联合的潜力。
conclusion: 融合LI-RADS与深度学习habitat放射组学的列线图可为MTM+ HCC提供可解释术前预测，辅助个体化诊疗与随访。
---

## 摘要
摘要 目的 巨梁状-巨块型（MTM+）肝细胞癌（HCC）与不良预后和早期复发相关。我们开发并验证了一种整合磁共振成像LI-RADS特征的列线图……

## Abstract
Abstract Objective Macrotrabecular-massive (MTM+) hepatocellular carcinoma(HCC) is associated with poor prognosis and early recurrence. We developed andvalidated a nomogram integrating magnetic resonance imaging LI-RADS features …

---

## 论文详细总结（自动生成）

# 论文结构化总结

## 1. 核心问题与整体含义（研究动机与背景）

- **临床痛点**：原发性肝细胞癌（HCC）术后复发率高，其中**巨梁状-巨块型（Macrotrabecular-massive, MTM+）HCC**是一种独特组织学亚型，侵袭性强、预后差、易早期复发，术前准确识别与复发风险分层对治疗决策至关重要。
- **现有手段的局限**：
  - ESM1等生物标志物虽可提示MTM+ HCC，但依赖术后病理标本，无法术前无创诊断。
  - 传统影像组学多基于**全肿瘤**提取特征，忽视肿瘤内部**空间异质性**；而MTM+ HCC恰恰以显著的瘤内异质性为特征。
  - 已有CT/MRI影像组学或深度学习（DL）模型虽取得一定性能（如双能CT DL模型外部AUC 0.89），但**尚无研究同时整合habitat影像组学与DL特征**来预测MTM+ HCC。
- **研究目标**：基于Gd-EOB-DTPA增强MRI，构建并验证一个**整合临床、LI-RADS影像学、habitat影像组学与DL特征的可解释融合列线图**，用于术前预测MTM+ HCC并对无复发生存（RFS）进行风险分层。

## 2. 方法论

### 核心思想
以**肿瘤内部栖息地（habitat）分区**刻画瘤内异质性，结合**3D Swin Transformer提取的深度学习特征**与**LI-RADS语义影像特征及临床变量**，通过多变量逻辑回归构建可解释的融合列线图。

### 关键技术细节与流程
- **分割**：nnU-Net自动分割（3D全分辨率配置），353例用于训练/验证（282/71），其余254例自动分割后由资深放射科医师校正，最终607例ground truth用于分析。
- **Habitat分区**：
  - 对影像组学特征进行K-means聚类（k=2–8），以Calinski–Harabasz指数确定最优聚类数 **k=3**。
  - 聚类质心固定后应用于内部验证集与外部测试集，生成3个habitat亚区图，作为瘤内异质性影像标志物。
- **Habitat影像组学特征提取**：PyRadiomics 3.0.1，基于原始、LoG（σ=2.0–5.0 mm）及小波变换图像，提取形状、一阶、GLCM、GLRLM、GLSZM、GLDM等特征；重采样至1×1×1 mm³，固定bin width=5。每cluster 1,132个特征，单期相共3,396个。
- **DL特征提取**：
  - 采用Kinetics预训练的**3D Swin Transformer**（PyTorch v2.5.1），迁移学习。
  - 图像强度归一化至[0,1]；数据增强含Resized、ScaleIntensityRanged、RandFlipd、RandAffined；batch size=16，初始学习率0.0001，每7 epoch衰减0.1；focal loss + Adam优化器；训练200–500 epoch。
- **特征选择与建模**：
  - 使用FeAture Explorer V0.5.12进行特征归一化与筛选。
  - 三期（AP、PP、HBP）特征融合为combined-phase（CP）特征。
  - Habitat影像组学模型用**SVM**；DL模型用**autoencoder**；按内部验证集AUC选择最优模型，输出habitat radiomics score与DL score。
- **融合列线图**：将p<0.05的临床、影像、habitat score、DL score纳入多变量向后逻辑回归，筛选独立预测因子，用逻辑回归构建融合模型并绘制列线图。
- **可解释性**：生成类激活图（CAM）可视化DL关注区域；使用**SHAP**分析特征贡献方向。
- **RFS分析**：以训练集为基础，将临床特征与列线图预测的MTM状态纳入单/多变量Cox回归，构建预后模型，以C-index评估。

## 3. 实验设计

- **数据集与场景**：
  - 多中心回顾性研究，3家医院2015年6月–2024年1月共739例病理确诊HCC，最终纳入**607例早期HCC**（474男/133女，年龄59.6±10.6岁），其中MTM+ 151例。
  - 中心1（435例）按7:3随机分为**训练集（304例）**与**内部验证集（131例）**；中心2、3（172例）作为**外部测试集**。
  - RFS分析纳入536例（88.3%），随访至2024年12月30日，复发231例（43.1%）。
- **Benchmark与对比方法**：
  - **CR模型**（临床-影像学模型，基于LI-RADS特征+临床变量）作为主要基准。
  - 分别建立4个habitat影像组学模型（AP、PP、HBP、CP）和4个DL模型（AP、PP、HBP、CP）。
  - 使用DeLong检验比较AUC；对habitat与DL模型间的两两比较采用Bonferroni校正（p<0.0083）。
  - 评估指标：AUC、校准曲线、混淆矩阵、决策曲线分析（DCA）、C-index、Kaplan–Meier生存曲线。
- **分割性能评估**：Dice系数（AP 0.891、PP 0.883、HBP 0.932）与95% Hausdorff距离（AP 13.4 mm、PP 13.2 mm、HBP 10.4 mm），并按肿瘤大小分层评估。

## 4. 资源与算力

- 论文中**未明确说明**所使用的GPU型号、数量、显存或具体训练时长。
- 仅提及：PyTorch v2.5.1框架、nnU-Net框架、3D Swin Transformer（Kinetics预训练）、训练200–500 epoch、batch size=16、学习率调度策略。
- 代码已在GitHub开源（MTM-HCC-Swin3d-classification）。
- **结论**：算力资源信息缺失，无法评估计算成本与可复现性。

## 5. 实验数量与充分性

- **实验组数概览**：
  - 1个CR模型 + 4个habitat影像组学模型（AP/PP/HBP/CP）+ 4个DL模型（AP/PP/HBP/CP）+ 1个融合列线图。
  - 分割性能评估（含按大小分层）+ 特征相关性分析 + 校准曲线 + DCA + 混淆矩阵 + CAM可视化 + SHAP分析 + RFS的Cox回归与KM曲线。
- **充分性评价**：
  - **优点**：设有独立外部测试集（172例），多中心设计，多期相消融式对比，模型间统计检验严谨（Bonferroni校正）。
  - **不足**：
    - 未进行专门的跨中心**图像协调/批次效应校正**，可能影响泛化性评估的公平性。
    - 未报告与已有文献模型的直接复现对比（仅作数值层面的间接比较）。
    - 缺乏端到端DL模型的对照实验。
    - RFS分析中内部验证集与外部测试集的C-index偏低（0.62、0.63），预后模型稳健性有限。

## 6. 主要结论与发现

- **融合列线图性能优异**：训练集AUC 0.897（95% CI 0.854–0.940）、内部验证集0.757（0.674–0.827）、外部测试集0.858（0.797–0.906），均显著优于CR模型（0.801、0.651、0.739，p<0.05）。
- **独立预测因子**：habitat radiomics score（OR=3.561）、DL score（OR=3.060）、AFP（OR=3.569）、ALT（OR=2.419）、fat in mass（OR=0.149，负相关）为MTM+ HCC独立预测因子。
- **Habitat与DL模型表现**：CP模型为各自类别中最优；MTM+组habitat score与DL score均显著高于MTM−组。
- **RFS分层**：列线图预测为MTM+的患者RFS显著更短（训练集18.9 vs 39.3个月，p<0.001；内部验证26.3 vs 40.5个月，p=0.022；外部测试30.0 vs 46.4个月，p=0.033）。
- **RFS独立预后因素**：AFP（HR=2.76）与列线图预测MTM状态（HR=1.72）为独立预后因素，预后模型C-index分别为0.74、0.62、0.63。
- **SHAP解释**：habitat score、DL score、AFP、ALT为正向贡献，fat mass为负向贡献。

## 7. 优点

- **方法创新**：首次将**habitat影像组学与3D Swin Transformer DL特征融合**用于MTM+ HCC术前预测，兼顾瘤内空间异质性与深层非线性特征。
- **多中心设计与外部验证**：3中心607例，含独立外部测试集，泛化性评估较充分。
- **可解释性强**：结合CAM热图与SHAP分析，提升DL模型透明度；列线图形式便于临床解读。
- **临床价值延伸**：不仅预测MTM+，还进一步关联RFS风险分层，为个体化诊疗与随访提供依据。
- **技术细节规范**：nnU-Net自动分割经资深医师校正，特征提取流程标准化，统计检验采用Bonferroni校正控制多重比较误差。
- **开源代码**：提供GitHub代码链接，利于复现与推广。

## 8. 不足与局限

- **回顾性设计**：存在固有选择偏倚，无法完全排除混杂因素。
- **缺乏图像协调**：三中心采集异质性大，未采用专门harmonization方法，可能限制泛化性。
- **计算复杂度高**：多层级融合列线图计算需求大，可能阻碍实时临床部署；为保持可解释性未采用端到端DL模型。
- **生存分析受限**：生存数据不足，未评估总生存期（OS）；RFS模型在内部验证与外部测试集C-index偏低（0.62、0.63）。
- **样本与亚组**：MTM+比例相对较低（151/607），外部测试集MTM+仅29例，可能影响统计效能。
- **未与已有模型直接复现对比**：仅作数值层面的间接比较，缺乏同一数据集上的公平基准测试。
- **算力信息缺失**：未报告GPU型号、数量与训练时长，影响可复现性与成本评估。

（完）
