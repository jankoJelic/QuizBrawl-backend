import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LobbiesService } from './lobbies.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Lobby } from './lobby.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('lobbies')
@Controller('lobbies')
export class LobbiesController {
  constructor(private lobbiesService: LobbiesService) {}

  @Get('/')
  async getLobbies() {
    return await this.lobbiesService.getLobbies();
  }

  @UseGuards(AdminGuard)
  @Post('/createLobby')
  async createLobby(@Body() lobby: Partial<Lobby>) {
    return await this.lobbiesService.createLobby(lobby);
  }

  @UseGuards(AdminGuard)
  @Patch('/lobby')
  async updateLobby(@Query('id') id: string, @Body() body: Partial<Lobby>) {
    return await this.lobbiesService.updateLobby(Number(id), body);
  }

  @Delete('/deleteLobby')
  async deleteLobby(@Param('id') id: number) {
    return await this.lobbiesService.deleteLobby(id);
  }
}
