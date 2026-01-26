import { Controller, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { SendOtpDto, VerifyOtpDto, VerifyIdDto } from './dto/customer.dto';

@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post('initiate')
    sendOtp(@Body() body: SendOtpDto) {
        return this.customerService.sendOtp(body.phoneNumber);
    }

    @Post('verify')
    verifyOtp(@Body() body: VerifyOtpDto) {
        return this.customerService.verifyOtp(body.phoneNumber, body.code);
    }

    @Post('verify-id')
    verifyId(@Body() body: VerifyIdDto & { userId: string }) {
        return this.customerService.verifyId(body.userId, body.type, body.value);
    }

    @Post('credit-check')
    checkCredit(@Body() body: { userId: string, bvn: string }) {
        return this.customerService.checkCredit(body.userId, body.bvn);
    }
}
