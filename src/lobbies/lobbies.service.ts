import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lobby } from './lobby.entity';
import { UserJoinedLobbyDto } from 'src/events/dtos/user-joined-lobby.dto';
import { UsersService } from 'src/auth/users.service';
import { User } from 'src/auth/user.entity';

@Injectable()
export class LobbiesService {
  constructor(
    @InjectRepository(Lobby)
    private lobbiesRepository: Repository<Lobby>,
    private usersService: UsersService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getLobbies() {
    return await this.lobbiesRepository.find();
  }

  async createLobby(lobby: Partial<Lobby>) {
    const newLobby = this.lobbiesRepository.create(lobby);

    return await this.lobbiesRepository.save(newLobby);
  }

  async updateLobby(lobbyId: number, lobby: Partial<Lobby>) {
    return await this.lobbiesRepository.update(lobbyId, lobby);
  }

  async deleteLobby(lobbyId: number) {
    return await this.lobbiesRepository.delete(lobbyId);
  }
}
