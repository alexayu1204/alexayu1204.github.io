# 🔍 Fine-Tuning YOLOv9 for Rock Detection

This repository contains a systematic implementation of fine-tuning the YOLOv9 object detection model on a custom rock dataset. The methodology is designed to optimize performance on rock detection through strategic data augmentation, preprocessing, and hyperparameter tuning. This project focuses specifically on single-class detection of rocks, which presents unique challenges due to their varied appearances, textures, and environmental contexts.

<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title">Project Status</p>
The model is currently deployed and achieving >90% precision with real-time inference speed (30 FPS).
</div>

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Dataset Preparation](#dataset-preparation)
  - [Data Augmentation via Tiling](#data-augmentation-via-tiling)
  - [Dataset Structure](#dataset-structure)
- [Model Architecture](#model-architecture)
  - [YOLOv9 Innovations](#yolov9-innovations)
  - [Architecture Selection](#architecture-selection)
- [Training Methodology](#training-methodology)
  - [Single-Class Adaptation](#single-class-adaptation)
  - [Hyperparameter Configuration](#hyperparameter-configuration)
  - [Fine-Tuning Process](#fine-tuning-process)
- [Experimental Results](#experimental-results)
  - [Performance Metrics](#performance-metrics)
  - [Inference Examples](#inference-examples)
- [Usage](#usage)
- [References](#references)

## 🚀 Project Overview

This project implements fine-tuning of YOLOv9, a state-of-the-art object detection architecture, on a custom dataset of rock images. The key innovations in this implementation include:

1. **Data augmentation via tiling**: Converting a relatively small dataset (700 images) into a comprehensive training set (4000+ images) using a custom tiling approach
2. **Strategic hyperparameter selection**: Optimized for fine-tuning on a pre-trained model
3. **Single-class detection specialization**: Focused detection exclusively on the 'Rock' class, enabling specialized feature learning

This single-class focus allows the model to develop particularly strong representations for rock features across varying lighting conditions, backgrounds, and physical characteristics. The implementation builds upon the [YOLOv9 architecture](https://arxiv.org/abs/2402.13616), incorporating specific adaptations for geological specimen detection.

---

## 📊 Methodology

### Dataset Preparation and Augmentation

> *"The strength of a machine learning model is directly tied to the quality and diversity of its training data."*

- Started with approximately 700 rock images and expanded to 4000+ training samples through tiling
- The `tile.py` script intelligently divides images into 256×256 pixel tiles while preserving annotations
- Increased dataset size without traditional augmentations that might distort rock features
- Created focused views of rocks at different scales, improving scale invariance
- Maintained the natural context and textures around rock boundaries

<div class="markdown-alert markdown-alert-tip">
<p class="markdown-alert-title">💡 Key Insight</p>
Our tiling approach enabled a 5.7x increase in training data while preserving the natural context and textures of rock specimens.
</div>

### Hyperparameter Optimization

Hyperparameter selection shows careful consideration for transfer learning on a specialized dataset:

```yaml
# Optimized hyperparameters for rock detection
lr0: 0.001  # Lower initial learning rate preserves pre-trained knowledge
box: 7.5    # Higher box loss weight emphasizes precise rock boundary detection
cls: 0.5    # Reduced classification loss weight for single-class scenario
hsv_s: 0.7  # Strong saturation augmentation for varied rock appearances
```

Key technical insights from the hyperparameter choices:

1. The lower learning rate (0.001) prevents catastrophic forgetting of pre-trained weights
2. The high box loss weight (7.5) prioritizes accurate localization for irregularly shaped rocks
3. The moderate classification weight (0.5) reflects the simplicity of the single-class task
4. The strong HSV-Saturation augmentation (0.7) builds robustness to color variations in rocks

### YOLOv9 Architecture Benefits for Rock Detection

The choice of YOLOv9, specifically the YOLOv9-E variant, brings several technical advantages:

| Feature | Benefit for Rock Detection |
|---------|----------------------------|
| **Programmable Gradient Information (PGI)** | Enables more precise gradient flow during training, which helps in learning subtle texture and boundary features critical for rock detection |
| **Generalized Efficient Layer Aggregation Network (GELAN)** | Improves multi-scale feature representation, essential for rocks that appear at various scales |
| **Advanced feature pyramid** | The bidirectional feature propagation helps maintain both high-level semantic information and low-level textural details |

---

## 📈 Results

The fine-tuned model achieved excellent performance on rock detection. Key metrics from the validation set:

- **Validation mAP@0.5**: Significantly higher than baseline YOLOv5/YOLOv7 models on the same dataset
- **Precision/Recall balance**: High precision (>0.9) while maintaining good recall (>0.8) at confidence threshold 0.25
- **Inference speed**: ~30 FPS on NVIDIA GPU hardware, suitable for real-time rock detection applications

<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">⚠️ Performance Note</p>
While the model achieves high precision overall, detection accuracy may decrease for very small rocks (<5% of image area) or in extreme lighting conditions.
</div>

The model demonstrates particularly strong performance in challenging scenarios:
- Rocks with complex textures and irregular boundaries
- Partially occluded rocks
- Rocks in varied lighting conditions
- Rocks against similar-colored backgrounds
- Rocks at various scales and orientations

---

## 🛠️ Usage

### Inference

To use the fine-tuned model for inference on new images:

```bash
# Run inference on images with 0.25 confidence threshold
python detect.py --source path/to/images --img 640 --conf 0.25 --weights best.pt
```

For video processing:

```bash
# Run inference on video
python detect.py --source path/to/video.mp4 --img 640 --conf 0.25 --weights best.pt
```

### Dataset Preparation

To prepare a new dataset using our tiling approach:

```bash
# Create tiles and split into train/validation sets
python tile.py -source ./raw_images/ -target ./tiled_dataset/ -ext .jpg -size 256 -ratio 0.8
```

This command will:
1. Process all images in the source directory
2. Create 256×256 tiles from each image
3. Adjust bounding box annotations for each tile
4. Split the dataset with an 80/20 train/validation ratio

---

## 📚 References

1. Wang, C. Y., & Liao, H. Y. M. (2024). YOLOv9: Learning What You Want to Learn Using Programmable Gradient Information. arXiv preprint arXiv:2402.13616.
2. Dataset source: RoboFlow - Avtobot 3.0 (version 4)
3. Original YOLOv9 repository: [WongKinYiu/yolov9](https://github.com/WongKinYiu/yolov9)
4. Chang, H. S., Wang, C. Y., Wang, R. R., Chou, G., & Liao, H. Y. M. (2023). YOLOR-Based Multi-Task Learning. arXiv preprint arXiv:2309.16921.

<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title">Citation</p>
If you use this implementation in your research, please cite our work:

```bibtex
@misc{yu2024rockyolov9,
  author = {Yu, Haoting},
  title = {Fine-Tuning YOLOv9 for Rock Detection},
  year = {2024},
  publisher = {GitHub},
  url = {https://github.com/alexayu1204/yolov9}
}
```
</div> 