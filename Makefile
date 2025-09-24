.PHONY: build copy-dist start-db setup-custom deploy clean restart-n8n

# Variáveis
DOCKER_COMPOSE = docker compose
N8N_CONTAINER = testetecnico-onfly-n8n-1
DIST_DIR = ./dist
N8N_CUSTOM_DIR = /home/node/.n8n/custom

# Comando principal que executa todo o processo
deploy: build start-db setup-custom restart-n8n
	@echo "Deployment completo!"
	@echo "Acesse o n8n em http://localhost:5678"

# Compila o código TypeScript
build:
	@echo "Compilando o código..."
	npm run build

# Inicia os serviços do Docker Compose
start-db:
	@echo "Subindo os serviços do Docker Compose..."
	$(DOCKER_COMPOSE) up -d
	@echo "Aguardando serviços ficarem prontos..."
	@if [ "$$(uname)" = "Linux" ]; then sleep 10; else timeout /t 15 /nobreak > nul; fi

# Verifica se a pasta custom existe, cria se necessário e copia os arquivos
setup-custom:
	@echo "Verificando e configurando pasta custom no container..."
	@docker exec $(N8N_CONTAINER) sh -c "[ ! -d $(N8N_CUSTOM_DIR) ] && mkdir -p $(N8N_CUSTOM_DIR) || echo 'Pasta custom já existe'"
	@echo "Copiando arquivos da pasta dist para o container..."
	docker cp $(DIST_DIR)/. $(N8N_CONTAINER):$(N8N_CUSTOM_DIR)/
	@echo "Arquivos copiados com sucesso!"
	@docker exec $(N8N_CONTAINER) sh -c "ls -la $(N8N_CUSTOM_DIR)"

# Reinicia o container n8n para recarregar os custom nodes
restart-n8n:
	@echo "Reiniciando container n8n para carregar custom nodes..."
	$(DOCKER_COMPOSE) restart n8n
	@echo "Aguardando n8n reiniciar..."
	@if [ "$$(uname)" = "Linux" ]; then sleep 10; else timeout /t 15 /nobreak > nul; fi
	@echo "Verificando se n8n está rodando..."
	@docker exec $(N8N_CONTAINER) sh -c "ps aux | grep n8n"

# Limpa os containers e volumes
clean:
	@echo "Parando e removendo containers..."
	$(DOCKER_COMPOSE) down -v
	@echo "Limpeza concluída!"

# Para os serviços
stop:
	@echo "Parando serviços..."
	$(DOCKER_COMPOSE) down

# Mostra logs do n8n
logs:
	$(DOCKER_COMPOSE) logs -f n8n

# Rebuild completo (limpa tudo e reconstrói)
rebuild: clean deploy
