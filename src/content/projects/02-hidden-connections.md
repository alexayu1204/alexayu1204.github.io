---
title: "Hidden Connections"
order: 3
tags: ["LLM", "data", "creative coding"]
period: "Nov 2025 – Dec 2025"
cover: "/assets/projects/hidden-connection.jpg"
links: [{"label": "View Project", "href": "https://github.com/jerryzhao173985/hidden-connection"}, {"label": "Live Demo", "href": "https://jerryzhao173985.github.io/hidden-connection/"}]
group: "Creative AI systems"
---

- Built an interactive constellation mapping semantic similarity between anonymous survey responses: an embedding pipeline (OpenAI text-embedding-3-large at 256-dim Matryoshka, with a local BGE fallback) feeding UMAP projection, KMeans clustering, and nearest-neighbour links.
- Rendered it as a real-time vanilla-JS Canvas galaxy — orbital drift, depth parallax, and strength-weighted glowing links — with five per-question views, deployed on GitHub Pages with an optional Express embeddings API.
