# ignition-node

Projeto Node.js para sumarização de arquivos utilizando serviços de IA.

## Descrição
Este projeto fornece uma API para upload de arquivos e geração de resumos automáticos utilizando modelos de linguagem. É possível integrar diferentes serviços de IA para sumarização de arquivos `.txt e .docx`.

## Funcionalidades
- Upload de arquivos
- Geração de resumo automático
- Integração com serviços de IA (Gemini)
- Documentação Swagger

## Instalação
1. Clone o repositório:
   ```sh
   git clone https://github.com/ignitiondti/ignition-node.git
   cd ignition-node
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```

## Uso
Para iniciar o servidor em modo desenvolvimento:
```sh
npm start
```

Acesse a documentação Swagger em: `http://localhost:3000/api-docs`

## Estrutura do Projeto
```
app.ts                # Ponto de entrada da aplicação
config/               # Configurações (ex: Swagger)
controllers/          # Lógica dos endpoints
routes/               # Definição das rotas
services/             # Serviços de negócio e integração IA
types/                # Tipagens customizadas
tests/                # Testes automatizados
```

## Testes
Execute os testes com:
```sh
npm test
```

## Licença
MIT
