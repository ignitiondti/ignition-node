---
description: Revisa um arquivo-fonte quanto à conformidade com a spec, corretude do contrato de erros e problemas de segurança.
---

# Prompt: Revisar Arquivo Contra a Spec

Anexe: `docs/SPEC.md`, `[ARQUIVO_A_REVISAR]`

---

Revise `[ARQUIVO_A_REVISAR]` e responda para cada item:

1. **Regras de validação (SPEC.md §3)** — cada regra está implementada? Liste as ausentes.
2. **Shape do body de erro (SPEC.md §2.4)** — é `{ error: { code, message } }` sem campos extras?
3. **Códigos de status HTTP** — correspondem exatamente à spec?
4. **Segurança** — mensagens de erro brutas podem chegar à resposta HTTP? O conteúdo do arquivo é logado?
5. **Tipagem** — há tipos `any` sem justificativa?

Formato: para cada problema encontrado, cite `arquivo:linha — SPEC.md §X`.
Linha final: `Veredicto: APROVADO / ALTERAÇÕES NECESSÁRIAS`
