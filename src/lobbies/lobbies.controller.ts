import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { LobbiesService } from './lobbies.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Lobby } from './lobby.entity';

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

  @Patch('/updateLobby')
  async updateLobby(@Body() body: Partial<Lobby>) {
    return await this.lobbiesService;
  }
}
