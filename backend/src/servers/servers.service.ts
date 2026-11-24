import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto.js';
import { UpdateServerDto } from './dto/update-server.dto.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class ServersService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createServerDto: CreateServerDto) {
    return 'This action adds a new server';
  }

  async findAll() {
    // connect to pool
    const pool = await this.databaseService.connectToPool();

    const servers = await pool.query(
      `SELECT s.id, s.name, s.code, r.name AS region, s.status FROM servers s INNER JOIN regions r ON s.region_id = r.id`,
    );

    if (servers.rowCount == 0) {
      throw new NotFoundException('no server found');
    }

    return { servers: servers.rows };
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
