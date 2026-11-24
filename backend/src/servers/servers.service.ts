import { Injectable } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto.js';
import { UpdateServerDto } from './dto/update-server.dto.js';

@Injectable()
export class ServersService {
  create(createServerDto: CreateServerDto) {
    return 'This action adds a new server';
  }

  findAll() {
    return `This action returns all servers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} server`;
  }

  update(id: number, updateServerDto: UpdateServerDto) {
    return `This action updates a #${id} server`;
  }

  remove(id: number) {
    return `This action removes a #${id} server`;
  }
}
