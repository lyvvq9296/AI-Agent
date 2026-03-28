import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { ChromaClient } from "chromadb";
import "dotenv/config";

// 配置本地ChromaDB连接
const client = new ChromaClient();
const embedder = new AlibabaTongyiEmbeddings({});

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

const documents = ["This is a document about pineapple", "This is a document about oranges"];
const documentEmbeddings = await Promise.all(documents.map((doc) => embedder.embedQuery(doc)));

await collection.add({
  ids: ["id1", "id2"],
  documents,
  embeddings: documentEmbeddings,
});

const queryText = "This is a query document about hawaii";
const queryEmbedding = await embedder.embedQuery(queryText);

const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 2, // how many results to return
});
console.log("Query results:", results);
