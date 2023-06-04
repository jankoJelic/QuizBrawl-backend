import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageType } from './dtos/message.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  title: string;

  @Column()
  text: string;

  @Column()
  recipientId: number;

  @Column()
  senderId: number;

  @Column({ nullable: true, type: 'json' })
  payload: any;

  @Column()
  type: MessageType;

  @Column({ default: false })
  read: boolean;
}
