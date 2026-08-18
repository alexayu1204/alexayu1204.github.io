---
title: "Neural Illumination"
order: 2
tags: ["generative", "creative coding"]
period: "2026"
cover: ""
links: [{"label": "View Project", "href": "https://github.com/jerryzhao173985/neuron-art"}]
group: "Creative AI systems"
---

- Implemented a neural network from scratch in the browser — a 64→16→2 classifier with ReLU and softmax, real backpropagation and SGD (~1,000 parameters) and Xavier/He initialisation — that genuinely trains to separate shapes, with no ML libraries.
- Rendered every neuron, weight, and gradient as flowing light and particles with p5.js (activation → brightness, weight → thickness, forward/backward pass → particle direction), with a live "show the math" mode, seed-reproducible runs, and interactive controls at ~60 FPS.
