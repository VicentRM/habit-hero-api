import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginDto, RegisterDto } from './dto/index';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, LoginResponse } from './interfaces/index';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {      
      const { password, ...userData } = createUserDto; 
           
      const newUser = this.usersRepository.create({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });
      await this.usersRepository.save(newUser);
      const { password: _, ...user } = newUser;
      return user;
    } catch (error) {
      if (error.code === 1100) {
        throw new BadRequestException(`${createUserDto.email} exists`);
      }
      throw new InternalServerErrorException(`Something terrible happend`);
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const { password, password2 } = registerDto;
    
    if (password !== password2) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password   
    });   
    return {
      user: user,
      token: this.getJwt({ id: user.id}),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.findIdByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Not valid credentials');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials');
    }

    const { password: _, ...rest } = user;
    return {
      user: rest,
      token: this.getJwt({ id: user.id }),
    };
  }

  getJwt(payload: JwtPayload) {    
    const token = this.jwtService.sign(payload);    
    return token;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findIdByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateAuthDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  // async remove(email: string) {
  //   const user = await this.findIdByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException();
  //   }
  //   return await this.usersRepository.remove(user);
  // }
}
