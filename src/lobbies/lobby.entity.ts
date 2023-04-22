import { Room } from 'src/rooms/room.entity';
import { Topic } from 'src/rooms/types/Topic';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playersCount: number;

  @Column()
  availableRoomsCount: number;

  @Column()
  topic: Topic;

  @OneToMany(() => Room, (room) => room.lobby)
  rooms: Room[];
}
