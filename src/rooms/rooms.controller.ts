import { Body, Controller, Post, Req } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post('/create')
  createRoom(
    @Req() req,
    @Body() body: { createdBy: number; name: string; players: {} },
  ) {
    this.roomsService.createRoom();
  }
}
