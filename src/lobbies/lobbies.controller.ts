import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  @Patch('/updateLobby')
  async updateLobby(@Param() id: string, @Body() body: Partial<Lobby>) {
    return await this.lobbiesService.updateLobby(Number(id), body);
  }

  @Delete('/deleteLobby')
  async deleteLobby(@Param() id: number) {
    return await this.lobbiesService.deleteLobby(id);
  }
}
