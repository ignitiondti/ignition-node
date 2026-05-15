# GitHub Copilot — Instruções do Repositório

> Estas instruções se aplicam a todas as sessões de chat de IA neste repositório.
> Usuários de Copilot, Claude e Gemini: leia este arquivo antes de iniciar sua sessão.

---

## Como o exercício funciona

Escreva uma **User Story** e entregue ao agente da fase. O agente faz o trabalho; você revisa e aprova.

| Fase | Agente | Entrada | Saída |
|------|--------|---------|-------|
| 1+2 — Plano de Código & Testes | `@fase1-planejamento-estoria` | Sua US | `docs/CODING_PLAN.md` (plano técnico + roteiro de testes) |
| 2 — Desenvolvimento | `@fase2-desenvolvimento` | `docs/CODING_PLAN.md` | Testes escritos + código implementado, tudo passando |
| 3 — Validação | `@fase3-validacao` | Todos os arquivos de serviço | Veredicto APROVADO / ALTERAÇÕES NECESSÁRIAS |

O `.github/SPEC.md` é a lei que substitui qualquer outra coisa — os agentes o leem automaticamente.

---

## Sempre anexe como contexto

| Prioridade | Arquivo | Por quê |
|------------|---------|---------|
| Automático | `.github/SPEC.md` | Lido pelos agentes — não precisa anexar |
| Obrigatório | O arquivo que você está editando | Para que a IA veja o código real |
| Recomendado | `docs/CODING_PLAN.md` (gerado na Fase 1+2) | Para que o agente da Fase 3 se alinhe ao plano e roteiro de testes |

---

## Disciplina de prompts: bom vs. ruim

### Prompts ruins
```
"Escreva o endpoint de resumo"
```
> Muito vago. A IA inventa requisitos, ignora sua spec e produz código que você não entende.

```
"Corrija o bug"
```
> Qual bug? A IA adivinha, possivelmente criando novos.

```
"Faça os testes passarem"
```
> A IA pode deletar asserções ou mockar coisas incorretamente para forçar um resultado verde.

### Prompts bons
```
"Usando .github/SPEC.md §3.3 como regra, implemente a verificação cruzada MIME+extensão em
services/summaryService.ts. A função deve lançar um AppError com code
UNSUPPORTED_MEDIA_TYPE e status 415 quando a verificação falhar.
Não altere nenhuma outra função."
```

```
"Escreva um teste Jest unitário para a função validateFile em summaryService.ts
cobrindo o cenário V-05 do docs/CODING_PLAN.md §9:
O tipo MIME é application/vnd.openxmlformats-officedocument.wordprocessingml.document
mas a extensão do arquivo é .txt. Esperado: lança com code UNSUPPORTED_MEDIA_TYPE."
```

```
"Revise o prompt Gemini em services/geminiService.ts.
Ele satisfaz os requisitos do docs/CODING_PLAN.md §5?
Liste qualquer coisa que não corresponda à spec e explique por quê."
```

**Padrão:** Escopo → Referência à regra → Restrição exata → O que NÃO mudar.

---

## Peça testes antes do código

Ao implementar uma nova funcionalidade:

1. Peça o teste primeiro:
   ```
   "Escreva um teste unitário com falha para [funcionalidade] de acordo com [seção da spec].
    Não implemente a funcionalidade ainda."
   ```
2. Execute o teste — confirme que falha pelo motivo correto.
3. Então peça a implementação:
   ```
   "Implemente [funcionalidade] em [arquivo] para que o teste que escrevi passe.
    Siga [seção da spec]. Não altere outros testes."
   ```
4. Execute os testes — confirme que passam.

---

## Como questionar a saída da IA

Nunca aceite código gerado cegamente. Para cada resposta da IA:

- **Pergunte "por quê":** `"Explique linha por linha o que esta função faz e por que você escolheu esta abordagem."`
- **Verifique conformidade com a spec:** `"Esta implementação trata cada regra de validação do SPEC.md §3? Liste-as e confirme que cada uma está coberta."`
- **Verifique os caminhos de erro:** `"O que acontece se mammoth.extractRawText lançar um erro? Mostre-me o caminho exato do código."`
- **Encontre o caso extremo:** `"O que acontece se maxLength for 0? E se for undefined? A spec permite isso?"`
- **Verificação de segurança:** `"Há algum cenário onde o conteúdo do arquivo chega a uma linha de log ou ao body de uma resposta de erro?"`

Se a IA não conseguir responder ou se contradizer, trate a saída como não confiável.

---

## Anti-padrões a observar

| Anti-padrão | Por que está errado | O que fazer em vez disso |
|-------------|--------------------|--------------------------| 
| `catch (e) { res.status(500).json({ error: e.message }) }` | Vaza erros internos para os clientes | Mapeie para `INTERNAL_ERROR` e registre o erro real no servidor |
| Validar apenas a extensão, não o MIME | Pode ser burlado com um arquivo renomeado | Sempre faça a validação cruzada de ambos, conforme SPEC.md §3.3 |
| Tipo `any` para o arquivo enviado | Esconde erros de tipo reais | Use `UploadedFile` de `express-fileupload` |
| Escrever conteúdo do arquivo no `console.log` | Risco de PII, violação da spec | Registre apenas metadados (tamanho, MIME, tempo) |
| `maxLength` parseado com `parseInt` sem verificação de `isNaN` | `parseInt('abc')` retorna `NaN` | Valide antes de usar |
| `GEMINI_API_KEY` hardcoded | Violação de segurança | Sempre leia de `process.env` |
| Retornar campo `statusCode` no body de erro | Não está no contrato da spec | Use apenas `error.code` e `error.message` |

---

## Limites de escopo

Os seguintes arquivos são **intencionalmente incompletos** — eles são o que você deve implementar:

- `controllers/summaryController.ts` — faltando: validação completa, parsing de parâmetros, tratamento estruturado de erros, Swagger JSDoc
- `services/summaryService.ts` — faltando: verificação MIME, verificação de tamanho, suporte a `maxLength`/`language`, shape do objeto de resposta

**Não altere:**
- `app.ts` (a menos que adicione middleware para timeout de requisição)
- Configuração base de `config/swagger.ts` (adicione schemas via JSDoc nas rotas)
- `services/fileService.ts` (já completo — só corrija se a conformidade com a spec exigir)
- `services/geminiService.ts` (apenas atualize o prompt e o nome do modelo)

---

## Versões de modelos e bibliotecas

| Dependência | Versão em uso | Observação |
|-------------|---------------|------------|
| `@google/generative-ai` | latest | Use o nome de modelo `gemini-flash-latest` |
| `mammoth` | latest | Não troque por outra biblioteca docx |
| `express-fileupload` | latest | O arquivo está em `req.files.file` |
| TypeScript | latest | Modo strict ativado |

---

## Definição de pronto (por fase)

Não marque uma fase como concluída até que:
- O código funcione
- Os testes que você planejou passem
- A seção da spec esteja totalmente coberta
- Um colega ou sênior tenha revisado o código gerado pela IA com você
