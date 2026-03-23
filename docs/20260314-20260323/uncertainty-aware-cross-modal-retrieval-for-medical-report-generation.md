---
title: Uncertainty-Aware Cross-Modal Retrieval for Medical Report Generation
title_zh: 面向医学报告生成的不确定性感知跨模态检索
authors: Unknown
date: Unknown
pdf: "https://scholar.google.com/scholar_url?url=https://ieeexplore.ieee.org/abstract/document/11440925/&hl=en&sa=X&d=18390740007939977857&ei=46nAae3rGpqe6rQP85LWgQY&scisig=ADi0EEUGjMJ3FmB0eRp1_MD3PYN_&oi=scholaralrt&hist=Sp41LysAAAAJ:10706931080633283153:ADi0EEVZJGLsnIeIyliil1w_anle&html=&pos=0&folt=rel"
tldr: 自动医疗报告生成（MRG）目前主要依赖单模态检索，限制了多模态语义的捕捉。本文提出了一种不确定性感知跨模态检索方法，旨在解决现有检索增强策略中的局限性。通过引入跨模态检索机制并考虑不确定性，该方法能够更准确地捕捉图像与文本间的复杂关联，从而生成更高质量、更准确的医疗报告，显著提升了MRG系统的性能和鲁棒性。
motivation: 现有医疗报告生成方法过度依赖单模态检索，难以充分利用多模态语义信息且忽略了检索过程中的不确定性。
method: 提出了一种不确定性感知的跨模态检索框架，通过整合图像和文本特征并量化不确定性来增强报告生成的准确性。
result: 实验结果表明，该方法在多个医疗报告生成基准数据集上均取得了显著的性能提升，优于现有的检索增强方法。
conclusion: 引入不确定性感知和跨模态检索能有效提升医疗报告生成的质量，为自动化临床报告撰写提供了新的有效路径。
---

## 摘要
随着检索增强策略的应用，自动医学报告生成（MRG）取得了显著进展。然而，现有方法仍面临两个持续存在的挑战：1）很大程度上依赖单模态检索，这限制了多模态语义的捕捉……

## 速览
**TLDR**：自动医疗报告生成（MRG）目前主要依赖单模态检索，限制了多模态语义的捕捉。本文提出了一种不确定性感知跨模态检索方法，旨在解决现有检索增强策略中的局限性。通过引入跨模态检索机制并考虑不确定性，该方法能够更准确地捕捉图像与文本间的复杂关联，从而生成更高质量、更准确的医疗报告，显著提升了MRG系统的性能和鲁棒性。 \
**Motivation**：现有医疗报告生成方法过度依赖单模态检索，难以充分利用多模态语义信息且忽略了检索过程中的不确定性。 \
**Method**：提出了一种不确定性感知的跨模态检索框架，通过整合图像和文本特征并量化不确定性来增强报告生成的准确性。 \
**Result**：实验结果表明，该方法在多个医疗报告生成基准数据集上均取得了显著的性能提升，优于现有的检索增强方法。 \
**Conclusion**：引入不确定性感知和跨模态检索能有效提升医疗报告生成的质量，为自动化临床报告撰写提供了新的有效路径。

---

## Abstract
Automatic medical report generation (MRG) has advanced significantly with retrieval-augmented strategies. However, existing methods face two persistent challenges: 1)a largely reliance on single-modal retrieval, which limits multimodal semantic capture …