import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // schema validation with zod
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  // sessions middleware
  app.use(
    session({
      secret: process.env.SESSIONS_SECRET || 'session-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
