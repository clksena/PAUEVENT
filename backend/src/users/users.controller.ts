import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...result } = user;
    return result;
  }

  @Patch(':id/assign-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async assignRole(@Param('id') id: string, @Body() assignRoleDto: AssignRoleDto) {
    const user = await this.usersService.assignRole(+id, assignRoleDto.roleName);
    const { password, ...result } = user;
    return result;
  }
}

