import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('photo', { dest: './uploads' }))
  uploadSingle(@UploadedFile() file) {
    console.log(file);
  }
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('photos[]', 10, { dest: './uploads' }))
  uploadMultiple(@UploadedFiles() files) {
    console.log(files);
  }
}
