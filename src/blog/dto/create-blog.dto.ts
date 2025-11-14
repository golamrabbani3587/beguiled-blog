import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsBoolean, IsUrl } from 'class-validator';
import { BlogStatus } from '../entities/blog.entity';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string; // Rich HTML content

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsUrl()
  @IsOptional()
  featuredImage?: string;

  @IsArray()
  @IsOptional()
  tags?: string[]; // Array of tag IDs

  @IsString()
  @IsOptional()
  category?: string; // Category ID

  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

