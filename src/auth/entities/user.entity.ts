import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'users'})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number;
  
    @Column({ length: 100, unique: true })
    username: string;
  
    @Column({ unique: true, length: 100 })
    email: string;
  
    @Column()
    password?: string;

    @Column({ length: 255, nullable: true })
    profile_picture?: string;
  
    @Column({ type:'jsonb', nullable: true })
    preferences?: string; 
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;


}
