# Especificação Funcional — API de Sumarização de Arquivos

> **Status:** Aprovado · **Versão:** 1.0 · **Última atualização:** 2026-05-12
> Este documento é a única fonte da verdade. Se a spec conflitar com qualquer outro arquivo, a spec prevalece.

---

## 1. Visão Geral

A API expõe um único endpoint que aceita um documento de texto simples ou Word, extrai seu conteúdo e retorna um resumo conciso produzido pelo modelo Google Gemini. Nenhum arquivo é persistido em disco; todo o processamento é em memória.

---

## 2. Definição do Endpoint

### `POST /api/v1/summarize`

| Atributo        | Valor                                               |
|-----------------|-----------------------------------------------------|
| Método          | `POST`                                              |
| Caminho         | `/api/v1/summarize`                                 |
| Content-Type    | `multipart/form-data`                               |
| Auth            | Nenhuma (exercício interno — não adicione autenticação) |
| Idempotente     | Não                                                 |

### 2.1 Campos da Requisição

| Campo       | Tipo     | Obrigatório | Restrições                                                                                                   |
|-------------|----------|-------------|--------------------------------------------------------------------------------------------------------------|
| `file`      | binário  | Sim         | `.txt` ou `.docx`. MIME deve corresponder à extensão. Máx **10 MB**. Não pode estar vazio após extração de texto. |
| `maxLength` | inteiro  | Não         | Número de palavras que o resumo não deve exceder. Intervalo: `50–2000`. Padrão: `300`.                       |
| `language`  | string   | Não         | Tag de idioma BCP-47 (ex: `pt-BR`, `en`, `es`, `fr`). Padrão: `pt-BR`.                                      |

### 2.2 Tipos MIME Aceitos

| Extensão | MIME Esperado                                                             |
|----------|---------------------------------------------------------------------------|
| `.txt`   | `text/plain`                                                              |
| `.docx`  | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

**Regra de verificação cruzada:** o tipo MIME declarado pelo cliente E a extensão do arquivo devem estar na lista permitida e devem concordar entre si. Divergências → `415`.

### 2.3 Resposta de Sucesso — `200 OK`

```jsonc
{
  "summary": "O documento discute...",
  "originalLength": 4821,       // contagem de caracteres do texto extraído
  "summaryLength": 312,         // contagem de caracteres do resumo retornado
  "language": "pt-BR",
  "model": "gemini-2.0-flash",
  "processingTimeMs": 1423
}
```

Todos os campos estão sempre presentes em uma resposta de sucesso.

### 2.4 Contrato de Erros

Toda resposta de erro utiliza um **body estruturado**:

```jsonc
{
  "error": {
    "code": "FILE_TOO_LARGE",          // constante legível por máquina (SCREAMING_SNAKE_CASE)
    "message": "Texto legível por humanos.", // nunca exponha stack traces internos
    "details": {}                      // opcional, para informações de validação por campo
  }
}
```

| Status HTTP | `error.code`               | Gatilho                                                                                              |
|-------------|----------------------------|------------------------------------------------------------------------------------------------------|
| `400`       | `NO_FILE`                  | Campo `file` ausente no body multipart                                                               |
| `400`       | `INVALID_PARAMETER`        | `maxLength` ou `language` falha na validação                                                         |
| `400`       | `EMPTY_FILE`               | Arquivo presente mas com 0 bytes (ou produz texto vazio após extração)                               |
| `413`       | `FILE_TOO_LARGE`           | Tamanho do arquivo excede 10 MB                                                                      |
| `415`       | `UNSUPPORTED_MEDIA_TYPE`   | Extensão fora da lista permitida, MIME fora da lista permitida ou divergência extensão/MIME          |
| `422`       | `EXTRACTION_FAILED`        | `.docx` não pôde ser parseado (arquivo corrompido, protegido por senha, etc.)                        |
| `422`       | `UNPROCESSABLE_CONTENT`    | Texto extraído com sucesso, mas o Gemini recusou o conteúdo ou retornou resposta inutilizável        |
| `500`       | `INTERNAL_ERROR`           | Qualquer exceção inesperada; sem detalhes internos no body                                            |

> **Importante:** nunca exponha mensagens de exceção brutas, caminhos de arquivo ou stack traces nas respostas de erro.

### 2.5 Exemplo cURL

```bash
curl -X POST http://localhost:3000/api/v1/summarize \
  -F "file=@relatorio.docx" \
  -F "maxLength=200" \
  -F "language=pt-BR"
```

---

## 3. Regras de Validação (detalhadas)

### 3.1 Presença do Arquivo
- Rejeitar imediatamente com `400 / NO_FILE` se o campo `file` estiver ausente do body multipart.

### 3.2 Verificação de Tamanho
- Ler `file.size` **antes** de fazer o buffer do conteúdo.
- Rejeitar com `413 / FILE_TOO_LARGE` se `size > 10 * 1024 * 1024` bytes.
- Esta verificação deve ocorrer antes da validação de MIME/extensão para retornar o status correto rapidamente.

### 3.3 Verificação Cruzada MIME + Extensão
- Extrair a extensão de `file.name` usando `path.extname()` → normalizar para minúsculas.
- Ler `file.mimetype` conforme fornecido pelo `express-fileupload`.
- Aplicar a tabela de pares permitidos (§ 2.2).
- Extensão desconhecida, MIME desconhecido ou divergência → `415 / UNSUPPORTED_MEDIA_TYPE`.

### 3.4 Conteúdo Vazio
- Após a extração de texto (ver § 4), se a string estiver em branco após `.trim()` → `400 / EMPTY_FILE`.

### 3.5 Validação de Parâmetros
- `maxLength`: deve ser um inteiro positivo em `[50, 2000]`. Strings não-inteiras → rejeitar.
- `language`: deve corresponder a `/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/`. Tags desconhecidas são repassadas ao Gemini (não valide o dicionário de tags).

### 3.6 Falhas de Extração `.docx`
- Encapsular `mammoth.extractRawText()` em try/catch.
- Qualquer erro lançado → `422 / EXTRACTION_FAILED`.

---

## 4. Extração de Texto

| Tipo de arquivo | Biblioteca | Método                           | Saída          |
|-----------------|------------|----------------------------------|----------------|
| `.txt`          | built-in   | `buffer.toString('utf-8')`       | texto bruto    |
| `.docx`         | mammoth    | `mammoth.extractRawText(buffer)` | `result.value` |

A codificação para `.txt` é sempre assumida como UTF-8. Se a conversão produzir caracteres de substituição (`\uFFFD`) em mais de 5% da saída, trate como falha de extração.

---

## 5. Integração com Gemini

### 5.1 Entradas Necessárias
- Texto extraído
- `language` (da requisição ou padrão)
- `maxLength` (da requisição ou padrão)

### 5.2 Mapeamento de Resposta
- O texto de resposta do Gemini se torna `summary`.
- `summaryLength` = `summary.length` (caracteres).
- `model` = a string identificadora do modelo usada na requisição (ex: `"gemini-2.0-flash"`).

### 5.3 Timeout
- A chamada ao Gemini deve ter timeout de **30 segundos**.
- Em caso de timeout → `500 / INTERNAL_ERROR` (tratado como inesperado).

### 5.4 API Key
- Carregada de `process.env.GEMINI_API_KEY`.
- Se ausente na inicialização → lançar erro imediatamente para que o processo encerre (fail-fast).

---

## 6. Requisitos Não-Funcionais

| Requisito               | Regra                                                                                              |
|-------------------------|----------------------------------------------------------------------------------------------------|
| **Sem persistência**    | Bytes do arquivo e texto extraído nunca devem ser gravados em disco ou em qualquer armazenamento externo. |
| **Sem log de PII**      | Registrar metadados da requisição (timestamp, tamanho do arquivo, MIME, tempo de processamento) mas NÃO o conteúdo do arquivo. |
| **Logging**             | Cada requisição registra: código de status, tamanho do arquivo, tipo MIME, `processingTimeMs`.    |
| **Timeout**             | Chamada ao Gemini ≤ 30 s. Timeout de requisição Express ≤ 60 s.                                   |
| **Concorrência**        | Sem estado global. Cada requisição é independente.                                                 |
| **Ambiente**            | `NODE_ENV`, `PORT` (padrão `3000`), `GEMINI_API_KEY` (obrigatório).                               |

---

## 7. Contrato Swagger / OpenAPI

O endpoint **deve** ser completamente documentado no bloco de comentário JSDoc na rota, incluindo:
- Todos os campos da requisição com tipo + descrição
- Todos os campos da resposta de sucesso com tipo + exemplo
- Todas as respostas de erro (400, 413, 415, 422, 500) com `$ref` para um schema `ErrorResponse` compartilhado

O Swagger UI deve renderizar sem erros em `http://localhost:3000/api-docs`.

---

## 8. Fora do Escopo

- Autenticação / autorização
- Rate limiting
- Armazenamento / recuperação de arquivos
- PDF, XLSX, ou qualquer formato além de `.txt` / `.docx`
- Respostas em streaming
- Webhooks
