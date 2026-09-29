import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
