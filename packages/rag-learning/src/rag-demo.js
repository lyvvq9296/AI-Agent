import fs from "fs";
import pdf from "pdf-parse";
import { ChromaClient } from "chromadb";
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import "dotenv/config";

class RAGDemo {
  constructor() {
    this.client = new ChromaClient();
    this.embedder = new AlibabaTongyiEmbeddings({});
    this.collectionName = "nke-10k-2023";
  }

  // 1. 加载PDF文件内容
  async loadPDF(filePath) {
    console.log("正在加载PDF文件...");
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      console.log(`PDF加载成功，总页数: ${data.numpages}`);
      console.log(`文本长度: ${data.text.length} 字符`);
      return data.text;
    } catch (error) {
      console.error("PDF加载失败:", error);
      throw error;
    }
  }

  // 2. 拆分文本为chunk（每部分1000字，重叠200字）
  splitText(text, chunkSize = 1000, overlap = 200) {
    console.log("正在拆分文本...");
    const chunks = [];
    const textLength = text.length;
    let start = 0;

    while (start < textLength) {
      const end = Math.min(start + chunkSize, textLength);
      const chunk = text.substring(start, end);

      chunks.push({
        text: chunk,
        start: start,
        end: end,
      });

      // 移动到下一个chunk，考虑重叠
      start += chunkSize - overlap;

      // 如果剩余文本不足chunkSize，但还有内容，则创建最后一个chunk
      if (start >= textLength && end < textLength) {
        const lastChunk = text.substring(textLength - chunkSize, textLength);
        chunks.push({
          text: lastChunk,
          start: textLength - chunkSize,
          end: textLength,
        });
      }
    }

    console.log(`文本拆分完成，共生成 ${chunks.length} 个chunk`);
    return chunks;
  }

  // 3. 转换为embedding向量
  async generateEmbeddings(chunks) {
    console.log("正在生成embedding向量...");
    const embeddings = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await this.embedder.embedQuery(chunk.text);
        embeddings.push(embedding);
        console.log(`已生成第 ${i + 1}/${chunks.length} 个embedding`);
      } catch (error) {
        console.error(`生成第 ${i + 1} 个embedding失败:`, error);
        // 使用零向量作为fallback
        embeddings.push(new Array(1536).fill(0));
      }
    }

    console.log("Embedding生成完成");
    return embeddings;
  }

  // 4. 存储到本地Chroma数据库
  async storeToChroma(chunks, embeddings) {
    console.log("正在存储到Chroma数据库...");

    let collection;
    try {
      // 尝试创建新的collection
      collection = await this.client.createCollection({
        name: this.collectionName,
      });
      console.log("创建新的collection");
    } catch (error) {
      // 如果已存在，则获取现有collection
      collection = await this.client.getCollection({
        name: this.collectionName,
      });
      console.log("使用现有collection");
    }

    // 准备数据
    const ids = chunks.map((_, index) => `chunk_${index}`);
    const documents = chunks.map((chunk) => chunk.text);
    const metadatas = chunks.map((chunk) => ({
      start: chunk.start,
      end: chunk.end,
      length: chunk.text.length,
    }));

    // 存储到Chroma
    await collection.add({
      ids,
      documents,
      embeddings,
      metadatas,
    });

    console.log(`成功存储 ${chunks.length} 个文档到Chroma数据库`);
    return collection;
  }

  // 5. 检索功能
  async search(collection, query, nResults = 3) {
    console.log(`\n执行检索: "${query}"`);

    try {
      // 生成查询的embedding
      const queryEmbedding = await this.embedder.embedQuery(query);

      // 在向量数据库中检索
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults,
      });

      console.log(`检索到 ${results.documents[0].length} 个相关文档:`);

      results.documents[0].forEach((doc, index) => {
        console.log(`\n--- 结果 ${index + 1} ---`);
        console.log(`相似度: ${results.distances[0][index].toFixed(4)}`);
        console.log(`文档ID: ${results.ids[0][index]}`);
        console.log(`文档内容 (前200字符): ${doc.substring(0, 200)}...`);
      });

      return results;
    } catch (error) {
      console.error("检索失败:", error);
      throw error;
    }
  }

  // 主函数：执行完整的RAG流程
  async run() {
    console.log("=== RAG功能演示开始 ===\n");

    try {
      // 1. 加载PDF
      const pdfText = await this.loadPDF("./files/nke-10k-2023.pdf");

      // 2. 拆分文本
      const chunks = this.splitText(pdfText, 1000, 200);

      // 3. 生成embedding
      const embeddings = await this.generateEmbeddings(chunks);

      // 4. 存储到Chroma
      const collection = await this.storeToChroma(chunks, embeddings);

      // 5. 执行两次检索演示
      console.log("\n=== 检索演示 ===");

      // 第一次检索：财务相关
      await this.search(collection, "财务业绩和收入");

      // 第二次检索：产品相关
      await this.search(collection, "运动鞋和服装产品");

      console.log("\n=== RAG功能演示完成 ===");
    } catch (error) {
      console.error("RAG流程执行失败:", error);
    }
  }
}

// 执行演示
const demo = new RAGDemo();
demo.run().catch(console.error);
