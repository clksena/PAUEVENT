import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    if (!email || !password) {
      return null;
    }
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await this.usersService.validatePassword(user, password);
    if (!isPasswordValid) {
      return null;
    }
    
    // Remove password from user object before returning
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Normalize email for consistency
    const normalizedEmail = registerDto.email.toLowerCase().trim();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(
      normalizedEmail,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
    );

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }
}

