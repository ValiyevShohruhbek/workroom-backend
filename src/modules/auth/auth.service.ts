import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SendOtpDto } from './dto/send-otp.dto';
import { OtpService } from './otp.service';
import { LoginAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register-auth.dto';
import { CheckStepDto } from './dto/check-step.dto';
import { CheckProfileDto } from './dto/check-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private otpService: OtpService,
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  async sendOtp(body: SendOtpDto) {
    const { phone_number } = body;
    await this.checkPhoneNumber(phone_number);
    const data = await this.otpService.sendSms(phone_number);
    return data;
  }
  async verifyOtp(phone_number: string, code: string) {
    await this.otpService.isBlockedUser(phone_number);
    const session_token = await this.otpService.verifyOtpCode(
      phone_number,
      code,
    );
    return {
      message: 'success',
      session_token,
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const findEmail = await this.db.prisma.user.findUnique({
      where: {
        email: loginAuthDto.email,
      },
    });

    if (!findEmail) throw new NotFoundException('Email or password incorrect');

    const comparePassword = await bcrypt.compare(
      loginAuthDto.password,
      findEmail.password,
    );

    if (!comparePassword)
      throw new NotFoundException('Email or password incorrect');

    const token = await this.jwt.signAsync({ userId: findEmail.id });

    return token;
  }

  async register(userData: RegisterDto) {
    await this.otpService.checkSessionToken(
      userData.phone_number,
      userData.session_token,
    );
    const findEmail = await this.db.prisma.user.findFirst({
      where: { email: userData.email },
    });
    if (findEmail) throw new ConflictException('this email already existed!');
    await this.checkPhoneNumber(userData.phone_number);
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const { id, email } = await this.db.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        phone_number: userData.phone_number,
      },
    });
    return { message: 'success', data: { id, email } };
  }

  async checkPhoneNumber(phone_number: string) {
    const findPhone = await this.db.prisma.user.findFirst({
      where: { phone_number },
    });
    if (findPhone) throw new ConflictException('phone number already existed');
  }

  async checkStepSuccesfullComplate(body: CheckStepDto) {
    const { user_id, step } = body;

    const questions = await this.db.prisma.userProfileQuestions.findMany({
      where: {
        step_number: step,
      },
    });

    const answers = await this.db.prisma.userProfileQuestionAnswers.count({
      where: {
        user_id: user_id,
        question_id: { in: questions.map((q) => q.id) },
      },
    });

    if (answers === questions.length)
      throw new BadRequestException('Not all questions are answered');

    for (let i = 1; i < step; i++) {
      const prevStepQuestions =
        await this.db.prisma.userProfileQuestions.findMany({
          where: { step_number: i },
        });

      const prevStepAnswers =
        await this.db.prisma.userProfileQuestionAnswers.count({
          where: {
            user_id: user_id,
            question_id: { in: prevStepQuestions.map((q) => q.id) },
          },
        });

      if (prevStepAnswers !== prevStepQuestions.length) {
        throw new HttpException(
          'You need to complete previous steps first.',
          400,
        );
      }
    }

    const maxStep = await this.db.prisma.userProfileQuestions.aggregate({
      _max: { step_number: true },
    });

    if (step === maxStep._max.step_number) {
      await this.db.prisma.user.update({
        where: { id: user_id },
        data: { is_profile_complete: true },
      });
    }

    return { message: 'Step successfully completed.' };
  }

  async checkProfileComplated(data: CheckProfileDto) {
    const findUser = await this.db.prisma.user.findFirst({
      where: { id: data.user_id },
    });
    const isOriginalToken = await this.otpService.checkSessionToken(
      data.phone_number,
      data.session_token,
    );
    if (findUser?.is_profile_complete && isOriginalToken) {
      return { message: 'success' };
    }

    await this.db.prisma.user.delete({ where: { id: data.user_id } });
    throw new BadRequestException('you must register again!');
  }
}
