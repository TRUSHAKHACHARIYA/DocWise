import * as fs from 'fs';
import * as path from 'path';
import { retrieveRelevantChunks } from '../../backend/src/services/retriever';
import { buildPrompt, getStreamingLLMResponse } from '../../backend/src/services/llm';
import { env } from '../../backend/src/config/env';

// Mocking session and user for eval purposes
const MOCK_USER_ID = "eval-user";
const MOCK_NAMESPACE = "eval-namespace";

async function runEvaluation() {
  console.log("🚀 Starting RAG Pipeline Evaluation...");
  
  const datasetPath = path.join(__dirname, '../datasets/golden_qa.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const results = [];

  for (const item of dataset) {
    console.log(`\nTesting Question: "${item.question}"`);
    
    try {
      // 1. Retrieval + Reranking
      const chunks = await retrieveRelevantChunks(item.question, MOCK_NAMESPACE, item.document_ids);
      console.log(`- Retrieved ${chunks.length} chunks.`);

      // 2. LLM Generation
      const prompt = buildPrompt(item.question, chunks);
      
      let fullResponse = "";
      // Since getStreamingLLMResponse returns a promise that resolves to the full text
      fullResponse = await getStreamingLLMResponse(prompt, (token) => {
          // Minimal progress logging
          process.stdout.write(".");
      });
      process.stdout.write("\n");

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
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  const passed = results.filter(r => r.status === "PASS").length;
  console.log(`\n✅ Eval finished! ${passed}/${results.length} tests passed basic keyword check.`);
  console.log(`📊 Full results saved to: /evals/results/latest_run.json`);
}

runEvaluation().catch(console.error);
