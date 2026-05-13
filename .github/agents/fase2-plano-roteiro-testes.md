---
description: "Fase 2 — Lê docs/CODING_PLAN.md e gera docs/TEST_PLAN.md como roteiro de testes. Não escreve código."
tools:
  - codebase
  - editFiles
---

# Phase 2 — Test Plan

Você recebe `docs/CODING_PLAN.md`. Produza `docs/TEST_PLAN.md` — um roteiro de testes completo. **Não escreva código de teste.** Isso é responsabilidade da Fase 3.

## Fluxo

1. Leia `.github/SPEC.md` e `docs/CODING_PLAN.md`.
2. Gere `docs/TEST_PLAN.md` com todos os cenários descritos abaixo.

## Formato do TEST_PLAN.md — Roteiro de Testes

O documento deve conter tabelas estruturadas. Cada linha é um test case concreto. Use o formato abaixo:

### Seção 1 — validateFile

| ID | Cenário | Entrada | Resultado esperado | Error code | HTTP |
|----|---------|---------|-------------------|------------|------|
| V-01 | Arquivo ausente | `file: undefined` | Lança AppError | `NO_FILE` | 400 |
| V-02 | Arquivo > 10MB | Buffer 10MB+1 byte | Lança AppError | `FILE_TOO_LARGE` | 413 |
| V-03 | Extensão inválida (.pdf) | arquivo.pdf | Lança AppError | `UNSUPPORTED_MEDIA_TYPE` | 415 |
| V-04 | MIME inválido | .txt com MIME errado | Lança AppError | `UNSUPPORTED_MEDIA_TYPE` | 415 |
| V-05 | MIME/extensão incompatíveis | .txt com MIME de .docx | Lança AppError | `UNSUPPORTED_MEDIA_TYPE` | 415 |
| V-06 | Arquivo vazio (0 bytes) | Buffer vazio | Lança AppError | `EMPTY_FILE` | 400 |
| V-07 | maxLength fora do range | maxLength=10 | Lança AppError | `INVALID_PARAMETER` | 400 |
| V-08 | maxLength NaN | maxLength="abc" | Lança AppError | `INVALID_PARAMETER` | 400 |
| V-09 | language inválido | language="!!!" | Lança AppError | `INVALID_PARAMETER` | 400 |
| V-10 | .txt válido | sample.txt, text/plain | Passa sem erro | — | — |
| V-11 | .docx válido | sample.docx, MIME correto | Passa sem erro | — | — |

### Seção 2 — geminiService

| ID | Cenário | Setup | Resultado esperado |
|----|---------|-------|-------------------|
| G-01 | Caminho feliz | SDK retorna texto | Retorna string do resumo |
| G-02 | API key ausente | `GEMINI_API_KEY` undefined | Lança erro |
| G-03 | SDK lança erro | Mock rejeita | Propaga erro |
| G-04 | Resposta vazia | SDK retorna "" | Lança AppError `UNPROCESSABLE_CONTENT` 422 |

### Seção 3 — summarizeFile

| ID | Cenário | Setup | Resultado esperado |
|----|---------|-------|-------------------|
| S-01 | .txt caminho feliz | texto válido, Gemini ok | Retorna objeto com 6 campos |
| S-02 | .docx caminho feliz | docx válido, Gemini ok | Retorna objeto com 6 campos |
| S-03 | Texto vazio pós-extração | fileService retorna "" | Lança AppError `EMPTY_FILE` 400 |
| S-04 | Gemini falha | geminiService rejeita | Propaga erro |
| S-05 | processingTimeMs válido | qualquer input ok | campo é inteiro >= 0 |

### Seção 4 — Controller

| ID | Cenário | Request | Resposta esperada |
|----|---------|---------|------------------|
| C-01 | Sem arquivo | POST sem file | 400 `NO_FILE` |
| C-02 | Sucesso | POST com .txt válido | 200 com 6 campos |
| C-03 | AppError do serviço | serviço lança AppError | Status correto + `{ error: { code, message } }` |
| C-04 | Erro genérico | serviço lança Error | 500 `INTERNAL_ERROR` sem detalhes internos |

### Seção 5 — Contrato de resposta

| ID | Cenário | Verificação |
|----|---------|------------|
| R-01 | Shape SummaryResponse | Tem exatamente: summary, originalLength, summaryLength, language, model, processingTimeMs |
| R-02 | Shape ErrorResponse | Tem exatamente: `{ error: { code, message } }` |
| R-03 | summaryLength coerente | `summaryLength === summary.length` |
| R-04 | language ecoa entrada | language da resposta === language do request |

## Saída

Após gerar o arquivo, exiba:

```
## Fase 2 concluída

Arquivo: docs/TEST_PLAN.md
Total de cenários: X

Próximo: @phase3-development com docs/CODING_PLAN.md + docs/TEST_PLAN.md
```

## Regras

- O TEST_PLAN.md é um documento de roteiro — **não contém código**.
- Todo `error.code` deve ser exato conforme SPEC.md §2.4.
- Cada cenário de validação de SPEC.md §3 deve ter pelo menos um test case.
- Nenhum campo pode conter "???" ou "A DEFINIR".
