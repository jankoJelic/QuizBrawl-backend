import { Controller, Post } from '@nestjs/common';

@Controller('room')
export class RoomController {
  constructor() {}

  @Post('/create')
  createRoom() {}
}
