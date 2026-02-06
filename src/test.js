import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey:
    process.env.ANTHROPIC_API_KEY ||
    "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",
});

const res = await anthropic.messages.create({
  model: "claude-3-haiku-20240307",
  max_tokens: 300,
  messages: [{ role: "user", content: "Explain REST APIs in simple terms" }],
});

console.log(res.content[0].text);
