---
description: "Fase 4 — Audita conformidade com SPEC.md, segurança, Swagger. Veredicto binário: APROVADO ou ALTERAÇÕES NECESSÁRIAS."
tools:
  - codebase
  - editFiles
  - runCommands
  - problems
---

# Phase 4 — Validation

Revisão final antes do merge. Todo veredicto é baseado em `.github/SPEC.md` e evidência de código — não opinião.

## Fluxo

Execute todas as verificações em ordem. Para cada item: **APROVADO** (com evidência) ou **REPROVADO** (com arquivo:linha e seção da spec).

---

### 1. Testes e Cobertura

```bash
npm test -- --coverage 2>&1
```

| Check | Critério |
|-------|----------|
| Testes | 0 falhando |
| Linhas | >= 80% |
| Branches | >= 75% |

### 2. Build

```bash
npm run build 2>&1
```
Zero erros → APROVADO.

### 3. Validação — SPEC.md §3

Leia `services/summaryService.ts`. Encontre a linha exata de cada regra:

| Regra | Ref | Evidência |
|-------|-----|-----------|
| Tamanho antes de extensão/MIME | §3.2 | linha X |
| Extensão .txt/.docx | §3.3 | linha X |
| MIME na lista | §3.3 | linha X |
| Cruzada MIME/extensão | §3.3 | linha X |
| Buffer vazio | §3.4 | linha X |
| maxLength [50, 2000] | §3.5 | linha X |
| maxLength NaN rejeitado | §3.5 | linha X |
| Regex BCP-47 | §3.5 | linha X |
| Falha .docx capturada | §3.6 | linha X |

### 4. Resposta — SPEC.md §2.3

Verificar os 6 campos no retorno do controller:
- `summary`: string
- `originalLength`: number  
- `summaryLength`: number (=== summary.length)
- `language`: string (ecoa request)
- `model`: string (não vazio)
- `processingTimeMs`: inteiro >= 0

### 5. Erros — SPEC.md §2.4

Leia `controllers/summaryController.ts`. Para cada error.code:

| code | HTTP | Shape correto | Sem stack trace |
|------|------|---------------|-----------------|
| NO_FILE | 400 | ? | ? |
| INVALID_PARAMETER | 400 | ? | ? |
| EMPTY_FILE | 400 | ? | ? |
| FILE_TOO_LARGE | 413 | ? | ? |
| UNSUPPORTED_MEDIA_TYPE | 415 | ? | ? |
| EXTRACTION_FAILED | 422 | ? | ? |
| UNPROCESSABLE_CONTENT | 422 | ? | ? |
| INTERNAL_ERROR | 500 | ? | ? |

Shape correto: `{ "error": { "code": "...", "message": "..." } }` — sem campos extras.

### 6. Segurança

```bash
grep -rn "AIza\|gemini.*=.*['\"]" --include="*.ts" . | grep -v ".env\|process.env"
grep -rn "writeFile\|writeFileSync\|createWriteStream" --include="*.ts" . | grep -v "node_modules\|tests"
grep -rn "console\.log.*text\|console\.log.*summary\|console\.log.*content" --include="*.ts" . | grep -v "node_modules\|tests"
```
Saída vazia em cada → APROVADO.

### 7. Swagger

Leia `routes/index.ts` e verifique:
- 3 campos de request documentados
- 6 campos de resposta de sucesso
- 5 status de erro (400, 413, 415, 422, 500)
- `$ref` usado para ErrorResponse

### 8. Não-funcionais — SPEC.md §6

- Timeout Gemini 30s → APROVADO / REPROVADO
- `GEMINI_API_KEY` apenas de `process.env` → APROVADO / REPROVADO
- Nenhum byte em disco → APROVADO / REPROVADO

---

## Veredicto

```
## Relatório — Fase 4

### APROVADO
- [check com evidência]

### REPROVADO
- [check com arquivo:linha e §spec]

### Veredicto: APROVADO / ALTERAÇÕES NECESSÁRIAS

Bloqueantes: N
  1. [problema] — SPEC.md §X — [arquivo]

Não-bloqueantes:
  1. [observação]
```

## Regras

- Todo APROVADO cita evidência (arquivo + linha ou saída de comando).
- Check ausente = REPROVADO.
- `INTERNAL_ERROR` nunca expõe detalhes internos.
- Veredicto binário: APROVADO ou ALTERAÇÕES NECESSÁRIAS.
