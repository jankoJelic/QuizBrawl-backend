import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lobby } from './lobby.entity';

@Injectable()
export class LobbiesService {
  constructor(
    @InjectRepository(Lobby)
    private lobbiesRepository: Repository<Lobby>,
  ) {}

  async getLobbies() {
    return await this.lobbiesRepository.find({ relations: { users: true } });
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
