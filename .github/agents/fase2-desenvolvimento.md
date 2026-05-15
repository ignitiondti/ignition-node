---
description: "Fase 2 — Escreve os testes do CODING_PLAN.md §9–§14, depois implementa o código até todos passarem com cobertura >=80%."
tools:
  - codebase
  - editFiles
  - runCommands
  - problems
  - findTestFiles
---

# Phase 2 — Development (TDD)

Você recebe `docs/CODING_PLAN.md` (que inclui o roteiro de testes nas seções §9–§14). Seu trabalho:
1. Escrever todos os testes Jest baseados no roteiro do CODING_PLAN.md §9–§14.
2. Confirmar que falham pelo motivo correto.
3. Implementar o código de produção até todos passarem.

## Fluxo

1. Leia `.github/SPEC.md`, `docs/CODING_PLAN.md`.
2. Leia todos os arquivos-fonte e o `tests/summaryService.spec.ts` existente.
3. **Escreva os testes** (Parte A).
4. Execute `npm test` — confirme falhas esperadas.
5. **Implemente o código** (Parte B) na ordem definida.
6. Execute `npm test` após cada etapa até tudo passar.

---

## Parte A — Escrever testes

Traduza cada test case do `docs/CODING_PLAN.md` §9–§14 em código Jest em `tests/summaryService.spec.ts`.

### Estrutura

```typescript
import { validateFile } from '../services/summaryService';
// mocks no topo

describe('validateFile', () => { /* um it() por test case V-XX */ });
describe('summarizeFile', () => { /* um it() por test case S-XX */ });
describe('controller', () => { /* um it() por test case C-XX */ });
describe('contrato', () => { /* um it() por test case R-XX */ });
```

### Padrões obrigatórios

- Erro: `toThrow(expect.objectContaining({ code: 'ERROR_CODE' }))` — nunca match por string.
- Mock:
```typescript
jest.mock('../services/fileService', () => ({ readFile: jest.fn() }));
jest.mock('../services/geminiService', () => ({ generateContentFromGemini: jest.fn() }));
```
- Arquivo grande: `Buffer.alloc(10 * 1024 * 1024 + 1)` programático no teste.
- Fixtures existentes (`sample.txt`, `empty.txt`): mantenha. Crie `sample.docx` em `beforeAll` se necessário.

### Verificação

Execute `npm test`. Todos os testes novos devem **falhar**.
- Falha aceitável: `not implemented` ou função não encontrada.
- Falha inaceitável: erro de sintaxe, importação ou mock. Corrija antes de prosseguir.

---

## Parte B — Implementar código

Siga esta ordem. Execute `npm test` após cada etapa.

### B1 — AppError

Crie `types/AppError.ts`:
```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### B2 — validateFile

Em `services/summaryService.ts`, implemente na ordem de SPEC.md §3.2:
1. Tamanho > 10MB → `FILE_TOO_LARGE` 413
2. Extensão não em ['.txt', '.docx'] → `UNSUPPORTED_MEDIA_TYPE` 415
3. MIME fora da lista → `UNSUPPORTED_MEDIA_TYPE` 415
4. MIME/extensão incompatíveis → `UNSUPPORTED_MEDIA_TYPE` 415
5. Buffer vazio → `EMPTY_FILE` 400

### B3 — Parsing de parâmetros

Em `controllers/summaryController.ts`:
- `maxLength`: parseInt, padrão 300, rejeitar NaN ou fora de [50, 2000] → `INVALID_PARAMETER` 400
- `language`: padrão 'pt-BR', validar regex BCP-47 → `INVALID_PARAMETER` 400

### B4 — Gemini Service

Em `services/geminiService.ts`:
- Modelo: `gemini-flash-latest` — sempre use `const GEMINI_MODEL = 'gemini-flash-latest';`
- Usar prompts de CODING_PLAN.md §5
- Timeout: AbortSignal 30s
- Resposta vazia → `UNPROCESSABLE_CONTENT` 422

### B5 — summarizeFile

Em `services/summaryService.ts`:
1. `validateFile(file)`
2. `const startMs = Date.now()`
3. `fileService.readFile(file)` — erro do mammoth → `EXTRACTION_FAILED` 422
4. `text.trim() === ''` → `EMPTY_FILE` 400
5. `geminiService.generateContentFromGemini({ text, language, maxLength })`
6. Retornar SummaryResult com 6 campos (incluindo `processingTimeMs`)

### B6 — Controller handler

Em `controllers/summaryController.ts`:
- Sem arquivo → `NO_FILE` 400
- Chamar parseParams + summarizeFile
- AppError → `res.status(err.statusCode).json({ error: { code, message } })`
- Erro genérico → log interno + `500 INTERNAL_ERROR` sem detalhes
- Sucesso → `res.status(200).json(result)`

> **ARMADILHA CONHECIDA — FILE_TOO_LARGE retornando INTERNAL_ERROR:**
> O `catch` do controller **deve verificar `instanceof AppError` primeiro**, antes do handler genérico.
> Se a ordem estiver errada, erros de validação (ex.: arquivo > 10 MB) são engolidos como `INTERNAL_ERROR`.
> Padrão obrigatório:
> ```typescript
> } catch (err) {
>   if (err instanceof AppError) {
>     return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
>   }
>   console.error(err);
>   return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
> }
> ```
> Nunca use um `catch` genérico único que ignore o tipo do erro.

### B7 — Swagger JSDoc

Em `routes/index.ts`:
- 3 campos de request documentados
- Schema SummaryResponse (6 campos)
- Erros: 400, 413, 415, 422, 500 com `$ref` ao ErrorResponse

### B8 — Verificação final

```bash
npm test -- --coverage
npm run build
```

---

## Saída

```
## Fase 3 concluída

Testes: X passando, 0 falhando
Cobertura: X% linhas, X% branches (meta: >=80%)
Build: limpo

Implementado:
  - AppError, validateFile, parsing parâmetros
  - Gemini service, summarizeFile, controller, Swagger

Próximo: @phase4-validation
```

## Regras

- Nunca delete ou enfraqueça uma asserção para fazer teste passar.
- Nunca use `// @ts-ignore` sem justificativa.
- Stack traces e caminhos internos nunca nas respostas HTTP.
- `GEMINI_API_KEY` lida apenas de `process.env`.
- Conteúdo de arquivo nunca em `console.log`.
