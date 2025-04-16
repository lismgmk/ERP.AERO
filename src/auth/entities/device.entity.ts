import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Token } from './token.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string; // Unique device identifier (e.g., UUID generated on device)

  @Column()
  deviceName: string; // User-friendly device name

  @Column({ nullable: true })
  deviceType: string; // e.g., 'mobile', 'desktop', 'tablet'

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  lastActiveAt: Date;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Token, (token) => token.device)
  tokens: Token[];
}
