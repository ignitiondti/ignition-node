---
description: Implementa a chamada ao Gemini em geminiService.ts usando o design de prompt do CODING_PLAN.md §5.
---

# Prompt: Implementar Serviço Gemini

Anexe: `.github/SPEC.md §5`, `docs/CODING_PLAN.md §5`, `services/geminiService.ts`

---

Atualize `services/geminiService.ts`:

- Nova assinatura: `generateContentFromGemini(input: { text: string; language: string; maxLength: number }): Promise<string>`
- Modelo: `gemini-2.0-flash`
- Use o system prompt e o user prompt do `docs/CODING_PLAN.md §5` exatamente
- Adicione timeout de 30 segundos via AbortSignal
- Se o resultado for string vazia → lance `AppError('UNPROCESSABLE_CONTENT', 422, ...)`
- `GEMINI_API_KEY` apenas de `process.env` — nunca hardcoded
- NÃO logue o parâmetro `text`
