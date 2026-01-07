import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Verify JWT_SECRET is loaded (log length only, not the value)
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (jwtSecret) {
    console.log(`✓ JWT_SECRET loaded (length: ${jwtSecret.length} characters)`);
  } else {
    console.error('✗ ERROR: JWT_SECRET is not defined in environment variables');
    process.exit(1);
  }
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

