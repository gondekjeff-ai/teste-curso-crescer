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
