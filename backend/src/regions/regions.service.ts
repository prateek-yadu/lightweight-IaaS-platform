import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto.js';
import { UpdateRegionDto } from './dto/update-region.dto.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class RegionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createRegionDto: CreateRegionDto) {
    return 'This action adds a new region';
  }

  async findAll() {
    // connect to pool
    const pool = await this.databaseService.connectToPool();

    const regions = await pool.query(`SELECT id, name, status FROM regions`);

    if (regions.rowCount == 0) {
      throw new NotFoundException('no region found');
    }

    return { regions: regions.rows };
  }

  findOne(id: number) {
    return `This action returns a #${id} region`;
  }

  update(id: number, updateRegionDto: UpdateRegionDto) {
    return `This action updates a #${id} region`;
  }

  remove(id: number) {
    return `This action removes a #${id} region`;
  }
}
