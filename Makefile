.PHONY: prod-up prod-down prod-logs prod-build prod-clean


# Production commands
prod-up:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-build:
	docker compose -f docker-compose.prod.yml build --no-cache

prod-clean:
	docker compose -f docker-compose.prod.yml down -v
	docker system prune -f

# Development commands
dev-up:
	docker compose up -d

dev-down:
	docker compose down

dev-logs:
	docker compose logs -f

