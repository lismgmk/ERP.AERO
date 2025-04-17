import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('JwtSecureStorage API')
  .setDescription('API для безопасного хранения JWT токенов')
  .setVersion('1.0')
  .addBearerAuth()
  .addApiKey(
    {
      type: 'apiKey',
      name: 'x-device-id',
      in: 'header',
      description: 'Уникальный идентификатор устройства',
    },
    'x-device-id'
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'x-device-name',
      in: 'header',
      description: 'Название устройства',
    },
    'x-device-name'
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'x-device-type',
      in: 'header',
      description: 'Тип устройства (опционально)',
    },
    'x-device-type'
  )
  .build();
