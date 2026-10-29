export type TechCategory =
  | "Software Engineering Fundamentals"
  | "Distributed Systems & Cloud"
  | "Databases & Storage Engines"
  | "Systems, OS & Compilers"
  | "AI Engineering & LLMs"
  | "Frontend & Web Performance"
  | "Cybersecurity & Cryptography"
  | "System Design & Architecture"
  | "Mindset, Growth & Leadership";

export interface TechTopic {
  id: string;
  title: string;
  category: TechCategory;
  difficulty: "Fundamental" | "Intermediate" | "Advanced" | "Beginner" | "Reflective";
  researchQuestion: string;
  keywords: string[];
}

export const CATEGORIES: TechCategory[] = [
  "Software Engineering Fundamentals",
  "Distributed Systems & Cloud",
  "Databases & Storage Engines",
  "Systems, OS & Compilers",
  "AI Engineering & LLMs",
  "Frontend & Web Performance",
  "Cybersecurity & Cryptography",
  "System Design & Architecture",
  "Mindset, Growth & Leadership",
];

// Curated comprehensive technical and growth topics designed for software engineers
const domainTemplates: Record<
  TechCategory,
  {
    prefix: string;
    coreThemes: Array<{
      title: string;
      prompt: string;
      difficulty: "Fundamental" | "Intermediate" | "Advanced" | "Beginner" | "Reflective";
      tags: string[];
    }>;
    angles: Array<{
      label: string;
      questionPrompt: string;
    }>;
  }
> = {
  "Software Engineering Fundamentals": {
    prefix: "fund",
    coreThemes: [
      { title: "DNS Resolution: From URL to IP Address", prompt: "What happens step-by-step between typing a URL in the browser and hitting the root, TLD, and authoritative nameservers.", difficulty: "Fundamental", tags: ["dns", "networking", "internet"] },
      { title: "TCP 3-Way Handshake vs UDP & QUIC", prompt: "How SYN, SYN-ACK, ACK establish reliable byte streams, and why modern web protocols are moving to UDP.", difficulty: "Fundamental", tags: ["tcp", "udp", "protocols"] },
      { title: "Garbage Collection vs Manual Memory Allocation", prompt: "How mark-and-sweep, generational GC, and reference counting compare to manual malloc/free and Rust ownership.", difficulty: "Fundamental", tags: ["memory", "gc", "rust"] },
      { title: "Git Under the Hood: Blobs, Trees and Commits", prompt: "How Git's content-addressable object store models commits as directed acyclic graphs (DAGs).", difficulty: "Fundamental", tags: ["git", "vcs", "data-structures"] },
      { title: "Big-O Notation in Real-World Production", prompt: "Why constant factors, memory cache locality, and I/O often matter far more than theoretical algorithmic Big-O.", difficulty: "Fundamental", tags: ["algorithms", "performance", "complexity"] },
      { title: "REST vs GraphQL vs gRPC: API Protocols", prompt: "Comparing HTTP JSON APIs, client-driven GraphQL queries, and high-performance binary Protobuf gRPC.", difficulty: "Fundamental", tags: ["api", "grpc", "graphql"] },
      { title: "Authentication: JWTs vs Server-Side Sessions", prompt: "The trade-offs of stateless cryptographic tokens vs revocable database sessions and cookie security.", difficulty: "Fundamental", tags: ["auth", "jwt", "security"] },
      { title: "Docker Internals: Linux Namespaces & cgroups", prompt: "Why containers are not lightweight virtual machines, but isolated Linux kernel processes.", difficulty: "Fundamental", tags: ["docker", "linux", "containers"] },
      { title: "Concurrency: Threads vs Event Loops vs Goroutines", prompt: "How Node.js single-threaded event loops, Java OS threads, and Go M:N green threads handle I/O concurrency.", difficulty: "Fundamental", tags: ["concurrency", "async", "threads"] },
      { title: "Cache Invalidation & Eviction Strategies", prompt: "Why Phil Karlton called cache invalidation one of the two hardest things in computer science, and how LRU/LFU work.", difficulty: "Fundamental", tags: ["caching", "redis", "architecture"] },
      { title: "WebSockets vs Server-Sent Events (SSE) vs Polling", prompt: "When full-duplex WebSockets are overkill and single-directional HTTP/2 SSE is the optimal choice.", difficulty: "Fundamental", tags: ["websockets", "sse", "realtime"] },
      { title: "Database Normalization: 1NF to 3NF vs Denormalization", prompt: "How avoiding data anomalies in transactional relational tables balances against read query performance.", difficulty: "Fundamental", tags: ["sql", "databases", "normalization"] },
      { title: "Idempotency in API and Payment Systems", prompt: "How idempotency keys and transactional deduplication prevent double-charging users during network retries.", difficulty: "Fundamental", tags: ["idempotency", "apis", "reliability"] },
      { title: "Clean Code & Refactoring Without Breaking Things", prompt: "The discipline of Martin Fowler's refactoring: small verifiable steps backed by solid automated unit tests.", difficulty: "Fundamental", tags: ["clean-code", "refactoring", "testing"] },
      { title: "SOLID Principles in Modern Engineering", prompt: "Single Responsibility, Open-Closed, Liskov, Interface Segregation, and Dependency Inversion in modern code.", difficulty: "Fundamental", tags: ["solid", "design-patterns", "oop"] },
      { title: "Testing Pyramid: Unit vs Integration vs E2E", prompt: "Why over-relying on slow, brittle end-to-end tests slows teams down and how to structure test suites.", difficulty: "Fundamental", tags: ["testing", "qa", "ci-cd"] },
    ],
    angles: [
      { label: "Core Mechanics", questionPrompt: "Explain the exact sequence of events step-by-step in under 90 seconds." },
      { label: "Common Junior Pitfall", questionPrompt: "What mistake do junior engineers commonly make when dealing with this?" },
      { label: "Production War Story", questionPrompt: "What is a real-world outage or incident caused by a misunderstanding of this concept?" },
      { label: "Performance Implication", questionPrompt: "How does this choice directly impact latency, throughput, or memory usage?" },
      { label: "Interview Explanation", questionPrompt: "How would you explain this cleanly to an interviewer in a system design interview?" },
      { label: "When NOT to Use It", questionPrompt: "Under what specific technical constraints is this pattern the wrong choice?" },
      { label: "Historical Evolution", questionPrompt: "Why was this technology invented and what previous limitation did it replace?" },
      { label: "Modern Alternatives", questionPrompt: "What recent modern frameworks or tools have re-invented this approach?" },
      { label: "Mental Model", questionPrompt: "What is an unforgettable physical-world analogy that makes this concept click?" },
      { label: "Senior vs Junior Perspective", questionPrompt: "How does a Staff engineer evaluate this differently from a junior engineer?" },
      { label: "Security Vulnerabilities", questionPrompt: "What security flaw opens up if you misconfigure this mechanism?" },
      { label: "Scaling Bottleneck", questionPrompt: "At what traffic threshold (1k req/s vs 100k req/s) does this start breaking down?" },
      { label: "Debugging Playbook", questionPrompt: "What command-line tools (curl, dig, tcpdump, gdb) do you use to diagnose this?" },
      { label: "Zero-Downtime Migration", questionPrompt: "How do you migrate from the old approach to this one without taking a service offline?" },
      { label: "Trade-off Matrix", questionPrompt: "What are the 2 major advantages and 2 major drawbacks you must balance?" },
      { label: "Punchy Summary", questionPrompt: "What is your single-sentence summary rule of thumb to remember forever?" },
    ],
  },
  "Distributed Systems & Cloud": {
    prefix: "dist",
    coreThemes: [
      { title: "Raft Consensus: Leader Election & Log Replication", prompt: "How Raft achieves linearizability and safety during network partitions without split-brain.", difficulty: "Advanced", tags: ["raft", "consensus", "etcd"] },
      { title: "CAP Theorem vs PACELC Theorem", prompt: "Why PACELC better models latency and consistency trade-offs during normal non-partition operation.", difficulty: "Intermediate", tags: ["cap", "pacelc", "theory"] },
      { title: "Consistent Hashing & Virtual Nodes", prompt: "How Dynamo-style distributed hash rings rebalance partitions with minimal data movement when nodes fail.", difficulty: "Intermediate", tags: ["hashing", "dynamo", "scalability"] },
      { title: "Vector Clocks and Causality", prompt: "How vector clocks detect concurrent write anomalies without relying on synchronized physical clocks.", difficulty: "Advanced", tags: ["clocks", "concurrency", "distributed"] },
      { title: "Google Spanner & TrueTime GPS Clocks", prompt: "Why hardware atomic clocks with bounded uncertainty enable globally distributed ACID serializability.", difficulty: "Advanced", tags: ["spanner", "truetime", "consistency"] },
      { title: "Conflict-Free Replicated Data Types (CRDTs)", prompt: "State-based vs operation-based CRDTs for collaborative real-time apps like Figma and Google Docs.", difficulty: "Advanced", tags: ["crdt", "offline-first", "sync"] },
      { title: "Two-Phase Commit (2PC) vs Saga Pattern", prompt: "Why 2PC is a blocking anti-pattern in cloud microservices and how compensatory transactions solve it.", difficulty: "Intermediate", tags: ["transactions", "sagas", "microservices"] },
      { title: "Gossip Protocols & Failure Detection", prompt: "How decentralized peer-to-peer epidemic protocols achieve exponential membership discovery in clusters.", difficulty: "Intermediate", tags: ["gossip", "peer-to-peer", "clusters"] },
      { title: "Distributed Rate Limiting (Token Bucket & Leaky Bucket)", prompt: "Using Redis sliding window logs to prevent thundering herds across multi-region API gateways.", difficulty: "Intermediate", tags: ["rate-limiting", "redis", "gateway"] },
      { title: "Active-Active Multi-Region Geo-Replication", prompt: "Mitigating blast radius and managing cross-region replication lag during cloud provider outages.", difficulty: "Advanced", tags: ["multi-region", "disaster-recovery", "cloud"] },
      { title: "Kafka Partitioning and Consumer Group Rebalancing", prompt: "How cooperative sticky rebalancing prevents stop-the-world pauses in massive stream consumer pools.", difficulty: "Advanced", tags: ["kafka", "streaming", "scale"] },
      { title: "Circuit Breakers, Bulkheads & Retry Budgets", prompt: "How Netflix Hystrix/Resilience4j patterns prevent cascading failures across microservice graphs.", difficulty: "Intermediate", tags: ["resilience", "microservices", "sre"] },
      { title: "Eventual Consistency & Read-Your-Own-Writes", prompt: "Architecting user interfaces so clients feel instant consistency despite asynchronous replica lag.", difficulty: "Intermediate", tags: ["consistency", "ux", "databases"] },
      { title: "Deadlock Detection in Distributed Systems", prompt: "Chandy-Misra-Haas edge chasing algorithms for detecting cross-shard dependency cycles.", difficulty: "Advanced", tags: ["deadlocks", "algorithms", "distributed"] },
      { title: "Distributed Tracing & W3C Trace Context", prompt: "How OpenTelemetry traceparent headers propagate causality across asynchronous message queues.", difficulty: "Intermediate", tags: ["opentelemetry", "tracing", "observability"] },
      { title: "Serverless Cold Starts & MicroVM Architectures", prompt: "How AWS Firecracker and Cloudflare Workers achieve sub-10ms startup times via microVM snapshots.", difficulty: "Intermediate", tags: ["serverless", "microvms", "cloud"] },
    ],
    angles: [
      { label: "Partition Scenario", questionPrompt: "What happens during an asymmetric network split where node A can send but cannot receive?" },
      { label: "System Design Tip", questionPrompt: "How do you explain this tradeoff concisely during a Meta/Google System Design round?" },
      { label: "Latency Cost", questionPrompt: "What is the speed-of-light cost of cross-region quorum round-trips?" },
      { label: "Data Loss Prevention", questionPrompt: "How does fsync frequency on the write-ahead log balance durability against I/O throughput?" },
      { label: "Production Failure Case", questionPrompt: "Describe an actual real-world outage caused by misinterpreting this distributed invariant." },
      { label: "Scale Limits", questionPrompt: "Does this scale to 10,000 nodes or does network heartbeat chat drown the network?" },
      { label: "Monitoring Alerts", questionPrompt: "What is the single most critical Prometheus alert metric that warns of impending collapse?" },
      { label: "Cost Analysis", questionPrompt: "How does cross-AZ and cross-region egress bandwidth dominate cloud bills for this architecture?" },
      { label: "Simplifying Advice", questionPrompt: "Why should teams usually stick with a single solid Postgres database before jumping to this?" },
      { label: "Testing Rigor", questionPrompt: "How do tools like Jepsen inject network chaos to prove safety invariants?" },
      { label: "Hardware Interconnect", questionPrompt: "How do NVMe SSDs and RDMA fabrics shift traditional distributed system bottlenecks?" },
      { label: "Developer Ergonomics", questionPrompt: "What makes building and debugging this locally in Docker Compose notoriously difficult?" },
      { label: "Disaster Recovery", questionPrompt: "What are your RPO (Recovery Point) and RTO (Recovery Time) targets during a region failover?" },
      { label: "Security & mTLS", questionPrompt: "How do you rotate mTLS workload certificates without dropping consensus heartbeats?" },
      { label: "Mathematical Proof", questionPrompt: "What formal specification tool (TLA+ or Alloy) was used to verify this state machine?" },
      { label: "Concluding Rule", questionPrompt: "What is the key sentence to leave your peers thinking about after your talk?" },
    ],
  },
  "Databases & Storage Engines": {
    prefix: "db",
    coreThemes: [
      { title: "LSM-Trees vs B+ Trees: Write vs Read Optimization", prompt: "Why write-heavy databases like Cassandra and RocksDB use Log-Structured Merge Trees while Postgres uses B+ Trees.", difficulty: "Advanced", tags: ["lsm", "b-trees", "storage"] },
      { title: "Write-Ahead Logging (WAL) & ARIES Crash Recovery", prompt: "How physiological logging, analysis, redo, and undo passes guarantee durability after sudden power cuts.", difficulty: "Advanced", tags: ["wal", "acid", "recovery"] },
      { title: "Database Isolation Levels: Dirty Reads to Write Skew", prompt: "Why Read Committed is default in Postgres, what Snapshot Isolation is, and how SSI prevents write skew.", difficulty: "Intermediate", tags: ["isolation", "acid", "transactions"] },
      { title: "Vector Databases: HNSW vs IVFPQ Indexing", prompt: "How Hierarchical Navigable Small World graphs achieve 99% recall in millisecond vector similarity search.", difficulty: "Advanced", tags: ["vector-db", "hnsw", "embeddings"] },
      { title: "Columnar Storage: Apache Parquet & Arrow", prompt: "Why analytical OLAP queries run 100x faster scanning column stripes with dictionary and run-length encoding.", difficulty: "Intermediate", tags: ["parquet", "arrow", "olap"] },
      { title: "Multi-Version Concurrency Control (MVCC) Internals", prompt: "How row xmin/xmax version headers allow concurrent readers to never block writers.", difficulty: "Intermediate", tags: ["mvcc", "postgres", "concurrency"] },
      { title: "PostgreSQL Vacuuming and Table Bloat", prompt: "Why auto-vacuum falls behind under update-heavy workloads and how Heap-Only Tuples (HOT) mitigates index bloat.", difficulty: "Intermediate", tags: ["postgres", "vacuum", "performance"] },
      { title: "DuckDB: In-Process Vectorized OLAP", prompt: "How morsel-driven execution and zero-copy Arrow interchange make DuckDB the 'SQLite for analytics'.", difficulty: "Intermediate", tags: ["duckdb", "olap", "analytics"] },
      { title: "Bloom Filters & Cuckoo Filters in Key-Value Stores", prompt: "How small bit-arrays save expensive disk seeks for non-existent keys in RocksDB and Redis.", difficulty: "Fundamental", tags: ["bloom-filter", "algorithms", "caching"] },
      { title: "Database Sharding: Hash vs Range vs Directory", prompt: "How horizontal sharding scales write throughput, and the pain of cross-shard distributed joins.", difficulty: "Intermediate", tags: ["sharding", "scalability", "databases"] },
      { title: "Distributed SQL: CockroachDB & Yugabyte Architecture", prompt: "Layering distributed transactions (Raft/Paxos) beneath standard PostgreSQL dialect query engines.", difficulty: "Advanced", tags: ["distributed-sql", "cockroachdb", "postgres"] },
      { title: "Database Connection Pooling & PgBouncer", prompt: "Why PostgreSQL process-per-connection model exhausts RAM and how transaction pooling fixes it.", difficulty: "Fundamental", tags: ["pgbouncer", "postgres", "concurrency"] },
      { title: "Zero-Downtime Database Schema Migrations", prompt: "The expand-and-contract pattern for safely renaming and dropping columns on 100M+ row tables.", difficulty: "Intermediate", tags: ["migrations", "sql", "devops"] },
      { title: "Database Query Optimizer & EXPLAIN ANALYZE", prompt: "How query planners calculate cost estimates and when seq scans beat index scans.", difficulty: "Intermediate", tags: ["query-plan", "postgres", "indexes"] },
      { title: "Change Data Capture (CDC) with Debezium", prompt: "Streaming database write-ahead log mutations directly into Kafka for real-time downstream sync.", difficulty: "Intermediate", tags: ["cdc", "debezium", "kafka"] },
      { title: "Buffer Pool Eviction Algorithms: LRU vs 2Q vs ARC", prompt: "Why Adaptive Replacement Cache prevents sequential table scans from flushing hot transactional cache pages.", difficulty: "Advanced", tags: ["buffer-pool", "caching", "kernel"] },
    ],
    angles: [
      { label: "Under the Hood", questionPrompt: "Explain the disk block or memory layout in simple terms." },
      { label: "Write Amplification", questionPrompt: "How does compaction strategy impact SSD write amplification and flash drive lifespan?" },
      { label: "Slow Query Triage", questionPrompt: "What is your step-by-step procedure when a production query jumps from 5ms to 8000ms?" },
      { label: "Index Selection", questionPrompt: "When is a B-Tree index inferior to a BRIN or Hash index in Postgres?" },
      { label: "Lock Contention", questionPrompt: "How do you detect and kill row-level deadlocks without bringing down the database?" },
      { label: "Memory Sizing", questionPrompt: "How should shared_buffers, work_mem, and maintenance_work_mem be sized on a 64GB box?" },
      { label: "Vector Search Reality", questionPrompt: "What is the accuracy drop when quantizing 1536-dimensional float32 embeddings down to int8?" },
      { label: "Backup & Recovery", questionPrompt: "How do Point-In-Time Recovery (PITR) WAL replays guarantee zero data loss?" },
      { label: "Denormalization Risk", questionPrompt: "At what point does denormalizing data to save join cost introduce corruption bugs?" },
      { label: "NoSQL vs SQL Truth", questionPrompt: "Why did the 'NoSQL replaces SQL' movement fizzle and what are the true niche use cases?" },
      { label: "SSD Direct I/O", questionPrompt: "Why do modern database engines use O_DIRECT to bypass the OS page cache?" },
      { label: "Multi-Tenant Isolation", questionPrompt: "Row-level security (RLS) vs separate schemas vs separate databases for SaaS apps." },
      { label: "Read Replica Lag", questionPrompt: "How do you handle users reading stale data right after writing a comment or profile change?" },
      { label: "Compaction Storms", questionPrompt: "How does tiered vs leveled compaction prevent background compaction storms?" },
      { label: "Cloud DB vs Self-Hosted", questionPrompt: "AWS RDS / Aurora vs running Postgres on Kubernetes EC2: where is the real cost trade-off?" },
      { label: "Golden Takeaway", questionPrompt: "What is the single most important rule to keep your database fast and reliable?" },
    ],
  },
  "Systems, OS & Compilers": {
    prefix: "sys",
    coreThemes: [
      { title: "Linux io_uring: High-Performance Async I/O", prompt: "How kernel/userspace shared memory ring buffers eliminate system call overhead for disk and network.", difficulty: "Advanced", tags: ["io_uring", "linux", "kernel"] },
      { title: "Rust Ownership & Non-Lexical Lifetimes (NLL)", prompt: "How compile-time borrow checking proves memory safety and race-freedom without garbage collection pauses.", difficulty: "Advanced", tags: ["rust", "memory", "compilers"] },
      { title: "WebAssembly (WASM) & WasmGC Component Model", prompt: "How WebAssembly delivers near-native CPU execution in browsers and serverless cloud edge environments.", difficulty: "Intermediate", tags: ["wasm", "wasmgc", "edge"] },
      { title: "LLVM Compiler Infrastructure: Clang, IR and Passes", prompt: "How Static Single Assignment (SSA) form enables dead code elimination and loop vectorization.", difficulty: "Advanced", tags: ["llvm", "compilers", "c++"] },
      { title: "Virtual Memory, Page Tables & TLB HugePages", prompt: "How Translation Lookaside Buffer misses stall CPU execution and why Transparent Huge Pages help.", difficulty: "Advanced", tags: ["memory", "virtual-memory", "kernel"] },
      { title: "CPU Cache Coherency & False Sharing", prompt: "How multiple CPU cores invalidating the same 64-byte L1/L2 cache line destroys multithreaded throughput.", difficulty: "Advanced", tags: ["cpu", "hardware", "concurrency"] },
      { title: "eBPF: Programmable Linux Kernel Extensions", prompt: "How sandboxed in-kernel bytecode transforms network packet routing and real-time security probing.", difficulty: "Advanced", tags: ["ebpf", "linux", "networking"] },
      { title: "Memory Allocation Internals: malloc, jemalloc, mimalloc", prompt: "How modern allocators avoid thread lock contention using thread-local arenas and segregated free lists.", difficulty: "Advanced", tags: ["memory", "malloc", "performance"] },
      { title: "Just-In-Time (JIT) Compilation: V8 TurboFan", prompt: "How speculative type feedback vectors deoptimize JavaScript back to interpreter bytecode when types change.", difficulty: "Intermediate", tags: ["v8", "jit", "javascript"] },
      { title: "SIMD Vectorization & AVX-512 Instructions", prompt: "How single-instruction multiple-data registers process 8 or 16 floating point numbers simultaneously.", difficulty: "Intermediate", tags: ["simd", "avx", "performance"] },
      { title: "Branch Prediction & Profile-Guided Optimization (PGO)", prompt: "How CPU branch predictors avoid pipeline flushes and how PGO restructures machine code layout.", difficulty: "Intermediate", tags: ["cpu", "compilers", "pgo"] },
      { title: "Lock-Free Data Structures & Atomic CAS Loops", prompt: "How Compare-And-Swap (CAS) instructions build wait-free queues without mutex lock sleeps.", difficulty: "Advanced", tags: ["concurrency", "lock-free", "atomics"] },
      { title: "Zero-Copy I/O: sendfile and splice Syscalls", prompt: "How streaming files straight from disk page cache to network socket DMA avoids userspace memory copies.", difficulty: "Intermediate", tags: ["zero-copy", "linux", "networking"] },
      { title: "Linux Process Signals & Zombie Processes", prompt: "How SIGINT, SIGTERM, and SIGKILL work, and why orphaned child processes linger until reaped by PID 1.", difficulty: "Fundamental", tags: ["linux", "processes", "posix"] },
      { title: "ABI (Application Binary Interface) Compatibility", prompt: "Why upgrading shared libraries can crash compiled binaries and how symbol versioning works.", difficulty: "Intermediate", tags: ["abi", "c++", "linux"] },
      { title: "Stack vs Heap Allocation & Escape Analysis", prompt: "How compilers prove an object never outlives its function scope to place it on the fast stack.", difficulty: "Fundamental", tags: ["compilers", "memory", "go"] },
    ],
    angles: [
      { label: "CPU Cycle Cost", questionPrompt: "What is the measured CPU cycle penalty of crossing the kernel context-switch boundary?" },
      { label: "Memory Safety", questionPrompt: "How does this prevent Use-After-Free and Buffer Overflow vulnerabilities?" },
      { label: "Mechanical Sympathy", questionPrompt: "How does writing code that matches hardware architecture yield a 10x speedup?" },
      { label: "Debugging Tool", questionPrompt: "How do you use perf, strace, or bpftrace to inspect this in production?" },
      { label: "Everyday Software Impact", questionPrompt: "How does this lower-level concept affect everyday Python, Go, or TypeScript apps?" },
      { label: "Core Mechanism", questionPrompt: "Explain the assembly or CPU register sequence simply." },
      { label: "Architecture Evolution", questionPrompt: "How will Apple Silicon unified memory change this traditional x86 assumption?" },
      { label: "Common Pitfall", questionPrompt: "What subtle bug manifests if an engineer assumes memory is sequentially consistent?" },
      { label: "Operating System Limit", questionPrompt: "What Linux sysctl configuration (/proc/sys) controls this behavior?" },
      { label: "Embedded Limits", questionPrompt: "How does this apply when programming a micro-controller with 64KB total RAM?" },
      { label: "Modern Rust vs C++", questionPrompt: "How does Rust approach this problem compared to modern C++20?" },
      { label: "Benchmark Rigor", questionPrompt: "Why do synthetic microbenchmarks fail to capture realistic cache-miss behavior?" },
      { label: "Crash Analysis", questionPrompt: "How do you inspect a Linux core dump in GDB to find the culprit line?" },
      { label: "Compiler Flag", questionPrompt: "What compiler flag (-O3, -flto, -march=native) unlocks this optimization?" },
      { label: "Mental Model", questionPrompt: "What is a simple analogy that explains this to a web developer?" },
      { label: "Key Takeaway", questionPrompt: "What is the one rule to keep in mind when writing performance-sensitive code?" },
    ],
  },
  "AI Engineering & LLMs": {
    prefix: "ai",
    coreThemes: [
      { title: "Transformer Self-Attention: Queries, Keys and Values", prompt: "How Q, K, V matrix dot-products compute token relevance and why self-attention scales quadratically with length.", difficulty: "Intermediate", tags: ["transformers", "attention", "ai"] },
      { title: "FlashAttention GPU Kernel Optimizations", prompt: "How tiling matrix multiplications in fast SRAM prevents the High Bandwidth Memory (HBM) bandwidth bottleneck.", difficulty: "Advanced", tags: ["gpu", "cuda", "flashattention"] },
      { title: "LLM Quantization: AWQ vs GPTQ vs GGUF", prompt: "How activation-aware weight quantization compresses 16-bit model weights down to 4 bits with minimal perplexity loss.", difficulty: "Intermediate", tags: ["quantization", "gguf", "inference"] },
      { title: "Model Context Protocol (MCP) Standard", prompt: "How Anthropic's MCP open protocol standardizes tool integration and agent capability discovery.", difficulty: "Fundamental", tags: ["mcp", "agents", "standards"] },
      { title: "RAG Architectures: Hybrid Search & Reranking", prompt: "Combining dense vector embeddings with sparse BM25 keyword search and cross-encoder rerankers for accuracy.", difficulty: "Intermediate", tags: ["rag", "search", "embeddings"] },
      { title: "Speculative Decoding: Speeding Up LLM Generation", prompt: "Using a fast, lightweight draft model verified by a larger model in parallel to achieve 2x lower latency.", difficulty: "Intermediate", tags: ["speculative-decoding", "inference", "throughput"] },
      { title: "KV Cache Management & PagedAttention", prompt: "How vLLM uses virtual memory page tables to eliminate memory fragmentation in multi-tenant model serving.", difficulty: "Advanced", tags: ["vllm", "memory", "inference"] },
      { title: "Agentic ReAct Loops: Thought, Action, Observation", prompt: "Why structured reasoning traces keep autonomous agents on track during multi-step tool workflows.", difficulty: "Fundamental", tags: ["agents", "prompting", "orchestration"] },
      { title: "RLHF, DPO and Model Alignment", prompt: "Why Direct Preference Optimization (DPO) replaces unstable reward model training in reinforcement learning.", difficulty: "Intermediate", tags: ["rlhf", "dpo", "alignment"] },
      { title: "Prompt Injection & Jailbreak Defenses", prompt: "How indirect prompt injections hijack tool-using agents and how to enforce input/output guardrails.", difficulty: "Intermediate", tags: ["security", "prompt-injection", "safety"] },
      { title: "Evaluating LLMs: Evals, Benchmarks and Hallucinations", prompt: "Why human evals and domain-specific test harnesses beat public leaderboard benchmarks (MMLU).", difficulty: "Intermediate", tags: ["evals", "benchmarks", "testing"] },
      { title: "Fine-Tuning: LoRA and QLoRA Techniques", prompt: "How low-rank adaptation matrix decomposition trains massive models on a single consumer GPU.", difficulty: "Intermediate", tags: ["lora", "fine-tuning", "gpu"] },
      { title: "Mixture of Experts (MoE) Architecture", prompt: "How gating networks route incoming tokens to specialized sub-networks to scale parameter count cheaply.", difficulty: "Advanced", tags: ["moe", "deep-learning", "scaling"] },
      { title: "Long-Context Extrapolation: RoPE vs YaRN", prompt: "Why Rotary Position Embeddings enable models to generalize to 100k+ token context windows.", difficulty: "Advanced", tags: ["rope", "context-length", "math"] },
      { title: "Local On-Device AI Models (Ollama, WebLLM)", prompt: "Running 2B to 8B parameter models locally on laptops with Apple Metal or WebGPU for privacy.", difficulty: "Fundamental", tags: ["local-ai", "ollama", "webgpu"] },
      { title: "Semantic Caching & Token Cost Optimization", prompt: "Using similarity thresholds on vector caches to avoid calling expensive LLM APIs for repeated queries.", difficulty: "Fundamental", tags: ["caching", "finops", "tokens"] },
    ],
    angles: [
      { label: "Production Engineering", questionPrompt: "What is the biggest operational headache when deploying this in production?" },
      { label: "Latency vs Cost", questionPrompt: "How does this technique shift the balance between token cost and time-to-first-token (TTFT)?" },
      { label: "Debugging Hallucinations", questionPrompt: "How do you detect and prevent the model from confidently hallucinating answers?" },
      { label: "Real-World Architecture", questionPrompt: "Draw the mental diagram of how this integrates into a standard web backend." },
      { label: "Common Misconception", questionPrompt: "What do software developers who are new to AI get completely backwards about this?" },
      { label: "Security Threat", questionPrompt: "How could an attacker exploit this AI component to extract private data?" },
      { label: "Model Evaluation", questionPrompt: "What automated test do you write in CI/CD to prevent model drift regressions?" },
      { label: "Hardware Accelerator", questionPrompt: "How do NVIDIA Tensor Cores and Google TPUs execute this math natively?" },
      { label: "Open-Source vs API", questionPrompt: "When should a company run open-source models vs calling proprietary APIs?" },
      { label: "Data Quality", questionPrompt: "Why is high-quality synthetic data outperforming massive scraped internet data?" },
      { label: "User Experience", questionPrompt: "How should the frontend stream tokens to feel responsive rather than sluggish?" },
      { label: "Future 2026 Trend", questionPrompt: "How has this field evolved in the last 12 months?" },
      { label: "Rule of Thumb", questionPrompt: "What is your practical rule of thumb when choosing between RAG and fine-tuning?" },
      { label: "Token Budgeting", questionPrompt: "How do you prevent agentic loops from burning $50 in API tokens on a single task?" },
      { label: "Simplicity First", questionPrompt: "Why is a simple well-crafted prompt often better than a complex multi-agent framework?" },
      { label: "Punchline", questionPrompt: "What memorable sentence should summarize your presentation?" },
    ],
  },
  "Frontend & Web Performance": {
    prefix: "fe",
    coreThemes: [
      { title: "Browser Rendering Pipeline: DOM, CSSOM, Layout, Paint", prompt: "Why CSS transform and opacity animations avoid CPU layout reflows and run at 60fps on the GPU.", difficulty: "Fundamental", tags: ["rendering", "dom", "browser"] },
      { title: "Core Web Vitals: INP (Interaction to Next Paint)", prompt: "How long animation frames, heavy JavaScript execution, and microtasks hurt interactive responsiveness.", difficulty: "Intermediate", tags: ["web-vitals", "inp", "performance"] },
      { title: "React Server Components (RSC) vs SSR vs Islands", prompt: "How serializing component trees across the network eliminates client JavaScript bundle weight.", difficulty: "Intermediate", tags: ["react", "rsc", "nextjs"] },
      { title: "Web Workers & Comlink for Off-Thread Compute", prompt: "Why moving image processing, crypto, and heavy parsing off the main thread keeps UI fluid.", difficulty: "Intermediate", tags: ["web-workers", "performance", "threads"] },
      { title: "View Transitions API for Seamless Navigation", prompt: "How native browser page morphing animations replace complex client-side CSS transition libraries.", difficulty: "Fundamental", tags: ["view-transitions", "css", "browser"] },
      { title: "Hydration Mismatch & Resumability (Qwik / Astro)", prompt: "Why traditional full-page hydration is a double-penalty on mobile and how resumability fixes it.", difficulty: "Intermediate", tags: ["hydration", "qwik", "astro"] },
      { title: "Modern CSS: Subgrid, Container Queries, Cascade Layers", prompt: "How container queries decouple component layout responsiveness from viewport window size.", difficulty: "Fundamental", tags: ["css", "responsive", "design-systems"] },
      { title: "WebAssembly in Web Apps: Figma & Photoshop", prompt: "How compiling C++/Rust to WebAssembly allows complex desktop-grade apps to run in the browser.", difficulty: "Intermediate", tags: ["wasm", "canvas", "performance"] },
      { title: "JavaScript Memory Leaks: Closures and Event Listeners", prompt: "How forgotten DOM event listeners and detached DOM nodes quietly bloat browser tab memory.", difficulty: "Intermediate", tags: ["memory-leaks", "debugging", "javascript"] },
      { title: "State Management: Signals vs Top-Down React Rerenders", prompt: "How fine-grained reactivity in Solid, Preact, and Vue updates only the exact DOM node that changed.", difficulty: "Intermediate", tags: ["signals", "reactivity", "state"] },
      { title: "Network Waterfall Elimination: HTTP 103 Early Hints", prompt: "How preloading critical CSS and font resources eliminates render-blocking roundtrips.", difficulty: "Fundamental", tags: ["networking", "performance", "cdn"] },
      { title: "Offline-First Web Apps: Service Workers & Cache API", prompt: "Using stale-while-revalidate caching to make progressive web apps open instantly offline.", difficulty: "Fundamental", tags: ["pwa", "service-workers", "offline"] },
      { title: "Micro-Frontend Architectures: Module Federation", prompt: "The organizational benefits and runtime dependency collision risks of multi-team web apps.", difficulty: "Advanced", tags: ["micro-frontends", "webpack", "architecture"] },
      { title: "Image Formats: AVIF vs WebP vs Responsive Srcset", prompt: "How modern image compression reduces asset payloads by 70% with zero visible quality loss.", difficulty: "Fundamental", tags: ["images", "avif", "performance"] },
      { title: "Web Audio API & Synthesizers in the Browser", prompt: "Using AudioContext oscillators, gain nodes, and panners to create interactive procedural audio.", difficulty: "Intermediate", tags: ["web-audio", "sound", "apis"] },
      { title: "Accessibility (a11y) & The Screen Reader Tree", prompt: "Why correct semantic HTML and ARIA landmarks prevent broken navigation for assistive tech.", difficulty: "Fundamental", tags: ["a11y", "accessibility", "html"] },
    ],
    angles: [
      { label: "60 FPS Rule", questionPrompt: "What single mistake drops frame rates from 60fps down to 15fps on a mobile phone?" },
      { label: "Bundle Size Budget", questionPrompt: "How do you audit dependencies to prevent a 2MB JavaScript bundle bloat?" },
      { label: "DevTools Profiling", questionPrompt: "How do you use Chrome DevTools Performance panel to find the exact long task?" },
      { label: "Mobile First Reality", questionPrompt: "Why does an app feel blazing fast on an M3 MacBook but crawl on a $150 Android phone?" },
      { label: "Framework Wars", questionPrompt: "What is the genuine trade-off between React's virtual DOM and Svelte's compiler approach?" },
      { label: "User Perception", questionPrompt: "How does perceived performance (skeletons, optimistic UI) beat raw network speed?" },
      { label: "Third-Party Scripts", questionPrompt: "How do marketing tags and analytics scripts sabotage Core Web Vitals?" },
      { label: "Font Loading Strategy", questionPrompt: "How does font-display: optional eliminate Cumulative Layout Shift (CLS)?" },
      { label: "Clean CSS Architecture", questionPrompt: "Tailwind CSS utility classes vs CSS Modules: what are the real maintenance trade-offs?" },
      { label: "Form Performance", questionPrompt: "Why uncontrolled inputs with native FormData scale better than controlled useState forms?" },
      { label: "Security: XSS in Frontend", questionPrompt: "How does dangerouslySetInnerHTML open up cross-site scripting vulnerabilities?" },
      { label: "Testing UI Logic", questionPrompt: "How do Playwright component tests provide high confidence without brittle mocks?" },
      { label: "Offline Gracefulness", questionPrompt: "What should a user see when their connection drops during form submission?" },
      { label: "Real-World Analogy", questionPrompt: "What analogy explains the browser rendering pipeline to non-engineers?" },
      { label: "Senior Engineer Insight", questionPrompt: "What separates a senior frontend engineer from someone who just knows React hooks?" },
      { label: "Core Takeaway", questionPrompt: "What is the single sentence advice every frontend developer should remember?" },
    ],
  },
  "Cybersecurity & Cryptography": {
    prefix: "sec",
    coreThemes: [
      { title: "Post-Quantum Cryptography: Lattice-Based Kyber", prompt: "How the Module-LWE math problem resists quantum computer attacks from Shor's algorithm.", difficulty: "Advanced", tags: ["pqc", "quantum", "crypto"] },
      { title: "Passkeys & WebAuthn: FIDO2 Passwordless Auth", prompt: "How hardware secure enclaves and public-key cryptography eradicate phishing forever.", difficulty: "Fundamental", tags: ["passkeys", "webauthn", "security"] },
      { title: "OAuth 2.1 & OIDC: Why PKCE is Mandatory", prompt: "Why the Authorization Code flow with Proof Key for Code Exchange replaced the deprecated Implicit Grant.", difficulty: "Fundamental", tags: ["oauth", "security", "auth"] },
      { title: "eBPF Kernel Security Observability (Tetragon & Falco)", prompt: "How in-kernel eBPF probes detect privilege escalation and namespace escapes in real time.", difficulty: "Advanced", tags: ["ebpf", "security", "linux"] },
      { title: "Zero-Knowledge Proofs: zk-SNARKs vs zk-STARKs", prompt: "How mathematical proofs verify statement truth without revealing the underlying secret data.", difficulty: "Advanced", tags: ["zkp", "cryptography", "privacy"] },
      { title: "Software Supply Chain Security: SLSA & Sigstore", prompt: "How cryptographic container signing and build provenance prevent solarwinds-style attacks.", difficulty: "Intermediate", tags: ["supply-chain", "slsa", "sigstore"] },
      { title: "Memory Safety Bugs: Use-After-Free & Buffer Overflows", prompt: "Why 70% of historical CVEs stem from memory unsafety and why the NSA recommends Rust.", difficulty: "Fundamental", tags: ["memory-safety", "cve", "rust"] },
      { title: "Content Security Policy (CSP) v3 & Nonces", prompt: "Why strict nonce-based CSP headers are the only reliable defense against DOM-based XSS.", difficulty: "Fundamental", tags: ["csp", "xss", "web-security"] },
      { title: "Secrets Management & Vault Dynamic Leases", prompt: "Why static production database credentials are an anti-pattern and how short-lived leases work.", difficulty: "Intermediate", tags: ["vault", "secrets", "devops"] },
      { title: "Mutual TLS (mTLS) & SPIFFE Zero-Trust Identities", prompt: "How cryptographic SVID certificates verify workload identity across microservice meshes.", difficulty: "Advanced", tags: ["mtls", "spiffe", "zerotrust"] },
      { title: "SQL Injection: Why Prepared Statements Work", prompt: "The fundamental distinction between SQL code compilation and parameterized query data.", difficulty: "Fundamental", tags: ["sql-injection", "security", "databases"] },
      { title: "Cross-Site Request Forgery (CSRF) & SameSite Cookies", prompt: "How SameSite=Lax/Strict cookie attributes closed the traditional CSRF attack vector.", difficulty: "Fundamental", tags: ["csrf", "cookies", "security"] },
      { title: "End-to-End Encryption (E2EE) & Signal Protocol", prompt: "How the Double Ratchet Algorithm provides forward secrecy and post-compromise security.", difficulty: "Advanced", tags: ["encryption", "signal", "privacy"] },
      { title: "DDoS Mitigation: SYN Cookies & BGP Anycast", prompt: "How server kernels absorb SYN flood attacks without allocating memory state.", difficulty: "Intermediate", tags: ["ddos", "networking", "security"] },
      { title: "Secure Hashing: Argon2 vs bcrypt vs PBKDF2", prompt: "Why fast hashing algorithms (MD5/SHA256) are disastrous for passwords and why memory-hardness matters.", difficulty: "Fundamental", tags: ["passwords", "hashing", "argon2"] },
      { title: "Threat Modeling with the STRIDE Methodology", prompt: "Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.", difficulty: "Intermediate", tags: ["threat-modeling", "stride", "architecture"] },
    ],
    angles: [
      { label: "Attack Vector", questionPrompt: "How would a malicious actor actually exploit this weakness in practice?" },
      { label: "Defense in Depth", questionPrompt: "Why is relying on a single layer of security here a recipe for disaster?" },
      { label: "Developer Mistake", questionPrompt: "What is the innocent code snippet developers write that creates this vulnerability?" },
      { label: "Incident Response", questionPrompt: "What is your emergency playbook when this security control is breached?" },
      { label: "Compliance & Audits", questionPrompt: "How does this satisfy SOC2 Type II, HIPAA, or ISO 27001 requirements?" },
      { label: "Performance Overhead", questionPrompt: "What is the CPU cycle and latency cost of encrypting this layer?" },
      { label: "Simplicity vs Security", questionPrompt: "How do you make the secure path the easiest path for developers to follow?" },
      { label: "Cryptographic Principle", questionPrompt: "What underlying mathematical principle guarantees the security proof?" },
      { label: "Zero-Trust Philosophy", questionPrompt: "Why does the 'trusted internal corporate network' perimeter model no longer work?" },
      { label: "Key Rotation Lifecycle", questionPrompt: "How are private keys rotated globally without causing an outage?" },
      { label: "Cloud IAM Pitfall", questionPrompt: "How do overly permissive cloud IAM wildcard policies lead to data leaks?" },
      { label: "Human Psychology", questionPrompt: "Why do social engineering and phishing bypass even the strongest firewalls?" },
      { label: "Open-Source Risk", questionPrompt: "How do attackers sneak malicious code into popular npm or PyPI packages?" },
      { label: "Air-Gapped Realities", questionPrompt: "How does this security measure operate when internet access is severed?" },
      { label: "Golden Security Rule", questionPrompt: "What single habit prevents 90% of security breaches in software teams?" },
      { label: "Closing Thought", questionPrompt: "What is your final piece of advice to leave the audience vigilant?" },
    ],
  },
  "System Design & Architecture": {
    prefix: "arch",
    coreThemes: [
      { title: "Monolith vs Microservices: Conway's Law in Practice", prompt: "Why team communication structure inevitably mirrors architecture, and when microservices are a disaster.", difficulty: "Intermediate", tags: ["microservices", "monolith", "architecture"] },
      { title: "The Strangler Fig Pattern: Modernizing Legacy Systems", prompt: "How to safely migrate business domains piece by piece without a catastrophic rewrite from scratch.", difficulty: "Intermediate", tags: ["strangler-fig", "legacy", "refactoring"] },
      { title: "Event-Driven Architecture vs Synchronous REST", prompt: "How asynchronous pub/sub messaging decouples services at the cost of eventual consistency.", difficulty: "Intermediate", tags: ["event-driven", "messaging", "architecture"] },
      { title: "Load Balancing: Consistent Hashing vs Least Connections", prompt: "Comparing round-robin, IP hash, least response time, and Maglev algorithms.", difficulty: "Fundamental", tags: ["load-balancing", "networking", "scalability"] },
      { title: "Designing for High Availability: 99.9% vs 99.999%", prompt: "The exponential cost curve of chasing 'five nines' availability (5 minutes downtime per year).", difficulty: "Intermediate", tags: ["availability", "sla", "sre"] },
      { title: "Content Delivery Networks (CDNs) & Edge Compute", prompt: "How edge caching, Anycast routing, and serverless edge functions slash global latency.", difficulty: "Fundamental", tags: ["cdn", "edge", "networking"] },
      { title: "CQRS (Command Query Responsibility Segregation)", prompt: "Separating write-optimized transactional models from read-optimized analytical projections.", difficulty: "Advanced", tags: ["cqrs", "event-sourcing", "architecture"] },
      { title: "Database Sharding vs Read Replicas", prompt: "When read replicas are enough, and when horizontal sharding becomes unavoidable.", difficulty: "Intermediate", tags: ["sharding", "replicas", "databases"] },
      { title: "Architectural Decision Records (ADRs) & RFC Culture", prompt: "How writing down architecture decisions prevents organizational amnesia and political debates.", difficulty: "Fundamental", tags: ["adr", "rfc", "documentation"] },
      { title: "Domain-Driven Design (DDD): Bounded Contexts", prompt: "Why different departments need different definitions of the same entity (e.g. 'User' in Billing vs Support).", difficulty: "Intermediate", tags: ["ddd", "architecture", "domain-design"] },
      { title: "Rate Limiting & Throttling at Scale", prompt: "Token bucket, leaky bucket, and fixed window algorithms to protect services from bad actors.", difficulty: "Fundamental", tags: ["rate-limiting", "scalability", "security"] },
      { title: "Backpressure Management in Streaming Systems", prompt: "How downstream consumer feedback prevents out-of-memory crashes during 10x traffic spikes.", difficulty: "Intermediate", tags: ["backpressure", "streaming", "reliability"] },
      { title: "Disaster Recovery: Active-Passive vs Active-Active", prompt: "Comparing cold standby, warm standby, and multi-region active-active failover mechanisms.", difficulty: "Intermediate", tags: ["disaster-recovery", "cloud", "resilience"] },
      { title: "Designing a URL Shortener (Bitly System Design)", prompt: "Base62 encoding, distributed ID generation (Snowflake), and high-read caching strategies.", difficulty: "Fundamental", tags: ["system-design", "interviews", "bitly"] },
      { title: "Designing a Real-Time Chat System (WhatsApp/Slack)", prompt: "WebSockets, presence servers, message queues, and multi-device synchronization.", difficulty: "Intermediate", tags: ["system-design", "chat", "websockets"] },
      { title: "Designing a Distributed Job Scheduler (Quartz/Celery)", prompt: "Leader election, delayed execution, worker heartbeats, and at-least-once task delivery.", difficulty: "Intermediate", tags: ["system-design", "queues", "jobs"] },
    ],
    angles: [
      { label: "Step 1: Clarifying Scope", questionPrompt: "What questions must you ask first before proposing an architecture?" },
      { label: "Back-of-the-Envelope Math", questionPrompt: "Estimate storage, QPS, and network bandwidth requirements." },
      { label: "Single Point of Failure (SPOF)", questionPrompt: "Where is the single point of failure and how do you eliminate it?" },
      { label: "Database Choice", questionPrompt: "Why choose SQL or NoSQL for this specific data access pattern?" },
      { label: "Bottleneck Analysis", questionPrompt: "When traffic multiplies by 10x, what component breaks first?" },
      { label: "Simplicity Principle", questionPrompt: "How can you cut the number of moving parts in half while achieving 95% of goals?" },
      { label: "Operational Overhead", questionPrompt: "Who is on call when this complex architecture misbehaves at 3 AM?" },
      { label: "Cost Optimization", questionPrompt: "How do you prevent this system design from racking up a $50k/mo cloud bill?" },
      { label: "Component Diagram", questionPrompt: "Walk through the request flow from client to CDN to gateway to service to DB." },
      { label: "Graceful Degradation", questionPrompt: "What non-critical features turn off automatically under peak overload?" },
      { label: "Idempotency & Retries", questionPrompt: "What happens if a network timeout occurs right after processing an order?" },
      { label: "Team Scalability", questionPrompt: "How does this architecture allow 5 autonomous engineering squads to work without stepping on toes?" },
      { label: "Monitoring & SLIs", questionPrompt: "What are the 3 golden signals you put on your main executive dashboard?" },
      { label: "Legacy Modernization", questionPrompt: "How do you roll this out safely without a risky big-bang release?" },
      { label: "System Design Interview Tip", questionPrompt: "What separates a senior architect candidate from an average engineer here?" },
      { label: "Core Takeaway", questionPrompt: "What is the single sentence architectural takeaway to conclude with?" },
    ],
  },
  "Mindset, Growth & Leadership": {
    prefix: "lead",
    coreThemes: [
      { title: "Deep Work vs Shallow Work for Engineers", prompt: "Why 4 uninterrupted hours of deep coding beats 8 hours of meeting-fragmented context switching.", difficulty: "Fundamental", tags: ["deep-work", "focus", "productivity"] },
      { title: "Overcoming Imposter Syndrome in Tech", prompt: "Recognizing that software engineering is too vast for anyone to know everything, and embracing curiosity.", difficulty: "Reflective", tags: ["confidence", "career", "growth"] },
      { title: "Staff+ Engineering: Influence Without Authority", prompt: "How principal engineers align cross-team technical strategy through writing and mentorship.", difficulty: "Intermediate", tags: ["staff-eng", "leadership", "career"] },
      { title: "The Art of Constructive Code Reviews", prompt: "Reviewing code for correctness, clarity, and architecture without nitpicking or demoralizing peers.", difficulty: "Fundamental", tags: ["code-review", "culture", "empathy"] },
      { title: "Managing Technical Debt and Refactoring Budgets", prompt: "How high-performing teams negotiate a permanent 20% engineering capacity allocation for maintenance.", difficulty: "Fundamental", tags: ["tech-debt", "planning", "refactoring"] },
      { title: "Blameless Postmortems & Psychological Safety", prompt: "Why punishing human error guarantees that systemic flaws remain hidden until catastrophic failures.", difficulty: "Fundamental", tags: ["postmortems", "sre", "culture"] },
      { title: "Preventing On-Call Burnout in Engineering Teams", prompt: "Sustainable rotation structures, actionable alerts, and compensating engineers for 24/7 on-call.", difficulty: "Fundamental", tags: ["on-call", "sre", "burnout"] },
      { title: "DORA Metrics: Measuring Engineering Velocity", prompt: "Deployment frequency, lead time for changes, change failure rate, and time to restore service.", difficulty: "Fundamental", tags: ["dora", "metrics", "productivity"] },
      { title: "Writing Clear Technical Documentation & RFCs", prompt: "Why writing down proposals forces rigorous thinking and aligns stakeholders before code is written.", difficulty: "Fundamental", tags: ["writing", "rfcs", "communication"] },
      { title: "First Principles Thinking in Debugging", prompt: "Isolating assumptions, testing hypotheses scientifically, and avoiding blind stack overflow copy-pasting.", difficulty: "Intermediate", tags: ["debugging", "thinking", "problem-solving"] },
      { title: "Career Pivots & Skill Stacking in Software", prompt: "Why being in the top 20% of two complementary fields (e.g. backend + ML) beats being top 1% in one.", difficulty: "Intermediate", tags: ["career", "skills", "growth"] },
      { title: "Atomic Habits for Software Engineers", prompt: "How small daily habits (reading code, 1 commit a day, clean desk) compound over a 10-year career.", difficulty: "Beginner", tags: ["habits", "discipline", "growth"] },
      { title: "Public Speaking for Introverted Developers", prompt: "Reframing conference talks and video journals as teaching tools rather than ego performances.", difficulty: "Beginner", tags: ["public-speaking", "confidence", "presentation"] },
      { title: "Managing Up and Working with Product Managers", prompt: "Translating technical constraints into business risks and ROI that non-engineers understand.", difficulty: "Fundamental", tags: ["management", "communication", "product"] },
      { title: "The Senior Engineer Mindset: Knowing When NOT to Build", prompt: "Why the best line of code is the line you never had to write, deploy, or maintain.", difficulty: "Reflective", tags: ["simplicity", "wisdom", "seniority"] },
      { title: "Navigating AI Disruption as a Software Engineer", prompt: "Focusing on problem formulation, system architecture, and domain judgment rather than boilerplate syntax.", difficulty: "Reflective", tags: ["ai", "future-of-work", "career"] },
    ],
    angles: [
      { label: "Actionable Daily Routine", questionPrompt: "What is one small habit you can adopt today to make this effortless?" },
      { label: "Overcoming Resistance", questionPrompt: "How do you push through days when you feel stuck or unmotivated?" },
      { label: "Mentoring Others", questionPrompt: "How would you explain this lesson to a junior engineer joining your team?" },
      { label: "Culture Shift", questionPrompt: "How can one individual start shifting an entire engineering team's culture in this direction?" },
      { label: "Common Pitfall", questionPrompt: "What is the biggest mistake engineers make when trying to apply this?" },
      { label: "Personal Reflection", questionPrompt: "How has your perspective on this changed over your career journey?" },
      { label: "Handling Disagreement", questionPrompt: "How do you navigate conflict when someone strongly opposes this approach?" },
      { label: "Burnout Red Flags", questionPrompt: "What early warning signs tell you that you or a teammate are heading towards exhaustion?" },
      { label: "Communication Formula", questionPrompt: "What sentence formula can you use to communicate this to executive leadership?" },
      { label: "Balancing Ideals with Reality", questionPrompt: "How do you balance high engineering standards with tight business deadlines?" },
      { label: "Career Longevity", questionPrompt: "How does this mindset prepare you to stay relevant and happy in tech for the next 20 years?" },
      { label: "Simplicity is Genius", questionPrompt: "Why does true senior wisdom always lean towards radical simplicity?" },
      { label: "The Human Element", questionPrompt: "Why is emotional intelligence (EQ) just as critical as technical skill in senior engineering?" },
      { label: "Measuring True Progress", questionPrompt: "How do you measure growth in this area beyond vanity metrics?" },
      { label: "Memorable Story", questionPrompt: "What personal or historical story best illustrates this lesson in action?" },
      { label: "Inspiring Closing", questionPrompt: "What is your concluding sentence to leave fellow engineers motivated?" },
    ],
  },
};

// Generate 9 Categories * 16 Core Themes * 16 Angles = 2,304 deeply curated topics!
export function generateCuratedTopics(): TechTopic[] {
  const catalog: TechTopic[] = [];

  for (const category of CATEGORIES) {
    const domain = domainTemplates[category];
    if (!domain) continue;

    let counter = 1;

    for (const theme of domain.coreThemes) {
      for (const angle of domain.angles) {
        const id = `${domain.prefix}-${String(counter).padStart(3, "0")}`;
        const title = `${theme.title}: ${angle.label}`;
        const researchQuestion = `${theme.prompt} Discussion Prompt: ${angle.questionPrompt}`;
        const keywords = Array.from(
          new Set([
            ...theme.tags,
            angle.label.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            category.toLowerCase().split(" ")[0],
          ])
        ).slice(0, 4);

        catalog.push({
          id,
          title,
          category,
          difficulty: theme.difficulty,
          researchQuestion,
          keywords,
        });

        counter++;
      }
    }
  }

  return catalog;
}

export const ALL_CURATED_TOPICS: TechTopic[] = generateCuratedTopics();
