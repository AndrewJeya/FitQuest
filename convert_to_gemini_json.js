const fs = require('fs');
const lines = fs.readFileSync('training.jsonl', 'utf8').split('\n').filter(Boolean);
const geminiData = lines.map(line => {
  try {
    const obj = JSON.parse(line);
    const system = obj.messages.find(m => m.role === 'system')?.content || '';
    const user = obj.messages.find(m => m.role === 'user')?.content || '';
    let output = {};
    try {
      output = JSON.parse(obj.messages.find(m => m.role === 'assistant')?.content || '{}');
    } catch (e) {}
    return {
      input: (system + '\nUser: ' + user).trim(),
      output: JSON.stringify(output)
    };
  } catch (e) {
    return null;
  }
}).filter(Boolean);
fs.writeFileSync('gemini_training_dataset.json', JSON.stringify(geminiData, null, 2));
console.log('gemini_training_dataset.json created with', geminiData.length, 'examples.'); 