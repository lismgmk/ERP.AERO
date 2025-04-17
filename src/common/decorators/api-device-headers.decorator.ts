import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiDeviceHeaders() {
  return applyDecorators(
    ApiHeader({
      name: 'x-device-id',
      description: 'Unique device identifier',
      required: true,
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiHeader({
      name: 'x-device-name',
      description: 'Device name',
      required: true,
      example: 'iPhone 12',
    }),
    ApiHeader({
      name: 'x-device-type',
      description: 'Device type (optional)',
      required: false,
      example: 'mobile',
    })
  );
}
