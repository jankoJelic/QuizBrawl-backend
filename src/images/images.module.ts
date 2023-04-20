import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { ImagesController } from './images.controller';

@Module({
  providers: [ImagesService],
  imports: [TypeOrmModule.forFeature([Image])],
  exports: [TypeOrmModule],
  controllers: [ImagesController],
})
export class ImagesModule {}
