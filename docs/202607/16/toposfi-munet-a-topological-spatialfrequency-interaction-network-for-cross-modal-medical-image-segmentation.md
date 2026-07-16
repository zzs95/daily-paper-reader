---
title: "TopoSFI-MUNet: a topological spatial–frequency interaction network for cross-modal medical image segmentation"
title_zh: TopoSFI-MUNet：一种用于跨模态医学图像分割的拓扑空域-频域交互网络
authors: Unknown
date: Unknown
pdf: "https://link.springer.com/content/pdf/10.1007/s44443-026-00977-z_reference.pdf"
tldr: 本研究提出TopoSFI-MUNet，一种用于跨模态医学图像分割的拓扑空间-频率交互网络。针对不同模态提供的互补组织结构和病变信息，该模型通过引入空间与频率域的拓扑交互机制，有效融合多源图像特征。实验证明，该方法显著提升了对病变区域的识别与定位能力，为多模态医学影像分析提供了更精准的分割方案。
source: google_scholar_email
selection_source: fresh_fetch
motivation: 旨在解决如何有效融合不同医学成像模态提供的互补信息，以提高病变区域识别和定位的准确性。
method: 提出了一种名为TopoSFI-MUNet的网络，通过拓扑空间-频率交互机制来实现跨模态特征的深度融合。
result: 该方法在跨模态医学图像分割任务中表现优异，显著增强了模型捕捉复杂组织结构和病变细节的能力。
conclusion: TopoSFI-MUNet通过创新的空间-频率交互策略，证明了多模态信息融合在提升医学影像分割精度方面的有效性。
---

## 摘要
由于不同的成像模态提供了互补的组织结构和病变信息，多模态医学图像语义分割可以通过融合多源图像，显著提高识别和定位病变区域的能力。

## Abstract
Since different imaging modalities provide complementary tissue structure and lesioninformation, multi-modal medical image semantic segmentation can significantlyimprove the ability to identify and locate lesion regions by fusing multi-source image …

---

## 论文详细总结（自动生成）

这是一份关于论文《TopoSFI-MUNet: a topological spatial–frequency interaction network for cross-modal medical image segmentation》的深度结构化总结：

### 1. 核心问题与研究背景
*   **研究动机**：多模态医学影像（如CT、PET）能提供互补的组织结构信息，但现有分割方法多将其视为像素级的独立分类问题，忽略了像素间的**拓扑连接关系**。
*   **核心挑战**：在处理复杂病变边界或低对比度区域时，传统方法容易导致边界模糊、轮廓不连续。此外，如何从拓扑关系的角度有效融合跨模态的**空域（Spatial）**与**频域（Frequency）**特征仍是一个难题。

### 2. 方法论：TopoSFI-MUNet
*   **核心思想**：构建一个基于“连通图建模”的三编码器-单解码器框架，通过显式建模像素间的连通性，并在跳跃连接和瓶颈层引入空频交互模块，增强模型对病变边缘和轮廓的感知力。
*   **关键技术细节**：
    *   **连通性变换（Connected Transformation）**：将二值标签转换为八方向连通图，使网络学习像素与其8邻域的拓扑关系。
    *   **CFCSP-TCM 模块（跳跃连接处）**：跨模态“频率-通道，空间-位置”拓扑特征补偿模块。利用离散余弦变换（DCT）捕捉多频结构信息，结合空间注意力补偿编码器到解码器的信息流失。
    *   **CSCFP-TEM 模块（瓶颈层）**：跨模态“空间-通道，频率-位置”拓扑特征增强模块。利用离散波叶变换（DWT）将特征分解为高低频，通过交叉注意力机制实现空频信息的深度交互。
    *   **联合监督损失（$L_{con}$）**：由区域语义损失、拓扑损失和边缘损失三部分组成，共同约束预测结果的结构一致性。

### 3. 实验设计
*   **数据集**：
    1.  **临床肺部肿瘤数据集**：包含200名患者的PET、CT和PET/CT图像（共1800个有效切片）。
    2.  **BraTS2019 公开脑肿瘤数据集**：包含FLAIR、T1和T2三种MRI模态（共1745个样本）。
*   **Benchmark 与对比方法**：
    *   **单模态网络**：U-Net, SeResUnet, UTNet, TransUnet, DconnNet等。
    *   **多模态网络**：MEAUNet, Guide-Ynet, MdCo-Unet, DBW-Unet等。
*   **评价指标**：mIoU, Dice, VOE, RVD, Recall 以及 Hausdorff 距离 (HD)。

### 4. 资源与算力
*   **硬件环境**：NVIDIA TITAN V GPU (12GB), Intel Xeon Gold 6154 CPU。
*   **软件环境**：PyTorch 1.7.0, CUDA 11.1。
*   **训练细节**：Adam优化器，初始学习率 1e-4，Batch size 为 4，训练 100 个 Epoch。
*   **计算开销**：参数量 16.16M，FLOPs 78.90G，显存占用约 580.82MB。单样本推理时间约 51.39ms。

### 5. 实验数量与充分性
*   **实验规模**：
    *   在两个不同部位（肺部、脑部）的数据集上进行了完整的对比实验。
    *   采用了**患者级五折交叉验证**，确保了结果的统计可靠性。
    *   **消融实验**非常详尽：包括模块间消融（验证CFCSP-TCM、CSCFP-TEM和损失函数的各自贡献）以及模块内子组件的消融。
*   **评价**：实验设计客观、公平，通过雷达图、可视化切片和量化表格多维度展示了性能提升，实验充分性高。

### 6. 主要结论与发现
*   **性能提升**：在肺部肿瘤数据集上，mIoU和Dice分别提升了3.03%和2.34%；在脑部肿瘤数据集上，分别提升了3.69%和2.93%。
*   **拓扑建模的价值**：显式引入像素连通性约束能显著降低边缘预测误差（HD距离明显下降），使分割出的病变区域更加完整、平滑。
*   **空频融合的优势**：频域特征（高频边缘、低频轮廓）与空域语义的交互，能有效弥补单一域特征在处理复杂解剖结构时的不足。

### 7. 优点与亮点
*   **创新视角**：将医学图像分割从单纯的像素分类提升到拓扑结构建模的高度。
*   **轻量化与效率**：相比于一些大型多模态模型（如Guide-Ynet），该模型在保持高精度的同时，参数量和显存占用更低，更具临床部署潜力。
*   **多损失协同**：通过区域、边缘、拓扑三位一体的损失函数，解决了病变区域破碎和边界模糊的问题。

### 8. 不足与局限
*   **静态拓扑限制**：目前采用固定的8邻域建模，属于静态拓扑。对于形状极度不规则或弥漫性的小病灶，固定邻域可能引入背景噪声。
*   **计算复杂度**：虽然比部分大型模型快，但由于引入了多次频域变换（DCT/DWT）和注意力机制，其推理速度仍慢于基础的U-Net等轻量级网络。
*   **应用范围**：主要验证了肿瘤类分割，对于血管等极细长结构的拓扑保持能力尚需进一步验证。

（完）
