---
description: Escreve um único teste Jest com falha para um cenário específico antes que a funcionalidade seja implementada.
---

# Prompt: Escrever Teste Unitário com Falha

Anexe: `tests/summaryService.spec.ts`, `services/summaryService.ts`, `.github/SPEC.md §[SEÇÃO]`

---

Escreva um teste Jest **com falha** para este cenário:

- ID do Cenário: [ex: U-V-03]
- Entrada: [shape exato do UploadedFile]
- Esperado: lança AppError com `code === '[CODIGO_ERRO]'`

Regras:
- NÃO implemente a funcionalidade
- Use `toThrow(expect.objectContaining({ code: '[CODIGO_ERRO]' }))`
- O teste deve falhar quando executado — a funcionalidade ainda não existe
- Sem `.skip`, sem `.only`
