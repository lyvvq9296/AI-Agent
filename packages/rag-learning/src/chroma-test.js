import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { ChromaClient } from "chromadb";
import "dotenv/config";

// 配置本地ChromaDB连接
const client = new ChromaClient();

// 创建向量数据库 Chroma 客户端
let collection;
try {
  collection = await client.createCollection({
    name: "test_collection",
  });
} catch (error) {
  // console.log("Collection already exists:", error);
  collection = await client.getCollection({
    name: "test_collection",
  });
}

//  2. 文档向量化, 利用阿里通义千问大模型
const embedder = new AlibabaTongyiEmbeddings({});
const documents = ["This is a document about pineapple", "This is a document about oranges"];
const documentEmbeddings = await Promise.all(documents.map((doc) => embedder.embedQuery(doc)));

//  3. 文档向量化结果存储到 Chroma 向量数据库
await collection.add({
  ids: ["id1", "id2"],
  documents,
  embeddings: documentEmbeddings,
});

//  4. 文档检索
// 4.1 查询向量化
const queryText = "This is a query document about hawaii";
const queryEmbedding = await embedder.embedQuery(queryText);

// 4.2 在向量数据库汇总检索查询向量
const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 2, // how many results to return
});
console.log("Query results:", results);
