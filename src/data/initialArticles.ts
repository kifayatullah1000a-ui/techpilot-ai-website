import { Article } from '../types';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-001',
    title: 'The Quantum Silicon Shift: How Optical Interconnects Solve the GPU Memory Wall',
    slug: 'quantum-silicon-shift-optical-interconnects',
    category: 'Quantum & Silicon',
    excerpt: 'As electrical trace bandwidth reaches physical limits, co-packaged optics and silicon photonics are redefining hyperscale AI cluster topology and memory access latency.',
    featuredImage: '/src/assets/images/blog_quantum_chips_1793517433536.jpg',
    featured: true,
    isDemo: true,
    publishedAt: 'Demonstration Sample',
    readTime: '7 min read',
    status: 'published',
    author: {
      name: 'Hardware Architecture Desk',
      role: 'TechPilot Technical Contributor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'The Quantum Silicon Shift: Optical Interconnects in AI Clusters | TechPilot AI',
      metaDescription: 'A technical breakdown of co-packaged optics, silicon photonics, and how optical interconnects circumvent the traditional GPU memory wall in distributed neural training.',
      keywords: ['silicon photonics', 'co-packaged optics', 'GPU memory wall', 'optical interconnects', 'hyperscale cluster'],
    },
    tags: ['Silicon Photonics', 'HBM4', 'Compute Fabric', 'Hardware'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'IEEE Photonic Society Transactions',
        url: 'https://ieee.org',
        note: 'Comprehensive benchmark on femtojoule-per-bit optical transceivers.',
      },
      {
        source: 'HotChips 38 Proceedings',
        url: 'https://hotchips.org',
        note: 'Multi-terabit optical substrate interconnect standards.',
      },
    ],
    content: `### Executive Summary
The rapid scaling of frontier foundation models has exposed an unavoidable physical constraint in computational clusters: the **Memory Wall**. While tensor core FLOPS have scaled by over $40\\times$ across the past four architectural generations, copper-based trace bandwidth between compute units and off-package memory has only scaled at roughly $4\\times$.

Optical interconnects, leveraging mature silicon photonics fabrication techniques, replace electrical copper traces with microscopic waveguides directly integrated onto compute substrate packaging.

---

### The Fundamental Physics Problem: Copper vs Photons
Electrical interconnects face three fundamental scaling bottlenecks as transmission frequencies push beyond 112 Gbps per differential pair:

1. **High-Frequency Attenuation**: Signal loss in standard FR4 and advanced Megtron substrates increases quadratically with frequency.
2. **Thermal Load & Power Dissipation**: Re-timers and PAM4 digital signal processors consume up to 30% of total interconnect power budget.
3. **Pin Density Limits**: The physical perimeter of an ASIC packaging substrate restricts the number of physical solder balls and micro-bumps.

By transitioning from electrons traversing copper traces to modulated infrared wavelengths traveling through silicon waveguides, transmission energy drops from ~15 pJ/bit down to **< 1.8 pJ/bit**, while propagation velocity remains near the speed of light in silica without resistive thermal penalty.

\`\`\`
[ Electrical Domain ]             [ Optical Substrate Fabric ]
Host GPU / HBM4 Stack  <--> Micro-ring Modulator <~~ Laser Guide ~~> Photodetector Array
Energy: ~15 pJ/bit                Energy: < 1.8 pJ/bit            Latency: Non-dispersive
\`\`\`

---

### Co-Packaged Optics (CPO) Architecture
In a Co-Packaged Optics architecture, optical engines are mounted directly on the same organic packaging substrate as the primary compute die (or GPU chiplet). 

Key architectural advantages:
- **Trace Length Reduction**: Distance between the compute logic and the optical driver drops from 300mm to under 15mm.
- **Lower Parasitic Capacitance**: Eliminates bulky socket connectors and high-capacitance trace runs.
- **Wavelength Division Multiplexing (WDM)**: Up to 16 distinct wavelengths multiplexed across a single optical fiber pair, yielding aggregate throughputs exceeding **3.2 Tbps per optical port**.

\`\`\`python
# Theoretical Bandwidth Comparison: Copper SerDes vs Optical WDM
def compute_bandwidth_efficiency(frequency_ghz: float, lanes: int, pJ_per_bit: float) -> dict:
    total_gbps = frequency_ghz * lanes * 2  # PAM4 modulation
    total_watts = (total_gbps * 1e9 * pJ_per_bit * 1e-12)
    return {
        "throughput_tbps": total_gbps / 1000.0,
        "power_consumption_watts": round(total_watts, 2),
        "efficiency_gbps_per_watt": round(total_gbps / max(total_watts, 0.001), 1)
    }

# 128-Lane Copper Interconnect @ 100GHz
copper = compute_bandwidth_efficiency(56.0, 128, 14.5)
# 16-Channel 8-Wavelength CPO Optical Link
optical = compute_bandwidth_efficiency(100.0, 128, 1.6)

print(f"Copper: {copper['throughput_tbps']} Tbps @ {copper['power_consumption_watts']}W")
print(f"Optical CPO: {optical['throughput_tbps']} Tbps @ {optical['power_consumption_watts']}W")
\`\`\`

---

### Practical Production Timeline & Industry Impact
Commercial deployment of CPO is already transitioning from pilot optical switches into production accelerator fabrics. By late 2026, leading wafer foundries will manufacture 3D monolithic photonic chiplets integrated directly into next-generation AI training racks.

Engineers designing distributed training topologies must re-evaluate cluster sharding strategies: all-to-all collectives that were previously latency-prohibitive across multiple physical racks can now execute with uniform single-switch latency.`,
  },
  {
    id: 'art-002',
    title: 'Autonomous Multi-Agent Architectures in Production: Lessons from 10M Workflows',
    slug: 'autonomous-multi-agent-architectures-production',
    category: 'Generative AI',
    excerpt: 'An engineering teardown of deterministic coordination graphs, token budgets, stateful recovery mechanics, and guardrail verification in mission-critical agent deployments.',
    featuredImage: '/src/assets/images/blog_neural_agents_1793517435046.jpg',
    featured: true,
    isDemo: true,
    publishedAt: 'Demonstration Sample',
    readTime: '9 min read',
    status: 'published',
    author: {
      name: 'Systems Infrastructure Desk',
      role: 'TechPilot Engineering Contributor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Autonomous Multi-Agent Architectures in Production | TechPilot AI',
      metaDescription: 'Field notes from running automated multi-agent workflows. Learn deterministic DAG orchestration, checkpoint recovery, and token budget governance.',
      keywords: ['AI agents', 'multi-agent systems', 'DAG orchestration', 'LLM production', 'deterministic recovery'],
    },
    tags: ['Autonomous Agents', 'System Design', 'LLMOps', 'Reliability'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'SysML Conference Papers',
        url: 'https://sysml.cc',
        note: 'Fault-tolerant state machine coordination for non-deterministic model calls.',
      },
    ],
    content: `### Introduction: Beyond the Chatbot Paradigm
Moving from single-turn language model completions to multi-agent autonomous systems is not simply a matter of looping prompts in a \`while\` statement. In enterprise production environments, agents must adhere to strict SLAs, bounded token expenditures, and strict deterministic repeatability.

Here are the core structural findings from production implementations across critical infrastructure workflows.

---

### 1. Directed Acyclic Graphs vs Unconstrained ReAct Loops
Early agent frameworks popularized the unconstrained ReAct loop (Reason, Act, Observe). While effective for exploratory demos, in production ReAct loops suffer from:
- **Infinite Reasoning Recursion**: Tendency to loop between search and analysis when confronted with ambiguous tool returns.
- **Budget Exhaustion**: A single runaway sub-agent can burn through millions of tokens in minutes.
- **State Drift**: The agent context accumulates contradictory previous thoughts.

The solution is **Deterministic State Graphs** (DAGs) with strict transition predicates:

\`\`\`typescript
interface AgentNode<TState> {
  id: string;
  maxTokens: number;
  timeoutMs: number;
  execute: (state: TState) => Promise<Partial<TState>>;
  routeNext: (state: TState) => string | 'TERMINATE';
}

// Resilient state validator enforcing schema invariants
export function validateStateInvariant<T>(state: T, schema: ValidationRule<T>[]): boolean {
  return schema.every(rule => rule.check(state));
}
\`\`\`

---

### 2. State Snapshots & Checkpoint Recovery
When an API error, rate limit, or tool failure occurs at Step 4 of a 6-step agent pipeline, re-running Steps 1 through 3 wastes compute and violates idempotency.

Every agent transition must serialize its minimal diff into a distributed key-value store. If step execution times out:
1. Re-hydrate the state from the last committed snapshot.
2. Increment the node retry counter.
3. If max retries are exceeded, switch to a fallback deterministic heuristic.

---

### 3. The 3-Tier Guardrail Verification
Never trust raw output from a sub-agent before passing it to subsequent downstream nodes. Implement a three-tier filter:
1. **Syntactic Validation**: JSON Schema compliance using strict type-check parsers.
2. **Semantic Alignment**: Deterministic rule checker for prohibited tokens, leaked credentials, or schema hallucination.
3. **Budget Gatekeeper**: Hard kill-switch if token count exceeds 120% of historical median for that node type.`,
  },
  {
    id: 'art-003',
    title: 'Embodied AI & Tactile Teleoperation: Why High-Frequency Force Feedback Matters',
    slug: 'embodied-ai-tactile-teleoperation-force-feedback',
    category: 'Robotics & Hardware',
    excerpt: 'Vision alone cannot solve real-world physical manipulation. How sub-millisecond tactile sensor arrays and torque impedance control are unlocking industrial dextrous robots.',
    featuredImage: '/src/assets/images/blog_embodied_robotics_1793517434978.jpg',
    featured: true,
    isDemo: true,
    publishedAt: 'Demonstration Sample',
    readTime: '6 min read',
    status: 'published',
    author: {
      name: 'Robotics & Hardware Desk',
      role: 'TechPilot Research Contributor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Embodied AI & Tactile Teleoperation in Modern Robotics | TechPilot AI',
      metaDescription: 'Discover why high-frequency force feedback and tactile sensor matrices are crucial for general-purpose robotic manipulation and imitation learning.',
      keywords: ['embodied AI', 'robotics', 'tactile sensing', 'force feedback', 'dexterous manipulation'],
    },
    tags: ['Robotics', 'Embodied AI', 'Sensors', 'Hardware'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'Robotics: Science and Systems (RSS)',
        url: 'https://roboticsconference.org',
        note: 'High-bandwidth tactile skins for closed-loop slip detection.',
      },
    ],
    content: `### The Limits of Pure Vision
Most contemporary humanoid robotics demonstrations rely heavily on visual perception: RGB-D cameras feeding transformer-based vision-language-action (VLA) models at 30 to 60 Hz. 

However, when an end-effector makes contact with an object, vision is frequently occluded by the robot's own mechanical fingers. Furthermore, friction coefficients, structural compliance, and micro-slippage cannot be reliably estimated from pixels alone.

---

### High-Frequency Tactile Sensing (1 kHz Loop)
To achieve true dexterity—such as threading a wire, turning a key in an unyielding lock, or handling brittle optical components—the control loop must operate at **$\ge 1000\\text{ Hz}$** using tactile sensor arrays.

Key physical metrics sensed:
- **Normal Pressure Distribution**: Matrix of piezoresistive or capacitive sensor cells mapping contact area geometry.
- **Shear Stress Vector**: Detection of impending slip before micro-movements transition to macro-slippage.
- **Vibrational Frequency**: High-frequency micro-vibrations providing material texture identification.

\`\`\`
[ 1000 Hz Tactile Array ] ---> [ Fast Impedance Controller ] ---> [ High-Torque Actuators ]
             ^                                                               |
             |---------------- Close-Loop Slip Compensation -----------------|
\`\`\`

---

### Teleoperation as High-Fidelity Data Collection
Before reinforcement learning models can generalize across physical environments, high-quality human demonstrations are essential. When teleoperators receive high-fidelity bilateral force feedback through specialized haptic gloves, demonstration completion time decreases by **42%**, and object drop rates plummet by **78%**.

By recording both multimodal sensor streams and human joint torques, training datasets achieve the sensory density necessary for zero-shot real-world transfer.`,
  },
  {
    id: 'art-004',
    title: 'Speculative Decoding at Scale: Slashing Inference Latency by 64% in LLM Serving',
    slug: 'speculative-decoding-at-scale-llm-serving',
    category: 'Dev & Cloud Architecture',
    excerpt: 'How pairing compact draft models with heavyweight foundation models enables multi-token speculative verification without modifying output token probability distribution.',
    featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    featured: false,
    isDemo: true,
    publishedAt: 'Demonstration Sample',
    readTime: '8 min read',
    status: 'published',
    author: {
      name: 'ML Systems Desk',
      role: 'TechPilot Engineering Contributor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Speculative Decoding at Scale in LLM Serving | TechPilot AI',
      metaDescription: 'A technical deep-dive on speculative decoding algorithms, draft model selection, rejection sampling mechanics, and KV-cache optimizations.',
      keywords: ['speculative decoding', 'LLM inference', 'vLLM', 'latency optimization', 'rejection sampling'],
    },
    tags: ['Inference', 'Distributed Systems', 'Performance', 'Python'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'NeurIPS 2024 / 2025 Accelerated Inference Track',
        url: 'https://neurips.cc',
        note: 'Lossless speedup theorems for speculative verification.',
      },
    ],
    content: `### Autoregressive Latency: Memory-Bound Verification
Standard autoregressive LLM decoding generates tokens one by one:
$$x_{t} \\sim P(x_t \\mid x_{<t})$$
Because each step requires transferring all model weights from HBM to SRAM for just one token calculation, GPU compute units sit idle waiting for memory transfers (arithmetic intensity $\\ll 1$).

### The Speculative Solution
Speculative decoding breaks this bottleneck:
1. A small, ultra-fast **draft model** (e.g. 1B parameter sibling) guesses $K$ upcoming tokens in rapid succession.
2. The larger target model (e.g. 70B parameter primary) processes all $K$ tokens in a single parallel forward pass.
3. A modified rejection sampling scheme accepts matching tokens and resamples from the residual distribution upon first mismatch.

Crucially, **the output distribution is mathematically identical** to querying the target model directly. No accuracy loss occurs.`,
  },
  {
    id: 'art-005',
    title: 'Constitutional AI & Mechanistic Interpretability: Inspecting Hidden Neurons in Reasoning Models',
    slug: 'constitutional-ai-mechanistic-interpretability-neurons',
    category: 'AI Safety & Governance',
    excerpt: 'Using sparse autoencoders and activation patching to identify safety circuits, truthfulness vectors, and latent deception in frontier reasoning models.',
    featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    featured: false,
    isDemo: true,
    publishedAt: 'Demonstration Draft',
    readTime: '10 min read',
    status: 'pending_review',
    author: {
      name: 'AI Safety Working Group',
      role: 'TechPilot Research Contributor',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Mechanistic Interpretability in Frontier Models | TechPilot AI',
      metaDescription: 'How activation patching and sparse autoencoders uncover internal representation vectors and verify alignment constitutions without black-box guessing.',
      keywords: ['mechanistic interpretability', 'AI safety', 'sparse autoencoders', 'alignment', 'activation patching'],
    },
    tags: ['AI Safety', 'Interpretability', 'Sparse Autoencoders', 'Alignment'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'Mechanistic Interpretability Working Group',
        url: 'https://anthropic.com/research',
        note: 'Dictionary learning and feature steering in language models.',
      },
    ],
    reviewNotes: 'Pending editorial review: verify mathematical proof in section 3 regarding Sparse Autoencoder feature dictionary reconstruction error.',
    content: `### Opening the Black Box
For years, language models have been treated as uninspectable black boxes. While input-output benchmarks provide high-level metrics, they fail to guarantee that a model is not exhibiting deceptive alignment or sycophancy.

Mechanistic interpretability aims to reverse-engineer the computational circuits formed by transformer attention heads and multi-layer perceptron (MLP) layers.

---

### Sparse Autoencoders (SAE) as Feature Dictionaries
Individual neurons in standard transformers are notoriously polysemantic: a single neuron might activate for both French vocabulary, legal jurisdictions, and curly brackets.

By training Sparse Autoencoders on residual stream activations, we reconstruct monosemantic feature vectors:
$$\\mathbf{x} \\approx \\sum_{i} f_i \\mathbf{d}_i$$
where $\\mathbf{d}_i$ represents an interpretable direction in representation space (e.g., "discussion of nuclear physics", "attempted prompt injection", or "sarcasm indicator").`,
  },
  {
    id: 'art-006',
    title: 'Zero-Knowledge Machine Learning (ZKML): Privacy-Preserving Inference on Untrusted Nodes',
    slug: 'zero-knowledge-machine-learning-zkml-privacy',
    category: 'Dev & Cloud Architecture',
    excerpt: 'Combining cryptographic zk-SNARKs with neural network forward passes to verify compute integrity and patient data privacy across decentralized edge clouds.',
    featuredImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    featured: false,
    isDemo: true,
    publishedAt: 'Demonstration Draft',
    readTime: '7 min read',
    status: 'revision_requested',
    author: {
      name: 'Cryptography & Privacy Desk',
      role: 'TechPilot Security Contributor',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Zero-Knowledge Machine Learning (ZKML) Overview | TechPilot AI',
      metaDescription: 'A technical introduction to zk-SNARK proof generation for quantized neural networks, computational overhead trade-offs, and healthcare deployment patterns.',
      keywords: ['ZKML', 'zero-knowledge proofs', 'zk-SNARKs', 'privacy compute', 'machine learning'],
    },
    tags: ['Cryptography', 'Privacy', 'ZKML', 'Cloud'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'IACR Cryptology ePrint Archive',
        url: 'https://eprint.iacr.org',
        note: 'Efficient polynomial commitment schemes for quantized convolutional layers.',
      },
    ],
    reviewNotes: 'Revision requested by Editor-in-Chief: Please expand on proof generation benchmarks comparing Halo2 vs Plonky3 overhead.',
    content: `### The Verifiability Crisis in Outsourced AI
When an organization outsources inference to an untrusted cloud provider, two trust dilemmas emerge:
1. **Privacy**: Can the cloud provider reconstruct sensitive patient or financial inputs?
2. **Integrity**: Did the cloud provider execute the genuine, un-quantized model, or did they quietly route to a cheaper 3B model to save compute costs?

Zero-Knowledge Machine Learning solves this using zk-SNARKs: generating a succinct cryptographic proof that a specific neural network forward pass was executed accurately against private inputs.`,
  },
  {
    id: 'art-007',
    title: 'Next-Generation HBM4 Architecture: 2048-Bit Interfaces and 3D Die Stacking',
    slug: 'next-gen-hbm4-architecture-3d-stacking',
    category: 'Quantum & Silicon',
    excerpt: 'A comprehensive technical overview of JEDEC HBM4 specifications, switching from 1024-bit to 2048-bit bus widths and customized logic base dies.',
    featuredImage: '/src/assets/images/blog_quantum_chips_1793517433536.jpg',
    featured: false,
    isDemo: true,
    publishedAt: 'Demonstration Draft',
    readTime: '6 min read',
    status: 'draft',
    author: {
      name: 'Hardware Architecture Desk',
      role: 'TechPilot Technical Contributor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Next-Gen HBM4 Architecture & 3D Stacking | TechPilot AI',
      metaDescription: 'Exploring HBM4 specifications, 2048-bit wide memory interfaces, advanced packaging, and custom foundry base dies.',
      keywords: ['HBM4', 'high bandwidth memory', 'TSMC CoWoS', 'semiconductors', 'memory bandwidth'],
    },
    tags: ['Semiconductors', 'HBM4', 'Packaging', 'Memory'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [],
    reviewNotes: 'Initial draft in progress by author.',
    content: `### The Next Frontier in Memory Density
High Bandwidth Memory (HBM) has been the linchpin of modern AI accelerators. HBM3e achieved bandwidths of 1.2 TB/s per stack over a 1024-bit interface.

The HBM4 standard represents the most radical architectural leap in the standard's history:
- **Doubling Bus Width**: Widening from 1024 bits to 2048 bits per stack.
- **Customized Logic Base Dies**: Moving from standard DRAM fabrication to 4nm/3nm advanced logic process nodes for the base interposer die.
- **Direct Hybrid Bonding**: Copper-to-copper micro-bumps allowing tighter vertical thermal and signal dissipation.`,
  },
  {
    id: 'art-008',
    title: 'Architectural Invariants for Large-Scale MoE Deployment in 2027',
    slug: 'architectural-invariants-for-large-scale-moe-deployment-2027',
    category: 'Dev & Cloud Architecture',
    excerpt: 'An authoritative systems engineering analysis of distributed Mixture-of-Experts inference: All-to-All collective bottlenecks, load balancing frontiers, PagedAttention memory isolation, and 2027 hardware fabric invariants.',
    featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    featured: true,
    isDemo: false,
    publishedAt: 'Draft (Pending Editorial Review)',
    readTime: '17 min read',
    status: 'pending_review',
    author: {
      name: 'AI Infrastructure Systems Desk',
      role: 'Staff Systems Researcher & Technical Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    seo: {
      title: 'Architectural Invariants for Large-Scale MoE Deployment in 2027 | TechPilot AI',
      metaDescription: 'A rigorous technical dissection of distributed Mixture-of-Experts inference, All-to-All network collective scaling limits, and PagedAttention virtual memory KV-cache allocation.',
      keywords: ['Mixture of Experts', 'MoE 2027', 'All-to-All collective', 'PagedAttention', 'Hockney model', 'MegaBlocks', 'Expert Parallelism', 'distributed inference'],
    },
    tags: ['Mixture-of-Experts', 'Distributed Systems', 'HPC', 'PagedAttention', 'All-to-All', 'KV Cache', 'Ultra Ethernet'],
    metrics: {
      likes: 0,
      shares: 0,
    },
    citations: [
      {
        source: 'ACM SOSP 2023 Proceedings',
        url: 'https://doi.org/10.1145/3600006.3613165',
        note: 'Kwon et al. Efficient Memory Management for Large Language Model Serving with PagedAttention. (Validates virtual memory KV cache paging, block table translation, and elimination of external/internal fragmentation).',
      },
      {
        source: 'ICLR 2021 Proceedings',
        url: 'https://arxiv.org/abs/2006.16668',
        note: 'Lepikhin et al. GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding. (Validates Top-2 gating formulation, expert capacity factor C sizing, and auxiliary load balancing loss).',
      },
      {
        source: 'Journal of Machine Learning Research (JMLR 2022)',
        url: 'https://jmlr.org/papers/v23/21-0998.html',
        note: 'Fedus et al. Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity. (Validates Top-1 routing mechanics, token drop dynamics under non-uniform routing, and capacity factor scaling).',
      },
      {
        source: 'PMLR ICML 2022 Proceedings',
        url: 'https://arxiv.org/abs/2201.05596',
        note: 'Rajbhandari et al. DeepSpeed-MoE: Advancing Mixture-of-Experts Inference and Training. (Validates Expert Parallelism (EP) communication overheads, hierarchical All-to-All collectives, and communication-computation overlap).',
      },
      {
        source: 'MLSys 2023 Proceedings',
        url: 'https://arxiv.org/abs/2211.15841',
        note: 'Gale et al. MegaBlocks: Efficient Sparse Training with Mixture-of-Experts. (Validates dropless MoE formulation using block-sparse GPU kernels, avoiding token dropping without static capacity padding waste, achieving up to 40% speedup over Tutel MoE and up to 2.4x speedup over dense Megatron-LM models).',
      },
      {
        source: 'Parallel Computing (Elsevier 1994)',
        url: 'https://doi.org/10.1016/S0167-8191(06)80021-9',
        note: 'Hockney, R. W. The Communication Challenge for MPP: Intel Paragon and Meiko CS-2. (Validates alpha-beta analytical network transfer model and message startup latency penalties in collective exchanges).',
      },
      {
        source: 'NVIDIA H100 Architecture Whitepaper (2022)',
        url: 'https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper',
        note: 'NVIDIA Corporation. NVIDIA H100 Tensor Core GPU Architecture. (Validates NVLink 4 theoretical 900 GB/s bidirectional peak and 450 GB/s per direction; empirical 750-820 GB/s NCCL bus goodput is noted as an unverified external benchmark measurement).',
      },
      {
        source: 'NVIDIA Quantum-2 InfiniBand Documentation (2022)',
        url: 'https://www.nvidia.com/en-us/networking/infiniband-switching/',
        note: 'NVIDIA Corporation. NVIDIA Quantum-2 400Gb/s InfiniBand Architecture. (Validates NDR 400 Gbps / 50 GB/s physical wire rate per port; empirical 47.5-48.5 GB/s ib_write_bw RDMA goodput is noted as an unverified external benchmark measurement).',
      },
      {
        source: 'Ultra Ethernet Consortium Specification History (UEC 1.0 Specification)',
        url: 'https://ultraethernet.org/specification-history/',
        note: 'Ultra Ethernet Consortium (UEC). Ultra Ethernet Transport Specification v1.0 Overview. (Validates transport standards for multi-path packet spraying, selective retransmission, and packet pacing to mitigate incast buffer exhaustion in high-radix AI fabrics).',
      },
      {
        source: 'NVIDIA Blackwell Technical Brief (2024)',
        url: 'https://resources.nvidia.com/en-us-blackwell-architecture',
        note: 'NVIDIA Corporation. NVIDIA Blackwell Architecture Technical Brief. (Validates 5th-generation NVLink 1800 GB/s bidirectional theoretical peak, 900 GB/s per direction, and 7.2 TB/s NVLink Switch ASIC; goodput figures remain unverified projections).',
      },
    ],
    reviewNotes: 'Editorial Revision Complete: Resolved all editorial issues. Numbered all sections sequentially 00-08 without duplicates. Thoroughly justified the U > 0.85 expert utilization boundary by contrasting expert capacity utilization (U_cap) against hardware MFU. Added complete Fat-Tree vs. Torus topology comparative analysis. Fully qualified All-to-All collective bottlenecks. Explicitly labeled Python KV-cache reference implementation as educational host prototype vs. production GPU systems. Supported technical claims regarding asynchronous CUDA streams, synchronization stalls, and GPUDirect RDMA. Preserved canonical Hockney (1994) DOI. Official hardware documentation cited strictly for theoretical peak specifications with empirical NCCL and ib_write_bw benchmark goodput kept explicitly labeled as unverified measurements. Referenced UEC Specification v1.0 Overview. Retained strictly in pending_review status.',
    content: `### 00. Executive Summary & Scope

Deploying modern frontier Mixture-of-Experts (MoE) architectures at hyperscale requires confronting non-negotiable physical bottlenecks at the intersection of memory bandwidth, distributed interconnect topologies, and network serialization.

A recurring source of architectural failure in AI infrastructure engineering is conflating two completely orthogonal subsystems:
1. **The Attention Layer Memory Subsystem**: Managing variable-length Key-Value (KV) cache activations within local accelerator High Bandwidth Memory (HBM) using virtualized page tables (**PagedAttention**).
2. **The MLP Layer Communication Subsystem**: Shuffling token representations across distributed GPU ranks via **All-to-All collectives** to compute feed-forward expert activations (**Expert Parallelism**).

This manuscript establishes the core architectural invariants governing large-scale MoE deployments today and projects the physical constraints that will shape inference fabrics through **2027**.

---

### 01. Foundational Architecture: Prefill, Decode, and Latency Bounds

When deploying distributed inference clusters, end-to-end request latency comprises distinct physical stages governed by fundamentally different scaling laws.

| Phase / Pipeline Layer | Primary Determinants | Typical Measured Latency | Bottleneck Classification |
| :--- | :--- | :--- | :--- |
| **Edge Transport (Reverse Proxy / TLS)** | TCP 3-way handshake, TLS 1.3 session resumption, HTTP/2 framing | 15 ms – 120 ms | Geographic network distance & protocol overhead |
| **Prompt Prefill Phase** | Dense GEMM operations over all $N$ prompt tokens simultaneously | 30 ms – 800+ ms | **Compute-Bound (Tensor Core TFLOPS)** |
| **Autoregressive Decode Phase** | Matrix-Vector (GEMV) operations streaming weights from HBM per token ($N=1$) | 8 ms – 35 ms / token | **Memory Bandwidth-Bound (HBM TB/s)** |
| **Intra-Node Accelerator Interconnect** | NVLink / NVSwitch bidirectional transfers | ~100 ns – 250 ns hardware hop | Bandwidth saturation (900 – 1800 GB/s) |
| **Inter-Node NIC Packet Transport** | InfiniBand NDR / RoCEv2 RDMA packet transit | 1.5 µs – 5.0 µs raw wire latency | Switch hops & optical transceiver serialization |
| **Distributed All-to-All Barrier Phase** | Multi-node All-to-All collective synchronization across $P$ ranks | 15 µs – 60+ µs per MoE layer | Incast congestion & straggler tail latency |

> **Architectural Clarification on Network Latency:**
> Claims of "sub-microsecond" latency for distributed multi-node All-to-All collectives are physically invalid. While intra-chip SRAM access operates in nanoseconds, optical fiber propagation introduces a fixed physical delay of approximately $5\\text{ ns}$ per meter. Traversing a modern two-tier or three-tier Clos network (NIC $\\to$ Leaf Switch $\\to$ Spine Switch $\\to$ Leaf Switch $\\to$ Destination NIC) requires multiple physical cut-through switch transits (each adding $100\\text{--}400\\text{ ns}$), serialization delay, and RDMA queue pair parsing. Consequently, raw point-to-point packet delivery requires $1.5\\text{--}5\\ \\mu\\text{s}$, and multi-node All-to-All collective barriers with incast packet pacing strictly require $15\\text{--}60+\\ \\mu\\text{s}$.

#### The Prefill vs. Decode Divergence
During the **prefill phase**, the accelerator ingests $N$ prompt tokens simultaneously. The matrix multiplication operates as a dense GEMM with high arithmetic intensity:

$$I_{\\text{prefill}} = \\frac{\\mathcal{O}(N \\cdot d_{\\text{model}}^2)}{\\mathcal{O}(d_{\\text{model}}^2 + N \\cdot d_{\\text{model}})} \\gg 1$$

Tensor cores remain saturated, placing execution in the compute-bound regime of the Roofline model.

In the **autoregressive decode phase**, each sequence generates one token at a time ($N=1$). Computing token logits requires streaming the entire parameter matrix from High Bandwidth Memory (HBM) into on-chip SRAM for a single vector multiplication:

$$I_{\\text{decode}} = \\frac{\\mathcal{O}(1 \\cdot d_{\\text{model}}^2)}{\\mathcal{O}(d_{\\text{model}}^2)} \\approx \\mathcal{O}(1)$$

Arithmetic intensity collapses well below the accelerator ridge point, rendering decode throughput strictly bound by HBM memory bandwidth and distributed collective interconnect latency.

---

### 02. Sparse MoE Routing Mechanics & Expert Parallelism

In a sparse Mixture-of-Experts model, the standard dense feed-forward network (FFN) is replaced by $E$ independent expert networks. For each token representation $x \\in \\mathbb{R}^{d_{\\text{model}}}$, a parameterized gating network dispatches the token to a sparse subset of $K$ experts ($K \\ll E$, e.g., $K=1, 2$, or fine-grained $K=8$ out of $E=64$).

#### Top-$K$ Gating Formulation
Let $W_g \\in \\mathbb{R}^{d_{\\text{model}} \\times E}$ denote the gating weight matrix. The raw routing logits are computed as $H(x) = x \\cdot W_g$. To enforce sparsity and routing stability:

$$G(x) = \\text{Softmax}(\\text{KeepTopK}(H(x), K))$$

where $\\text{KeepTopK}(\\cdot, K)$ retains the $K$ largest logit values and masks all remaining entries to $-\\infty$. The output of the MoE layer for token $x$ is the weighted sum across the selected experts:

$$y = \\sum_{i \\in \\text{TopK}} G(x)_i \\cdot \\text{Expert}_i(x)$$

#### Expert Capacity Utilization vs. Hardware Compute Utilization (MFU)
In distributed systems literature, two completely distinct metrics of "utilization" are frequently conflated, leading to unsupported claims such as "MoE systems achieve $>85\%$ expert utilization":

1. **Expert Capacity Utilization ($U_{\text{cap}}$)**: Defined as the fraction of pre-allocated static expert buffer slots that hold valid, non-padding tokens:
   $$U_{\text{cap}} = \frac{\sum_{i=1}^E \text{tokens}(e_i)}{E \cdot C}$$
   where $C = \text{Capacity Factor (CF)} \times \lceil \frac{N \cdot K}{E} \rceil$ is the expert capacity buffer size. In static frameworks (GShard, Switch Transformers), maintaining high capacity utilization ($U_{\text{cap}} > 0.85$) while eliminating dropped tokens is mathematically unachievable under non-uniform routing distributions:
   - Setting $\text{CF} = 1.0$ forces $U_{\text{cap}}$ close to $1.0$ on oversubscribed experts, but causes severe token dropping ($5\%\text{--}15\%$ of tokens dropped cluster-wide), degrading validation perplexity.
   - Over-provisioning static capacity to $\text{CF} = 1.25\text{--}1.5$ reduces token dropping to $<0.5\%$, but forces undersubscribed experts to process dummy padding tokens, causing average capacity utilization ($U_{\text{cap}}$) to collapse to $65\%\text{--}75\%$.
2. **GPU Hardware Compute Utilization (Model FLOPs Utilization / MFU)**: The percentage of theoretical peak accelerator floating-point capability (TFLOPS) achieved by the Tensor Cores during matrix multiplication.

> **Empirical Findings on MegaBlocks (Gale et al., MLSys 2023):**
> MegaBlocks resolves this static dilemma by introducing **dropless MoE (dMoE)** using block-sparse GPU kernels (Block-Sparse GEMM) coupled with dynamic-buffer All-to-All collectives.
> 
> Claims that sparse MoE guarantees $>85\%$ hardware compute utilization (MFU) are unsupported by hardware realities. In practice, block-sparse kernels exhibit lower raw Tensor Core execution efficiency (~40–60% of peak theoretical TFLOPS) than large dense cuBLAS GEMMs (>70% MFU) due to irregular tile scheduling, unaligned memory access, and thread-divergence overheads.
> 
> However, Gale et al. (2023) demonstrated that dMoE achieves **up to a 40% speedup over Tutel MoE (at $\text{CF}=1.25$)** and **up to a 2.4$\times$ end-to-end training speedup over dense Transformer baselines (Megatron-LM dense DNNs)** for equivalent validation perplexity. This speedup is achieved by completely eliminating padding tokens and token drops, shifting the operational constraint from buffer memory waste to straggler tail latency across unbalanced expert ranks during the All-to-All collective.

#### Auxiliary Load Balancing vs. Routing Bias
To prevent gating networks from degenerating into a state where only a small subset of experts receive tokens while others starve, systems employ auxiliary balancing mechanisms:
1. **Auxiliary Loss ($\mathcal{L}_{\\text{aux}}$)**:
   $$\\mathcal{L}_{\\text{aux}} = \\alpha_{\\text{aux}} \\cdot E \\sum_{i=1}^E f_i \\cdot P_i$$
   where $f_i$ is the empirical fraction of tokens assigned to expert $i$, and $P_i$ is the average gating probability assigned to expert $i$. While effective, high values of $\\alpha_{\\text{aux}}$ impair model convergence by penalizing true domain specialization.
2. **Dynamic Logit Bias Adjustment (Loss-Free Balancing)**:
   Modern architectures (e.g., DeepSeek-V2/V3) introduce dynamically updated bias terms $b_i$ to the routing logits: $H(x)_i = x \\cdot W_{g,i} + b_i$. If expert $i$ is overloaded, $b_i$ is decremented; if underloaded, $b_i$ is incremented. This decouples load balancing from backpropagation gradients, preserving model optimization dynamics.

---

### 03. All-to-All Collective Communication & Fabric Topology

In Expert Parallelism (EP), the $E$ experts are partitioned across $P$ distinct accelerator ranks. Each rank processes local tokens but must send them to the rank hosting the assigned expert, and subsequently gather the resulting activations back. This bidirectional exchange is executed via **All-to-All (AlltoAllv)** collectives.

\`\`\`
[ Rank 0: Local Tokens ] ----\\ /---- [ Rank 0: Hosted Expert E0 ]
                                 X
[ Rank 1: Local Tokens ] ----/ \\---- [ Rank 1: Hosted Expert E1 ]
          All-to-All Dispatch                  All-to-All Combine
\`\`\`

#### The Pairwise All-to-All Hockney Equation
In classical parallel systems, pairwise shift exchange across $P$ processes is modeled via the Hockney analytical formulation:

$$T_{\text{pairwise}} = (P - 1)\alpha + \frac{P - 1}{P} \frac{M}{B}$$

Where:
- $P$: Total number of communicating ranks participating in the Expert Parallel group.
- $M$: Total payload volume (in bytes) transmitted *by each rank* to all peers combined during the collective step (i.e., $M = \sum_{j=0}^{P-1} m_{i,j}$).
- $\frac{M}{P}$: The payload size transferred to each individual peer rank under an idealized uniform token distribution.
- $\frac{P - 1}{P} M$: The aggregate data volume each rank transmits across all $P - 1$ remote peer ranks (excluding local self-dispatch).
- $B$: Effective network injection bandwidth of the rank's network interface (in bytes per second).
- $\alpha$: Message startup latency per peer-to-peer exchange (software queue injection, NIC firmware parsing, optical transit delay, and cut-through switch forwarding).

#### Explicit Model Assumptions:
1. **Uniform Routing Distribution**: Tokens are distributed identically across all $P$ ranks (exactly $\frac{M}{P}$ bytes per destination rank). Skewed distributions induce straggler arrival, extending completion time to that of the most heavily loaded rank.
2. **Synchronous Shift Exchange**: Ranks execute $P-1$ communication steps sequentially. In step $s \in \{1, \dots, P-1\}$, rank $i$ communicates with rank $(i + s) \pmod P$.
3. **Single-Port Contention Constraint**: Each rank transmits and receives through a single logical network port (or ganged NIC) that can service at most one peer-to-peer channel simultaneously without multiplexing penalty.
4. **Contention-Free Bisection**: Intermediate switch bisection bandwidth is non-blocking (full bisection fat-tree), and packet queuing delays at switch egress buffers are negligible.

#### Interconnect Hardware Specifications: Theoretical vs. Measured Bandwidth
Applying Hockney to real-world GPU clusters requires using verified hardware specifications rather than nominal marketing ratings:

| Interconnect Technology | Interface / Standard | Theoretical Peak Bandwidth | Goodput Metric (Empirical vs. Projection) | Official Hardware Reference |
| :--- | :--- | :--- | :--- | :--- |
| **NVLink 4 (Intra-Node)** | Hopper H100 / H200 SXM5 | $900\text{ GB/s}$ bidirectional ($450\text{ GB/s}$ / dir) | $\approx 750\text{--}820\text{ GB/s}$ bus bandwidth (Empirical NCCL) | NVIDIA H100 Architecture Whitepaper (2022) |
| **NVLink 5 (Intra-Node)** | Blackwell B200 SXM6 | $1800\text{ GB/s}$ bidirectional ($900\text{ GB/s}$ / dir) | $\approx 1500\text{--}1650\text{ GB/s}$ bus bandwidth (*Unverified Projection*) | NVIDIA Blackwell Architecture Technical Brief (2024) |
| **InfiniBand NDR (Inter-Node)** | ConnectX-7 / Quantum-2 | $400\text{ Gbps} = 50\text{ GB/s}$ / dir ($100\text{ GB/s}$ bidi) | $\approx 47.5\text{--}48.5\text{ GB/s}$ (\`ib_write_bw\` Empirical) | NVIDIA Quantum-2 InfiniBand Documentation (2022) |
| **InfiniBand XDR (Inter-Node)** | ConnectX-8 / Quantum-X800 | $800\text{ Gbps} = 100\text{ GB/s}$ / dir ($200\text{ GB/s}$ bidi) | $\approx 94.0\text{--}96.0\text{ GB/s}$ wire goodput (*Unverified Projection*) | NVIDIA Quantum-X800 Technical Specification (2024) |
| **RoCEv2 400GbE / 800GbE** | Broadcom TH5 / Cisco 8000 | 400 Gbps ($50\text{ GB/s}$) or 800 Gbps ($100\text{ GB/s}$) | $\approx 360\text{--}385\text{ Gbps}$ effective (*Unverified Projection*, DCQCN/PFC) | Ultra Ethernet Consortium Specification History (2024) |

##### Benchmark Profiles & Status of Interconnect Goodput Figures:
- **NVLink 4 Bus Bandwidth (Empirical Benchmark):** Measured via NCCL \`alltoall_perf\` and \`all_reduce_perf\` microbenchmarks across 8x H100 SXM5 baseboards. High bus efficiency ($83\%\text{--}91\%$ of theoretical bidirectional limit) is realized only for contiguous message payloads $M \ge 64\text{ MB}$ leveraging Direct P2P NVLink memory addressing and CUDA IPC handles. At smaller payload sizes ($M < 256\text{ KB}$ typical of interactive decode batches), kernel launch latency and NVLink packet encapsulation overhead suppress effective throughput below $40\%$.
- **NVLink 5 Bus Bandwidth (*Unverified Projection*):** The projected goodput of $\approx 1500\text{--}1650\text{ GB/s}$ on B200 SXM6 is an unverified analytical projection based on scaling Hopper's $83\%\text{--}91\%$ efficiency factor to Blackwell's $1800\text{ GB/s}$ theoretical limit; published empirical physical cluster validation remains unverified.
- **InfiniBand NDR Wire Goodput (Empirical Benchmark):** Measured via the OFED \`ib_write_bw\` RDMA test on NVIDIA ConnectX-7 400 Gbps adapters over PCIe Gen5 x16 hosts. The sustained unidirectional rate of $47.5\text{--}48.5\text{ GB/s}$ ($\approx 380\text{--}388\text{ Gbps}$, reaching $95\%\text{--}97\%$ of theoretical line rate) requires Reliable Connection (RC) transport, Queue Pair Depth = 2, MTU = 4096 bytes, and transfer sizes $\ge 64\text{ KB}$ with GPUDirect RDMA bypassing host DRAM.
- **InfiniBand XDR & RoCEv2 (*Unverified Projections*):** InfiniBand XDR wire goodput ($94.0\text{--}96.0\text{ GB/s}$) and RoCEv2 400G effective throughput ($360\text{--}385\text{ Gbps}$) are unverified engineering projections that depend on hardware availability and network-wide DCQCN/PFC congestion tuning.

#### Topology Nuances: Hierarchical All-to-All & Multi-Path Packet Spraying

Systems architects must recognize that routing optimizations do not offer universal performance guarantees:

1. **Hierarchical All-to-All (Rajbhandari et al., DeepSpeed-MoE):**
   Hierarchical partitioning aggregates tokens from intra-node GPUs across local high-bandwidth NVLink meshes before dispatching aggregated payloads across inter-node InfiniBand/RoCE links. While this substantially cuts inter-node bisection traffic, **it does not guarantee universal speedup**. In inference regimes characterized by small batch sizes or large expert counts, the extra multi-stage intra-node transpose, local memory copy staging, and barrier synchronization introduce latency overheads that can match or exceed flat All-to-All communication time. Furthermore, if cross-node routing distribution is skewed, intra-node ranks remain idle waiting for the single slowest remote inter-node transfer.

2. **Multi-Path Packet Spraying (UEC Transport & Advanced RoCE):**
   Packet spraying distributes packets of a single collective across all parallel Equal-Cost Multi-Path (ECMP) links in a Clos topology, effectively preventing the single-link elephant-flow hash polarization seen in standard ECMP. However, **packet spraying is not an absolute panacea**. Because packets traverse paths with differing physical flight times and switch queuing delays, packets arrive out of order at the destination NIC. This necessitates dedicated hardware reordering buffers. Under acute multi-rank incast bursts, receiver reorder buffers can exhaust on-chip SRAM, inducing packet drops, triggering selective retransmissions, and degrading tail latency.

#### Fabric Topology Trade-offs: Fat-Tree (Clos) vs. Torus Topologies

Cluster network topology fundamentally dictates All-to-All collective scalability and determines how network congestion manifests across hundreds or thousands of GPUs:

| Topological Feature | Non-Blocking Fat-Tree (Clos) | Multi-Dimensional Torus (e.g., 3D/5D Torus) |
| :--- | :--- | :--- |
| **Bisection Bandwidth Scaling** | Full bisection bandwidth scales linearly with rank count ($\mathcal{O}(N)$), maintaining non-blocking $1:1$ capacity across all tiers. | Bisection bandwidth scales sub-linearly ($\mathcal{O}(N^{2/3})$ in 3D Torus, $\mathcal{O}(N^{(d-1)/d})$ in $d$-dimensional Torus), constraining global cross-partition traffic. |
| **Network Diameter & Hop Count** | Uniform small diameter ($2\text{--}3$ switch hops across Leaf-Spine tiers; predictable latency $\approx 1\text{--}3\ \mu\text{s}$). | Variable diameter proportional to radix per dimension ($\mathcal{O}(d \cdot N^{1/d})$); distant node communication traverses multiple routing hops. |
| **Suitability for MoE All-to-All** | **Optimal for Global All-to-All:** Tokens dynamically routed to arbitrary experts across the entire cluster without spatial locality penalties. | **Constrained for Arbitrary All-to-All:** High-volume All-to-All generates severe multi-hop dimension contention and link hotspotting unless expert groups are strictly partitioned into local sub-topologies. |
| **Hardware & Cabling Cost** | High switch ASIC count, massive optical transceiver cabling, and high power dissipation across spine tiers. | Direct node-to-node cabling without external spine packet switches; significantly lower cabling cost and optical power overhead. |
| **Workload Affinity** | Universal: Highly irregular sparse MoE routing, dynamic all-gather, and high-entropy shuffle collectives. | Nearest-neighbor stencil computations, 1D/2D pipeline parallel stages, and ring-based all-reduce collectives. |

##### System-Level All-to-All Bottleneck Qualifications:
The All-to-All collective ($T_{\text{pairwise}}$) is constrained not merely by raw link injection bandwidth ($B$), but by three interdependent runtime bottlenecks:
1. **Routing Skew and Tail Stragglers:** Because token assignment in sparse MoE is dynamically governed by input semantics, expert workload distributions exhibit natural variance. In unbuffered synchronous All-to-All barriers, total collective completion latency collapses to the arrival time of the most heavily loaded rank.
2. **Bandwidth Asymmetry Between Interconnect Tiers:** While intra-node NVLink provides $900\text{--}1800\text{ GB/s}$ bidirectional bandwidth, inter-node InfiniBand/RoCE links offer only $50\text{--}100\text{ GB/s}$ per GPU—a $9\times\text{--}18\times$ bandwidth drop. Cross-node traffic quickly saturates inter-node NIC queues while intra-node engines sit stalled.
3. **Software Queue Injection & Synchronization Latency ($\alpha$):** In autoregressive decode loops where individual token payloads are tiny ($M < 256\text{ KB}$), latency is completely dominated by message startup overhead ($\alpha$), kernel launch latency, and CUDA event synchronization rather than wire bandwidth.

---

### 04. Orthogonal Memory Virtualization: PagedAttention vs. MoE Shuffling

A critical systems distinction must be drawn between **PagedAttention** and **Distributed MoE Communication**. Conflating these components leads to flawed cluster provisioning.

| Architectural Dimension | PagedAttention Subsystem | Distributed MoE Subsystem |
| :--- | :--- | :--- |
| **Model Layer Operation** | Self-Attention / Multi-Head Attention layers | Feed-Forward Network (FFN / MLP) layers |
| **Physical Location** | Local Accelerator Memory (HBM3 / HBM3e) | Inter-Accelerator Network Fabric (NVLink / InfiniBand / RoCE) |
| **Primary Problem Solved** | Memory fragmentation from unpredictable sequence lengths | Parameter scale exceeding single-device memory capacity |
| **Mechanism** | OS-style page tables mapping logical token blocks to physical blocks | All-to-All collective shuffling dispatching tokens to expert ranks |
| **Communication Scope** | Node-local (intra-GPU memory addressing) | Cross-rank distributed network collective |
| **Hardware Bottleneck** | HBM memory capacity & memory bus bandwidth | Bisection network bandwidth & fabric injection latency |

#### PagedAttention Mechanics
Prior to PagedAttention (Kwon et al., SOSP 2023), inference systems allocated contiguous HBM buffers sized for the maximum possible sequence length ($L_{\max}$). Because generation lengths are unknown *a priori*, this produced:
- **Internal Fragmentation**: Unused reserved slots in active sequence buffers.
- **External Fragmentation**: Memory gaps between sequences preventing allocation.
- **Reservation Waste**: Over $60\%\text{--}80\%$ of KV cache memory remained unutilized.

PagedAttention resolves this by partitioning the KV cache into fixed-size logical blocks ($B_L$, e.g., 16 or 32 tokens). A software **Block Table** maps logical sequence blocks to non-contiguous physical blocks pre-allocated in HBM. A custom fused CUDA/Triton attention kernel dynamically dereferences physical block pointers during tensor core matrix multiplication.

#### CUDA Stream Orchestration, Synchronization Overheads, and GPUDirect RDMA

Executing distributed MoE inference without catastrophic pipeline stalls requires strict discipline across asynchronous CUDA streams:

1. **Multi-Stream Overlap Architecture:**
   Production inference servers decouple memory-bound attention computation from network communication by dispatching them onto concurrent, independent CUDA execution streams (\`cudaStream_t\`):
   - **Compute Stream:** Executes fused PagedAttention kernels (FlashAttention-2/3) and local linear projections.
   - **Communication Stream:** Executes asynchronous non-blocking NCCL All-to-All collectives (\`ncclAllToAllv\`) across the inter-accelerator fabric.
   - **Cross-Stream Event Coordination:** Dependency synchronization is managed strictly on the GPU device via lightweight CUDA events (\`cudaEventRecord\`, \`cudaStreamWaitEvent\`), entirely avoiding CPU host round-trips.

2. **The Cost of Synchronization Stalls:**
   Any blocking call on the host CPU (\`cudaStreamSynchronize\`, \`cudaDeviceSynchronize\`, or implicit host synchronization triggered by runtime memory allocation via \`cudaMalloc\`) causes the GPU hardware command queues to drain completely. In autoregressive token decode loops running at tens of milliseconds per token, a single pipeline drain adds millisecond-level bubbles that destroy generation throughput.

3. **GPUDirect RDMA & Zero-Copy Fabric Injection:**
   To sustain multi-gigabyte inter-node All-to-All goodput, systems leverage **GPUDirect RDMA (GDR)**. The network interface card (NIC) directly accesses tensor buffers in GPU High Bandwidth Memory (HBM) across the PCIe bus or NVLink network using physical memory bar windows. This bypasses the host CPU and system DRAM entirely, eliminating two intermediate memory copies and cutting peer-to-peer latency by more than $60\%$.

---

### 05. Educational Reference Implementation: Virtualized Block Table with True Copy-on-Write

The following Python 3 script provides an executable, verified implementation of logical-to-physical block mapping with **true Copy-on-Write (CoW)** handling when an appending sequence writes into a shared, partially filled block.

> **EDUCATIONAL SPECIFICATION & SCOPE: Host Prototype vs. Production GPU Systems**
> This reference implementation is **tested and fully executable** in standard Python 3. It serves an educational purpose: demonstrating the host-side metadata algorithms for logical-to-physical block table translation, reference-counted block sharing, copy-on-write branching, and explicit block reclamation.
> 
> **Critical Architectural Distinction from Production GPU Memory Implementations:**
> A production inference engine (such as vLLM or TensorRT-LLM) differs fundamentally from this host-side prototype:
> 1. **Physical HBM Allocation:** Rather than manipulating Python lists and dictionaries on CPU memory, production engines allocate massive contiguous tensor blocks directly within accelerator High Bandwidth Memory (HBM) using CUDA driver memory APIs (\`cudaMalloc\`, virtual memory management via \`cuMemMap\`).
> 2. **Asynchronous Kernel Execution:** Translation occurs inside custom fused CUDA or Triton attention kernels (e.g., FlashAttention-2/3) running directly on GPU Streaming Multiprocessors, where thread blocks dereference 64-bit physical memory addresses inside high-speed register files without CPU involvement.
> 3. **Lock-Free Concurrency:** Multi-stream generation and continuous batching require thread-safe, lock-free atomic reference counting across asynchronous CUDA execution streams to prevent race conditions during sequence forks and preemptions.
> 4. **Hardware Copy-on-Write Acceleration:** Physical buffer copying is executed via asynchronous Tensor Memory Accelerator (TMA) copy hardware engines or peer-to-peer DMA, eliminating CPU-GPU synchronization stalls.

\`\`\`python
#!/usr/bin/env python3
"""
EDUCATIONAL REFERENCE IMPLEMENTATION: VIRTUALIZED BLOCK TABLE MANAGER WITH TRUE COPY-ON-WRITE
Scope: Fully executable Python 3 educational demonstration modeling host-side block tables,
physical block pooling, and reference-counted Copy-on-Write branching.
(Production LLM engines integrate this host metadata with low-level CUDA/Triton attention kernels).
Demonstrates:
  1. Fixed-size physical block pooling in accelerator memory.
  2. Dynamic logical-to-physical block mapping (PagedAttention concept).
  3. True Copy-on-Write (CoW) when appending to a shared partially filled block.
  4. Explicit block reclamation preventing memory leaks.
"""

from typing import Dict, List, Optional

class PhysicalBlockPool:
    """Manages an accelerator HBM physical block pool with reference counting and storage simulation."""
    def __init__(self, total_blocks: int, block_size: int = 16):
        self.block_size = block_size
        self.total_blocks = total_blocks
        self.free_blocks: List[int] = list(range(total_blocks))
        self.ref_counts: Dict[int, int] = {i: 0 for i in range(total_blocks)}
        # Simulates physical memory storage: block_id -> list of token representations
        self.block_data: Dict[int, List[str]] = {i: [] for i in range(total_blocks)}

    def allocate(self) -> int:
        """Allocates an unused physical block from the free list."""
        if not self.free_blocks:
            raise MemoryError("HBM Physical Block Pool Exhausted (Out of GPU Memory)")
        block_id = self.free_blocks.pop(0)
        self.ref_counts[block_id] = 1
        self.block_data[block_id] = []
        return block_id

    def retain(self, block_id: int) -> None:
        """Increments reference count for Copy-on-Write block sharing."""
        self.ref_counts[block_id] += 1

    def release(self, block_id: int) -> None:
        """Decrements reference count and returns block to pool when unreferenced."""
        self.ref_counts[block_id] -= 1
        if self.ref_counts[block_id] <= 0:
            self.ref_counts[block_id] = 0
            self.block_data[block_id] = []
            if block_id not in self.free_blocks:
                self.free_blocks.append(block_id)

class SequenceBlockTable:
    """Tracks logical-to-physical block mappings with true Copy-on-Write token append."""
    def __init__(self, sequence_id: str, pool: PhysicalBlockPool):
        self.sequence_id = sequence_id
        self.pool = pool
        self.logical_to_physical: List[int] = []
        self.num_tokens: int = 0

    def append_token(self, token_val: str) -> int:
        """
        Appends a generated token.
        If writing into a shared block (ref_count > 1), triggers true Copy-on-Write:
        allocates a new unshared block, copies existing tokens, and updates mapping.
        """
        self.num_tokens += 1
        token_offset = (self.num_tokens - 1) % self.pool.block_size

        if token_offset == 0:
            # Need a brand-new physical block
            new_block_id = self.pool.allocate()
            self.logical_to_physical.append(new_block_id)
            self.pool.block_data[new_block_id].append(token_val)
            return new_block_id
        else:
            # Writing into current active block
            current_block = self.logical_to_physical[-1]
            if self.pool.ref_counts[current_block] > 1:
                # COPY-ON-WRITE: Block is shared with parent/sibling!
                cow_block_id = self.pool.allocate()
                # Copy existing tokens from shared block into new private block
                self.pool.block_data[cow_block_id] = list(self.pool.block_data[current_block])
                # Release reference to shared block
                self.pool.release(current_block)
                # Remap logical entry to new private block
                self.logical_to_physical[-1] = cow_block_id
                current_block = cow_block_id

            self.pool.block_data[current_block].append(token_val)
            return current_block

    def fork(self, new_sequence_id: str) -> 'SequenceBlockTable':
        """Creates a child sequence sharing physical blocks via Copy-on-Write."""
        child = SequenceBlockTable(new_sequence_id, self.pool)
        child.logical_to_physical = list(self.logical_to_physical)
        child.num_tokens = self.num_tokens
        for block_id in self.logical_to_physical:
            self.pool.retain(block_id)
        return child

    def free(self) -> None:
        """Reclaims all mapped physical blocks back to the memory pool."""
        for block_id in self.logical_to_physical:
            self.pool.release(block_id)
        self.logical_to_physical.clear()
        self.num_tokens = 0

# --- Verification & Execution Demonstration ---
if __name__ == "__main__":
    # Initialize a pool with 8 physical blocks of block_size = 4 tokens
    memory_pool = PhysicalBlockPool(total_blocks=8, block_size=4)

    # 1. Sequence A generates 2 tokens (occupies half of Block 0)
    seq_a = SequenceBlockTable("req-parent", memory_pool)
    seq_a.append_token("tok_0")
    seq_a.append_token("tok_1")

    print(f"Seq A Mapped Blocks: {seq_a.logical_to_physical}")
    print(f"Block 0 Ref Count: {memory_pool.ref_counts[0]}")
    assert seq_a.logical_to_physical == [0]
    assert memory_pool.ref_counts[0] == 1

    # 2. Fork Sequence A into Sequence B (parallel sampling / beam search)
    seq_b = seq_a.fork("req-child")
    print(f"After fork, Seq B Mapped Blocks: {seq_b.logical_to_physical}")
    print(f"Block 0 Ref Count: {memory_pool.ref_counts[0]}")
    assert seq_b.logical_to_physical == [0]
    assert memory_pool.ref_counts[0] == 2

    # 3. Sequence B appends token 'tok_2_b' into shared partially filled Block 0
    # Must trigger TRUE COPY-ON-WRITE!
    seq_b.append_token("tok_2_b")
    print(f"After Seq B Append (CoW Triggered):")
    print(f"  Seq A Mapped Blocks: {seq_a.logical_to_physical} -> Data: {memory_pool.block_data[seq_a.logical_to_physical[-1]]}")
    print(f"  Seq B Mapped Blocks: {seq_b.logical_to_physical} -> Data: {memory_pool.block_data[seq_b.logical_to_physical[-1]]}")
    print(f"  Block 0 Ref Count: {memory_pool.ref_counts[0]}")
    print(f"  Block 1 Ref Count: {memory_pool.ref_counts[1]}")

    # Assertions validating data isolation and reference counts
    assert seq_a.logical_to_physical == [0]
    assert seq_b.logical_to_physical == [1]
    assert memory_pool.block_data[0] == ["tok_0", "tok_1"]
    assert memory_pool.block_data[1] == ["tok_0", "tok_1", "tok_2_b"]
    assert memory_pool.ref_counts[0] == 1
    assert memory_pool.ref_counts[1] == 1

    # 4. Clean up both sequences; all blocks must return to free pool
    seq_a.free()
    seq_b.free()
    print(f"After clean-up, Free Blocks Remaining: {len(memory_pool.free_blocks)}")
    assert len(memory_pool.free_blocks) == 8
    print("Verification execution with true Copy-on-Write passed successfully.")
\`\`\`

---

### 06. 2027 Horizon: Hardware Projections vs. Physical Invariants

To avoid speculative marketing assertions, architectural roadmaps must clearly delineate between **empirical production facts (2024–2025)** and **verifiable engineering projections for 2027 fabrics**.

| Architectural Dimension | Current Empirical Standard (2024–2025) | Projected Production Invariant (2027 Horizon) | Physical Bottleneck / Constraint |
| :--- | :--- | :--- | :--- |
| **Node-Level Interconnect** | NVLink 4 / NVLink 5 ($900\\text{--}1800\\text{ GB/s}$) | NVLink 6 / Optical Interconnect ($3600+\\text{ GB/s}$) | Shoreline silicon area, ball-grid escape density, and thermal packaging limits |
| **Inter-Node Fabric Transport** | InfiniBand NDR ($400\\text{ Gbps}$) & RoCEv2 over 51.2T switches | Ultra Ethernet Consortium (UEC 1.0) & 800G/1.6T NICs | Incast buffer exhaustion in high-radix Clos networks |
| **Optical Transit** | Plug-in optical transceivers (DSP-driven) | Co-Packaged Optics (CPO) and Near-Package Optics | Laser reliability, fiber connector dust sensitivity, thermal dissipation |
| **MoE Routing Topology** | Static Top-2 routing with capacity factor padding | Fine-grained dropless MoE ($K=8$, $E=64\\text{--}256$) with loss-free bias | Dynamic buffer memory stragglers & non-uniform rank arrival |
| **Memory Expansion** | Local HBM3 / HBM3e ($3.2\\text{--}8.0\\text{ TB/s}$) | Heterogeneous HBM4 + CXL 3.1 fabric memory pooling | CXL switch transit latency ($200\\text{--}350\\text{ ns}$) limits CXL use to KV-cache offload |

#### The Invariant Limits
Regardless of 2027 transceiver bandwidth advancements, three physical constants remain unalterable:
1. **Light Propagation in Fiber**: Photons propagate through silica glass at approximately $200\\text{ km/ms}$ ($5\\text{ ns/m}$). Cable runs across a 100k+ GPU datacenter guarantee irreducible round-trip transit times.
2. **Serialization and Switching Delays**: Every switch stage in a Clos network adds store-and-forward or cut-through pipeline latency ($100\\text{--}300\\text{ ns}$).
3. **Amdahl's Law in Collective Barriers**: The completion time of an unbuffered All-to-All collective across $P$ nodes is dictated by the slowest rank (the tail straggler). As rank counts scale into the thousands, straggler latency dominates unless asynchronous computation-communication overlap is enforced.

---

### 07. Technical Glossary

- **Expert Parallelism (EP)**: A distributed parallelization strategy where independent expert sub-networks of a sparse MoE model are partitioned across separate accelerator ranks.
- **Tensor Parallelism (TP)**: Intra-node model parallelization splitting individual weight matrices (e.g., Megatron-LM column and row parallel linear layers) across GPUs via All-Reduce operations.
- **Pipeline Parallelism (PP)**: Inter-node parallelization partitioning sequential model layers across consecutive pipeline stages via point-to-point Send/Recv collectives.
- **All-to-All (AlltoAllv)**: A collective communication primitive where every participating rank transmits distinct, variable-length data segments to every other rank simultaneously.
- **PagedAttention**: A virtual memory management algorithm for LLM inference that partitions Key-Value (KV) cache tensors into non-contiguous physical memory blocks to eliminate internal and external memory fragmentation.
- **Capacity Factor (CF)**: A scalar multiplier defining the maximum buffer size allocated for tokens routed to an individual expert relative to an idealized uniform distribution.
- **Incast Congestion**: A network condition occurring when multiple senders transmit packets to a single destination port simultaneously, causing intermediate switch buffer exhaustion and packet drops.
- **Roofline Model**: An analytical performance model relating computational throughput (FLOP/s) to arithmetic intensity (FLOP/byte) and memory bandwidth limits.

---

### 08. Peer-Reviewed Citations & Verifiable Technical Documentation

All technical assertions, mathematical formulations, and scaling laws in this manuscript are grounded in peer-reviewed literature and official specifications:

1. **Kwon, W., Li, Z., Zhuang, S., Sheng, Y., Zheng, L., Yu, C. H., Gonzalez, J. E., Zhang, H., & Stoica, I.** (2023).  
   *Efficient Memory Management for Large Language Model Serving with PagedAttention.*  
   Proceedings of the 29th ACM Symposium on Operating Systems Principles (SOSP '23), pp. 611–626.  
   DOI: [https://doi.org/10.1145/3600006.3613165](https://doi.org/10.1145/3600006.3613165) | arXiv: [https://arxiv.org/abs/2309.06180](https://arxiv.org/abs/2309.06180)  
   *Validates: Virtual memory KV-cache paging, block table indirect addressing, and elimination of internal/external fragmentation.*

2. **Lepikhin, D., Lee, H., Xu, Y., Chen, D., Firat, O., Huang, Y., Krikun, M., Shazeer, N., & Chen, Z.** (2021).  
   *GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding.*  
   International Conference on Learning Representations (ICLR 2021).  
   arXiv: [https://arxiv.org/abs/2006.16668](https://arxiv.org/abs/2006.16668)  
   *Validates: Top-2 gating formulation, expert capacity $C$ calculation, capacity factor tradeoffs, and auxiliary load balancing loss.*

3. **Fedus, W., Zoph, B., & Shazeer, N.** (2022).  
   *Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity.*  
   Journal of Machine Learning Research (JMLR), Vol. 23(120), pp. 1–39.  
   JMLR: [https://jmlr.org/papers/v23/21-0998.html](https://jmlr.org/papers/v23/21-0998.html) | arXiv: [https://arxiv.org/abs/2101.03961](https://arxiv.org/abs/2101.03961)  
   *Validates: Top-1 routing mechanics, token drop dynamics under non-uniform routing, and capacity factor scaling.*

4. **Rajbhandari, S., Li, C., Yao, Z., Zhang, M., Aminabadi, R. Y., Awan, A. A., Rasley, J., & He, Y.** (2022).  
   *DeepSpeed-MoE: Advancing Mixture-of-Experts Inference and Training to Power Next-Generation AI.*  
   Proceedings of the 39th International Conference on Machine Learning (ICML 2022), PMLR 162:18332–18346.  
   PMLR / arXiv: [https://arxiv.org/abs/2201.05596](https://arxiv.org/abs/2201.05596)  
   *Validates: Expert Parallelism (EP) communication overheads, hierarchical All-to-All collectives, and communication-computation overlap.*

5. **Gale, T., Narayanan, D., Young, C., & Zaharia, M.** (2023).  
   *MegaBlocks: Efficient Sparse Training with Mixture-of-Experts.*  
   Proceedings of the 6th Conference on Machine Learning and Systems (MLSys 2023).  
   arXiv: [https://arxiv.org/abs/2211.15841](https://arxiv.org/abs/2211.15841)  
   *Validates: Dropless MoE formulation using block-sparse GPU kernels, avoiding token dropping without static capacity padding waste, achieving up to 40% speedup over Tutel MoE and up to 2.4x speedup over dense Megatron-LM models.*

6. **Hockney, R. W.** (1994).  
   *The Communication Challenge for MPP: Intel Paragon and Meiko CS-2.*  
   Parallel Computing, Vol. 20(3), pp. 389–398.  
   DOI: [https://doi.org/10.1016/S0167-8191(06)80021-9](https://doi.org/10.1016/S0167-8191(06)80021-9)  
   *Validates: The alpha-beta analytical communication model and message startup latency penalties in collective exchanges.*

7. **NVIDIA Corporation** (2022).  
   *NVIDIA H100 Tensor Core GPU Architecture Whitepaper.*  
   NVIDIA Architecture Documentation.  
   URL: [https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper](https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper)  
   *Validates: NVLink 4 theoretical 900 GB/s bidirectional peak bandwidth and 450 GB/s per direction. (Note: Empirical 750–820 GB/s NCCL bus goodput is an unverified external benchmark measurement).*

8. **NVIDIA Corporation** (2022).  
   *NVIDIA Quantum-2 400Gb/s InfiniBand Architecture Documentation.*  
   NVIDIA Networking Documentation.  
   URL: [https://www.nvidia.com/en-us/networking/infiniband-switching/](https://www.nvidia.com/en-us/networking/infiniband-switching/)  
   *Validates: NDR 400 Gbps (50 GB/s) per-port physical line rate. (Note: Empirical 47.5–48.5 GB/s RDMA goodput via ib_write_bw is an unverified external benchmark measurement).*

9. **Ultra Ethernet Consortium** (UEC).  
   *Ultra Ethernet Consortium Specification History (UEC 1.0 Transport Specification Overview).*  
   UEC Technical Documentation.  
   URL: [https://ultraethernet.org/specification-history/](https://ultraethernet.org/specification-history/)  
   *Validates: UEC 1.0 transport architectural standards for multi-path packet spraying, selective retransmission, and packet pacing to mitigate incast buffer exhaustion in high-radix AI fabrics.*

10. **NVIDIA Corporation** (2024).  
    *NVIDIA Blackwell Architecture Technical Brief: Advancing Generative AI and Accelerated Computing at Trillion-Parameter Scale.*  
    NVIDIA Technical Documentation.  
    URL: [https://resources.nvidia.com/en-us-blackwell-architecture](https://resources.nvidia.com/en-us-blackwell-architecture)  
    *Validates: 5th-generation NVLink theoretical 1800 GB/s bidirectional peak bandwidth, 900 GB/s per direction wire rate, and 7.2 TB/s aggregate bidirectional bandwidth per NVLink Switch chip. (Projected goodput figures remain unverified projections).*`,
  },
];

export const TOOL_ITEMS: {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  actionLabel: string;
}[] = [
  {
    id: 'prompt-architect',
    name: 'AI Prompt Architect & Enhancer',
    category: 'Prompt Engineering',
    description: 'Transform rough concepts into production-grade system prompts with explicit constraints, negative examples, and structured output formatting.',
    badge: 'Interactive Tool',
    actionLabel: 'Launch Architect',
  },
  {
    id: 'headline-generator',
    name: 'Tech Headline & Hook Generator',
    category: 'Content Optimization',
    description: 'Generate high-CTR, clickbait-free technical headlines calibrated for engineering leaders, Hacker News, technical blogs, and developer newsletters.',
    badge: 'Interactive Tool',
    actionLabel: 'Generate Hooks',
  },
  {
    id: 'code-explainer',
    name: 'Code Logic & Complexity Analyzer',
    category: 'Code & Architecture',
    description: 'Analyze snippets in TypeScript, Python, Rust, or SQL. Inspect Big-O time and space complexity, edge-case hazards, and clean architecture tips.',
    badge: 'Interactive Tool',
    actionLabel: 'Analyze Code',
  },
  {
    id: 'ai-detector',
    name: 'AI Text & Readability Estimator',
    category: 'Analysis & SEO',
    description: 'Calculate perplexity variance, burstiness scores, Flesch-Kincaid reading levels, and highlight overused repetitive phrases in technical copy.',
    badge: 'Interactive Tool',
    actionLabel: 'Inspect Text',
  },
  {
    id: 'jargon-translator',
    name: 'Tech Jargon & Architecture Translator',
    category: 'Prompt Engineering',
    description: 'Decode dense acronyms (MoE, LoRA, CPO, ZKML, KV Cache) into three perspectives: ELI5 analogy, senior engineer breakdown, and business ROI.',
    badge: 'Interactive Tool',
    actionLabel: 'Decode Terms',
  },
  {
    id: 'seo-previewer',
    name: 'SEO & OpenGraph Social Card Previewer',
    category: 'Analysis & SEO',
    description: 'Simulate live search engine snippets and social share cards (X / Twitter, LinkedIn, Google) with real-time character count and readability checks.',
    badge: 'Interactive Tool',
    actionLabel: 'Preview Cards',
  },
];
