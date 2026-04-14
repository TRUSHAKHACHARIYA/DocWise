import { retrieveContext } from "../backend/src/services/retriever";

async function testRetrieval() {
  const userId = "test-user-id";
  const question = "How does the ingestion pipeline work?";

  console.log(`--- Testing Retrieval for: "${question}" ---`);
  
  try {
    const results = await retrieveContext(userId, question);

    if (results.length === 0) {
      console.log("No results found. (Did you index any documents yet?)");
    } else {
      results.forEach((res, i) => {
        console.log(`\nMatch ${i + 1} (Score: ${res.score.toFixed(4)})`);
        console.log(`Document: ${res.documentId}`);
        console.log(`Content: ${res.text.substring(0, 150)}...`);
      });
    }
  } catch (error: any) {
    console.error("Retrieval failed:", error.message);
  }
}

testRetrieval();
