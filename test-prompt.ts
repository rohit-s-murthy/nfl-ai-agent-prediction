import { PredictionAgent } from './src/agents/predictionAgent';
import { Game } from './src/models/game';

const agent = new PredictionAgent();

// Test game: Buffalo Bills @ Kansas City Chiefs
const game = new Game('KC', 'BUF', new Date('2025-09-08'), 0, 0, 1, 2025);

console.log('🏈 GENERATING AI PROMPT FOR: Buffalo Bills @ Kansas City Chiefs');
console.log('=' .repeat(60));

// Generate quick prompt
const quickPrompt = agent.generateAIPrompt(game, 'quick');
console.log('\n📝 QUICK PROMPT:');
console.log('-' .repeat(40));
console.log(quickPrompt);

console.log('\n' + '=' .repeat(60));

// Generate comprehensive prompt (first 1000 characters)
const comprehensivePrompt = agent.generateAIPrompt(game, 'comprehensive');
console.log('\n📋 COMPREHENSIVE PROMPT (Preview):');
console.log('-' .repeat(40));
console.log(comprehensivePrompt.substring(0, 1000) + '...\n[truncated for display]');

console.log('\n' + '=' .repeat(60));

// Show prediction
const prediction = agent.generatePrediction(game);
console.log('\n🎯 PREDICTION RESULT:');
console.log(`🏆 Winner: ${prediction.predictedWinner}`);
console.log(`📊 Score: KC ${prediction.predictedScore.home}, BUF ${prediction.predictedScore.away}`);
console.log(`🎯 Confidence: ${prediction.confidence}%`);
console.log(`🔑 Key Factors: ${prediction.keyFactors.slice(0, 3).join(', ')}`);
console.log(`💭 Reasoning: ${prediction.reasoning}`);
