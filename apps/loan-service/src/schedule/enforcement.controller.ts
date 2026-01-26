import { Controller, Post } from '@nestjs/common';
import { EnforcementService } from './enforcement.service';

@Controller('enforcement')
export class EnforcementController {
    constructor(private readonly service: EnforcementService) { }

    @Post('trigger')
    async trigger() {
        await this.service.triggerManually();
        return { message: 'Enforcement job triggered' };
    }
}
