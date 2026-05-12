# Ignition Course — Exercício de Backend com IA

> Um exercício prático para desenvolvedores em início de carreira: construa uma API de sumarização de arquivos usando TypeScript, Express e Google Gemini — guiado por ferramentas de IA durante todo o ciclo de desenvolvimento.

---

## O que você vai construir

Um endpoint REST `POST /api/v1/summarize` que:

1. Aceita uploads de arquivos `.txt` e `.docx`
2. Extrai o conteúdo de texto do arquivo
3. Envia o texto ao Google Gemini para sumarização
4. Retorna uma resposta JSON estruturada com o resumo e metadados

O endpoint deve validar as entradas de forma rigorosa, tratar todos os casos de erro com um schema de erro consistente e ser documentado no Swagger/OpenAPI.

---

## Objetivos de aprendizado

Ao concluir este exercício, você irá:

- Praticar o **desenvolvimento spec-first**: ler e implementar com base em um documento de especificação, não na intuição
- Vivenciar o **SDLC assistido por IA**: usar ferramentas de IA para design, escrita de testes, implementação e revisão — sem deixar que elas substituam seu julgamento
- Construir um serviço **TypeScript/Express** com tratamento de erros adequado, validação e documentação de API
- Escrever **testes unitários e de integração Jest** antes do código de produção (TDD)
- Realizar uma **revisão de código estruturada** do código gerado pela IA em relação à spec escrita

---

## Pré-requisitos

| Requisito | Versão |
|-----------|--------|
| Node.js | 20 ou superior |
| npm | 10 ou superior |
| Google Gemini API key | Tier gratuito é suficiente |
| Editor com suporte a IA | VS Code + GitHub Copilot recomendado |

---

## Início rápido

```bash
# 1. Clone e instale
git clone <repository-url>
cd ignition-node
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY

# 3. Inicie o servidor de desenvolvimento
npm start

# 4. Abra o Swagger UI
open http://localhost:3000/api-docs
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `GEMINI_API_KEY` | **Sim** | — | Chave da API do Google Gemini. Nunca commite este valor. |
| `PORT` | Não | `3000` | Porta em que o servidor escuta |
| `NODE_ENV` | Não | `development` | `development` ou `production` |

Crie um arquivo `.env` na raiz do projeto (já incluído no `.gitignore`):

```env
GEMINI_API_KEY=sua_chave_aqui
PORT=3000
```

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento com hot reload (nodemon) |
| `npm test` | Executa todos os testes Jest |
| `npm test -- --coverage` | Executa os testes e gera relatório de cobertura |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run clean` | Remove a saída compilada |

---

## Estrutura do projeto

```
app.ts                          # Entry point do Express (não modifique)
config/
  swagger.ts                    # Config base do Swagger (não modifique)
controllers/
  summaryController.ts          # ← VOCÊ IMPLEMENTA ISSO
services/
  summaryService.ts             # ← VOCÊ IMPLEMENTA ISSO
  fileService.ts                # Extração de texto (não modifique)
  geminiService.ts              # Chamada ao SDK do Gemini (atualize prompt + modelo)
routes/
  index.ts                      # Definições de rotas + Swagger JSDoc
types/
  mammoth.d.ts                  # Declarações de tipo para mammoth
tests/
  summaryService.spec.ts        # Arquivo de testes (VOCÊ ESCREVE OS TESTES)
  fixtures/                     # Arquivos de fixture para testes (você cria esses)
docs/
  SPEC.md                       # A spec autoritativa — leia isso primeiro
.github/
  copilot-instructions.md       # Regras de contexto do Copilot para este repositório
  agents/                       # Agentes de fase — guiados pela sua descrição de US
    phase1-coding-plan.md
    phase2-test-plan.md
    phase3-development.md
    phase4-validation.md
  prompts/                      # Templates de prompt reutilizáveis para tarefas específicas
```

---

## As 4 Fases — Todas guiadas por agentes a partir de uma User Story

Você não preenche templates em branco. Você escreve uma **User Story** (1–10 frases descrevendo o que quer construir) e entrega ao agente da fase. O agente lê a spec, lê o código e faz o trabalho. Você revisa, aprova e passa para a próxima fase.

### Como escrever uma User Story para este exercício

```
Como desenvolvedor, quero um endpoint POST /api/v1/summarize que:
- aceite uploads de arquivos .txt e .docx (multipart/form-data)
- valide o tipo de arquivo, tamanho (<= 10 MB) e tipo MIME
- extraia o conteúdo de texto do arquivo
- envie o texto ao Google Gemini com parâmetros opcionais maxLength e language
- retorne uma resposta JSON estruturada com summary, originalLength, summaryLength,
  language, model e processingTimeMs
- retorne respostas de erro estruturadas para todos os casos de falha (400/413/415/422/500)
- seja documentado no Swagger/OpenAPI
```

---

### Fase 1 — Plano de Código

**Agente:** `@phase1-coding-plan`

**O que você faz:**
1. Abra o Copilot Chat em modo agente → selecione `phase1-coding-plan`
2. Cole sua descrição de US
3. Anexe `docs/SPEC.md`
4. Envie

**O que o agente faz:**
- Lê a spec e o código existente
- Gera `docs/CODING_PLAN.md` com arquitetura, detalhamento dos módulos, fluxo de dados, todas as regras de validação, as strings de prompt do Gemini, tabela de tratamento de erros, definições de schema do Swagger e riscos
- Explica cada decisão
- Informa exatamente como iniciar a Fase 2

**Critério de saída:** `docs/CODING_PLAN.md` existe sem seções vazias.

---

### Fase 2 — Plano de Testes e Testes com Falha

**Agente:** `@phase2-test-plan`

**O que você faz:**
1. Mude para `phase2-test-plan`
2. Cole sua descrição de US
3. Anexe `docs/CODING_PLAN.md`
4. Envie

**O que o agente faz:**
- Gera `docs/TEST_PLAN.md` com todos os IDs de cenário e labels `it(...)`
- Escreve o código Jest completo em `tests/summaryService.spec.ts`
- Cria os arquivos de fixture que faltam
- Executa `npm test` e mostra a saída de falha
- Confirma que cada teste falha pelo motivo correto (não por erros de import/sintaxe)

**Critério de saída:** `npm test` executa, todos os novos testes falham com `"not implemented"`.

---

### Fase 3 — Implementação

**Agente:** `@phase3-development`

**O que você faz:**
1. Mude para `phase3-development`
2. Cole sua descrição de US
3. Anexe `docs/CODING_PLAN.md`
4. Envie

**O que o agente faz:**
- Implementa funcionalidades na ordem definida pela spec: AppError → validateFile → parsing de parâmetros → serviço Gemini → summarizeFile → handler de erro do controller → Swagger JSDoc
- Executa `npm test` após cada etapa
- Executa `npm test -- --coverage` ao final
- Reporta cobertura e quaisquer problemas restantes

**Critério de saída:** `npm test` passa. Cobertura ≥ 80%. `npm run build` limpo.

---

### Fase 4 — Validação

**Agente:** `@phase4-validation`

**O que você faz:**
1. Mude para `phase4-validation`
2. Envie "iniciar Fase 4"
3. Anexe `docs/SPEC.md` e todos os arquivos de serviço

**O que o agente faz:**
- Executa `npm test -- --coverage` e `npm run build`
- Audita cada regra de validação em relação à spec (por número de linha)
- Verifica o shape do body de erro para todos os 8 códigos de erro
- Executa verificações de segurança com grep (chaves hardcoded, escrita de arquivos, log de conteúdo)
- Verifica a completude do Swagger
- Produz um veredicto estruturado APROVADO / ALTERAÇÕES NECESSÁRIAS

**Critério de saída:** Veredicto do agente é APROVADO.

---

## Como usar os prompts

Os templates em `.github/prompts/` são para tarefas específicas dentro de uma fase quando você quer perguntar ao Copilot inline (não no modo agente):

| Prompt | Use quando |
|--------|-----------|
| `implement-validation-rule.prompt.md` | Implementando uma regra específica em isolamento |
| `write-failing-test.prompt.md` | Adicionando um teste de cenário único manualmente |
| `review-against-spec.prompt.md` | Verificando qualquer arquivo em relação à spec |
| `design-gemini-prompt.prompt.md` | Atualizando o prompt/modelo do Gemini |

---

## Referência da API

**`POST /api/v1/summarize`**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | binário | Sim | `.txt` ou `.docx`, máx 10 MB |
| `maxLength` | inteiro | Não | Máx de palavras no resumo (50–2000, padrão 300) |
| `language` | string | Não | Tag de idioma BCP-47 (padrão `pt-BR`) |

**Resposta de sucesso `200`:**
```json
{
  "summary": "O documento discute...",
  "originalLength": 4821,
  "summaryLength": 312,
  "language": "pt-BR",
  "model": "gemini-2.0-flash",
  "processingTimeMs": 1423
}
```

Spec completa: `docs/SPEC.md`

---

## Links úteis

| Recurso | URL |
|---------|-----|
| Swagger UI (local) | `http://localhost:3000/api-docs` |
| Documentação da API Google Gemini | https://ai.google.dev/docs |
| mammoth (biblioteca docx) | https://github.com/mwilliamson/mammoth.js |
| express-fileupload | https://github.com/richardgirges/express-fileupload |

---

## Licença

MIT

