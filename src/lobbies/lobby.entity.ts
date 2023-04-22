import { Room } from 'src/rooms/room.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  playersCount: number;

  @Column({ default: 0 })
  availableRoomsCount: number;

  @OneToMany(() => Room, (room) => room.lobby)
  rooms: Room[];

  @Column()
  name: 'Arena' | '1v1' | 'Solo';
}
