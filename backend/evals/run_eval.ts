import * as fs from 'fs';
import * as path from 'path';
import { retrieveRelevantChunks } from '../src/services/retriever';
import { buildPrompt, getSimpleLLMResponse } from '../src/services/llm';

// Mocking session and user for eval purposes
const MOCK_USER_ID = "eval-user";

async function runEvaluation() {
  console.log("🚀 Starting RAG Pipeline Evaluation...");
  
  const datasetPath = path.join(__dirname, 'golden_qa.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const results = [];

  for (const item of dataset) {
    console.log(`\nTesting Question: "${item.question}"`);
    
    try {
      // 1. Retrieval + Reranking (Signature: userId, question, topK, documentIds)
      const chunks = await retrieveRelevantChunks(MOCK_USER_ID, item.question, 5, item.document_ids);
      console.log(`- Retrieved ${chunks.length} chunks.`);

      // 2. Build Prompt (Signature: systemPrompt, history, newQuery, sourceChunks)
      const { systemPrompt, messages } = await buildPrompt(
        "You are a helpful assistant.",
        [],
        item.question,
        chunks
      );
      
      console.log("- Generating response...");
      const fullResponse = await getSimpleLLMResponse(systemPrompt, messages);

      // 3. Simple scoring (Exact match or keyword check for basic eval)
      const isCorrect = fullResponse.toLowerCase().includes(item.expected_answer.split(' ')[0].toLowerCase());

      results.push({
        ...item,
        actual_answer: fullResponse,
        retrieved_chunks_count: chunks.length,
        status: isCorrect ? "PASS" : "FAIL"
      });
      
    } catch (error: any) {
      console.error(`- Error testing "${item.question}":`, error.message);
    }
  }

  const resultsPath = path.join(__dirname, '../results/latest_run.json');
  const resultsDir = path.dirname(resultsPath);
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  const passed = results.filter(r => r.status === "PASS").length;
  console.log(`\n✅ Eval finished! ${passed}/${dataset.length} tests complete.`);
  console.log(`📊 Full results saved to: /evals/results/latest_run.json`);
}

runEvaluation().catch(console.error);
