import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN'),
    });

    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject('Failed to create access token');
        }
        resolve(token);
      });
    });

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId: this.configService.get('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        accessToken,
      },
    };
    this.mailerService.addTransporter('gmail', config);
  }

  public async sendUserConfirmation(user: CreateUserDto, code: string) {
    await this.setTransport();
    this.mailerService
      .sendMail({
        transporterName: 'gmail',
        to: user.email,
        from: 'noreply@humorme.com',
        subject: 'Verification Code',
        template: 'confirmation',
        context: {
          code,
          name: user.firstName,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
