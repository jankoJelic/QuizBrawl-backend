import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/auth/auth.controller';
import { DELETE_ACCOUNT_INSTRUCTIONS } from 'src/views/delete-account-instructions';
import { PRIVACY_POLICY } from 'src/views/privacy-policy';

@Public()
@Controller('pages')
export class PagesController {
  constructor() {}

  @Get('/privacy_policy')
  renderPrivacyPolicy(@Res() res: Response) {
    res.send(PRIVACY_POLICY);
  }

  @Get('/delete_account_instructions')
  renderDeleteAccountInstructions(@Res() res: Response) {
    res.send(DELETE_ACCOUNT_INSTRUCTIONS);
  }
}
