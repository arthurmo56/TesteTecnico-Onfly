# 🚀 Custom n8n Node: True Random Number Generator

Este repositório contém o desenvolvimento de um conector (custom node) para a plataforma de automação n8n, como parte do desafio técnico da OnFly. O conector, chamado **Random**, integra-se com a API pública da [Random.org](https://www.random.org) para gerar números aleatórios.

## Índice

- [Funcionalidades](#funcionalidades)
- [Arquitetura e Infraestrutura](#arquitetura-e-infraestrutura)
  - [Automação com `Makefile`](#automação-com-makefile)
- [Qualidade e Boas Práticas](#qualidade-e-boas-práticas)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [Testes Unitários](#testes-unitários)
- [Como Usar o Node no n8n](#como-usar-o-node-no-n8n)

## Funcionalidades

- **Nome do Node:** `Random`
- **Operação:** `True Random Number Generator`
- **Parâmetros de Entrada:**
    - `Min`: O valor mínimo inteiro para o sorteio (inclusivo).
    - `Max`: O valor máximo inteiro para o sorteio (inclusivo).
- **Saída:** Retorna um único item JSON contendo o número aleatório gerado. Ex: `{ "randomNumber": 7 }`.

## Arquitetura e Infraestrutura

A infraestrutura do projeto é totalmente gerenciada via Docker e Docker Compose, garantindo um ambiente de desenvolvimento consistente e de fácil configuração.

- **Serviços:**
    1.  `n8n`: O serviço principal que executa a aplicação n8n. Ele é configurado para utilizar o serviço PostgreSQL como banco de dados.
    2.  `postgres`: Um banco de dados PostgreSQL para persistência dos dados do n8n (workflows, execuções, etc.).

- **Segurança:** Durante a inicialização do container do PostgreSQL, o script `init-data.sh` é executado para criar um **usuário não-root** com permissões específicas para o banco de dados do n8n.Para fornecer mais segurança e para limitar o acesso e o potencial de danos em caso de comprometimento.

- **Volumes Persistentes:** São utilizados volumes Docker (`db_storage` e `n8n_storage`) para garantir que os dados do banco e as configurações do n8n não sejam perdidos ao reiniciar ou recriar os containers.

### Automação com `Makefile`

Para simplificar a interação com o ambiente Docker, foi criado um `Makefile` que abstrai os comandos complexos.

| Comando           | Descrição                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `make deploy`     | **Comando principal.** Executa todo o processo: compila o código, sobe os containers, configura a pasta custom e reinicia o n8n.                                                 |
| `make build`      | Apenas compila o código TypeScript do projeto, gerando os arquivos JavaScript na pasta `./dist`.                                                                               |
| `make start-db`   | Inicia os containers `n8n` e `postgres` em modo detached (`-d`).                                                                                                                 |
| `make setup-custom` | Garante que o diretório `/home/node/.n8n/custom` exista dentro do container do n8n e **copia os arquivos compilados** da pasta `dist` local para este diretório no container.    |
| `make restart-n8n`| Reinicia o container do n8n, forçando-o a recarregar e reconhecer o novo conector personalizado.                                                                                |
| `make clean`      | Para e remove os containers, redes e **volumes** associados ao projeto, realizando uma limpeza completa.                                                                       |
| `make stop`       | Apenas para e remove os containers, mas mantém os volumes com os dados.                                                                                                        |
| `make logs`       | Exibe os logs em tempo real do container do n8n, útil para depuração.                                                                                                           |
| `make rebuild`    | Executa uma limpeza completa (`clean`) e em seguida um novo deploy.                                                                                                            |

## Observações

- **Tratamento de Erros:** O node possui validações internas, como verificar se o valor `Min` não é maior que o `Max`, retornando um erro claro para o usuário caso a condição não seja atendida.
- **Sem Credenciais:** A integração utiliza um endpoint público da API da Random.org que não requer autenticação. Portanto, este conector não necessita de configuração de credenciais, simplificando seu uso.

## Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v22 ou superior) e npm

## Como Executar o Projeto

1.  **Clone o Repositório**
    ```bash
    git clone https://github.com/arthurmo56/TesteTecnico-Onfly.git
    cd TesteTecnico-Onfly
    ```

2.  **Configure as Variáveis de Ambiente**
    Crie um arquivo chamado `.env` na raiz do projeto, copiando o exemplo abaixo, e preencha com os valores desejados.

    ```dotenv
    # Arquivo: .env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=n8n
    POSTGRES_NON_ROOT_USER=n8nuser
    POSTGRES_NON_ROOT_PASSWORD=n8npass
    ```

3.  **Execute o Deploy com um Único Comando**
    O `Makefile` cuidará de tudo para você.
    ```bash
    make deploy
    ```
    Este comando irá compilar o projeto, iniciar os containers, copiar o conector customizado e reiniciar o n8n.

4.  **Acesse o n8n**
    Após a conclusão do deploy, acesse o n8n em seu navegador: [http://localhost:5678](http://localhost:5678).

## Testes Unitários

O projeto utiliza [Jest](https://jestjs.io/) para testes unitários, garantindo a confiabilidade da lógica do conector.

1.  **Instale as Dependências de Desenvolvimento**
    ```bash
    npm install
    ```

2.  **Execute os Testes**
    ```bash
    npm test
    ```
    Ou, se preferir usar o npx diretamente:
    ```bash
    npx jest
    ```
    Os testes irão verificar tanto o funcionamento correto da integração (simulado com mocks) quanto o tratamento de erros.

## Como Usar o Node no n8n

Depois de executar o `make deploy`, o conector "Random" estará disponível na sua instância local do n8n.

1.  Crie um novo workflow no n8n.
2.  Clique no botão `+` para adicionar um novo node.
3.  Pesquise por "Random" e selecione-o.
4.  No painel de configuração do node, preencha os campos "Min" e "Max" com os valores desejados.
5.  Execute o node para ver o número aleatório gerado como resultado.

`![Como usar o node Random no n8n](./assets/images/random-node-demo.gif)`