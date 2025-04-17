import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DeviceInfo } from '../interfaces/device-info.interface';
import * as UAParser from 'ua-parser-js';

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const parser = new UAParser.UAParser(req.headers['user-agent']);
    const uaResult = parser.getResult();

    const deviceInfo: DeviceInfo = {
      deviceId:
        (req.headers['x-device-id'] as string) ||
        uaResult.device.model ||
        'unknown',
      deviceName:
        (req.headers['x-device-name'] as string) ||
        `${uaResult.browser.name} ${uaResult.os.name}`,
      deviceType:
        (req.headers['x-device-type'] as string) ||
        uaResult.device.type ||
        'unknown',
    };

    req['deviceInfo'] = deviceInfo;
    next();
  }
}
