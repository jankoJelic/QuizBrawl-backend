import { User } from 'src/auth/user.entity';
import { Room } from 'src/rooms/room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Room, (room) => room.lobby, { eager: true })
  @JoinColumn()
  rooms: Room[];

  @Column()
  name: 'Arena' | '1v1' | 'Solo';

  @OneToMany(() => User, (user) => user.lobby, {
    eager: true,
    // cascade: ['insert', 'update'],
  })
  users: User[];
}
