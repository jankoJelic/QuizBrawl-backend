import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { User } from 'src/auth/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(32)
  @MinLength(3)
  @Column()
  name: string;

  @Column({ default: null })
  avatar: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.team)
  users: User[];

  @Column({ default: null })
  country: string;

  @Column({ default: 0 })
  rank: number;
}
