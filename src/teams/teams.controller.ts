import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
    @Post('/')
    async createTeam() {
        
    }
}
