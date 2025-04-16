.PHONY: prod-up prod-down prod-logs prod-build prod-clean

# Get docker compose command
DOCKER_COMPOSE := $(shell ./scripts/check-docker-compose.sh)

# Production commands
prod-up:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d

prod-down:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml down

prod-logs:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml logs -f

prod-build:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml build --no-cache

prod-clean:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml down -v
	docker system prune -f

# Development commands
dev-up:
	$(DOCKER_COMPOSE) up -d

dev-down:
	$(DOCKER_COMPOSE) down

dev-logs:
	$(DOCKER_COMPOSE) logs -f

# Database commands
db-migrate:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml exec app npx typeorm migration:run

db-revert:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml exec app npx typeorm migration:revert 