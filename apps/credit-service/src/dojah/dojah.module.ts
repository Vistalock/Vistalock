import { Module } from '@nestjs/common';
import { DojahService } from './dojah.service';

@Module({
    providers: [DojahService],
    exports: [DojahService],
})
export class DojahModule { }
