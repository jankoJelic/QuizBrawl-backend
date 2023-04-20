import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async getImages(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async createImage(image: Image): Promise<Image> {
    return this.imageRepository.save(image);
  }

  async getImage(id: number): Promise<Image> {
    return this.imageRepository.findOneBy({ id });
  }

  async deleteImage(id: number): Promise<void> {
    await this.imageRepository.delete(id);
  }
}
