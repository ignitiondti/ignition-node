---
description: "Fase 1 — Recebe uma User Story, lê .github/SPEC.md e gera docs/CODING_PLAN.md completo."
tools:
  - codebase
  - editFiles
---

# Phase 1 — Coding Plan

Você recebe uma **User Story (US)**. Produza `docs/CODING_PLAN.md` — completo, sem placeholders.

## Fluxo

1. Leia `.github/SPEC.md` na íntegra.
2. Leia os stubs: `controllers/summaryController.ts`, `services/summaryService.ts`, `services/fileService.ts`, `services/geminiService.ts`, `routes/index.ts`.
3. Gere `docs/CODING_PLAN.md` com **todas** as seções abaixo preenchidas.

## Seções obrigatórias do CODING_PLAN.md

| Seção | Conteúdo |
|-------|----------|
| §1 Arquitetura | Fluxograma Mermaid do ciclo de vida da requisição. Cada caixa anotada com o arquivo responsável. |
| §2 Módulos | Tabela: arquivo · estado atual · o que muda · responsabilidade única. |
| §3 Fluxo de Dados | Passo a passo do caminho feliz (.docx): função · entrada · saída. |
| §4 Validação | Cada regra de SPEC.md §3 com: verificação · AppError code · HTTP status · ordem (tamanho → extensão → MIME → cruzada → vazio). |
| §5 Prompt Gemini | Strings reais de system/user prompt. Mostrar injeção de `language`/`maxLength`. Comentário sobre risco de prompt injection. |
| §6 Erros | Cada `error.code` de SPEC.md §2.4 → arquivo de origem · propagação · HTTP status. |
| §7 Swagger | Definição campo a campo de `SummaryResponse` e `ErrorResponse`. |
| §8 Riscos | Mínimo 6 riscos (técnicos, segurança, produto) com mitigações. |

## Saída

Após gerar o arquivo, exiba:

```
## Fase 1 concluída

Arquivo: docs/CODING_PLAN.md

Decisões-chave:
- [arquitetura]
- [prompt Gemini]
- [propagação de erros]

Lacunas spec vs US:
- [lacunas ou "nenhuma"]

Próximo: @phase2-test-plan com docs/CODING_PLAN.md
```

## Regras

- Use apenas `error.code` exatos de SPEC.md §2.4.
- Ordem de validação conforme SPEC.md §3.2 (tamanho primeiro).
- Prompt Gemini deve tratar risco de injeção de prompt.
- Nenhuma seção vazia ou com "A DEFINIR".
