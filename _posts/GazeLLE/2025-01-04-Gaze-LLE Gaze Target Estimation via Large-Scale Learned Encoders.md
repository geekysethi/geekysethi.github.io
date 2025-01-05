---
layout: post
title: "Gaze Target Estimation via Large-Scale Learned Encoders"
date: 2025-01-04
description: "A study on gaze target estimation using large-scale learned encoders."
categories: [gaze target estimation, computer vision, machine learning]
tags: [gaze estimation, large-scale learned encoders, DINOv2]
---

## Problem Statement
* In gaze target estimation, we predict where a person is looking in a scene.
- Predicting a person's gaze target requires **reasoning both about the person's appearance and the contents of the scene.**
- Prior works have developed increasingly **complex, handcrafted pipelines** for gaze target estimation that carefully fuse features from separate scene encoders, head encoders, and auxiliary models for signals like depth and pose.

![Figure 1: Examples of gaze estimation](/assets/images/gazelle/image1.png "Figure 1. The image is showing the various example of how gaze estimation look like")

## Motivation
This paper is motivated by the idea that general-purpose visual features from a foundational model-based encoder can simplify the overall pipeline for this task.


![Figure 2: Prior approaches comparison](/assets/images/gazelle/image2.png "Figure 2. Figure 1. Prior approaches for gaze target estimation carefully fuse features from a separate head encoders, the Gaze-LLE, uses a single feature representation from a frozen image encoder.")
## Introduction
- Gaze-LLE uses frozen features from the [DINOv2](https://arxiv.org/pdf/2304.07193) encoder.
- The method employs a single feature representation for the scene and applies a person-specific positional prompt to decode gaze with a lightweight module.

## Model Architecture
![Figure 3: Proposed Model Architecture](/assets/images/gazelle/image3.png "Figure 3. Proposed Model Architecture")


- The Gaze-LLE architecture consists of a frozen, large-scale general-purpose scene encoder and a learned Gaze Decoder module.
- The gaze decoder performs head prompting to condition outputs on a specific person.
- It updates the feature representation with a small transformer module and predicts a gaze heatmap, as well as whether the target is in-frame.

## Scene Encoder
* The authors used the pretrained feature extractor $\mathcal{F}$ which is DINOv2 in this case.
* From $\mathcal{F}(x_{\text{img}})$, a lower resolution feature map of size $d_{\mathcal{F}} \times H \times W$ is obtained.
* A linear  layer to project it to smaller dimension of $d_{model}$ yielding feature map of $x_{\mathcal{F}} \in \mathbb{R}^{d_{\text{model}} \times H \times W}$

### Head Position Embedding

- The authors incorporated head position after the scene encoder.
- A downsampled, binarized mask $M$ of size $H \times W$ is created from the given head bounding box $x_{\text{bbox}}$ within the extracted scene feature map.
- A learned position embedding $p_{\text{head}} \in \mathbb{R}^{d_{\text{model}}}$ is added to the scene tokens containing the head.
- This $M$ mask helps the model understand the ground truth and find the relationship between the target face and output gaze.


The scene feature map $S$ is then:


$$\large(S = x_{\mathcal{F}} + \left( M \cdot p_{\text{head}} \right))$$
### Transformer Layers

- After feature extraction and mask addition, a small learnable transformer module, $T$, is trained.
- Instead of convolutional layers, the transformer $T$ uses self-attention to process the head-conditioned scene features.
- The feature map $S$ with the added head position is flattened into a scene token list: $[s_1, s_2, \dots, s_{H\times W}]$, where each $s$ is a pixel-wise token sent to $T$ to determine whether that pixel belongs to the gaze.
- In the VideoAttentionTarget and ChildPlay benchmark settings, a learnable task token, $t_{\text{in/out}}$, is prepended to the token list.

Our token list is then:


$$\large[\underbrace{t_{\text{in/out}}}_{\text{task token}}
\underbrace{s_1, s_2, \dots, s_{H \times W}}_{\text{scene tokens}}]$$

* Due to the spatial nature of task, authors added the absolute 2d sinusoidal position embeddings $P$ to the scene features before they are input to $T$ , i.e., $T (S + P)$.


## Prediction Heads

- From $T(S + P)$, updated scene features $S'$ and the updated task token $t'_{\text{in/out}}$ are obtained.
- $S'$ is reconstructed into a feature map of size $d_{\mathcal{F}} \times H \times W$.
- A gaze heatmap decoder, $D_{\text{hm}}$, consisting of two convolutional layers upsamples the feature map to the output size $H_{\text{out}} \times W_{\text{out}}$ and produces a classification score.
- A 2-layer MLP $D_{\text{in/out}}$ takes $t'_{\text{in/out}}$ and outputs a classification score indicating whether the queried person’s gaze target is in-frame or out-of-frame.

## Loss Functions


* In this method they using two loss functions one for each token prediction and one is for $t'_{in/out}$ .both the loss functions are cross entropy loss.

$$\large{\mathcal{L} = \mathcal{L}_{\text{hm}} + \lambda\mathcal{L}_{\text{in/out}}}$$

* $\mathcal{L}_{hm}$ is pixel-wise binary cross entropy loss and $\mathcal{L}_{in/out}$ binary cross entropy loss for the $in/out$ prediction task weighted by $λ ∈\mathbb{R}$. 
* The supervisory signal is an $H_{out}×W_{out}$ heatmap constructed by placing a $2D$ Gaussian distribution with $σ = 3$ around each ground truth $(x, y)$ gaze annotation.
* The backbone F is frozen during training. Our model with a ViT-B backbone has $∼2.8M$ learnable parameters—significantly fewer than all prior works.

## Results
![Table 1: Gaze target estimation results on GazeFollow and VideoAttentionTarget. report the number of learnable parameters for each model, and if auxiliary models are used for inputs: I is image, D is depth, and P is pose, O is objects, and E is eyes.](/assets/images/gazelle/table1.png "Table 1. Gaze target estimation results on GazeFollow and VideoAttentionTarget. report the number of learnable parameters for each model, and if auxiliary models are used for inputs: I is image, D is depth, and P is pose, O is objects, and E is eyes.")

![Table 2: Gaze target estimation results on ChildPlay.](/assets/images/gazelle/table2.png "Table 2. Gaze target estimation results on ChildPlay.")

![Figure 4: Visual results of proposed method](/assets/images/gazelle/image4.png "Figure 4. Visual results of proposed method")

## Ablation Studies - 


![Figure 5: Showing the effect of injecting head information earlier and later](/assets/images/gazelle/image5.png "Figure 5. Showing the effect of injecting head information earlier and later")

![Table 3: Shows the design choices across 3 axes: (1) early vs. late head integration, (2) convolutional vs. transformer decoder, and (3) using a head & scene branch (H+S) vs. a scene branch alone (S). Row a is the setting most similar to prior work. Conversely, Author's develop our final Gaze-LLE design from row f.](/assets/images/gazelle/table3.png "Table 3. Shows the design choices across 3 axes: (1) early vs. late head integration, (2) convolutional vs. transformer decoder, and (3) using a head & scene branch (H+S) vs. a scene branch alone (S). Row a is the setting most similar to prior work. Conversely, Author's develop our final Gaze-LLE design from row f.")
### Where should inject the head position?

- The head position is crucial for determining gaze.
- Prior works provide head position as an extra channel to the scene branch (i.e., RGB + head position), requiring the scene encoder to learn its usage during finetuning.
- Simply concatenating the head position channel _after_ extracting DINOv2 features boosts performance significantly (Table 3: a vs. c).

### Do we need a head branch?

- Prior works use a separate encoder for head crops, which helps understand gaze direction.
- The authors hypothesize that DINOv2 already captures gaze direction in its representation.
- Performance with and without a head branch is nearly the same when using a transformer-based decoder (Table 3: d vs. f).

### How should we decode the DINOv2 features?

*  Prior works use convolutional stacks to decode heatmaps.
- Comparing a 6-layer convolutional stack to a 1-layer transformer with a 2-layer convolutional decoder, the transformer performs better due to its ability to use global information (Table 3: c vs. d).

## Using DINOv2 in prior Works

Using DINOv2 directly to prior work does not lead to good results, as we can see in the table below.
  

![Table 4: Author replaced the scene encoder in 3 existing open source methods with the DINOv2 ViT-B backbone and evaluate on GazeFollow.](/assets/images/gazelle/table4.png "Table 4.Author replaced the scene encoder in 3 existing open source methods with the DINOv2 ViT-B backbone and evaluate on GazeFollow.")

## Conclusion 

* The proposed method offers a streamlined approach with fewer components to solve a challenging problem while achieving state-of-the-art results.
- Head prompting innovatively learns the binary mask and the relationship between ground truth and the target face.
- The authors demonstrated that a foundational model can achieve state-of-the-art results without additional training.



## References - 
* Paper - [https://arxiv.org/abs/2412.09586](https://arxiv.org/abs/2412.09586)
* DINOv2 - [https://arxiv.org/pdf/2304.07193](https://arxiv.org/pdf/2304.07193)
