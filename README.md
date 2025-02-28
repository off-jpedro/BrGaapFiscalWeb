# View SAPUI5 - Gerenciamento de Notas Fiscais

## Sobre
Este repositório contém a view desenvolvida em SAPUI5 para o gerenciamento de notas fiscais. A aplicação faz integração com a API desenvolvida em C#/.NET, permitindo a visualização, criação, edição e remoção de notas fiscais, clientes e fornecedores.

## Tecnologias Utilizadas
- **Frontend:** SAPUI5
- **Linguagem:** JavaScript/TypeScript
- **Backend:** API em C#/.NET
- **Banco de Dados:** PostgreSQL

## Funcionalidades
- Listagem de notas fiscais com informações detalhadas
- Criação de novas notas fiscais, clientes e fornecedores
- Edição e remoção de registros
- Integração direta com a API via requisições HTTP

## Instalação e Configuração
### Requisitos:
- Node.js instalado (para ferramentas de desenvolvimento)
- Servidor SAPUI5 configurado
- API .NET em funcionamento

### Passos:
1. Clone o repositório:
   ```sh
   git clone https://github.com/off-jpedro/BrGaapFiscalWeb.git
   ```
2. Acesse o diretório do projeto:
   ```sh
   cd seu-repositorio-view
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```
4. Configure a URL da API no arquivo de configuração apropriado.
5. Inicie a aplicação:
   ```sh
   npm start
   ```

## Estrutura do Projeto
- `/webapp` - Contém os arquivos principais da aplicação SAPUI5
- `/model` - Modelos de dados e configurações
- `/view` - Views da interface do usuário
- `/controller` - Controladores da aplicação

## Contribuição
Contribuições são bem-vindas! Para contribuir:
1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade: `git checkout -b minha-feature`
3. Faça commit das suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Envie para o repositório remoto: `git push origin minha-feature`
5. Abra um Pull Request

