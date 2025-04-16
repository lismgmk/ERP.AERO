import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { File } from '../../files/entities/file.entity';
import { Token } from '../../auth/entities/token.entity';
import { Device } from '../../auth/entities/device.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryColumn()
  id: string; // email or phone

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => File, (file) => file.user)
  files: File[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];
}
