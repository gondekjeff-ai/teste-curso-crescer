import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Carousel image validation schema
export const carouselImageSchema = z.object({
  alt_text: z
    .string()
    .trim()
    .min(1, 'Texto alternativo é obrigatório')
    .max(200, 'Texto alternativo deve ter no máximo 200 caracteres'),
  image_url: z
    .string()
    .trim()
    .url('URL da imagem inválida')
    .max(2048, 'URL muito longa'),
  display_order: z
    .number()
    .int('Ordem deve ser um número inteiro')
    .nonnegative('Ordem deve ser positiva'),
  active: z.boolean(),
});

// Hero content validation schema
export const heroContentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  subtitle: z
    .string()
    .trim()
    .min(1, 'Subtítulo é obrigatório')
    .max(500, 'Subtítulo deve ter no máximo 500 caracteres'),
  primaryButtonText: z
    .string()
    .trim()
    .min(1, 'Texto do botão primário é obrigatório')
    .max(50, 'Texto do botão deve ter no máximo 50 caracteres'),
  secondaryButtonText: z
    .string()
    .trim()
    .min(1, 'Texto do botão secundário é obrigatório')
    .max(50, 'Texto do botão deve ter no máximo 50 caracteres'),
});

// Sanitize HTML content
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
};

// Sanitize object with string values
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
};

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome do produto é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  category: z
    .string()
    .trim()
    .min(1, 'Categoria é obrigatória')
    .max(100, 'Categoria deve ter no máximo 100 caracteres'),
  price: z
    .number()
    .nonnegative('Preço deve ser positivo')
    .optional(),
  active: z.boolean(),
});

// News validation schema
export const newsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  excerpt: z
    .string()
    .trim()
    .max(500, 'Resumo deve ter no máximo 500 caracteres')
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, 'Conteúdo é obrigatório')
    .max(50000, 'Conteúdo deve ter no máximo 50000 caracteres'),
  image_url: z
    .string()
    .trim()
    .url('URL da imagem inválida')
    .max(2048, 'URL muito longa')
    .optional()
    .or(z.literal('')),
  published: z.boolean(),
});

export type CarouselImageInput = z.infer<typeof carouselImageSchema>;
export type HeroContentInput = z.infer<typeof heroContentSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type NewsInput = z.infer<typeof newsSchema>;

// Contact form validation schemas with strict security
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter no mínimo 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos')
  .transform(val => val.replace(/\s+/g, ' ')); // Remove multiple spaces

export const emailSchema = z
  .string()
  .trim()
  .email('Email inválido')
  .max(255, 'Email deve ter no máximo 255 caracteres')
  .toLowerCase()
  .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Formato de email inválido');

export const messageSchema = z
  .string()
  .trim()
  .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
  .max(5000, 'Mensagem deve ter no máximo 5000 caracteres')
  .transform(val => val.replace(/\s+/g, ' ')); // Remove multiple spaces

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Número de telefone inválido')
  .optional();

// Honeypot and anti-bot validation
export const honeypotSchema = z
  .string()
  .max(0, 'Bot detectado');

export const timestampSchema = z
  .number()
  .positive('Timestamp inválido');

// Service selection validation for orders
export const servicesArraySchema = z
  .array(z.string())
  .min(1, 'Selecione pelo menos um serviço')
  .max(20, 'Máximo de 20 serviços permitidos');

// Implementation deadline validation
export const implementationDeadlineSchema = z
  .string()
  .trim()
  .min(1, 'Selecione um prazo de implementação')
  .max(50, 'Prazo inválido');
