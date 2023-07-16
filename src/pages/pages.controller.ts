import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/auth/auth.controller';
import { PRIVACY_POLICY } from 'src/views/privacy-policy';

@Controller('pages')
export class PagesController {
  constructor() {}

  @Public()
  @Get('/privacy_policy')
  async renderPrivacyPolicy(@Res() res: Response) {
    console.log(__dirname);
    res.send(PRIVACY_POLICY);
  }
}
