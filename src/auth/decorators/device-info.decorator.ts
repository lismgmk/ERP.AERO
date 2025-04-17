import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceInfo } from '../interfaces/device-info.interface';

export const GetDeviceInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DeviceInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.deviceInfo;
  }
);
