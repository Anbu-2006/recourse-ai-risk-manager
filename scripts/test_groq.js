const fs = require('fs');
const { Groq } = require('groq-sdk');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('\n').find(l => l.startsWith('GROQ_API_KEY=')).split('=')[1].trim();
const groq = new Groq({ apiKey: key });

async function test() {
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
  for (const m of models) {
    try {
      const res = await groq.chat.completions.create({
        model: m,
        messages: [{ role: 'user', content: 'Extract to JSON: {"category": "Groceries", "cap": 500}' }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      console.log('Model', m, 'SUCCESS:', res.choices[0].message.content);
      return m;
    } catch (e) {
      console.log('Model', m, 'failed:', e.message);
    }
  }
}

test();
