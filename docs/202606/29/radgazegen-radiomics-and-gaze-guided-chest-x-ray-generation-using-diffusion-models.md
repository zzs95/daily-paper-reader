---
title: "RadGazeGen: radiomics and gaze-guided chest X-ray generation using diffusion models"
title_zh: RadGazeGen：基于扩散模型的影像组学与视线引导的胸部 X 射线生成
authors: Unknown
date: Unknown
pdf: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13285692/"
tldr: 本研究提出RadGazeGen，一种利用扩散模型并结合放射组学与视线引导的胸部X射线图像生成方法。该研究源于NoduLoCC2026挑战赛，旨在通过生成高质量的合成影像来辅助肺结节的检测与定位任务。通过整合专家视线数据和影像特征，该方法显著增强了生成图像的病理真实性，为医学影像分析提供了更丰富的数据支持。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在解决胸部X射线影像中肺结节检测与定位任务面临的高质量标注数据不足的问题。
method: 提出一种基于扩散模型的RadGazeGen框架，通过放射组学特征和人类专家视线追踪数据引导图像生成。
result: 成功举办了NoduLoCC2026挑战赛，并吸引了多个国际团队参与，验证了相关技术在肺结节任务中的潜力。
conclusion: 结合多模态引导信息的扩散模型是生成高质量医学影像的有效途径，能显著推动肺结节自动诊断技术的发展。
---

## 摘要
我们提出了 NoduLoCC2026，这是一项关于胸部 X 射线图像中肺结节检测与定位的挑战赛。我们为这两项任务提供了一个数据集，并收到了来自 5 个国际团队的提交。参赛团队的解决方案是……

## Abstract
We propose NoduLoCC2026, a challenge on lung nodule detection and localizationin chest X-ray images. We have provided a dataset for both tasks and receivedsubmissions from 5 international teams. The participating teams' solutions are …

---

## 论文详细总结（自动生成）

这篇论文提出了 **RadGazeGen**，一个结合了放射科医生视线追踪（Eye Gaze）数据和影像组学（Radiomics）特征的扩散模型框架，旨在生成高临床保真度的胸部 X 射线（CXR）图像。

以下是对该论文的结构化总结：

### 1. 核心问题与整体含义（研究动机和背景）
*   **核心问题**：现有的文本生成图像（T2I）扩散模型在生成医学影像时，仅依赖文本描述（放射学报告）往往无法捕捉到疾病的具体细节、精确位置和解剖结构的严谨性。
*   **研究动机**：放射学报告通常存在歧义，且缺乏空间定位信息。为了生成临床准确的影像，需要引入更细粒度的控制信号。
*   **整体含义**：论文提出利用放射科医生的**视线轨迹**（反映人类视觉认知和注意力）和**影像组学特征图**（捕捉亚视觉表型，如纹理、强度和形状）作为空间和语义控制，以弥合人类感知与机器生成之间的差距。

### 2. 方法论：核心思想与技术细节
RadGazeGen 框架由两个核心模块组成，基于 ControlNet 架构进行扩展：
*   **Rad-CN (Radiomics ControlNet)**：
    *   **核心思想**：利用影像组学滤波器（如 Canny 边缘、Sobel 算子、高斯-拉普拉斯算子）和肺部分割掩码作为控制信号。
    *   **作用**：确保生成的图像在解剖结构（形状）和纹理特征上具有一致性。
*   **HVA-CN (Human Visual Attention ControlNet)**：
    *   **核心思想**：将放射科医生的视线轨迹转化为人类视觉注意力（HVA）热图。
    *   **假设生成机制**：通过阈值化 HVA 图产生掩码，从图像库中提取病理特征生成多个“假设图像”，选择与原始图像相似度最高的假设作为控制信号进行训练。
    *   **作用**：引导模型在专家关注的特定区域生成准确的病理模式。
*   **算法流程**：首先在 CXR 数据集上微调 Stable Diffusion (SD-CXR)，然后分别训练 Rad-CN 和 HVA-CN，最后在推理阶段融合多个控制信号生成最终图像。

### 3. 实验设计
*   **数据集**：
    *   **训练/微调**：MIMIC-CXR（基础扩散模型训练）、REFLACX 和 Eye Gaze Data for CXR（视线数据训练）。
    *   **下游任务评估**：CheXpert 测试集（用于疾病分类验证）、MIMIC-CXR-LT（用于长尾分布学习验证）。
*   **对比方法 (Benchmarks)**：
    *   基础模型：Stable Diffusion (SD) v1.5。
    *   可控生成模型：T2I-Adapter、ControlNet、MultiControlNet。
    *   医学专用模型：RoentGen、MedFusion、CXR-IRGen。
*   **评估指标**：FID（图像质量）、SSIM/mIoU（可控性）、CLIP-score（内容一致性）、AUC（分类性能）、放射科医生人工评分（解剖/病理真实性）。

### 4. 资源与算力
*   **硬件**：单张 **NVIDIA Quadro RTX 8000 (48 GB)** GPU。
*   **训练细节**：
    *   SD 微调：50,000 步，batch size 为 4。
    *   ControlNet 训练：10 个 epoch，学习率 $10^{-5}$。
    *   使用了混合精度（fp16）和梯度检查点技术以优化显存使用。

### 5. 实验数量与充分性
*   **实验规模**：涵盖了图像质量评估、可控性分析、下游分类任务（12 种疾病）以及长尾分布增强实验。
*   **消融实验**：对比了单独使用 Rad-CN、单独使用 HVA-CN 以及两者结合的效果，验证了多模态控制的必要性。
*   **充分性评价**：实验设计较为全面，不仅有客观的计算机视觉指标，还引入了**两位资深放射科医生**（4 年和 8 年经验）的盲测评分，增强了结果的临床说服力。

### 6. 主要结论与发现
*   **质量提升**：RadGazeGen 在 FID 和 SSIM 指标上优于现有的 T2I-Adapter 和 ControlNet 变体。
*   **临床有效性**：生成的图像在 CheXpert 分类任务中表现优异，AUC 显著高于仅靠文本引导的 SD 模型。
*   **解决数据不平衡**：在长尾数据集（MIMIC-CXR-LT）上，利用 RadGazeGen 生成的少数类样本进行数据增强，显著提升了分类器的平衡准确率（bAcc）。
*   **专家认可**：放射科医生评分显示，该方法生成的图像在解剖合理性和病理真实性上得分最高。

### 7. 优点与亮点
*   **创新性控制信号**：首次将放射科医生的视线数据（认知特征）与影像组学（物理特征）结合用于扩散模型控制。
*   **多控制融合**：展示了强大的组合能力，能够同时遵循解剖掩码、纹理特征和病理位置。
*   **下游应用导向**：不仅关注图像“好看”，更证明了生成的图像对训练诊断模型有实际帮助（数据增强）。

### 8. 不足与局限
*   **数据依赖性**：视线追踪数据（Eye Gaze）获取成本高，限制了该模型向缺乏此类数据的其他医学领域迁移。
*   **计算开销**：多控制信号的融合和假设生成过程增加了推理时的计算复杂度和时间。
*   **维度限制**：目前仅在 2D CXR 图像上验证，尚未扩展到 3D 影像（如 CT/MRI），且 3D 视线数据的处理复杂度会呈指数级增长。
*   **样本量**：虽然使用了多个数据集，但视线数据的总样本量相对较小（约数千例），可能存在过拟合特定专家风格的风险。

（完）
