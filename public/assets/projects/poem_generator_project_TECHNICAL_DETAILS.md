## Implementation Details: MLX LoRA Poetry Fine-Tuning for Personalized Poem Generation

This document provides a comprehensive overview of the technical implementation of a fine-tuned poetry generation system using MLX, LoRA, and Qwen2.5 Language Models. The system is designed for parameter-efficient fine-tuning and optimized performance on Macbook Hardware (Apple Silicon devices).

<div class="markdown-alert markdown-alert-tip">
  <div class="markdown-alert-title"><strong>Note:</strong></div>
  Please refer to the Appendix below for AI generated poems by the finetuned LLM models.
</div>

---

### 1. Abstract

This project implements an end-to-end pipeline for converting a corpus of custom poems into a fine-tuned model capable of generating stylistically consistent modern poetry. The approach leverages LoRA (Low-Rank Adaptation) to fine-tune Qwen2.5 language models (7B/14B/32B) using Apple's MLX framework, combined with an innovative training strategy, prompt engineering, and rigorous evaluation methods. The resulting system is both computationally efficient and capable of producing high-quality, creative outputs with minimal data.

---

### 2. Data Preparation and Processing

#### 2.1 Training Data Format

The training data is formatted to align with an instruction-following paradigm. Each entry contains three types of messages that guide the model's behavior:

```
{
  "text": "<|im_start|>system 用户会给出一个主题，请按照给定的主题，切实准确简洁且情感丰富地写一首现代诗<|im_end|> <|im_start|>user [PROMPT]<|im_end|> <|im_start|>assistant [POEM]<|im_end|>"
}
```

- **System Message**: Instructs the model to generate a concise, accurate, and emotionally compelling modern poem based on a provided theme.
- **User Message**: Contains a short theme or prompt (e.g., "河" for river).
- **Assistant Message**: Expected to output the generated poem.

#### 2.2 Data Workflow

The data preparation workflow, consists of the following steps:

1. **Loading and Cleaning**: Import the raw JSON data containing poems.
2. **Formatting**: Convert the raw poems into the standardized instruction format.
3. **Splitting**: Create training and validation splits.
4. **Exporting**: Write the formatted data into JSONL files for MLX consumption.

---

### 3. Fine-Tuning with LoRA (Low-Rank Adaptation) method

#### 3.1 Fine-Tuning Strategy

The core of the system uses LoRA to adapt large pre-trained Qwen2.5 models with minimal adjustments, focusing on critical transformer layers. The benefits include:

- **Parameter Efficiency**: Reduces the number of trainable parameters from billions to millions.
- **Hardware Optimization**: Facilitates training on Apple Silicon using MLX.

#### 3.2 LoRA Configuration

Key hyperparameters include:

- **Rank (r)**: Typically between 4 to 8, determining the dimensionality of the adaptation matrices.
- **Alpha (α)**: Usually set as twice the rank (e.g., 8-16), scaling the LoRA updates.
- **Dropout Rate**: Set between 0.1 to 0.2 to mitigate overfitting with small datasets.
- **Scaling Factor**: Affects the magnitude of the updates, with typical values between 8.0 to 16.0.

Training hyperparameters:

- **Batch Size**: 2 to 4, depending on model size.
- **Total Iterations**: Approximately 800 to 1600 steps.
- **Learning Rate**: Around 1e-5 with cosine decay.
- **Warmup Steps**: Roughly 5% of total iterations (80-100 steps).
- **Max Sequence Length**: Limited to 256 tokens.

---

### 4. Generation Pipeline

#### 4.1 Prompt Engineering

To boost output diversity, the system creates multiple prompt variants. For example:

```python
def build_prompt_variants(phrase):
    templates = [
        "<|im_start|>system 用户会给出一个主题，请按照给定的主题，切实准确简洁且情感丰富地写一首现代诗<|im_end|> " +
        "<|im_start|>user {phrase}<|im_end|> <|im_start|>assistant",
        "<|im_start|>system 用户会给出一个主题，请按照给定的主题，切实准确简洁且情感丰富地写一首现代诗<|im_end|> " +
        "<|im_start|>user {phrase}\n<|im_end|> <|im_start|>assistant",
        # Additional variations can be added here
    ]
    return [template.format(phrase=phrase) for template in templates]
```

#### 4.2 Generation Execution

The MLX generation command is constructed and executed on the training dataset with config parameters, returning the raw output. It handles errors gracefully using Python's subprocess module.

```python
def run_generation(model, temp_adapter_dir, prompt):
    cmd = [
        "mlx_lm.generate",
        "--model", model,
        "--adapter-path", temp_adapter_dir,
        "--prompt", prompt
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"ERROR: Generation failed. Details: {e}\nOutput: {e.output}"
```

---

### 5. Evaluation and Ranking Strategy

#### 5.1 Automated Evaluation

The system utilizes OpenAI's API to score and rank the generated outputs. The evaluation result is encapsulated in a data model:

```python
class RankingOutput(BaseModel):
    rankings: List[int]
    top_poems: List[int]
    explanation: str
```

#### 5.2 Checkpoint Metadata Encoding

A unique encoding mechanism maps checkpoints and prompt templates to specific integer identifiers, which simplifies identification:

```python
def encode_checkpoint(base_checkpoint: int, template_index: int) -> int:
    return base_checkpoint + (template_index - 1)
```

#### 5.3 Batch Processing

Evaluation is performed in batches to improve efficiency, with the final selection based on aggregate scores.

---

### 6. Human Evaluation UI (User Interface) Structure

#### 6.1 Key features

The system includes a Tkinter-based graphical user interface (GUI) for manual poem evaluation.

- **Progress Tracking**: Monitor evaluation progress and show completion status
- **Display Panel**: Separate panels for poem title and content with clear view
- **Action Buttons**: Options to Accept, Edit, Skip, or Delete a poem as actionable buttons
- **Persistence**: Ability to save evaluations as JSON files for later review, a saving mechanism for preserving human evaluations

#### 6.2 User Interaction Flow

The UI implements the following interaction flow:

1. Load and flatten poem data
2. Display poems one by one
3. Process user actions (accept/edit/skip/delete)
4. Reconstruct and save the updated data structure

#### 6.3 Output data processing

The UI processes the output data into a list of poems in a flattened structure for easier navigation before evaluation:

```python
def flatten_results(results):
    flattened = []
    for outer_idx, inner_list in enumerate(results):
        for inner_idx, pair in enumerate(inner_list):
            flattened.append({
                'outer_idx': outer_idx,
                'inner_idx': inner_idx,
                'image': pair[0],
                'response': pair[1],
                'accepted': False,
                'edited': False
            })
    return flattened
```

And the evaluation output is saved in JSON format for ease of retrival

```python
def save_changes(self):
    # flatten list from a dictionary where each key is a title and value is a list
    flattened_list = []
    for key, value in data.items():
        flattened_list.extend(value)
    # Save the list of dicts to JSON
    with open('structured.json', 'w', encoding='utf-8') as outfile:
        json.dump(flattened, outfile, ensure_ascii=False, indent=4)
    print(f"Successfully written flattened JSON to '{args.output}'.")

```


---

### 7. Optimizations and Performance Considerations

Several measures have been implemented to enhance performance:

- **Memory Efficiency**: Use of LoRA reduces the parameter count significantly, from billions to millions.
- **Quantization Techniques**: Models are quantized to 4-bit or 8-bit, improving speed compared to base models.
- **Layer Targeting**: Only the most critical layers are fine-tuned.
- **Prompt Engineering**: Multiple prompt templates increase variability in outputs.
- **Evaluation Pipeline**: A combination of automated ranking and human curation ensures high-quality results.

#### 7.1 Training Speed

1. **MLX native**: Leverages Apple's optimized ML framework
2. **Batch size optimization**: Adjusts based on model size and available memory
3. **Sequence length limitation**: Uses 256 tokens to speed up training

#### 7.2 Generation Quality

1. **Checkpoint averaging**: Selects best checkpoints based on validation loss
2. **Prompt engineering**: Multiple formulations for diverse outputs
3. **Evaluation pipeline**: Automated ranking followed by human curation

#### 7.3 Iterative Performance Optimization

The system is designed to support an iterative improvement process:

1. Fine-tune model on initial dataset
2. Generate poems using checkpoints
3. **Evaluate and rank outputs**
4. Human curation via UI
5. **Incorporate high-quality outputs into training data**
6. **Repeat the process with enriched dataset** 

---

### 8. Conclusion

This system represents a fusion of advanced machine learning techniques and practical engineering optimizations. By combining LoRA fine-tuning with innovative prompt engineering and thorough evaluation processes, it achieves a balance between computational efficiency and creative output. The integration with Apple's MLX framework further enhances its accessibility, making high-quality poetry generation feasible on consumer hardware.

---

<!-- Inline styling for poem cards -->
<style>
.poem-card {
  background: #fdfdfd;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.poem-card h4 {
  margin-top: 0;
  color: #007bff;
}
.poem-original, .poem-translation {
  margin-bottom: 10px;
}
.poem-original blockquote, .poem-translation blockquote {
  background: #fff;
  border-left: 4px solid #007bff;
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: 5px;
  font-style: italic;
  color: #333;
}
</style>

### Appendix: Sample Poems

<div class="poem-card">
  <h4>Self-Written Poem (2020)</h4>
  <div class="poem-original">
    <p><strong>Original (Chinese):</strong></p>
    <blockquote>
      阳光洗去了树叶的所有颜色，  <br/>
      它们的色彩溅在我的脚上，  <br/>
      蒸发成蝴蝶，  <br/>
      然后飞走了。
    </blockquote>
  </div>
  <div class="poem-translation">
    <p><strong>Translation (English):</strong></p>
    <blockquote>
      The sunshine has washed all the color from the leaves,  <br/>
      their hues splashed upon my feet,  <br/>
      evaporating into butterflies  <br/>
      that fly away.
    </blockquote>
  </div>
</div>

---

<div class="poem-card">
  <h4>Model (Qwen 2.5 7B) Result on Theme "阳光" (Sunshine) ☀️</h4>
  <div class="poem-original">
    <p><strong>Original (Chinese):</strong></p>
    <blockquote>
      清晨的阳光  <br/>
      它弯曲伸展在清冽的河水  <br/>
      缠绕着寂静的湖面  <br/>
      攀上篝火的头顶  <br/>
      嵌入寒冷的岩壁
    </blockquote>
  </div>
  <div class="poem-translation">
    <p><strong>Translation (English):</strong></p>
    <blockquote>
      Morning sunlight,  <br/>
      it curves and stretches over the crisp river,  <br/>
      entwining with the silent lake,  <br/>
      climbing atop the bonfire's peak,  <br/>
      and embedding itself into the cold rock wall.
    </blockquote>
  </div>
</div>

---

<div class="poem-card">
  <h4>Model (Qwen 2.5 14B) Result on Theme "阳光" (Sunshine) ☀️</h4>
  <div class="poem-original">
    <p><strong>Original (Chinese):</strong></p>
    <blockquote>
      阳光  <br/>
      是被风吹散的  <br/>
      金色粉末  <br/>
      是藏在云里  <br/>
      偷看世界的眼
    </blockquote>
  </div>
  <div class="poem-translation">
    <p><strong>Translation (English):</strong></p>
    <blockquote>
      Sunlight  <br/>
      is golden dust scattered by the wind;  <br/>
      it is the eye hidden in the clouds,  <br/>
      peeking at the world.
    </blockquote>
  </div>
</div>

---

<div class="poem-card">
  <h4>Model (Qwen 2.5 32B) Result on Theme "阳光" (Sunshine) ☀️</h4>
  <div class="poem-original">
    <p><strong>Original (Chinese):</strong></p>
    <blockquote>
      阳光  <br/>
      在城市的缝隙里  <br/>
      它挤出一条路  <br/>
      照亮了  <br/>
      那些被遗忘的角落
    </blockquote>
  </div>
  <div class="poem-translation">
    <p><strong>Translation (English):</strong></p>
    <blockquote>
      Sunlight  <br/>
      in the cracks of the city  <br/>
      squeezes out a path,  <br/>
      illuminating  <br/>
      those forgotten corners.
    </blockquote>
  </div>
</div>

---

*For further inquiries or detailed implementation instructions, please refer to the project's repository or contact the author.* 

[**Github Repository**](https://github.com/alexayu1204/alexayu1204-Personalized-Poem-Generation-with-Fine-Tuned-Large-Language-Model)

[**Hugging Face Pre-Trained Poem Generator Model**](https://huggingface.co/jerryzhao173985/Qwen2.5-7B-poem-8bit)
