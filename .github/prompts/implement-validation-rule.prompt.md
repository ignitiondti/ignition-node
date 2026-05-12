---
description: Implementa uma regra de validação específica em summaryService.ts. Preencha os detalhes da regra e anexe a seção da spec.
---

# Prompt: Implementar Regra de Validação

Anexe: `docs/SPEC.md`, `services/summaryService.ts`, `types/AppError.ts`

---

Usando `docs/SPEC.md §[SEÇÃO]`, implemente a verificação `[NOME_DA_REGRA]` em `services/summaryService.ts`.

- Lance `AppError` com `code: '[CODIGO_ERRO]'`, `statusCode: [STATUS_HTTP]`
- A mensagem NÃO deve revelar detalhes internos
- Esta verificação roda [ANTES/DEPOIS] da verificação de [VERIFICACAO_ADJACENTE]
- NÃO altere nenhuma outra função
- NÃO adicione console.log com conteúdo do arquivo
- `npm run build` deve passar após a alteração
