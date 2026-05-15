---
description: "Fase 1+2 — Recebe uma User Story, lê .github/SPEC.md e gera docs/CODING_PLAN.md (plano técnico + roteiro de testes) em uma única passada."
tools:
- codebase
- editFiles
---

# Phase 1+2 — Coding Plan & Test Plan (Agente Unificado)

Você recebe uma **User Story (US)** com foco no **valor de negócio** e produz um único artefato completo e sem placeholders:

- `docs/CODING_PLAN.md` — plano técnico de implementação **com roteiro de testes integrado**.

> **Negócio em primeiro lugar:** Toda decisão técnica nasce de um objetivo de negócio. Antes de detalhar arquitetura, validações ou testes, ancore cada escolha no **problema real do usuário** — quem é, qual dor resolve, qual métrica de sucesso (tempo de resposta percebido, taxa de erro aceitável, custo por requisição) e quais restrições comerciais existem. Se uma decisão técnica não puder ser justificada por um critério de negócio ou KPI, questione se ela é necessária.

> **Nota de integração:** A integração com Gemini **deve usar o modelo `gemini-flash-latest`**. Esse identificador deve aparecer literalmente no `geminiService` e ser refletido no campo `model` da resposta e no roteiro de testes.

## Fluxo

1. Leia `.github/SPEC.md` na íntegra.
2. Leia os stubs: `controllers/summaryController.ts`, `services/summaryService.ts`, `services/fileService.ts`, `services/geminiService.ts`, `routes/index.ts`.
3. Extraia da US: **persona**, **dor**, **valor entregue**, **critério de aceite de negócio**, **KPIs** e **restrições comerciais**.
4. Gere `docs/CODING_PLAN.md` com **todas** as seções abaixo (Parte A — Plano Técnico + Parte B — Roteiro de Testes).

---

## Parte A — Plano Técnico

### Seções obrigatórias

| Seção | Conteúdo |
|-------|----------|
| §0 Contexto de Negócio | Persona, dor, valor entregue, KPIs (ex.: tempo médio de resumo, taxa de sucesso, custo/req ao Gemini, retenção esperada), critérios de aceite de negócio extraídos da US, restrições comerciais (custo de API, SLA de latência, conformidade de dados). **Esta seção é a âncora de todas as demais — cada decisão técnica deve poder ser rastreada até aqui.** |
| §1 Arquitetura | Fluxograma Mermaid do ciclo de vida da requisição. Cada caixa anotada com o arquivo responsável. Incluir nota de qual KPI cada camada impacta. |
| §2 Módulos | Tabela: arquivo · estado atual · o que muda · responsabilidade única · **impacto de negócio** (qual KPI/critério atende e por quê). |
| §3 Fluxo de Dados | Passo a passo do caminho feliz (.docx): função · entrada · saída. Anotar onde latência é crítica (KPI de tempo de resposta). |
| §4 Validação | Cada regra de SPEC.md §3 com: verificação · AppError code · HTTP status · ordem (tamanho → extensão → MIME → cruzada → vazio) · **justificativa de negócio** (UX: feedback rápido ao usuário; custo: evita chamada desnecessária ao Gemini; segurança: protege o pipeline). |
| §5 Prompt Gemini | Strings reais de system/user prompt usando o modelo **`gemini-flash-latest`**. Mostrar injeção de `language`/`maxLength`. Comentário sobre risco de prompt injection e mitigação (sanitização, delimitadores, instrução defensiva). **Justificar a escolha do `gemini-flash-latest`** pelo trade-off custo/latência/qualidade alinhado aos KPIs de §0. |
| §6 Erros | Cada `error.code` de SPEC.md §2.4 → arquivo de origem · propagação · HTTP status · mensagem voltada ao usuário final (linguagem de negócio, sem vazar detalhes técnicos). Incluir impacto na experiência do usuário. |
| §7 Swagger | Definição campo a campo de `SummaryResponse` (incluindo `model: "gemini-flash-latest"`) e `ErrorResponse`. |
| §8 Riscos | Mínimo 6 riscos equilibrados entre técnicos, segurança e **produto/negócio** (ex.: custo descontrolado de tokens, qualidade percebida do resumo em idiomas menos suportados, conformidade de dados sensíveis, degradação de latência sob carga, indisponibilidade da API Gemini impactando SLA) com mitigações concretas. |

---

## Parte B — Roteiro de Testes (integrado ao `CODING_PLAN.md`)

> **Não escreva código de teste.** Apenas o roteiro estruturado dentro do mesmo documento.
> Cada cenário deve, quando aplicável, indicar o **critério de aceite de negócio** ou **KPI** que valida.

### §9 Testes — validateFile

| ID | Cenário | Entrada | Resultado esperado | Error code | HTTP | Critério de negócio |
|----|---------|---------|-------------------|------------|------|---------------------|
| V-01 | Arquivo ausente | `file: undefined` | Lança AppError | `NO_FILE` | 400 | UX: feedback imediato |
| V-02 | Arquivo > 10MB | Buffer 10MB+1 byte | Lança AppError | `FILE_TOO_LARGE` | 413 | Custo: evita processamento caro |
| V-03 | Extensão inválida (.pdf) | arquivo.pdf | Lança AppError | `UNSUPPORTED_MEDIA_TYPE` | 415 | UX: erro claro antes do processamento |
| V-04 | MIME inválido | .txt com MIME errado | Lança AppError | `UNSUPPORTED_MEDIA_TYPE` | 415 | Segurança: rejeita arquivo mascarado |
| V-05 | MIME/extensão incompatíveis | .txt com MIME de .docx | Lança AppError | `UNSUPPORTED_MEDIA_TYPE` | 415 | Segurança: validação cruzada |
| V-06 | Arquivo vazio (0 bytes) | Buffer vazio | Lança AppError | `EMPTY_FILE` | 400 | Custo: evita chamada ao Gemini sem conteúdo |
| V-07 | maxLength fora do range | maxLength=10 | Lança AppError | `INVALID_PARAMETER` | 400 | UX: feedback sobre parâmetro inválido |
| V-08 | maxLength NaN | maxLength="abc" | Lança AppError | `INVALID_PARAMETER` | 400 | UX: feedback sobre parâmetro inválido |
| V-09 | language inválido | language="!!!" | Lança AppError | `INVALID_PARAMETER` | 400 | UX: feedback sobre parâmetro inválido |
| V-10 | .txt válido | sample.txt, text/plain | Passa sem erro | — | — | — |
| V-11 | .docx válido | sample.docx, MIME correto | Passa sem erro | — | — | — |

### §10 Testes — geminiService (modelo `gemini-flash-latest`)

| ID | Cenário | Setup | Resultado esperado |
|----|---------|-------|-------------------|
| G-01 | Caminho feliz | SDK com `gemini-flash-latest` retorna texto | Retorna string do resumo; `model === "gemini-flash-latest"` |
| G-02 | API key ausente | `GEMINI_API_KEY` undefined | Lança erro |
| G-03 | SDK lança erro | Mock rejeita | Propaga erro |
| G-04 | Resposta vazia | SDK retorna "" | Lança AppError `UNPROCESSABLE_CONTENT` 422 |
| G-05 | Modelo correto invocado | Espia chamada do SDK | Argumento de modelo === `"gemini-flash-latest"` |

### §11 Testes — summarizeFile

| ID | Cenário | Setup | Resultado esperado |
|----|---------|-------|-------------------|
| S-01 | .txt caminho feliz | texto válido, Gemini ok | Retorna objeto com 6 campos |
| S-02 | .docx caminho feliz | docx válido, Gemini ok | Retorna objeto com 6 campos |
| S-03 | Texto vazio pós-extração | fileService retorna "" | Lança AppError `EMPTY_FILE` 400 |
| S-04 | Gemini falha | geminiService rejeita | Propaga erro |
| S-05 | processingTimeMs válido | qualquer input ok | campo é inteiro >= 0 (KPI de latência) |

### §12 Testes — Controller

| ID | Cenário | Request | Resposta esperada |
|----|---------|---------|------------------|
| C-01 | Sem arquivo | POST sem file | 400 `NO_FILE` |
| C-02 | Sucesso | POST com .txt válido | 200 com 6 campos, `model: "gemini-flash-latest"` |
| C-03 | AppError do serviço | serviço lança AppError | Status correto + `{ error: { code, message } }` |
| C-04 | Erro genérico | serviço lança Error | 500 `INTERNAL_ERROR` sem detalhes internos |

### §13 Testes — Contrato de resposta

| ID | Cenário | Verificação |
|----|---------|------------|
| R-01 | Shape SummaryResponse | Tem exatamente: summary, originalLength, summaryLength, language, model, processingTimeMs |
| R-02 | Shape ErrorResponse | Tem exatamente: `{ error: { code, message } }` |
| R-03 | summaryLength coerente | `summaryLength === summary.length` |
| R-04 | language ecoa entrada | language da resposta === language do request |
| R-05 | model fixo | `model === "gemini-flash-latest"` |

### §14 Testes — Aceite de Negócio

| ID | Critério de Negócio (da US) | Como validar | KPI impactado |
|----|------------------------------|--------------|---------------|
| B-01 | Usuário recebe resumo em tempo aceitável | Asserção sobre `processingTimeMs` (ou teste de carga leve) | Latência p95 |
| B-02 | Resumo respeita `maxLength` solicitado | Verificar `summaryLength <= maxLength` | Satisfação do usuário |
| B-03 | Idioma do resumo corresponde ao solicitado | Validar `language` ecoado e amostragem manual no QA | Cobertura de mercado |
| B-04 | Falhas não expõem dados internos | C-04 + revisão das mensagens de erro | Segurança / Compliance |
| B-05 | Custo controlado por requisição | Modelo travado em `gemini-flash-latest` (G-05) | Custo/req |
| B-06 | Taxa de sucesso no caminho feliz | S-01 + S-02 + C-02 passam consistentemente | Taxa de sucesso |

---

## Regras do roteiro de testes

- O roteiro **não contém código** — apenas cenários estruturados.
- Todo `error.code` deve ser exato conforme SPEC.md §2.4.
- Cada cenário de validação de SPEC.md §3 deve ter pelo menos um test case.
- Nenhum campo pode conter "???" ou "A DEFINIR".

---

## Saída final (exibir após gerar o arquivo)