COMPOSE := docker compose -f dev-container/docker-compose.prod.yml

.DEFAULT_GOAL := help

.PHONY: help env deploy up down restart logs logs-backend ps health clean

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

env: ## Create backend/.env from .env.sample if missing
	@if [ -f backend/.env ]; then echo "backend/.env already exists"; else cp backend/.env.sample backend/.env && echo "Created backend/.env — fill in real values before deploying"; fi

deploy: ## Full deploy (pull + build + up + healthcheck)
	bash deploy.sh

up: ## Build images and start the stack (detached)
	$(COMPOSE) up -d --build

down: ## Stop the stack
	$(COMPOSE) down

restart: ## Restart the stack
	$(COMPOSE) restart

logs: ## Tail all service logs
	$(COMPOSE) logs -f --tail=100

logs-backend: ## Tail backend logs
	$(COMPOSE) logs -f --tail=100 backend

ps: ## Show container status
	$(COMPOSE) ps

health: ## Run the healthcheck
	bash deploy.sh health

clean: ## Stop and remove images (state lives in Atlas + Supabase, not here)
	$(COMPOSE) down --rmi all --remove-orphans
