---
description: "Fase 3 — Audita conformidade com SPEC.md, segurança, Swagger. Gera docs/VALIDATION_REPORT.md com veredicto binário: APROVADO ou ALTERAÇÕES NECESSÁRIAS."
tools:
  - codebase
  - editFiles
  - runCommands
  - problems
---

# Fase 3 — Validação

Revisão final antes do merge. Todo veredicto é baseado em `.github/SPEC.md` e evidência de código — não em opinião.

Ao concluir todas as verificações, **escreva o arquivo `docs/VALIDATION_REPORT.md`** seguindo exatamente o template definido no final deste documento.

---

## Coleta de Evidências

Execute todas as verificações abaixo em ordem e registre cada resultado para compor o relatório final.

---

### 1. Testes e Cobertura

```bash
npm test -- --coverage 2>&1
```

Registre:
- Número de testes passando / falhando
- % de cobertura de linhas (critério: >= 80%)
- % de cobertura de branches (critério: >= 75%)
- Nomes dos cenários cobertos em `tests/summaryService.spec.ts`

---

### 2. Build TypeScript

```bash
npm run build 2>&1
```

Registre: zero erros = APROVADO, caso contrário liste cada erro com arquivo:linha.

---

### 3. Conformidade com SPEC.md §3 — Regras de Validação

Leia `services/summaryService.ts` e localize a linha exata de cada regra:

| Regra | Ref | Critério |
|-------|-----|---------|
| Verificação de tamanho antes de MIME/extensão | §3.2 | `file.size > 10 * 1024 * 1024` verificado primeiro |
| Extensão aceita `.txt` e `.docx` | §3.3 | `path.extname()` normalizado para minúsculas |
| MIME aceito conforme §2.2 | §3.3 | Checagem na lista de MIMEs permitidos |
| Cruzamento MIME ↔ extensão | §3.3 | Divergência → `UNSUPPORTED_MEDIA_TYPE` |
| Conteúdo vazio pós-extração | §3.4 | `.trim()` vazio → `EMPTY_FILE` |
| `maxLength` no intervalo `[50, 2000]` | §3.5 | Rejeita fora do intervalo |
| `maxLength` NaN rejeitado | §3.5 | String não-inteira → `INVALID_PARAMETER` |
| `language` regex BCP-47 | §3.5 | `/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/` |
| Falha `.docx` capturada com try/catch | §3.6 | Erro de mammoth → `EXTRACTION_FAILED` |

---

### 4. Contrato de Resposta — SPEC.md §2.3

Leia `controllers/summaryController.ts` e verifique os 6 campos obrigatórios no retorno 200:

| Campo | Tipo | Regra |
|-------|------|-------|
| `summary` | string | presente e não vazio |
| `originalLength` | number | contagem de chars do texto extraído |
| `summaryLength` | number | `=== summary.length` |
| `language` | string | ecoa o valor da requisição |
| `model` | string | não vazio (`"gemini-2.0-flash"`) |
| `processingTimeMs` | number | inteiro >= 0 |

---

### 5. Contrato de Erros — SPEC.md §2.4

Para cada código de erro, verifique HTTP status, shape `{ "error": { "code", "message" } }` e ausência de stack trace:

| `error.code` | HTTP esperado | Arquivo | Linha |
|--------------|---------------|---------|-------|
| `NO_FILE` | 400 | | |
| `INVALID_PARAMETER` | 400 | | |
| `EMPTY_FILE` | 400 | | |
| `FILE_TOO_LARGE` | 413 | | |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | | |
| `EXTRACTION_FAILED` | 422 | | |
| `UNPROCESSABLE_CONTENT` | 422 | | |
| `INTERNAL_ERROR` | 500 | | |

Shape proibido: campos extras (`statusCode`, `stack`, `details` internos) no body.

---

### 6. Auditoria de Segurança

```bash
grep -rn "AIza\|gemini.*=.*['\"]" --include="*.ts" . | grep -v "\.env\|process\.env"
grep -rn "writeFile\|writeFileSync\|createWriteStream" --include="*.ts" . | grep -v "node_modules\|tests"
grep -rn "console\.log.*text\|console\.log.*summary\|console\.log.*content" --include="*.ts" . | grep -v "node_modules\|tests"
```

Saída vazia em cada comando = APROVADO. Qualquer match = achado de segurança.

---

### 7. Auditoria Swagger — SPEC.md §7

Leia `routes/index.ts` e verifique o JSDoc da rota `POST /api/v1/summarize`:

| Item | Critério |
|------|---------|
| 3 campos de request (`file`, `maxLength`, `language`) | documentados com tipo + descrição |
| 6 campos de resposta 200 | documentados com tipo + exemplo |
| Status 400 (2×), 413, 415, 422 (2×), 500 | todos presentes |
| `$ref: '#/components/schemas/ErrorResponse'` | usado nas respostas de erro |

---

### 8. Requisitos Não-Funcionais — SPEC.md §6

Leia `services/geminiService.ts` e `app.ts`:

| Requisito | Critério | Arquivo | Linha |
|-----------|---------|---------|-------|
| Timeout Gemini 30 s | `AbortSignal` ou equivalente | | |
| `GEMINI_API_KEY` somente de `process.env` | sem hardcode | | |
| Nenhum byte gravado em disco | sem `writeFile`/`createWriteStream` | | |
| Log só de metadados (sem conteúdo do arquivo) | sem log de texto/resumo | | |

---

## Template do Relatório

Após coletar todas as evidências, crie `docs/VALIDATION_REPORT.md` com o seguinte conteúdo (substituindo os placeholders pelos valores reais):

```markdown
# Relatório de Validação — Fase 4

**Revisor:** Agente de Validação AI
**Data:** {{DATA_ATUAL}}
**Arquivo principal:** `POST /api/v1/summarize`

---

## Resumo

| Veredicto | Descrição |
|-----------|-----------|
| {{EMOJI_VEREDICTO}} **{{VEREDICTO}}** | {{DESCRICAO_CURTA}} |

**Status Geral:** {{EMOJI_VEREDICTO}} {{VEREDICTO}}

---

## Contexto

### Requisitos da SPEC.md

| ID | Requisito | Status |
|----|-----------|--------|
| §3.1 | Presença do arquivo (`NO_FILE`) | {{STATUS}} |
| §3.2 | Verificação de tamanho antes de MIME/extensão | {{STATUS}} |
| §3.3 | Cruzamento MIME + extensão | {{STATUS}} |
| §3.4 | Conteúdo vazio pós-extração (`EMPTY_FILE`) | {{STATUS}} |
| §3.5 | Validação de `maxLength` e `language` | {{STATUS}} |
| §3.6 | Captura de falha `.docx` (`EXTRACTION_FAILED`) | {{STATUS}} |
| §2.3 | Shape de resposta 200 com 6 campos | {{STATUS}} |
| §2.4 | Contrato de erros (8 códigos) | {{STATUS}} |
| §6   | Requisitos não-funcionais (timeout, sem disco, sem PII) | {{STATUS}} |
| §7   | Documentação Swagger completa | {{STATUS}} |

### Cobertura do TEST_PLAN.md

| Cenário | Arquivo de Teste | Status |
|---------|-----------------|--------|
{{LINHAS_COBERTURA_TESTES}}

---

## 🟦 Revisão da API (Node.js / TypeScript)

**Status:** {{STATUS_API}}

### 🔴 Achados Críticos

{{TABELA_CRITICOS_OU_"_Nenhum achado crítico._"}}

### 🟡 Deve Corrigir

{{TABELA_DEVE_CORRIGIR_OU_"_Nenhum item._"}}

### 🟢 Sugestões

{{TABELA_SUGESTOES_OU_"_Nenhuma sugestão._"}}

### ✨ Pontos Positivos

{{LISTA_PONTOS_POSITIVOS}}

### 🧪 Cobertura de Testes

| Cenário | Arquivo | Status |
|---------|---------|--------|
{{LINHAS_COBERTURA_DETALHADA}}

---

## 🔒 Auditoria de Segurança

| Verificação | Resultado | Detalhe |
|-------------|-----------|---------|
| API key hardcoded | {{STATUS}} | {{DETALHE}} |
| Escrita em disco | {{STATUS}} | {{DETALHE}} |
| Log de conteúdo de arquivo (PII) | {{STATUS}} | {{DETALHE}} |

---

## 📐 Auditoria Swagger

| Item | Status | Detalhe |
|------|--------|---------|
| Campos de request (3) documentados | {{STATUS}} | {{DETALHE}} |
| Campos de resposta 200 (6) documentados | {{STATUS}} | {{DETALHE}} |
| Todos os status de erro documentados | {{STATUS}} | {{DETALHE}} |
| `$ref: ErrorResponse` usado | {{STATUS}} | {{DETALHE}} |

---

## ⚙️ Requisitos Não-Funcionais

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| Timeout Gemini 30 s (SPEC.md §5.3) | {{STATUS}} | {{ARQUIVO}}:{{LINHA}} |
| `GEMINI_API_KEY` somente de `process.env` (SPEC.md §5.4) | {{STATUS}} | {{ARQUIVO}}:{{LINHA}} |
| Nenhum byte gravado em disco (SPEC.md §6) | {{STATUS}} | {{EVIDENCIA}} |
| Log apenas de metadados, sem conteúdo do arquivo (SPEC.md §6) | {{STATUS}} | {{EVIDENCIA}} |

---

## ✅ Checklist de Aceitação

- [x] Todos os arquivos relevantes à US revisados
- [x] Cada achado tem arquivo, linha e sugestão de correção
- [x] Lacunas de cobertura de testes identificadas
- [x] Requisitos da SPEC.md explicitamente referenciados

---

## Comentários Prontos para PR

{{LISTA_COMENTARIOS_ARQUIVO_LINHA_SEVERIDADE}}

---

## Próximos Passos Recomendados

{{LISTA_NUMERADA_PROXIMOS_PASSOS}}

---

## Veredicto Final

**{{EMOJI_VEREDICTO}} {{VEREDICTO}}**

**Bloqueantes:** {{N}}
{{LISTA_BLOQUEANTES}}

**Não-bloqueantes:**
{{LISTA_NAO_BLOQUEANTES}}
```

---

## Regras de Preenchimento

- Todo achado **crítico** ou **deve corrigir** referencia arquivo + linha + seção da spec.
- `INTERNAL_ERROR` nunca expõe detalhes internos — se expuser, é achado crítico.
- Veredicto binário: **APROVADO** (✅) se zero bloqueantes; **ALTERAÇÕES NECESSÁRIAS** (❌) se houver qualquer bloqueante.
- Achado bloqueante = qualquer violação da SPEC.md ou falha de teste.
- Achado não-bloqueante = sugestão de melhoria sem violação de spec.
- Use ✅ para aprovado, ❌ para reprovado, ⚠️ para parcial/atenção, 🟢 para ok, 🟡 para atenção, 🔴 para crítico.
