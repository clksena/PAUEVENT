import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Normalize user ID from payload (support both sub and userId)
    const userId = payload.sub ?? payload.userId;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload: missing user ID');
    }
    
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Always return normalized user object with id, email, and roles
      return { 
        id: Number(userId), // Ensure id is always a number
        email: user.email || payload.email || '', 
        roles: user.roles || [] 
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('User not found');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

