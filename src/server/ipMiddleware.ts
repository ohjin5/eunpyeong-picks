import { Request, Response, NextFunction } from 'express';

export function checkHospitalIpMiddleware(req: Request, res: Response, next: NextFunction) {
  const enableIpRestriction = process.env.ENABLE_IP_RESTRICTION === 'true';

  if (!enableIpRestriction) {
    return next();
  }

  // Admin routes can have separate secret check, but for general store access:
  const allowedIpRangesStr = process.env.ALLOWED_IP_RANGES || '';
  const allowedRanges = allowedIpRangesStr
    .split(',')
    .map(ip => ip.trim())
    .filter(Boolean);

  const clientIp = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    ''
  ).trim();

  if (allowedRanges.length === 0) {
    // If enabled but no IP range specified, allow or restrict appropriately
    return next();
  }

  const isAllowed = allowedRanges.some(allowed => {
    if (allowed === '*' || clientIp.includes(allowed)) return true;
    return false;
  });

  if (!isAllowed) {
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      message: '은평성모병원 내부 네트워크(원내 IP)에서만 접근할 수 있는 서비스입니다.',
      clientIp
    });
  }

  next();
}
